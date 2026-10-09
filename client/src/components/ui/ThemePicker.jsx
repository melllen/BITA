import { useState, useRef, useEffect } from 'react';
import { THEMES } from '../../utils/themes.js';

export default function ThemePicker({ current, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="theme-picker" ref={ref}>
      <button
        className="btn-ghost theme-toggle-btn"
        onClick={() => setOpen(o => !o)}
        title={`Sky: ${current.label}`}
        aria-label="Change sky"
      >
        {current.emoji}
      </button>

      {open && (
        <div className="theme-swatches">
          {THEMES.map(theme => (
            <button
              key={theme.id}
              className={`theme-swatch${current.id === theme.id ? ' theme-swatch--active' : ''}`}
              style={{ background: theme.sky }}
              title={theme.label}
              onClick={() => { onSelect(theme.id); setOpen(false); }}
            >
              <span className="theme-swatch-label">{theme.emoji}</span>
              <span className="theme-swatch-name">{theme.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
