import { Request, Response } from "express";
import * as productRepository from "../repositories/productRepository";

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

export async function create(req: Request, res: Response): Promise<Response> {
  const { name, price_cents: priceCents, stock } = req.body;

  if (!areProductFieldsValid(name, priceCents, stock)) {
    return res
      .status(400)
      .json({ error: "name, price_cents and stock are required with valid values" });
  }

  const product = await productRepository.createProduct(
    String(name).trim(),
    Number(priceCents),
    Number(stock),
  );

  return res.status(201).json(product);
}

export async function list(_req: Request, res: Response): Promise<Response> {
  const products = await productRepository.listProducts();
  return res.status(200).json(products);
}

export async function get(req: Request, res: Response): Promise<Response> {
  const product = await productRepository.getProductById(req.params.id);

  if (!product) {
    return res.status(404).json({ error: "product not found" });
  }

  return res.status(200).json(product);
}

export async function update(req: Request, res: Response): Promise<Response> {
  const { name, price_cents: priceCents, stock } = req.body;

  if (!areProductFieldsValid(name, priceCents, stock)) {
    return res
      .status(400)
      .json({ error: "name, price_cents and stock are required with valid values" });
  }

  const product = await productRepository.updateProduct(
    req.params.id,
    String(name).trim(),
    Number(priceCents),
    Number(stock),
  );

  if (!product) {
    return res.status(404).json({ error: "product not found" });
  }

  return res.status(200).json(product);
}

export async function remove(req: Request, res: Response): Promise<Response> {
  const deleted = await productRepository.deleteProduct(req.params.id);

  if (!deleted) {
    return res.status(404).json({ error: "product not found" });
  }

  return res.status(204).send();
}
