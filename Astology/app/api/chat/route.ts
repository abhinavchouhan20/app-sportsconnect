import { NextResponse } from "next/server";
import { buildAstroChatReply } from "@/lib/chat-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json(
    await buildAstroChatReply({
      message: body.message ?? "",
      userName: body.userName ?? "",
      plan: body.plan ?? "Free",
      birthProfile: body.birthProfile
    })
  );
}
