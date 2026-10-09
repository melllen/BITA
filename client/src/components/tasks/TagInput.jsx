import { useState } from 'react';
import { tagColor } from '../../utils/tagColor.js';

export default function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');

  const add = () => {
    const val = input.trim().replace(/,/g, '');
    if (!val || tags.includes(val) || tags.length >= 10) { setInput(''); return; }
    onChange([...tags, val]);
    setInput('');
  };

  const remove = (tag) => onChange(tags.filter(t => t !== tag));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
    else if (e.key === 'Backspace' && !input && tags.length > 0) remove(tags[tags.length - 1]);
  };

  const color = (t) => tagColor(t);

  return (
    <div className="tag-input-wrap">
      {tags.map(tag => (
        <span
          key={tag}
          className="tag-chip"
          style={{ background: color(tag) + '22', color: color(tag), borderColor: color(tag) + '88' }}
        >
          {tag}
          <button type="button" className="tag-chip-x" onClick={() => remove(tag)}>×</button>
        </span>
      ))}
      {tags.length < 10 && (
        <input
          className="tag-input-field"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={add}
          placeholder={tags.length === 0 ? 'Add tags… (Enter to confirm)' : ''}
        />
      )}
    </div>
  );
}
