import { Request, Response } from "express";
import * as orderRepository from "../repositories/orderRepository";

type OrderStatus = "pending" | "paid" | "canceled";

function isValidOrderStatus(status: unknown): status is OrderStatus {
  return status === "pending" || status === "paid" || status === "canceled";
}

export async function create(req: Request, res: Response): Promise<Response> {
  const { user_id: userId, status } = req.body;

  if (!userId || !isValidOrderStatus(status)) {
    return res.status(400).json({ error: "user_id and a valid status are required" });
  }

  const order = await orderRepository.createOrder(String(userId), status);
  return res.status(201).json(order);
}

export async function list(_req: Request, res: Response): Promise<Response> {
  const orders = await orderRepository.listOrders();
  return res.status(200).json(orders);
}

export async function get(req: Request, res: Response): Promise<Response> {
  const order = await orderRepository.getOrderById(req.params.id);

  if (!order) {
    return res.status(404).json({ error: "order not found" });
  }

  return res.status(200).json(order);
}

export async function update(req: Request, res: Response): Promise<Response> {
  const { status } = req.body;

  if (!isValidOrderStatus(status)) {
    return res.status(400).json({ error: "valid status is required" });
  }

  const order = await orderRepository.updateOrder(req.params.id, status);

  if (!order) {
    return res.status(404).json({ error: "order not found" });
  }

  return res.status(200).json(order);
}

export async function remove(req: Request, res: Response): Promise<Response> {
  const deleted = await orderRepository.deleteOrder(req.params.id);

  if (!deleted) {
    return res.status(404).json({ error: "order not found" });
  }

  return res.status(204).send();
}

export async function detail(req: Request, res: Response): Promise<Response> {
  const rows = await orderRepository.getOrderDetail(req.params.id);

  if (rows.length === 0) {
    return res.status(404).json({ error: "order not found" });
  }

  return res.status(200).json(rows);
}
