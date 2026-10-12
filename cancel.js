import { sql, handler, need, balance, ApiError } from "../../lib/db.js";

export default handler(async (b) => {
  const id = Number(need(b, "userId")), rideId = Number(need(b, "rideId"));
  const r = await sql`UPDATE rides SET status = 'Cancelled'
    WHERE id = ${rideId} AND user_id = ${id} AND status = 'Confirmed' RETURNING fare`;
  if (!r.length) throw new ApiError("Ride not found");
  const fare = Number(r[0].fare);
  await sql`UPDATE wallets SET balance = balance + ${fare} WHERE user_id = ${id}`;
  await sql`INSERT INTO wallet_transactions (user_id, amount, type, note) VALUES (${id}, ${fare}, 'REFUND', ${"Ride #" + rideId + " cancelled"})`;
  return { balance: await balance(id) };
});
