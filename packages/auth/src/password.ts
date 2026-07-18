// Hashing de contraseñas con bcrypt. Nunca se guardan en texto plano.
// (No importar desde el middleware edge: usar el subpath "@shein/auth/tokens").
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(plano: string): Promise<string> {
  return bcrypt.hash(plano, SALT_ROUNDS);
}

export async function verifyPassword(
  plano: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plano, hash);
}
