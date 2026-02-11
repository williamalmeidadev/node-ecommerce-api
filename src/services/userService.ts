import bcrypt from "bcrypt";
import * as userRepository from "../repositories/userRepository";
import { AppError } from "./errors";

const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

export async function createUser(input: {
  name: unknown;
  email: unknown;
  password: unknown;
}) {
  const { name, email, password } = input;

  if (!name || !email || !password) {
    throw new AppError("name, email and password are required", 400);
  }

  try {
    const passwordHash = await bcrypt.hash(String(password), saltRounds);
    return await userRepository.createUser(String(name), String(email), passwordHash);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      throw new AppError("email already exists", 409);
    }

    throw new AppError("internal server error", 500);
  }
}

export async function listUsers() {
  return userRepository.listUsers();
}

export async function getUserById(id: string) {
  const user = await userRepository.getUserById(id);

  if (!user) {
    throw new AppError("user not found", 404);
  }

  return user;
}

export async function updateUser(
  id: string,
  input: { name: unknown; email: unknown },
) {
  const { name, email } = input;

  if (!name || !email) {
    throw new AppError("name and email are required", 400);
  }

  const user = await userRepository.updateUser(id, String(name), String(email));

  if (!user) {
    throw new AppError("user not found", 404);
  }

  return user;
}

export async function updateUserPassword(
  id: string,
  input: { password: unknown },
) {
  const { password } = input;

  if (!password) {
    throw new AppError("password is required", 400);
  }

  const passwordHash = await bcrypt.hash(String(password), saltRounds);
  const updated = await userRepository.updateUserPassword(id, passwordHash);

  if (!updated) {
    throw new AppError("user not found", 404);
  }
}

export async function deleteUser(id: string) {
  const deleted = await userRepository.deleteUser(id);

  if (!deleted) {
    throw new AppError("user not found", 404);
  }
}
