"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale } from "@/components/LocaleProvider";
import { LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

type Placement = "bottom-end" | "right-start" | "top-end";

export function LanguageSwitcher({
  className,
  compact = false,
  placement = "bottom-end",
  variant = "default",
}: {
  className?: string;
  compact?: boolean;
  placement?: Placement;
  variant?: "default" | "dock" | "ghost" | "nav";
}) {
  const { locale, setLocale, t } = useLocale();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 196 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const current = LOCALES.find((item) => item.id === locale) || LOCALES[0];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- portal needs document
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const menuWidth = Math.max(196, rect.width);
    const menuHeight = 240;
    let top = rect.bottom + 8;
    let left = rect.right - menuWidth;

    if (placement === "right-start") {
      top = rect.top;
      left = rect.right + 10;
    }
    if (placement === "top-end") {
      top = Math.max(8, rect.top - menuHeight - 8);
      left = rect.right - menuWidth;
    }

    left = Math.min(Math.max(8, left), window.innerWidth - menuWidth - 8);
    if (placement !== "top-end") {
      top = Math.min(top, window.innerHeight - menuHeight - 8);
    }

    setCoords({ top, left, width: menuWidth });
  }, [placement]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: Locale) {
    setLocale(next);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onButtonKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }

  function onMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const buttons = menuRef.current?.querySelectorAll<HTMLButtonElement>(
      "[data-locale-option]"
    );
    if (!buttons?.length) return;
    const list = Array.from(buttons);
    const index = list.findIndex((el) => el === document.activeElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      list[(index + 1) % list.length]?.focus();
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      list[(index - 1 + list.length) % list.length]?.focus();
    }
    if (event.key === "Home") {
      event.preventDefault();
      list[0]?.focus();
    }
    if (event.key === "End") {
      event.preventDefault();
      list[list.length - 1]?.focus();
    }
  }

  useEffect(() => {
    if (!open) return;
    const first = menuRef.current?.querySelector<HTMLButtonElement>(
      "[data-locale-option][aria-selected='true'], [data-locale-option]"
    );
    first?.focus();
  }, [open]);

  return (
    <div className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold transition",
          compact && "!min-h-10 !px-2.5",
          variant === "default" &&
            "border-[var(--border)] bg-[var(--panel-2)] text-[var(--text)]",
          (variant === "dock" || variant === "nav") &&
            "border-transparent bg-[var(--panel-2)] text-[var(--text)] hover:bg-[#2a2a2a]",
          variant === "ghost" && "border-transparent bg-transparent text-[var(--text)]"
        )}
        aria-label={t.lang}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onButtonKeyDown}
      >
        {current.short}
        <ChevronDown
          size={14}
          className={cn("opacity-70 transition", open && "rotate-180")}
        />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={menuRef}
                id={listboxId}
                role="listbox"
                aria-label={t.lang}
                tabIndex={-1}
                onKeyDown={onMenuKeyDown}
                initial={reduced ? false : { opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.16 }}
                style={{
                  position: "fixed",
                  top: coords.top,
                  left: coords.left,
                  width: coords.width,
                  zIndex: 9999,
                }}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b1b] py-1.5 text-[#f7f7f2] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)]"
              >
                {LOCALES.map((item) => {
                  const selected = item.id === locale;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      data-locale-option
                      aria-selected={selected}
                      onClick={() => choose(item.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm outline-none transition",
                        selected
                          ? "bg-[#ff4a0a]/15 font-bold text-[#ff4a0a]"
                          : "text-[#f7f7f2]/90 hover:bg-white/6 focus:bg-white/8"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {selected ? (
                          <Check size={14} className="text-[#ff4a0a]" />
                        ) : (
                          <span className="inline-block w-3.5" />
                        )}
                        {item.label}
                      </span>
                      <span className="text-xs text-[#8a8a86]">{item.short}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
