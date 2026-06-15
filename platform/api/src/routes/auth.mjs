import { json } from '../lib/http.mjs';
import {
  registerUser,
  loginUser,
  verifyEmailToken,
  resendVerification,
  requestPasswordReset,
  resetPassword,
  verifyToken,
  getUserById,
} from '../services/auth.mjs';

export async function handleAuthRegister(res, body) {
  const result = await registerUser(body);
  json(res, 201, result);
}

export async function handleAuthLogin(res, body) {
  const result = await loginUser(body);
  json(res, 200, result);
}

export async function handleAuthVerifyEmail(res, token) {
  const result = await verifyEmailToken(token);
  json(res, 200, result);
}

export async function handleAuthResendVerification(res, body) {
  const result = await resendVerification(body);
  json(res, 200, result);
}

export async function handleAuthForgotPassword(res, body) {
  const result = await requestPasswordReset(body);
  json(res, 200, result);
}

export async function handleAuthResetPassword(res, body) {
  const result = await resetPassword(body);
  json(res, 200, result);
}

export async function handleAuthMe(res, authHeader) {
  const auth = verifyToken(authHeader);
  const user = await getUserById(auth.userId);
  if (!user) {
    json(res, 404, { error: 'User not found' });
    return;
  }
  json(res, 200, { user });
}
