import { handler, need, balance } from "../lib/db.js";

export default handler(async (b) => ({ balance: await balance(Number(need(b, "userId"))) }));
