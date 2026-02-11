import * as productRepository from "../repositories/productRepository";
import { AppError } from "./errors";

function areProductFieldsValid(name: unknown, priceCents: unknown, stock: unknown): boolean {
  if (typeof name !== "string" || name.trim().length === 0) {
    return false;
  }

  if (!Number.isInteger(Number(priceCents)) || Number(priceCents) < 0) {
    return false;
  }

  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
    return false;
  }

  return true;
}

export async function createProduct(input: {
  name: unknown;
  price_cents: unknown;
  stock: unknown;
}) {
  const { name, price_cents: priceCents, stock } = input;

  if (!areProductFieldsValid(name, priceCents, stock)) {
    throw new AppError("name, price_cents and stock are required with valid values", 400);
  }

  return productRepository.createProduct(String(name).trim(), Number(priceCents), Number(stock));
}

export async function listProducts() {
  return productRepository.listProducts();
}

export async function getProductById(id: string) {
  const product = await productRepository.getProductById(id);

  if (!product) {
    throw new AppError("product not found", 404);
  }

  return product;
}

export async function updateProduct(
  id: string,
  input: { name: unknown; price_cents: unknown; stock: unknown },
) {
  const { name, price_cents: priceCents, stock } = input;

  if (!areProductFieldsValid(name, priceCents, stock)) {
    throw new AppError("name, price_cents and stock are required with valid values", 400);
  }

  const product = await productRepository.updateProduct(
    id,
    String(name).trim(),
    Number(priceCents),
    Number(stock),
  );

  if (!product) {
    throw new AppError("product not found", 404);
  }

  return product;
}

export async function deleteProduct(id: string) {
  const deleted = await productRepository.deleteProduct(id);

  if (!deleted) {
    throw new AppError("product not found", 404);
  }
}
