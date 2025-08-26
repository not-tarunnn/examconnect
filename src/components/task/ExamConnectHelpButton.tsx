"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export type HelpButtonProps = {
  side?: "right" | "left";
  bottom?: number;
  offset?: number;
  className?: string;
};

export default function ExamConnectHelpButton({
  side = "right",
  bottom = 16,
  offset = 16,
  className = "",
}: HelpButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const id = React.useId();

  const visible = open || hovered;

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const sidePin = side === "right" ? { right: offset } : { left: offset };

  return (
    <div
      ref={containerRef}
      className={`fixed z-50 select-none ${className}`}
      style={{ bottom, ...sidePin }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={visible}
        aria-controls={`help-card-${id}`}
        onClick={() => setOpen((v) => !v)}
        className="group h-10 w-10 rounded-full bg-white text-slate-900 shadow-lg ring-1 ring-slate-200 grid place-items-center outline-none transition-all hover:shadow-xl focus-visible:ring-2 focus-visible:ring-slate-400"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
      >
        <span className="sr-only">Open help</span>
        <motion.span
          initial={{ rotate: 0 }}
          animate={{ rotate: visible ? 12 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="text-base font-semibold leading-none"
        >
          ?
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {visible && (
          <motion.div
            id={`help-card-${id}`}
            role="dialog"
            aria-label="ExamConnect help"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute ${
              side === "right" ? "right-12 bottom-0" : "left-12 bottom-0"
            } w-[280px] max-w-[80vw] rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-200`}
          >
            {/* Caret */}
            <div
              className={`absolute bottom-3 h-3 w-3 rotate-45 bg-white ring-1 ring-slate-200 ${
                side === "right" ? "-right-1.5" : "-left-1.5"
              }`}
            />

            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Quick tips
            </div>

            <ul className="space-y-2 text-sm text-slate-700">
              <li className="leading-5">• Drag nodes to reposition</li>
              <li className="leading-5">• Connect task handles to subject handles</li>
              <li className="leading-5">• Use mouse wheel to zoom, drag to pan</li>
              <li className="leading-5">• Use controls for fit view and zoom</li>
            </ul>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">ExamConnect</div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 active:scale-[0.98]"
              >
                
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
