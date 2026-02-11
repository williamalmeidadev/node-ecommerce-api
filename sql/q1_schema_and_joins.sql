CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS ecommerce;
SET search_path TO ecommerce;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'canceled')),
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_cents_snapshot INTEGER NOT NULL CHECK (price_cents_snapshot >= 0)
);

INSERT INTO users (name, email, password_hash) VALUES
('Diego Alves', 'diego@example.com', 'hash_fake'),
('Carla Souza', 'carla@example.com', 'hash_fake')
ON CONFLICT (email) DO NOTHING;

INSERT INTO products (name, price_cents, stock) VALUES
('Mouse', 5000, 10),
('Keyboard', 12000, 5),
('Headset', 15000, 2)
ON CONFLICT DO NOTHING;

INSERT INTO orders (user_id, status)
SELECT u.id, x.status
FROM (VALUES
  ('diego@example.com', 'paid'),
  ('carla@example.com', 'pending')
) AS x(email, status)
JOIN users u ON u.email = x.email;

INSERT INTO order_items (order_id, product_id, quantity, price_cents_snapshot)
SELECT
  o.id,
  p.id,
  x.quantity,
  x.price_cents_snapshot
FROM (VALUES
  ('diego@example.com', 'Mouse', 2, 5000),
  ('carla@example.com', 'Keyboard', 1, 12000)
) AS x(email, product_name, quantity, price_cents_snapshot)
JOIN orders o ON o.user_id = (SELECT id FROM users WHERE email = x.email)
JOIN products p ON p.name = x.product_name;

SELECT
  o.id AS order_id,
  u.name AS user_name,
  u.email,
  o.status,
  p.name AS product_name,
  oi.quantity,
  oi.price_cents_snapshot
FROM orders o
INNER JOIN users u ON u.id = o.user_id
INNER JOIN order_items oi ON oi.order_id = o.id
INNER JOIN products p ON p.id = oi.product_id
ORDER BY o.created_at DESC;
