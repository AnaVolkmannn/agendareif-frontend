"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

function Sheet({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetBackdrop({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="sheet-backdrop"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

const sideStyles = {
  left: "inset-y-0 left-0 h-full w-[280px] border-r data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full",
  right:
    "inset-y-0 right-0 h-full w-[280px] border-l data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
} as const

function SheetContent({
  className,
  children,
  side = "left",
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  side?: "left" | "right"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetBackdrop />
      <DialogPrimitive.Viewport className="fixed inset-0 z-50">
        <DialogPrimitive.Popup
          data-slot="sheet-content"
          className={cn(
            "fixed flex flex-col gap-4 border-border bg-sidebar p-5 text-sidebar-foreground shadow-lg outline-none duration-200 ease-in-out",
            sideStyles[side],
            className
          )}
          {...props}
        >
          {showCloseButton && (
            <DialogPrimitive.Close
              data-slot="sheet-close"
              aria-label="Fechar menu"
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-foreground/60 outline-none transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          )}
          {children}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sheet-header" className={cn("pr-8", className)} {...props} />
  )
}

function SheetTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-glacial text-lg font-bold", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetBackdrop,
  SheetContent,
  SheetHeader,
  SheetTitle,
}