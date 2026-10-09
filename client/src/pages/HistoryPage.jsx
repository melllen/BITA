import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getTasks, getHistory, reinstateTask, setCompletionNote, updateTask } from '../api/tasks.js';
import { uploadVoiceNote } from '../api/voiceNotes.js';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder.js';
import VoiceNotePlayer from '../components/tasks/VoiceNotePlayer.jsx';
import TagInput from '../components/tasks/TagInput.jsx';
import { tagColor } from '../utils/tagColor.js';
import { BALL_COLORS } from '../utils/ballColors.js';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function toDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function TagChips({ tags }) {
  if (!tags?.length) return null;
  return (
    <div className="tag-display">
      {tags.map(tag => (
        <span
          key={tag}
          className="tag-chip"
          style={{ background: tagColor(tag) + '22', color: tagColor(tag), borderColor: tagColor(tag) + '88' }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

// ── Active task inline editor ─────────────────────────────────────────────────

function ActiveTaskItem({ task }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: task.title,
    description: task.description ?? '',
    dueAt: toDatetimeLocal(task.due_at),
    estimatedMinutes: task.estimated_minutes ?? '',
    tags: task.tags ?? [],
    ballColor: task.ball_color,
  });

  const mutation = useMutation({
    mutationFn: (data) => updateTask(task.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setEditing(false);
    },
  });

  const handleSave = () => {
    mutation.mutate({
      title: form.title,
      description: form.description || undefined,
      dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined,
      estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : undefined,
      tags: form.tags,
      ballColor: form.ballColor,
    });
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm(f => ({ ...f, [key]: e.target.value })),
  });

  return (
    <li className="history-item">
      <div className="history-item-dot" style={{ background: task.ball_color }} />
      <div className="history-item-body">
        {!editing ? (
          <>
            <div className="history-item-header">
              <span className="history-title">{task.title}</span>
              <button className="btn-ghost btn-xs" onClick={() => setEditing(true)}>✏️ Edit</button>
            </div>
            {task.description && <p className="history-desc">{task.description}</p>}
            <span className="history-date">
              Added {formatDate(task.created_at)}
              {task.due_at && <> · Due {formatDate(task.due_at)}</>}
              {task.estimated_minutes && <> · ~{task.estimated_minutes} min</>}
            </span>
            <TagChips tags={task.tags} />
          </>
        ) : (
          <div className="task-form active-edit-form">
            <label>
              Title
              <input {...field('title')} autoFocus />
            </label>
            <label>
              Description
              <textarea rows={2} {...field('description')} placeholder="Optional details" />
            </label>
            <label>
              Due date
              <input type="datetime-local" {...field('dueAt')} />
            </label>
            <label>
              Estimated minutes
              <input type="number" min="1" {...field('estimatedMinutes')} placeholder="e.g. 30" />
            </label>
            <label>
              Tags
              <TagInput tags={form.tags} onChange={t => setForm(f => ({ ...f, tags: t }))} />
            </label>
            <div className="color-picker-label">Ball color</div>
            <div className="color-swatches">
              {BALL_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch${form.ballColor === c ? ' color-swatch--active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setForm(f => ({ ...f, ballColor: c }))}
                  title={c}
                />
              ))}
            </div>
            {mutation.isError && (
              <p className="form-error">Something went wrong, try again.</p>
            )}
            <div className="form-actions">
              <button className="btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              <button
                className="btn-primary btn-sm"
                disabled={mutation.isPending || !form.title.trim()}
                onClick={handleSave}
              >
                {mutation.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

// ── Completed task item ────────────────────────────────────────────────────────

function NoteEditor({ task }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(task.completion_note ?? '');
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (note) => setCompletionNote(task.id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['history'] });
      setEditing(false);
    },
  });

  if (!editing) {
    return (
      <div className="note-display">
        {task.completion_note && <p className="note-text">📝 {task.completion_note}</p>}
        <button className="btn-ghost btn-sm" onClick={() => setEditing(true)}>
          {task.completion_note ? 'Edit note' : '+ Add note'}
        </button>
      </div>
    );
  }

  return (
    <div className="note-editor">
      <textarea
        rows={2}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="How did it go?"
        autoFocus
      />
      <div className="note-actions">
        <button className="btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
        <button
          className="btn-primary btn-sm"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate(text)}
        >
          {mutation.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function VoiceNoteSection({ task }) {
  const qc = useQueryClient();
  const { isRecording, blob, durationMs, error: recError, start, stop, reset } = useVoiceRecorder();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!blob) return;
    setUploading(true);
    try {
      await uploadVoiceNote(task.id, blob, durationMs);
      qc.invalidateQueries({ queryKey: ['history'] });
      reset();
    } catch {
    } finally {
      setUploading(false);
    }
  };

  if (task.voiceNote) return <VoiceNotePlayer voiceNote={task.voiceNote} />;

  return (
    <div className="voice-add">
      {!blob && !isRecording && (
        <button className="btn-ghost btn-sm" onClick={start}>🎙 Add voice note</button>
      )}
      {isRecording && (
        <button className="btn-record btn-record--active btn-sm" onClick={stop}>⏹ Stop</button>
      )}
      {blob && (
        <div className="voice-preview">
          <audio src={URL.createObjectURL(blob)} controls />
          <button className="btn-primary btn-sm" disabled={uploading} onClick={handleUpload}>
            {uploading ? 'Saving…' : 'Save'}
          </button>
          <button className="btn-ghost btn-sm" onClick={reset}>Remove</button>
        </div>
      )}
      {recError && <p className="field-error">{recError}</p>}
    </div>
  );
}

function HistoryItem({ task }) {
  const qc = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const reinstateMutation = useMutation({
    mutationFn: () => reinstateTask(task.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['history'] });
    },
  });

  return (
    <li className="history-item">
      <div className="history-item-dot" style={{ background: task.ball_color }} />
      <div className="history-item-body">
        <div className="history-item-header">
          <span className="history-title">{task.title}</span>
          {task.status === 'completed' && (
            confirming ? (
              <span className="reinstate-confirm">
                Reinstate?{' '}
                <button className="link-btn" onClick={() => reinstateMutation.mutate()}>Yes</button>
                {' / '}
                <button className="link-btn" onClick={() => setConfirming(false)}>No</button>
              </span>
            ) : (
              <button className="btn-ghost btn-xs" onClick={() => setConfirming(true)} title="Put it back">
                ↩ Reinstate
              </button>
            )
          )}
        </div>
        {task.description && <p className="history-desc">{task.description}</p>}
        <span className="history-date">Popped {formatDate(task.completed_at)}</span>
        <TagChips tags={task.tags} />
        {task.status === 'completed' && (
          <>
            <NoteEditor task={task} />
            <VoiceNoteSection task={task} />
          </>
        )}
      </div>
    </li>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const [tab, setTab] = useState('popped');

  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['history'],
    queryFn: getHistory,
  });

  const { data: active = [], isLoading: loadingActive } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });

  const isLoading = tab === 'popped' ? loadingHistory : loadingActive;
  const items = tab === 'popped' ? history : active;

  return (
    <div className="history-page">
      <div className="history-header">
        <h2>{tab === 'popped' ? 'Popped bubbles' : 'Floating bubbles'}</h2>
        <Link to="/" className="btn-ghost">← Back</Link>
      </div>

      <div className="tab-bar">
        <button
          className={`tab-btn${tab === 'floating' ? ' tab-btn--active' : ''}`}
          onClick={() => setTab('floating')}
        >
          🎈 Floating
        </button>
        <button
          className={`tab-btn${tab === 'popped' ? ' tab-btn--active' : ''}`}
          onClick={() => setTab('popped')}
        >
          🫧 Popped
        </button>
      </div>

      {isLoading && <p className="muted">Loading…</p>}
      {!isLoading && items.length === 0 && (
        <p className="muted">
          {tab === 'popped' ? 'No popped bubbles yet.' : 'No floating bubbles right now.'}
        </p>
      )}

      <ul className="history-list">
        {tab === 'popped'
          ? items.map(task => <HistoryItem key={task.id} task={task} />)
          : items.map(task => <ActiveTaskItem key={task.id} task={task} />)
        }
      </ul>
    </div>
  );
}
