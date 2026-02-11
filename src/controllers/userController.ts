import { Request, Response } from "express";
import * as userService from "../services/userService";
import { AppError } from "../services/errors";

function handleError(res: Response, error: unknown): Response {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  return res.status(500).json({ error: "internal server error" });
}

export async function create(req: Request, res: Response): Promise<Response> {
  try {
    const user = await userService.createUser(req.body);
    return res.status(201).json(user);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function list(_req: Request, res: Response): Promise<Response> {
  try {
    const users = await userService.listUsers();
    return res.status(200).json(users);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function get(req: Request, res: Response): Promise<Response> {
  try {
    const user = await userService.getUserById(req.params.id);
    return res.status(200).json(user);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function update(req: Request, res: Response): Promise<Response> {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return res.status(200).json(user);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function updatePassword(req: Request, res: Response): Promise<Response> {
  try {
    await userService.updateUserPassword(req.params.id, req.body);
    return res.status(204).send();
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function remove(req: Request, res: Response): Promise<Response> {
  try {
    await userService.deleteUser(req.params.id);
    return res.status(204).send();
  } catch (error: unknown) {
    return handleError(res, error);
  }
}
