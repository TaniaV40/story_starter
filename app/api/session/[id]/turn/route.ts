import { NextResponse } from "next/server";
import { processTurnAnswer } from "@/lib/session-store";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(props.params);
    const sessionId = params.id;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID parameter is required." },
        { status: 400 }
      );
    }

    const body = (await request.json()) as any;
    const userAnswer = body?.user_answer || body?.userAnswer || body?.answer;

    if (!userAnswer || typeof userAnswer !== "string" || !userAnswer.trim()) {
      return NextResponse.json(
        { error: "A valid user_answer string is required." },
        { status: 400 }
      );
    }

    const { session, turnResponse } = await processTurnAnswer(sessionId, userAnswer);

    return NextResponse.json({
      success: true,
      session,
      turn: turnResponse,
    });
  } catch (error: any) {
    console.error("Error processing turn answer:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process turn." },
      { status: 500 }
    );
  }
}
