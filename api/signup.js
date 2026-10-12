import { sql, handler, need, hash, ApiError, SIGNUP_BONUS } from "../lib/db.js";

export default handler(async (b) => {
  const name = need(b, "name"), email = need(b, "email").toLowerCase(), password = need(b, "password");
  const exists = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (exists.length) throw new ApiError("Account already exists");
  const [u] = await sql`INSERT INTO users (name, email, password_hash)
    VALUES (${name}, ${email}, ${hash(password)}) RETURNING id`;
  await sql`INSERT INTO wallets (user_id, balance) VALUES (${u.id}, ${SIGNUP_BONUS})`;
  await sql`INSERT INTO wallet_transactions (user_id, amount, type, note) VALUES (${u.id}, ${SIGNUP_BONUS}, 'ADD', 'Signup bonus')`;
  return { id: u.id, name, email };
});
