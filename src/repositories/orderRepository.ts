import { pool } from "../pg/pool";

export type OrderOutput = {
  id: string;
  user_id: string;
  status: "pending" | "paid" | "canceled";
  created_at: string;
};

export type OrderDetailOutput = {
  order_id: string;
  status: "pending" | "paid" | "canceled";
  created_at: string;
  user_id: string;
  user_name: string;
  email: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price_cents_snapshot: number;
};

export async function createOrder(userId: string, status: OrderOutput["status"]): Promise<OrderOutput> {
  const result = await pool.query<OrderOutput>(
    `
      INSERT INTO ecommerce.orders (user_id, status)
      VALUES ($1, $2)
      RETURNING id, user_id, status, created_at
    `,
    [userId, status],
  );

  return result.rows[0];
}

export async function listOrders(): Promise<OrderOutput[]> {
  const result = await pool.query<OrderOutput>(
    `
      SELECT id, user_id, status, created_at
      FROM ecommerce.orders
      ORDER BY created_at DESC
    `,
  );

  return result.rows;
}

export async function getOrderById(id: string): Promise<OrderOutput | null> {
  const result = await pool.query<OrderOutput>(
    `
      SELECT id, user_id, status, created_at
      FROM ecommerce.orders
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] || null;
}

export async function updateOrder(
  id: string,
  status: OrderOutput["status"],
): Promise<OrderOutput | null> {
  const result = await pool.query<OrderOutput>(
    `
      UPDATE ecommerce.orders
      SET status = $2
      WHERE id = $1
      RETURNING id, user_id, status, created_at
    `,
    [id, status],
  );

  return result.rows[0] || null;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM ecommerce.orders WHERE id = $1", [id]);
  return result.rowCount === 1;
}

export async function getOrderDetail(id: string): Promise<OrderDetailOutput[]> {
  const result = await pool.query<OrderDetailOutput>(
    `
      SELECT
        o.id AS order_id,
        o.status,
        o.created_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email,
        p.id AS product_id,
        p.name AS product_name,
        oi.quantity,
        oi.price_cents_snapshot
      FROM ecommerce.orders o
      INNER JOIN ecommerce.users u ON u.id = o.user_id
      INNER JOIN ecommerce.order_items oi ON oi.order_id = o.id
      INNER JOIN ecommerce.products p ON p.id = oi.product_id
      WHERE o.id = $1
      ORDER BY p.name ASC
    `,
    [id],
  );

  return result.rows;
}
