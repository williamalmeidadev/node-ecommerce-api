import { pool } from "../pg/pool";

export type UserOutput = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export async function createUser(
  name: string,
  email: string,
  passwordHash: string,
): Promise<UserOutput> {
  const query = `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, created_at
  `;

  const result = await pool.query<UserOutput>(query, [name, email, passwordHash]);
  return result.rows[0];
}

export async function listUsers(): Promise<UserOutput[]> {
  const result = await pool.query<UserOutput>(
    "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC",
  );

  return result.rows;
}

export async function getUserById(id: string): Promise<UserOutput | null> {
  const result = await pool.query<UserOutput>(
    "SELECT id, name, email, created_at FROM users WHERE id = $1",
    [id],
  );

  return result.rows[0] || null;
}

export async function updateUser(
  id: string,
  name: string,
  email: string,
): Promise<UserOutput | null> {
  const result = await pool.query<UserOutput>(
    `
      UPDATE users
      SET name = $2, email = $3
      WHERE id = $1
      RETURNING id, name, email, created_at
    `,
    [id, name, email],
  );

  return result.rows[0] || null;
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<boolean> {
  const result = await pool.query(
    "UPDATE users SET password_hash = $2 WHERE id = $1",
    [id, passwordHash],
  );

  return result.rowCount === 1;
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
  return result.rowCount === 1;
}
