import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask } from '../../api/tasks.js';
import Modal from '../ui/Modal.jsx';
import TagInput from './TagInput.jsx';
import { BALL_COLORS } from '../../utils/ballColors.js';

export default function CreateTaskModal({ open, onClose }) {
  const qc = useQueryClient();
  const [tags, setTags] = useState([]);
  const [ballColor, setBallColor] = useState(null); // null = random
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      reset();
      setTags([]);
      setBallColor(null);
      onClose();
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({
      title: data.title,
      description: data.description || undefined,
      dueAt: data.dueAt ? new Date(data.dueAt).toISOString() : undefined,
      estimatedMinutes: data.estimatedMinutes ? Number(data.estimatedMinutes) : undefined,
      tags: tags.length > 0 ? tags : undefined,
      ballColor: ballColor ?? undefined,
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form className="task-form" onSubmit={handleSubmit(onSubmit)}>
        <h3>New task</h3>

        <label>What do you need to do?
          <input
            type="text"
            placeholder="Task title"
            {...register('title', { required: 'Title is required' })}
            autoFocus
          />
          {errors.title && <span className="field-error">{errors.title.message}</span>}
        </label>

        <label>Notes (optional)
          <textarea rows={3} {...register('description')} placeholder="Any details…" />
        </label>

        <label>Due date (optional)
          <input type="datetime-local" {...register('dueAt')} />
        </label>

        <label>Estimated time (minutes, optional)
          <input type="number" min="1" {...register('estimatedMinutes')} placeholder="e.g. 30" />
        </label>

        <label>Tags (optional)
          <TagInput tags={tags} onChange={setTags} />
        </label>

        <div className="color-picker-label">Ball color</div>
        <div className="color-swatches">
          <button
            type="button"
            className={`color-swatch color-swatch--random${ballColor === null ? ' color-swatch--active' : ''}`}
            onClick={() => setBallColor(null)}
            title="Random"
          >
            ✨
          </button>
          {BALL_COLORS.map(c => (
            <button
              key={c}
              type="button"
              className={`color-swatch${ballColor === c ? ' color-swatch--active' : ''}`}
              style={{ background: c }}
              onClick={() => setBallColor(c)}
              title={c}
            />
          ))}
        </div>

        {mutation.error && (
          <p className="form-error">
            {typeof mutation.error.response?.data?.error === 'string'
              ? mutation.error.response.data.error
              : 'Could not create task — please check your inputs'}
          </p>
        )}

        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary">
            {mutation.isPending ? 'Adding…' : 'Add task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
