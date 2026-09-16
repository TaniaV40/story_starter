import { NextResponse } from "next/server";
import { getSession } from "@/lib/session-store";

export const dynamic = "force-dynamic";

export async function GET(
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

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error: any) {
    console.error("Error retrieving session:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve session." },
      { status: 500 }
    );
  }
}
