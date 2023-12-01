import { createClient } from "@vercel/kv";
import { cookies} from "next/headers"
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  cookies()
  const counter = createClient({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  const current = (await counter.get<number>("headpats")) ?? 0;

  return new NextResponse(`${current}`);
}
