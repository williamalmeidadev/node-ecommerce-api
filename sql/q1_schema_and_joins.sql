-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- (Optional) keep everything in the public schema; no SET search_path, no schema prefix.

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NULL,
  updated_by UUID NULL,

  CONSTRAINT users_created_by_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT users_updated_by_fk FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NULL,
  updated_by UUID NULL,

  CONSTRAINT products_name_uk UNIQUE (name),
  CONSTRAINT products_created_by_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT products_updated_by_fk FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  external_ref TEXT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'canceled')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NULL,
  updated_by UUID NULL,

  CONSTRAINT orders_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT orders_external_ref_uk UNIQUE (external_ref),
  CONSTRAINT orders_created_by_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT orders_updated_by_fk FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_cents_snapshot INTEGER NOT NULL CHECK (price_cents_snapshot >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NULL,
  updated_by UUID NULL,

  CONSTRAINT order_items_order_fk FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT order_items_product_fk FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  CONSTRAINT order_items_order_product_uk UNIQUE (order_id, product_id),
  CONSTRAINT order_items_created_by_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT order_items_updated_by_fk FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Seed users (simple; will error if re-run due to unique email)
INSERT INTO users (name, email, password_hash)
VALUES
('Diego Alves', 'diego@example.com', 'hash_fake'),
('Carla Souza', 'carla@example.com', 'hash_fake');

-- Seed products
INSERT INTO products (name, price_cents, stock, created_by, updated_by)
VALUES
('Mouse', 5000, 10, (SELECT id FROM users WHERE email = 'diego@example.com'), (SELECT id FROM users WHERE email = 'diego@example.com')),
('Keyboard', 12000, 5, (SELECT id FROM users WHERE email = 'diego@example.com'), (SELECT id FROM users WHERE email = 'diego@example.com')),
('Headset', 15000, 2, (SELECT id FROM users WHERE email = 'diego@example.com'), (SELECT id FROM users WHERE email = 'diego@example.com'));

-- Seed orders
INSERT INTO orders (user_id, external_ref, status, created_by, updated_by)
VALUES
((SELECT id FROM users WHERE email = 'diego@example.com'), 'seed-order-diego-paid', 'paid',
 (SELECT id FROM users WHERE email = 'diego@example.com'), (SELECT id FROM users WHERE email = 'diego@example.com')),
((SELECT id FROM users WHERE email = 'carla@example.com'), 'seed-order-carla-pending', 'pending',
 (SELECT id FROM users WHERE email = 'carla@example.com'), (SELECT id FROM users WHERE email = 'carla@example.com'));

-- Seed order_items
INSERT INTO order_items (order_id, product_id, quantity, price_cents_snapshot, created_by, updated_by)
VALUES
(
  (SELECT id FROM orders WHERE external_ref = 'seed-order-diego-paid'),
  (SELECT id FROM products WHERE name = 'Mouse'),
  2,
  5000,
  (SELECT user_id FROM orders WHERE external_ref = 'seed-order-diego-paid'),
  (SELECT user_id FROM orders WHERE external_ref = 'seed-order-diego-paid')
),
(
  (SELECT id FROM orders WHERE external_ref = 'seed-order-carla-pending'),
  (SELECT id FROM products WHERE name = 'Keyboard'),
  1,
  12000,
  (SELECT user_id FROM orders WHERE external_ref = 'seed-order-carla-pending'),
  (SELECT user_id FROM orders WHERE external_ref = 'seed-order-carla-pending')
);
