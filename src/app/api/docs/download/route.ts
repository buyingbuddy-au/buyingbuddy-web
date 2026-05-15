import { POST as sendContractPack } from "../../contract-pack/send/route";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return sendContractPack(req);
}
