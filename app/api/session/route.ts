import { NextResponse } from "next/server";
import { createSession } from "@/lib/session-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as any;
    const storySeed = body?.story_seed || body?.storySeed;

    if (!storySeed || typeof storySeed !== "string" || !storySeed.trim()) {
      return NextResponse.json(
        { error: "A valid story_seed string is required." },
        { status: 400 }
      );
    }

    const { session, turn1Response } = await createSession(storySeed);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      session,
      turn: turn1Response,
    });
  } catch (error: any) {
    console.error("Error creating Story Starter session:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to initialize story session." },
      { status: 500 }
    );
  }
}
