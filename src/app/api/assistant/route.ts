import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { ASSISTANT_SYSTEM_PROMPT } from "@/features/assistant/system-prompt";

export const maxDuration = 30;

const MODEL_ID = process.env.ASSISTANT_MODEL ?? "claude-sonnet-5";
const RATE_LIMIT = { limit: 20, windowMs: 10 * 60 * 1000 };

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "assistant_not_configured" },
      { status: 503 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(ip, RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: anthropic(MODEL_ID),
    system: ASSISTANT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
