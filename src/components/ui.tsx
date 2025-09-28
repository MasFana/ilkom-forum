"use client";
import { cn } from "@/lib/utils";
import { identiconDataUrl } from "@/lib/identicon";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/40 dark:focus-visible:ring-white/40 transition-colors",
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-background shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus-visible:ring-2 focus-visible:ring-black/40 dark:focus-visible:ring-white/40 placeholder:opacity-60",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-black/10 dark:border-white/10 bg-transparent px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus-visible:ring-2 focus-visible:ring-black/40 dark:focus-visible:ring-white/40 placeholder:opacity-60",
        className
      )}
      {...props}
    />
  );
}

export function Avatar({ src, alt, className }: { src?: string; alt?: string; className?: string }) {
  return (
    <div className={cn("h-8 w-8 rounded-full overflow-hidden bg-black/5 dark:bg-white/10", className)}>
      {// eslint-disable-next-line @next/next/no-img-element
        <img
          src={src || identiconDataUrl(alt || "user")}
          alt={alt}
          className="h-full w-full object-cover"
        />}
    </div>
  );
}

export function Dropdown({
  label,
  children,
  active = false,
  className,
  ariaLabel,
  hideChevron = false,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  className?: string;
  ariaLabel?: string;
  hideChevron?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (open && !ref.current.contains(e.target as Node)) setOpen(false);
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
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={cn(
          "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/40 dark:focus-visible:ring-white/40 transition-colors gap-1",
          active ? "bg-black text-white dark:bg-white dark:text-black" : "opacity-80 hover:opacity-100",
          className
        )}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        {hideChevron ? null : <ChevronDown size={16} />}
      </button>
      {open ? (
        <div
          role="menu"
          className="fixed max-h-screen overflow-y-scroll scrollbar-none md:absolute right-0 mt-2 min-w-[220px] rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-background p-2 shadow-lg z-50"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownItem({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
