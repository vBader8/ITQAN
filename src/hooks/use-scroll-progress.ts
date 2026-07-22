"use client";

import { useEffect, useRef } from "react";

/**
 * Tracks the highest-numbered item (identified by `data-{attribute}` on
 * descendant elements) scrolled into view and persists it via `onProgress`,
 * debounced, while `isAuthenticated`. Powers "continue reading" for both
 * the Quran and Hadith readers.
 */
export function useScrollProgress({
  attribute,
  isAuthenticated,
  onProgress,
}: {
  attribute: string;
  isAuthenticated: boolean;
  onProgress: (highestNumber: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const highestSeenRef = useRef(0);
  const savedRef = useRef(0);

  useEffect(() => {
    if (!isAuthenticated || !containerRef.current) return;

    const container = containerRef.current;
    const selector = `[data-${attribute}]`;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const value = Number(
            (entry.target as HTMLElement).getAttribute(`data-${attribute}`),
          );
          if (value > highestSeenRef.current) {
            highestSeenRef.current = value;
          }
        }
      },
      { root: null, threshold: 0.5 },
    );

    for (const node of container.querySelectorAll<HTMLElement>(selector)) {
      observer.observe(node);
    }

    const interval = window.setInterval(() => {
      if (highestSeenRef.current > savedRef.current) {
        savedRef.current = highestSeenRef.current;
        onProgress(savedRef.current);
      }
    }, 2000);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attribute, isAuthenticated]);

  return containerRef;
}
