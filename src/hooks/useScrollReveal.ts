import { useLayoutEffect, useRef } from "react";

export function useScrollReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = Array.from(
      container.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    if (elements.length === 0) return;

    const reveal = (element: Element) => {
      element.classList.add("revealed");
    };

    const initialViewportBottom = window.innerHeight - 40;

    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top <= initialViewportBottom) {
        reveal(element);
      }
    });

    const pendingElements = elements.filter(
      (element) => !element.classList.contains("revealed")
    );

    if (pendingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    pendingElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return containerRef;
}
