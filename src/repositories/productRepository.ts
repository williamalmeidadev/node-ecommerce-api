import { pool } from "../pg/pool";

export type ProductOutput = {
  id: string;
  name: string;
  price_cents: number;
  stock: number;
  created_at: string;
};

export async function createProduct(
  name: string,
  priceCents: number,
  stock: number,
): Promise<ProductOutput> {
  const result = await pool.query<ProductOutput>(
    `
      INSERT INTO ecommerce.products (name, price_cents, stock)
      VALUES ($1, $2, $3)
      RETURNING id, name, price_cents, stock, created_at
    `,
    [name, priceCents, stock],
  );

  return result.rows[0];
}

export async function listProducts(): Promise<ProductOutput[]> {
  const result = await pool.query<ProductOutput>(
    `
      SELECT id, name, price_cents, stock, created_at
      FROM ecommerce.products
      ORDER BY created_at DESC
    `,
  );

  return result.rows;
}

export async function getProductById(id: string): Promise<ProductOutput | null> {
  const result = await pool.query<ProductOutput>(
    `
      SELECT id, name, price_cents, stock, created_at
      FROM ecommerce.products
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] || null;
}

export async function updateProduct(
  id: string,
  name: string,
  priceCents: number,
  stock: number,
): Promise<ProductOutput | null> {
  const result = await pool.query<ProductOutput>(
    `
      UPDATE ecommerce.products
      SET name = $2, price_cents = $3, stock = $4
      WHERE id = $1
      RETURNING id, name, price_cents, stock, created_at
    `,
    [id, name, priceCents, stock],
  );

  return result.rows[0] || null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM ecommerce.products WHERE id = $1", [id]);
  return result.rowCount === 1;
}
