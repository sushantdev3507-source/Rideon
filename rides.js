import { sql, handler, need } from "../lib/db.js";

export default handler(async (b) => {
  const rows = await sql`SELECT id, title, detail, fare, status, created_at FROM rides
    WHERE user_id = ${Number(need(b, "userId"))} ORDER BY id DESC`;
  return rows.map((r) => ({ ...r, fare: Number(r.fare), date: new Date(r.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) }));
});
