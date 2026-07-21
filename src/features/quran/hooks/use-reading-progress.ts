"use client";

import { useEffect, useRef } from "react";
import { saveProgressAction } from "@/features/quran/actions";

/**
 * Tracks the highest verse scrolled into view and persists it (debounced) as
 * reading progress, so "continue reading" can resume near where the user
 * left off. No-ops when signed out.
 */
export function useReadingProgress(
  surahNumber: number,
  isAuthenticated: boolean,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const highestSeenRef = useRef(0);
  const savedRef = useRef(0);

  useEffect(() => {
    if (!isAuthenticated || !containerRef.current) return;

    const container = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const ayahNumber = Number(
            (entry.target as HTMLElement).dataset.ayahNumber,
          );
          if (ayahNumber > highestSeenRef.current) {
            highestSeenRef.current = ayahNumber;
          }
        }
      },
      { root: null, threshold: 0.5 },
    );

    for (const node of container.querySelectorAll<HTMLElement>(
      "[data-ayah-number]",
    )) {
      observer.observe(node);
    }

    const interval = window.setInterval(() => {
      if (highestSeenRef.current > savedRef.current) {
        savedRef.current = highestSeenRef.current;
        void saveProgressAction(surahNumber, savedRef.current);
      }
    }, 2000);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, [surahNumber, isAuthenticated]);

  return containerRef;
}
