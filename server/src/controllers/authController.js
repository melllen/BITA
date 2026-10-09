import {
  createUser,
  verifyCredentials,
  getUserById,
  signToken,
  setSessionCookie,
  clearSessionCookie,
} from '../services/authService.js';

export async function signup(req, res, next) {
  try {
    const { email, password, displayName } = req.body;
    const user = await createUser({ email, password, displayName });
    const token = signToken(user);
    setSessionCookie(res, token);
    res.status(201).json({ user: { id: user.id, email: user.email, displayName: user.display_name } });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await verifyCredentials({ email, password });
    const token = signToken(user);
    setSessionCookie(res, token);
    res.json({ user: { id: user.id, email: user.email, displayName: user.display_name } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  clearSessionCookie(res);
  res.status(204).end();
}

export async function me(req, res, next) {
  try {
    const user = await getUserById(req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user.id, email: user.email, displayName: user.display_name } });
  } catch (err) {
    next(err);
  }
}
