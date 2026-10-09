import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getTasks, completeTask } from '../api/tasks.js';
import BallCanvas from '../components/balls/BallCanvas.jsx';
import CreateTaskModal from '../components/tasks/CreateTaskModal.jsx';
import { useAppStore } from '../store/useAppStore.js';
import { tagColor } from '../utils/tagColor.js';

export default function HomePage() {
  const qc = useQueryClient();
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ['tasks'], queryFn: getTasks });
  const [createOpen, setCreateOpen] = useState(false);
  const [filterTags, setFilterTags] = useState(new Set());
  const startPop = useAppStore(state => state.startPop);

  const { mutate: doComplete } = useMutation({
    mutationFn: completeTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['history'] });
    },
  });

  const onBallClick = useCallback((task) => {
    startPop(task.id);
    doComplete(task.id);
  }, [startPop, doComplete]);

  const allTags = useMemo(() => {
    const s = new Set();
    tasks.forEach(t => (t.tags ?? []).forEach(tag => s.add(tag)));
    return [...s].sort();
  }, [tasks]);

  const toggleTag = useCallback((tag) => {
    setFilterTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  }, []);

  return (
    <div className="home-page">
      <BallCanvas tasks={tasks} onBallClick={onBallClick} filterTags={filterTags} />

      {allTags.length > 0 && (
        <div className="filter-bar">
          {allTags.map(tag => (
            <button
              key={tag}
              className={`filter-chip${filterTags.has(tag) ? ' filter-chip--active' : ''}`}
              style={{ '--tag-color': tagColor(tag) }}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {isLoading && tasks.length === 0 && (
        <div className="empty-hint">Loading your tasks…</div>
      )}

      {!isLoading && tasks.length === 0 && (
        <div className="empty-hint">
          <p>Nothing in the air yet.</p>
          <p>Add a task to get started.</p>
        </div>
      )}

      <Link to="/history" className="history-fab" title="Popped bubbles" aria-label="View history">
        🫧
      </Link>

      <button
        className="fab"
        onClick={() => setCreateOpen(true)}
        title="Add task"
        aria-label="Add task"
      >
        +
      </button>

      <CreateTaskModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
