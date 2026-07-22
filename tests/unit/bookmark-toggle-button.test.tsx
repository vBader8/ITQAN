import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookmarkToggleButton } from "@/components/bookmark-toggle-button";

const labels = {
  bookmarkLabel: "Bookmark",
  bookmarkedLabel: "Bookmarked",
  authRequiredMessage: "Log in to bookmark",
};

describe("BookmarkToggleButton", () => {
  it("calls onToggle and reflects the result when authenticated", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn().mockResolvedValue({ bookmarked: true });

    render(
      <BookmarkToggleButton
        initialBookmarked={false}
        isAuthenticated
        onToggle={onToggle}
        {...labels}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-pressed", "false");

    await user.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("button")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("does not call onToggle when signed out", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <BookmarkToggleButton
        initialBookmarked={false}
        isAuthenticated={false}
        onToggle={onToggle}
        {...labels}
      />,
    );

    await user.click(screen.getByRole("button"));
    expect(onToggle).not.toHaveBeenCalled();
  });
});
