import * as orderRepository from "../repositories/orderRepository";
import { AppError } from "./errors";

type OrderStatus = "pending" | "paid" | "canceled";

function isValidOrderStatus(status: unknown): status is OrderStatus {
  return status === "pending" || status === "paid" || status === "canceled";
}

export async function createOrder(input: {
  user_id: unknown;
  status: unknown;
}) {
  const { user_id: userId, status } = input;

  if (!userId || !isValidOrderStatus(status)) {
    throw new AppError("user_id and a valid status are required", 400);
  }

  return orderRepository.createOrder(String(userId), status);
}

export async function listOrders() {
  return orderRepository.listOrders();
}

export async function getOrderById(id: string) {
  const order = await orderRepository.getOrderById(id);

  if (!order) {
    throw new AppError("order not found", 404);
  }

  return order;
}

export async function updateOrder(
  id: string,
  input: { status: unknown },
) {
  const { status } = input;

  if (!isValidOrderStatus(status)) {
    throw new AppError("valid status is required", 400);
  }

  const order = await orderRepository.updateOrder(id, status);

  if (!order) {
    throw new AppError("order not found", 404);
  }

  return order;
}

export async function deleteOrder(id: string) {
  const deleted = await orderRepository.deleteOrder(id);

  if (!deleted) {
    throw new AppError("order not found", 404);
  }
}

export async function getOrderDetail(id: string) {
  const rows = await orderRepository.getOrderDetail(id);

  if (rows.length === 0) {
    throw new AppError("order not found", 404);
  }

  return rows;
}
