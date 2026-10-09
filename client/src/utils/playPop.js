let sharedCtx = null;

function getCtx() {
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (sharedCtx.state === 'suspended') sharedCtx.resume();
  return sharedCtx;
}

export function playPop() {
  try {
    const ac = getCtx();
    const t = ac.currentTime;

    // Oscillator: sweeps down from ~520 Hz to ~80 Hz — the "boing" of a bubble
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.09);

    const oscGain = ac.createGain();
    oscGain.gain.setValueAtTime(0.28, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(oscGain);
    oscGain.connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.13);

    // Short noise burst — the wet "splat" of the droplets
    const bufLen = Math.floor(ac.sampleRate * 0.055);
    const buf = ac.createBuffer(1, bufLen, ac.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.18));
    }

    const noise = ac.createBufferSource();
    noise.buffer = buf;

    const bpf = ac.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 700;
    bpf.Q.value = 0.7;

    const noiseGain = ac.createGain();
    noiseGain.gain.setValueAtTime(0.14, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

    noise.connect(bpf);
    bpf.connect(noiseGain);
    noiseGain.connect(ac.destination);
    noise.start(t);
    noise.stop(t + 0.06);
  } catch {}
}
