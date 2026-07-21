import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/design-system/components/button";

describe("Button", () => {
  it("renders a native button by default", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("disables and marks aria-busy while loading", () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  // Regression test: asChild must render exactly one element into Radix
  // Slot. Passing the loading spinner as a sibling of `children` broke this
  // in production (see git history) because Slot requires a single child.
  it("renders a single child element when asChild is set", () => {
    render(
      <Button asChild>
        <a href="https://example.com/quran">Browse</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Browse" });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
  });
});
