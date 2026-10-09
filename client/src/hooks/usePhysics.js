import { useEffect, useRef, useCallback } from 'react';
import { stepBall, resolveCollisions, makeBallState, computeUrgency } from '../utils/ballPhysics.js';
import { useAppStore } from '../store/useAppStore.js';

export function usePhysics(tasks, bounds) {
  const setBalls = useAppStore(state => state.setBalls);
  const poppingIds = useAppStore(state => state.poppingIds);
  const boundsRef = useRef(bounds);
  const rafRef = useRef(null);

  // sync tasks → ball state (add new, remove completed)
  useEffect(() => {
    if (!bounds.width || !bounds.height) return;
    setBalls(prev => {
      const prevMap = new Map(prev.map(b => [b.id, b]));
      return tasks
        .filter(t => !poppingIds.has(t.id))
        .map(t => prevMap.get(t.id) ?? makeBallState(t, bounds));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, bounds.width, bounds.height]);

  // update urgency every minute
  useEffect(() => {
    const id = setInterval(() => {
      setBalls(prev => prev.map(b => {
        const task = tasks.find(t => t.id === b.id);
        return task ? { ...b, urgency: computeUrgency(task) } : b;
      }));
    }, 60_000);
    return () => clearInterval(id);
  }, [tasks, setBalls]);

  // RAF physics loop
  useEffect(() => {
    boundsRef.current = bounds;
  }, [bounds]);

  useEffect(() => {
    const tick = () => {
      setBalls(prev => {
        const stepped = prev.map(b => stepBall(b, boundsRef.current));
        return resolveCollisions(stepped);
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [setBalls]);
}
