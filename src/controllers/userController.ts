import bcrypt from "bcrypt";
import { Request, Response } from "express";
import * as userRepository from "../repositories/userRepository";

const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

export async function create(req: Request, res: Response): Promise<Response> {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required" });
  }

  try {
    const passwordHash = await bcrypt.hash(String(password), saltRounds);
    const user = await userRepository.createUser(String(name), String(email), passwordHash);
    return res.status(201).json(user);
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return res.status(409).json({ error: "email already exists" });
    }

    return res.status(500).json({ error: "internal server error" });
  }
}

export async function list(_req: Request, res: Response): Promise<Response> {
  const users = await userRepository.listUsers();
  return res.status(200).json(users);
}

export async function get(req: Request, res: Response): Promise<Response> {
  const user = await userRepository.getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }

  return res.status(200).json(user);
}

export async function update(req: Request, res: Response): Promise<Response> {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  const user = await userRepository.updateUser(req.params.id, String(name), String(email));

  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }

  return res.status(200).json(user);
}

export async function updatePassword(req: Request, res: Response): Promise<Response> {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "password is required" });
  }

  const passwordHash = await bcrypt.hash(String(password), saltRounds);
  const updated = await userRepository.updateUserPassword(req.params.id, passwordHash);

  if (!updated) {
    return res.status(404).json({ error: "user not found" });
  }

  return res.status(204).send();
}

export async function remove(req: Request, res: Response): Promise<Response> {
  const deleted = await userRepository.deleteUser(req.params.id);

  if (!deleted) {
    return res.status(404).json({ error: "user not found" });
  }

  return res.status(204).send();
}
