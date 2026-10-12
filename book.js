import { sql, handler, need, balance, ApiError } from "../../lib/db.js";

export default handler(async (b) => {
  const id = Number(need(b, "userId")), fare = Number(need(b, "fare")), title = need(b, "title");
  if (!(fare > 0)) throw new ApiError("Invalid fare");
  // Pay from wallet only if there is enough balance (single atomic statement)
  const paid = await sql`UPDATE wallets SET balance = balance - ${fare}
    WHERE user_id = ${id} AND balance >= ${fare} RETURNING balance`;
  if (!paid.length) throw new ApiError("Not enough wallet balance. Please add money.");
  await sql`INSERT INTO rides (user_id, title, detail, fare) VALUES (${id}, ${title}, ${b.detail || ""}, ${fare})`;
  await sql`INSERT INTO wallet_transactions (user_id, amount, type, note) VALUES (${id}, ${-fare}, 'PAYMENT', ${title})`;
  return { balance: await balance(id) };
});
