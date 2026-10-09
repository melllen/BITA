export default function BallFace({ mood }) {
  return (
    <svg viewBox="0 0 40 40" width="60%" height="60%" className="ball-face">
      {mood === 'angry' ? (
        <>
          {/* furrowed brows */}
          <line x1="8" y1="12" x2="16" y2="15" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="24" y1="15" x2="32" y2="12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          {/* eyes */}
          <circle cx="13" cy="18" r="2.5" fill="white" />
          <circle cx="27" cy="18" r="2.5" fill="white" />
          {/* frown */}
          <path d="M 13 30 Q 20 24 27 30" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* neutral eyes */}
          <circle cx="13" cy="17" r="2.5" fill="white" />
          <circle cx="27" cy="17" r="2.5" fill="white" />
          {/* gentle smile */}
          <path d="M 13 27 Q 20 32 27 27" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
