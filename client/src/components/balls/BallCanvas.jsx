import { useRef, useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Ball from './Ball.jsx';
import PopBurst from './PopBurst.jsx';
import { usePhysics } from '../../hooks/usePhysics.js';
import { useAppStore } from '../../store/useAppStore.js';

export default function BallCanvas({ tasks, onBallClick, filterTags = new Set() }) {
  const containerRef = useRef(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const { balls, poppingIds, endPop } = useAppStore();
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setBounds({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  usePhysics(tasks, bounds);

  const handleBallClick = useCallback((task, x, y) => {
    const color = task.overdue_stage >= 1 ? '#ef4444' : task.ball_color;
    setBursts(prev => [...prev, { id: task.id, x, y, color }]);
    onBallClick(task);
  }, [onBallClick]);

  const removeBurst = useCallback((id) => {
    setBursts(prev => prev.filter(b => b.id !== id));
    endPop(id);
  }, [endPop]);

  const ballMap = new Map(balls.map(b => [b.id, b]));

  return (
    <div ref={containerRef} className="ball-canvas">
      <AnimatePresence>
        {tasks.map(task => {
          const phys = ballMap.get(task.id);
          if (!phys || poppingIds.has(task.id)) return null;
          const dimmed = filterTags.size > 0 && !(task.tags ?? []).some(t => filterTags.has(t));
          return (
            <Ball
              key={task.id}
              task={task}
              physBall={phys}
              onClick={handleBallClick}
              dimmed={dimmed}
            />
          );
        })}
      </AnimatePresence>

      {bursts.map(b => (
        <PopBurst key={b.id} x={b.x} y={b.y} color={b.color} onDone={() => removeBurst(b.id)} />
      ))}
    </div>
  );
}
