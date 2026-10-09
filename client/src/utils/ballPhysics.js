const GRAVITY = 0.04;
const DAMPING = 0.6;
const DRIFT_STRENGTH = 0.015;
const MAX_SPEED = 2.5;
const FLOAT_SPRING = 0.0006; // pulls each ball toward its natural altitude

export function computeUrgency(task) {
  if (!task.due_at) return 0.15; // nearly buoyant with no deadline
  const now = Date.now();
  const created = new Date(task.created_at).getTime();
  const due = new Date(task.due_at).getTime();
  const total = due - created;
  if (total <= 0) return 1;
  const elapsed = now - created;
  return Math.min(1, Math.max(0, elapsed / total));
}

export function stepBall(ball, bounds) {
  let { x, y, vx, vy, radius, driftPhase, urgency } = ball;

  // gravity is zero at urgency=0, full at urgency=1
  const netGravity = GRAVITY * urgency;

  // soft spring toward natural float altitude (upper area when fresh, bottom when overdue)
  const naturalY = bounds.height * (0.22 + urgency * 0.63);
  const springFy = (naturalY - y) * FLOAT_SPRING;

  vy += netGravity + springFy;
  vx += Math.sin(driftPhase) * DRIFT_STRENGTH;
  vy += Math.cos(driftPhase * 0.73) * DRIFT_STRENGTH * 0.35; // gentle vertical bob
  driftPhase += 0.01;

  // clamp speed
  const speed = Math.sqrt(vx * vx + vy * vy);
  if (speed > MAX_SPEED) { vx = (vx / speed) * MAX_SPEED; vy = (vy / speed) * MAX_SPEED; }

  x += vx;
  y += vy;

  // wall bounce
  if (x - radius < 0)             { x = radius;              vx = Math.abs(vx) * DAMPING; }
  if (x + radius > bounds.width)  { x = bounds.width - radius; vx = -Math.abs(vx) * DAMPING; }
  if (y - radius < 0)             { y = radius;              vy = Math.abs(vy) * DAMPING; }

  // ground
  const ground = bounds.height - radius;
  const onGround = y >= ground;
  if (onGround) { y = ground; vy = 0; vx *= 0.95; }

  return { ...ball, x, y, vx, vy, driftPhase, onGround };
}

export function resolveCollisions(balls) {
  const out = balls.map(b => ({ ...b }));
  for (let i = 0; i < out.length; i++) {
    for (let j = i + 1; j < out.length; j++) {
      const a = out[i], b = out[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.radius + b.radius;
      if (dist < minDist && dist > 0) {
        const nx = dx / dist, ny = dy / dist;
        const overlap = (minDist - dist) / 2;
        out[i].x -= nx * overlap; out[i].y -= ny * overlap;
        out[j].x += nx * overlap; out[j].y += ny * overlap;
        // exchange velocities along normal
        const dvx = a.vx - b.vx, dvy = a.vy - b.vy;
        const dot = dvx * nx + dvy * ny;
        if (dot > 0) {
          out[i].vx -= dot * nx * DAMPING;
          out[i].vy -= dot * ny * DAMPING;
          out[j].vx += dot * nx * DAMPING;
          out[j].vy += dot * ny * DAMPING;
        }
      }
    }
  }
  return out;
}

export function makeBallState(task, bounds) {
  const radius = 62;
  return {
    id: task.id,
    x: radius + Math.random() * (bounds.width - radius * 2),
    y: radius + Math.random() * (bounds.height * 0.4),
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 0.5,
    radius,
    driftPhase: Math.random() * Math.PI * 2,
    urgency: computeUrgency(task),
    onGround: false,
  };
}
