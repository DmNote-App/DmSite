"use client";

import { useEffect, useRef } from "react";

import { VIEWER_MARKUP_HTML } from "./viewerMarkup";

function useKeyViewerPreviewInteractions(containerRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const root = container.querySelector<HTMLElement>("#root");
    if (!root) return;

    const keyElements = Array.from(
      root.querySelectorAll<HTMLElement>(".grid-bg > div.absolute")
    );

    const elementState = new Map<
      HTMLElement,
      { offsetX: number; offsetY: number }
    >();

    keyElements.forEach((el) => {
      elementState.set(el, { offsetX: 0, offsetY: 0 });
      el.style.cursor = "move";
    });

    let isDragging = false;
    let currentDragEl: HTMLElement | null = null;
    let startMouseX = 0;
    let startMouseY = 0;
    let startOffsetX = 0;
    let startOffsetY = 0;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLElement;
      e.preventDefault();
      isDragging = true;
      currentDragEl = target;
      startMouseX = e.clientX;
      startMouseY = e.clientY;

      const state = elementState.get(target);
      startOffsetX = state?.offsetX ?? 0;
      startOffsetY = state?.offsetY ?? 0;

      target.style.zIndex = "100";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !currentDragEl) return;

      const dx = e.clientX - startMouseX;
      const dy = e.clientY - startMouseY;

      const snap = 5;
      let newOffsetX = startOffsetX + dx;
      let newOffsetY = startOffsetY + dy;

      newOffsetX = Math.round(newOffsetX / snap) * snap;
      newOffsetY = Math.round(newOffsetY / snap) * snap;

      const state = elementState.get(currentDragEl);
      if (state) {
        state.offsetX = newOffsetX;
        state.offsetY = newOffsetY;
      }

      currentDragEl.style.setProperty("--key-offset-x", `${newOffsetX}px`);
      currentDragEl.style.setProperty("--key-offset-y", `${newOffsetY}px`);
    };

    const onMouseUp = () => {
      if (currentDragEl) currentDragEl.style.zIndex = "";
      isDragging = false;
      currentDragEl = null;
    };

    keyElements.forEach((el) => el.addEventListener("mousedown", onMouseDown));
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    const baseWidth = 896;
    const updateScale = () => {
      const parent = root.parentElement;
      if (!parent) return;

      const parentWidth = parent.clientWidth;
      const scale = Math.min(1, parentWidth / baseWidth);

      if (scale < 1) {
        root.style.transformOrigin = "top center";
        root.style.transform = `scale(${scale})`;
      } else {
        root.style.transform = "";
      }
    };

    window.addEventListener("resize", updateScale);
    updateScale();
    const t = window.setTimeout(updateScale, 100);

    return () => {
      window.clearTimeout(t);
      keyElements.forEach((el) => el.removeEventListener("mousedown", onMouseDown));
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", updateScale);
    };
  }, [containerRef]);
}

export function KeyViewerPreview() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useKeyViewerPreviewInteractions(containerRef);

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: VIEWER_MARKUP_HTML }}
    />
  );
}
