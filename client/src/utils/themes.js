export const THEMES = [
  {
    id: 'night',
    label: 'Night',
    emoji: '🌙',
    sky: 'linear-gradient(to bottom, #0b0b1e 0%, #16123a 40%, #2d1b69 75%, #16123a 100%)',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    emoji: '🌇',
    sky: 'linear-gradient(to bottom, #0d0221 0%, #350c4a 22%, #8e2157 44%, #d94538 66%, #f48c32 85%, #fcc469 100%)',
  },
  {
    id: 'dawn',
    label: 'Dawn',
    emoji: '🌄',
    sky: 'linear-gradient(to bottom, #0d2137 0%, #1a4a6e 25%, #7b4397 50%, #dc2430 70%, #f4a44a 87%, #fce8c2 100%)',
  },
  {
    id: 'day',
    label: 'Clear Day',
    emoji: '☀️',
    sky: 'linear-gradient(to bottom, #1565c0 0%, #1e88e5 30%, #42a5f5 58%, #90caf9 80%, #e3f2fd 100%)',
    light: true,
    vars: {
      '--bg': '#dbeafe',
      '--surface': 'rgba(255,255,255,0.82)',
      '--surface2': 'rgba(255,255,255,0.60)',
      '--text': '#1e293b',
      '--text-muted': '#475569',
      '--border': 'rgba(0,0,0,0.10)',
      '--shadow': '0 4px 24px rgba(0,0,0,0.12)',
      '--accent': '#2563eb',
      '--accent-hover': '#1d4ed8',
      '--header-bg': 'rgba(255,255,255,0.72)',
      '--danger': '#dc2626',
    },
  },
  {
    id: 'storm',
    label: 'Storm',
    emoji: '⛈️',
    sky: 'linear-gradient(to bottom, #1a1a2e 0%, #2d3561 30%, #4a5568 62%, #718096 88%, #8fa3ba 100%)',
  },
];

export const DEFAULT_THEME_ID = 'night';
