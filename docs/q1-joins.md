# Question 1 - PostgreSQL Tables and JOINs

## What was created
The script `sql/q1_schema_and_joins.sql` creates a small e-commerce schema with these tables:
- `users`
- `products`
- `orders`
- `order_items`

It also inserts sample data and runs a multi-table `INNER JOIN` query.

## JOIN Used
The query uses this chain:
- `orders o`
- `INNER JOIN users u ON u.id = o.user_id`
- `INNER JOIN order_items oi ON oi.order_id = o.id`
- `INNER JOIN products p ON p.id = oi.product_id`

## Why INNER JOIN
`INNER JOIN` was chosen because we only want complete order records with valid relationships:
- order + user
- order + items
- item + product

If any relation is missing, the row should not appear in the result set. This is the expected behavior for order detail reports.

## How to run in psql
```sql
\i sql/q1_schema_and_joins.sql
```

## Evidence to capture (screenshots)
- Table creation output in `psql`
- Insert statements output in `psql`
- Final JOIN query result in `psql`
