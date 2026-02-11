import { Request, Response } from "express";
import * as productService from "../services/productService";
import { AppError } from "../services/errors";

function handleError(res: Response, error: unknown): Response {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  return res.status(500).json({ error: "internal server error" });
}

export async function create(req: Request, res: Response): Promise<Response> {
  try {
    const product = await productService.createProduct(req.body);
    return res.status(201).json(product);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function list(_req: Request, res: Response): Promise<Response> {
  try {
    const products = await productService.listProducts();
    return res.status(200).json(products);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function get(req: Request, res: Response): Promise<Response> {
  try {
    const product = await productService.getProductById(req.params.id);
    return res.status(200).json(product);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function update(req: Request, res: Response): Promise<Response> {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return res.status(200).json(product);
  } catch (error: unknown) {
    return handleError(res, error);
  }
}

export async function remove(req: Request, res: Response): Promise<Response> {
  try {
    await productService.deleteProduct(req.params.id);
    return res.status(204).send();
  } catch (error: unknown) {
    return handleError(res, error);
  }
}
