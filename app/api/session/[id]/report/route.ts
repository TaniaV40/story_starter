import { NextResponse } from "next/server";
import { generateReport } from "@/lib/session-store";

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
    const finalAnswer = body?.user_answer || body?.userAnswer || body?.answer || "Final confirmation verified.";

    const { session, report } = await generateReport(sessionId, finalAnswer);

    return NextResponse.json({
      success: true,
      session,
      report,
    });
  } catch (error: any) {
    console.error("Error generating Turn 4 viability report:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate viability report." },
      { status: 500 }
    );
  }
}
