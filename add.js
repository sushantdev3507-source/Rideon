import { sql, handler, need, balance, ApiError } from "../../lib/db.js";

export default handler(async (b) => {
  const id = Number(need(b, "userId")), amt = Number(need(b, "amount"));
  if (!(amt > 0 && amt <= 50000)) throw new ApiError("Enter an amount between 1 and 50000");
  await sql`UPDATE wallets SET balance = balance + ${amt} WHERE user_id = ${id}`;
  await sql`INSERT INTO wallet_transactions (user_id, amount, type, note) VALUES (${id}, ${amt}, 'ADD', 'Money added')`;
  return { balance: await balance(id) };
});
