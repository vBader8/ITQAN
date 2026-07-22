import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { ASSISTANT_SYSTEM_PROMPT } from "@/features/assistant/system-prompt";

export const maxDuration = 30;

const MODEL_ID = process.env.ASSISTANT_MODEL ?? "claude-sonnet-5";
const RATE_LIMIT = { limit: 20, windowMs: 10 * 60 * 1000 };

// Loose on purpose — UIMessage's full shape (tool parts, data parts, etc.)
// evolves with the SDK, and our own client only ever sends text parts. This
// exists to reject obviously malformed bodies before they reach
// convertToModelMessages, not to fully re-validate the SDK's message type.
const requestBodySchema = z.object({
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["system", "user", "assistant"]),
      parts: z.array(z.record(z.string(), z.unknown())),
    }),
  ),
});

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "assistant_not_configured" },
      { status: 503 },
    );
  }

  // Trusted only because Vercel's edge network sets this itself and strips
  // any client-supplied value — if this app is ever deployed behind a
  // different proxy, that assumption needs re-checking before this limiter
  // is meaningful.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(ip, RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const parsed = requestBodySchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const result = streamText({
    model: anthropic(MODEL_ID),
    system: ASSISTANT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(parsed.data.messages as UIMessage[]),
  });

  return result.toUIMessageStreamResponse();
}
