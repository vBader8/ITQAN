/**
 * Thin logging abstraction — structured JSON in production (for log
 * aggregation), readable text in development. Swapping in a real provider
 * (Sentry, Axiom, Datadog) later means changing this file only; no call
 * site should import `console` directly for anything operationally
 * meaningful. See docs/ROADMAP.md.
 */
type LogLevel = "debug" | "info" | "warn" | "error";

type LogFields = Record<string, unknown>;

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function write(level: LogLevel, message: string, fields?: LogFields) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...fields,
  };

  const output = isProduction()
    ? JSON.stringify(entry)
    : `[${level.toUpperCase()}] ${message}${fields ? ` ${JSON.stringify(fields)}` : ""}`;

  const consoleMethod =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.log;
  consoleMethod(output);
}

export const logger = {
  debug: (message: string, fields?: LogFields) =>
    write("debug", message, fields),
  info: (message: string, fields?: LogFields) => write("info", message, fields),
  warn: (message: string, fields?: LogFields) => write("warn", message, fields),
  error: (message: string, fields?: LogFields) =>
    write("error", message, fields),
};
