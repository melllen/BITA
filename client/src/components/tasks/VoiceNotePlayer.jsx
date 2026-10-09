export default function VoiceNotePlayer({ voiceNote }) {
  if (!voiceNote?.presignedUrl) return null;

  const formatDuration = (ms) => {
    if (!ms) return '';
    const s = Math.round(ms / 1000);
    return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  return (
    <div className="voice-player">
      <audio src={voiceNote.presignedUrl} controls />
      {voiceNote.durationMs && (
        <span className="voice-duration">{formatDuration(voiceNote.durationMs)}</span>
      )}
    </div>
  );
}
