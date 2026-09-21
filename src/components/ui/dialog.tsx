"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

/**
 * Dialog, composed on Radix primitives.
 *
 * The shadcn/ui registry is unreachable from this environment, so these are
 * its underlying Radix primitives wired up directly: same focus trap, same
 * escape and scroll-lock behaviour, same aria wiring. Only the skin is ours.
 * Flat plates, square corners, no shadow, in keeping with the press.
 */

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[80] bg-[var(--color-bark)]/85",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    closeLabel?: string;
  }
>(({ className, children, closeLabel = "Close", ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-0 z-[90] overflow-y-auto",
        "bg-[var(--color-butter)] text-[var(--color-bark)]",
        "focus:outline-none",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        aria-label={closeLabel}
        className="fixed top-6 right-6 z-10 flex h-12 w-12 items-center justify-center
                   bg-[var(--color-bark)] text-[var(--color-butter)]
                   transition-colors duration-150
                   hover:bg-[var(--color-ember)] hover:text-[var(--color-butter)]
                   focus-visible:outline-3 focus-visible:outline-[var(--color-ember)]
                   sm:top-10 sm:right-10"
      >
        <X size={20} weight="bold" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
};
