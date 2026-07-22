"use client";

import { useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { Button } from "@/design-system/components/button";
import { Input } from "@/design-system/components/input";
import { Card, CardContent } from "@/design-system/components/card";

export function AssistantChat() {
  const t = useTranslations("Assistant");
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/assistant" }),
  });

  const busy = status === "streaming" || status === "submitted";

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void sendMessage({ text });
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-sm">{t("emptyState")}</p>
        )}

        {messages.map((message) => (
          <Card
            key={message.id}
            className={
              message.role === "user"
                ? "bg-accent ms-auto max-w-[85%] border-none shadow-none"
                : "max-w-[85%] border-none shadow-none"
            }
          >
            <CardContent className="p-3 text-sm leading-relaxed">
              <span dir="auto">
                {message.parts
                  .filter((part) => part.type === "text")
                  .map((part) => part.text)
                  .join("")}
              </span>
            </CardContent>
          </Card>
        ))}

        {error && (
          <p role="alert" className="text-destructive text-sm">
            {t("error")}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t("placeholder")}
          disabled={busy}
          aria-label={t("placeholder")}
        />
        <Button type="submit" size="icon" disabled={busy || !input.trim()}>
          <Send className="size-4" aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}
