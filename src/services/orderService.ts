import * as orderRepository from "../repositories/orderRepository";
import * as productRepository from "../repositories/productRepository";
import * as userRepository from "../repositories/userRepository";
import { AppError } from "./errors";

type OrderStatus = "pending" | "paid" | "canceled";

function isValidOrderStatus(status: unknown): status is OrderStatus {
  return status === "pending" || status === "paid" || status === "canceled";
}

function normalizeItems(
  input: unknown,
  options?: { allowEmpty: boolean },
): orderRepository.OrderItemInput[] {
  const allowEmpty = options?.allowEmpty ?? false;

  if (!Array.isArray(input)) {
    throw new AppError("items must be an array", 400);
  }

  if (!allowEmpty && input.length === 0) {
    throw new AppError("items must be a non-empty array", 400);
  }

  const normalized = input.map((item) => {
    const record = item as { product_id?: unknown; quantity?: unknown };
    const productId = record.product_id;
    const quantity = record.quantity;

    if (!productId || !Number.isInteger(quantity) || Number(quantity) <= 0) {
      throw new AppError("each item must have product_id and a positive integer quantity", 400);
    }

    return {
      product_id: String(productId),
      quantity: Number(quantity),
    };
  });

  const uniqueProductIds = new Set(normalized.map((item) => item.product_id));

  if (uniqueProductIds.size !== normalized.length) {
    throw new AppError("items cannot contain duplicated product_id", 400);
  }

  return normalized;
}

async function validateProductsExist(items: orderRepository.OrderItemInput[]): Promise<void> {
  for (const item of items) {
    const product = await productRepository.getProductById(item.product_id);

    if (!product) {
      throw new AppError(`product not found: ${item.product_id}`, 404);
    }
  }
}

async function validateUserExists(userId: string): Promise<void> {
  const user = await userRepository.getUserById(userId);

  if (!user) {
    throw new AppError("user not found", 404);
  }
}

export async function createOrder(input: {
  user_id: unknown;
  status: unknown;
  items: unknown;
}) {
  const { user_id: userId, status, items } = input;

  if (!userId || !isValidOrderStatus(status)) {
    throw new AppError("user_id and a valid status are required", 400);
  }

  const normalizedItems = normalizeItems(items);
  await validateUserExists(String(userId));
  await validateProductsExist(normalizedItems);

  return orderRepository.createOrder(String(userId), status, normalizedItems);
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
  input: { status?: unknown; items?: unknown },
) {
  const { status, items } = input;
  const hasStatus = status !== undefined;
  const hasItems = items !== undefined;

  if (!hasStatus && !hasItems) {
    throw new AppError("status and/or items are required", 400);
  }

  if (hasStatus && !isValidOrderStatus(status)) {
    throw new AppError("valid status is required", 400);
  }

  const normalizedItems = hasItems ? normalizeItems(items, { allowEmpty: true }) : undefined;

  if (normalizedItems) {
    await validateProductsExist(normalizedItems);
  }

  const order = await orderRepository.updateOrder(id, status, normalizedItems);

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
  const order = await orderRepository.getOrderDetail(id);

  if (!order) {
    throw new AppError("order not found", 404);
  }

  return order;
}
