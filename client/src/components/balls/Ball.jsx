import { motion } from 'framer-motion';

const GHOST_OFFSETS = [
  { dx: 22, dy: -10 },
  { dx: -20, dy: 12 },
  { dx: 10, dy: 20 },
];

export default function Ball({ task, physBall, onClick, dimmed = false }) {
  const { x, y, radius } = physBall;
  const stage = task.overdue_stage ?? 0;

  const color = stage >= 1 ? '#ef4444' : task.ball_color;

  const shakeVariants = {
    shake: {
      x: [0, -4, 4, -4, 4, 0],
      transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1.5 },
    },
  };

  return (
    <>
      {stage >= 2 && GHOST_OFFSETS.map((off, i) => (
        <div
          key={`ghost-${i}`}
          className="ball ghost"
          style={{
            left: x + off.dx - radius,
            top: y + off.dy - radius,
            width: radius * 2,
            height: radius * 2,
            background: color,
            opacity: 0.3,
          }}
        />
      ))}

      <motion.div
        className={`ball ${stage >= 1 ? 'ball--angry' : ''}`}
        style={{
          left: x - radius,
          top: y - radius,
          width: radius * 2,
          height: radius * 2,
          background: color,
          ...(dimmed ? { opacity: 0.12, pointerEvents: 'none' } : {}),
        }}
        variants={stage >= 1 ? shakeVariants : undefined}
        animate={stage >= 1 ? 'shake' : undefined}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => onClick(task, x, y)}
      >
        <span className="ball-label">{task.title}</span>
      </motion.div>
    </>
  );
}
