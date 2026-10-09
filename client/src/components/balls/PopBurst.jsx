import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const DROP_COUNT = 22;
const r = (min, max) => min + Math.random() * (max - min);

function makeDrops() {
  return Array.from({ length: DROP_COUNT }, (_, i) => {
    const baseAngle = (i / DROP_COUNT) * 2 * Math.PI;
    const angle = baseAngle + r(-0.25, 0.25);
    const dist = r(65, 145);
    const large = Math.random() > 0.5;
    const w = large ? 10 : 6;
    const h = large ? 19 : 11;
    const rotStart = (angle * 180 / Math.PI) + 90;
    return {
      endX: Math.cos(angle) * dist,
      endY: Math.sin(angle) * dist + r(8, 40), // gravity pulls drops down
      w, h,
      rotStart,
      rotEnd: rotStart + r(-25, 25),
      delay: r(0, 0.06),
      dur: r(0.5, 0.85),
    };
  });
}

export default function PopBurst({ x, y, color, onDone }) {
  const dropsRef = useRef(null);
  if (!dropsRef.current) dropsRef.current = makeDrops();

  useEffect(() => {
    const id = setTimeout(onDone, 1000);
    return () => clearTimeout(id);
  }, [onDone]);

  const drops = dropsRef.current;

  return (
    <>
      {/* Expanding bubble ring */}
      <motion.div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          borderRadius: '50%',
          border: `3px solid ${color}`,
          pointerEvents: 'none',
          zIndex: 300,
        }}
        initial={{ width: 20, height: 20, x: -10, y: -10, opacity: 0.9 }}
        animate={{ width: 210, height: 210, x: -105, y: -105, opacity: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      />

      {/* Second fainter ring slightly delayed */}
      <motion.div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          pointerEvents: 'none',
          zIndex: 300,
        }}
        initial={{ width: 10, height: 10, x: -5, y: -5, opacity: 0.5 }}
        animate={{ width: 140, height: 140, x: -70, y: -70, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.07 }}
      />

      {/* Center flash */}
      <motion.div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,255,255,0.95) 0%, ${color}99 55%, transparent 80%)`,
          pointerEvents: 'none',
          zIndex: 301,
        }}
        initial={{ width: 30, height: 30, x: -15, y: -15, opacity: 1 }}
        animate={{ width: 90, height: 90, x: -45, y: -45, opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      />

      {/* Teardrop droplets */}
      {drops.map((d, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: d.w,
            height: d.h,
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            background: color,
            boxShadow: `inset -1px -2px 3px rgba(0,0,0,0.2), inset 1px 1px 3px rgba(255,255,255,0.4)`,
            pointerEvents: 'none',
            zIndex: 300,
          }}
          initial={{ x: -d.w / 2, y: -d.h / 2, opacity: 1, scale: 1, rotate: d.rotStart }}
          animate={{ x: d.endX - d.w / 2, y: d.endY - d.h / 2, opacity: 0, scale: 0.1, rotate: d.rotEnd }}
          transition={{ duration: d.dur, ease: [0.15, 0.8, 0.7, 1], delay: d.delay }}
        />
      ))}
    </>
  );
}
