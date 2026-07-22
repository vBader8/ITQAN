import { describe, expect, it } from "vitest";
import { ASSISTANT_SYSTEM_PROMPT } from "@/features/assistant/system-prompt";

// Guards against accidentally weakening the assistant's safety rules in a
// future edit — these constraints are non-negotiable per the platform's
// requirements, not just a style preference.
describe("ASSISTANT_SYSTEM_PROMPT", () => {
  it("instructs the model not to issue religious rulings", () => {
    expect(ASSISTANT_SYSTEM_PROMPT).toMatch(
      /fatwas|definitive religious rulings/i,
    );
    expect(ASSISTANT_SYSTEM_PROMPT).toMatch(/qualified.*scholar/i);
  });

  it("instructs the model not to quote scripture from memory", () => {
    expect(ASSISTANT_SYSTEM_PROMPT).toMatch(/must not/i);
    expect(ASSISTANT_SYSTEM_PROMPT).toMatch(/quote exact quranic/i);
  });

  it("points users to the platform's own Quran/Hadith sections for exact wording", () => {
    expect(ASSISTANT_SYSTEM_PROMPT).toMatch(/Quran and Hadith sections/i);
  });
});
