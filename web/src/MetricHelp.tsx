import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Fixed positioning also works on browsers without interest invokers/anchor CSS.
export function MetricHelp({
  label,
  children,
}: {
  label: string;
  children: string;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const pinned = useRef(false);
  const timer = useRef(0);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 12, top: 12 });
  function close() {
    clearTimeout(timer.current);
    pinned.current = false;
    setOpen(false);
  }
  function leave() {
    hovering.current = false;
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (
        !hovering.current &&
        !pinned.current &&
        document.activeElement !== trigger.current
      )
        setOpen(false);
    }, 150);
  }
  function enter() {
    clearTimeout(timer.current);
    hovering.current = true;
    setOpen(true);
  }
  useLayoutEffect(() => {
    if (!open) return;
    function place() {
      if (!trigger.current || !tip.current) return;
      const anchor = trigger.current.getBoundingClientRect();
      const box = tip.current.getBoundingClientRect();
      const viewport = window.visualViewport;
      const leftEdge = (viewport?.offsetLeft ?? 0) + 12;
      const topEdge = (viewport?.offsetTop ?? 0) + 12;
      const rightEdge = leftEdge + (viewport?.width ?? window.innerWidth) - 24;
      const bottomEdge =
        topEdge + (viewport?.height ?? window.innerHeight) - 24;
      const top = anchor.top - box.height - 8;
      setPosition({
        left: Math.max(
          leftEdge,
          Math.min(anchor.right - box.width, rightEdge - box.width),
        ),
        top: Math.max(
          topEdge,
          Math.min(
            top >= topEdge ? top : anchor.bottom + 8,
            bottomEdge - box.height,
          ),
        ),
      });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    window.visualViewport?.addEventListener("resize", place);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      window.visualViewport?.removeEventListener("resize", place);
    };
  }, [open, children]);
  useEffect(() => {
    if (!open) return;
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    function outside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !trigger.current?.contains(event.target) &&
        !tip.current?.contains(event.target)
      )
        close();
    }
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="metric-help"
        aria-label={`About ${label}`}
        aria-describedby={open ? id : undefined}
        onPointerEnter={(e) => {
          if (e.pointerType !== "touch") enter();
        }}
        onPointerLeave={leave}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          pinned.current = false;
          leave();
        }}
        onClick={() => {
          if (pinned.current) close();
          else {
            pinned.current = true;
            setOpen(true);
          }
        }}
      >
        i
      </button>
      {open &&
        createPortal(
          <div
            ref={tip}
            id={id}
            role="tooltip"
            className="metric-tooltip"
            style={position}
            onPointerEnter={enter}
            onPointerLeave={leave}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}
