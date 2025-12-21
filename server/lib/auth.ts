import { Argon2id } from 'oslo/password';
import { generateId } from 'lucia'; // Lucia's own ID generator

const ID_LENGTH = 15; // Standard length for Lucia IDs
const argon2id = new Argon2id();

export const generateUserId = (): string => {
  return generateId(ID_LENGTH);
};

export const hashPassword = async (password: string): Promise<string> => {
  // oslo/password uses Argon2id by default
  return await argon2id.hash(password);
};

export const verifyPassword = async (
  hashedPassword: string,
  plainTextPassword: string,
): Promise<boolean> => {
  return await argon2id.verify(hashedPassword, plainTextPassword);
};
