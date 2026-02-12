import { pool } from "../pg/pool";
import type { PoolClient } from "pg";

export type OrderOutput = {
  id: string;
  user_id: string;
  status: "pending" | "paid" | "canceled";
  created_at: string;
};

export type OrderItemOutput = {
  product_id: string;
  product_name: string;
  quantity: number;
  price_cents_snapshot: number;
};

export type OrderWithItemsOutput = OrderOutput & {
  items: OrderItemOutput[];
};

export type OrderItemInput = {
  product_id: string;
  quantity: number;
};

async function insertOrder(
  client: PoolClient,
  userId: string,
  status: OrderOutput["status"],
): Promise<OrderOutput> {
  const result = await client.query<OrderOutput>(
    `
      INSERT INTO orders (user_id, status)
      VALUES ($1, $2)
      RETURNING id, user_id, status, created_at
    `,
    [userId, status],
  );

  return result.rows[0];
}

async function insertOrderItem(
  client: PoolClient,
  orderId: string,
  item: OrderItemInput,
): Promise<void> {
  const result = await client.query(
    `
      INSERT INTO order_items (order_id, product_id, quantity, price_cents_snapshot)
      SELECT $1, $2, $3, p.price_cents
      FROM products p
      WHERE p.id = $2
    `,
    [orderId, item.product_id, item.quantity],
  );

  if (result.rowCount !== 1) {
    throw new Error(`product not found: ${item.product_id}`);
  }
}

async function replaceOrderItems(
  client: PoolClient,
  orderId: string,
  items: OrderItemInput[],
): Promise<void> {
  await client.query("DELETE FROM order_items WHERE order_id = $1", [orderId]);

  for (const item of items) {
    await insertOrderItem(client, orderId, item);
  }
}

async function getOrderWithItemsByIdFromClient(
  client: PoolClient,
  id: string,
): Promise<OrderWithItemsOutput | null> {
  const orderResult = await client.query<OrderOutput>(
    `
      SELECT id, user_id, status, created_at
      FROM orders
      WHERE id = $1
    `,
    [id],
  );

  const order = orderResult.rows[0] || null;

  if (!order) {
    return null;
  }

  const itemsResult = await client.query<OrderItemOutput>(
    `
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        oi.quantity,
        oi.price_cents_snapshot
      FROM order_items oi
      INNER JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $1
      ORDER BY p.name ASC
    `,
    [id],
  );

  return {
    ...order,
    items: itemsResult.rows,
  };
}

export async function createOrder(
  userId: string,
  status: OrderOutput["status"],
  items: OrderItemInput[],
): Promise<OrderWithItemsOutput> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const order = await insertOrder(client, userId, status);
    await replaceOrderItems(client, order.id, items);
    const createdOrder = await getOrderWithItemsByIdFromClient(client, order.id);

    if (!createdOrder) {
      throw new Error("failed to load created order");
    }

    await client.query("COMMIT");
    return createdOrder;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listOrders(): Promise<OrderOutput[]> {
  const result = await pool.query<OrderOutput>(
    `
      SELECT id, user_id, status, created_at
      FROM orders
      ORDER BY created_at DESC
    `,
  );

  return result.rows;
}

export async function getOrderById(id: string): Promise<OrderWithItemsOutput | null> {
  const client = await pool.connect();

  try {
    return await getOrderWithItemsByIdFromClient(client, id);
  } finally {
    client.release();
  }
}

export async function updateOrder(
  id: string,
  status?: OrderOutput["status"],
  items?: OrderItemInput[],
): Promise<OrderWithItemsOutput | null> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const existingOrder = await getOrderWithItemsByIdFromClient(client, id);

    if (!existingOrder) {
      await client.query("ROLLBACK");
      return null;
    }

    if (status) {
      await client.query(
        `
          UPDATE orders
          SET status = $2
          WHERE id = $1
        `,
        [id, status],
      );
    }

    if (items) {
      await replaceOrderItems(client, id, items);
    }

    const updatedOrder = await getOrderWithItemsByIdFromClient(client, id);
    await client.query("COMMIT");
    return updatedOrder;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteOrder(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM orders WHERE id = $1", [id]);
  return result.rowCount === 1;
}

export async function getOrderDetail(id: string): Promise<OrderWithItemsOutput | null> {
  return getOrderById(id);
}
