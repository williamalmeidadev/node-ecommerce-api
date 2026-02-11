import { Request, Response } from "express";
import * as orderService from "../services/orderService";
import { AppError } from "../services/errors";

function handleError(res: Response, error: unknown): Response {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  return res.status(500).json({ error: "internal server error" });
}

export async function create(req: Request, res: Response): Promise<Response> {
  try {
    const order = await orderService.createOrder(req.body);
    return res.status(201).json(order);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function list(_req: Request, res: Response): Promise<Response> {
  try {
    const orders = await orderService.listOrders();
    return res.status(200).json(orders);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function get(req: Request, res: Response): Promise<Response> {
  try {
    const order = await orderService.getOrderById(req.params.id);
    return res.status(200).json(order);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function update(req: Request, res: Response): Promise<Response> {
  try {
    const order = await orderService.updateOrder(req.params.id, req.body);
    return res.status(200).json(order);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function remove(req: Request, res: Response): Promise<Response> {
  try {
    await orderService.deleteOrder(req.params.id);
    return res.status(204).send();
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function detail(req: Request, res: Response): Promise<Response> {
  try {
    const rows = await orderService.getOrderDetail(req.params.id);
    return res.status(200).json(rows);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}
