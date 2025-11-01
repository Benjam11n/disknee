"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FormDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: () => void;
  onSkip?: () => void;
  submitText?: string;
  skipText?: string;
  isSubmitting?: boolean;
  canSubmit?: boolean;
  showSkip?: boolean;
  preventClose?: boolean;
  className?: string;
}

export function FormDialog({
  isOpen,
  title,
  description,
  children,
  onSubmit,
  onSkip,
  submitText = "Submit",
  skipText = "Skip",
  isSubmitting = false,
  canSubmit = true,
  showSkip = true,
  preventClose = true,
  className,
}: FormDialogProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent
        className={className}
        onPointerDownOutside={
          preventClose ? (e) => e.preventDefault() : undefined
        }
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="my-6">{children}</div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {showSkip && onSkip && (
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {skipText}
            </Button>
          )}
          <Button
            type="submit"
            onClick={onSubmit}
            className="w-full sm:w-auto"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : submitText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
