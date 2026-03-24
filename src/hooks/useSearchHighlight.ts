import { useState, useEffect, useCallback, useRef } from "react";

const HIGHLIGHT_DURATION = 2500;

/**
 * Manages a temporary highlight state for a search-selected item.
 * Returns the currently highlighted ID and a ref callback to attach to items.
 */
export function useSearchHighlight(highlightId: string | null) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!highlightId) return;
    setActiveId(highlightId);

    // Scroll into view after a short delay to let the DOM settle
    const scrollTimer = setTimeout(() => {
      const el = document.querySelector(`[data-search-id="${highlightId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);

    // Auto-clear highlight
    timerRef.current = setTimeout(() => {
      setActiveId(null);
    }, HIGHLIGHT_DURATION);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(timerRef.current);
    };
  }, [highlightId]);

  const isHighlighted = useCallback(
    (id: string) => activeId === id,
    [activeId]
  );

  return { isHighlighted };
}
