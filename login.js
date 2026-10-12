import { sql, handler, need, hash, ApiError } from "../lib/db.js";

export default handler(async (b) => {
  const email = need(b, "email").toLowerCase(), password = need(b, "password");
  const r = await sql`SELECT id, name FROM users WHERE email = ${email} AND password_hash = ${hash(password)}`;
  if (!r.length) throw new ApiError("Wrong email or password");
  return { id: r[0].id, name: r[0].name, email };
});
