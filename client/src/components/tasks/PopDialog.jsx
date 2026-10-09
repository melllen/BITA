import { useMutation, useQueryClient } from '@tanstack/react-query';
import { completeTask } from '../../api/tasks.js';
import { useAppStore } from '../../store/useAppStore.js';
import Modal from '../ui/Modal.jsx';

export default function PopDialog({ task, onClose }) {
  const qc = useQueryClient();
  const { startPop } = useAppStore();

  const completeMutation = useMutation({
    mutationFn: () => completeTask(task.id),
    onSuccess: () => {
      startPop(task.id);
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['history'] });
      onClose();
    },
  });

  return (
    <Modal open={!!task} onClose={onClose}>
      <div className="pop-dialog">
        <h3>Pop "{task?.title}"?</h3>
        <p className="pop-subtitle">Mark this task as done.</p>

        {completeMutation.error && (
          <p className="form-error">Something went wrong — try again.</p>
        )}

        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button
            type="button"
            onClick={() => completeMutation.mutate()}
            disabled={completeMutation.isPending}
            className="btn-primary btn-pop"
          >
            {completeMutation.isPending ? 'Popping…' : '🫧 Pop it!'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
