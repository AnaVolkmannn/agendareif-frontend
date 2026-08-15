"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { hasNavigatedWithinApp } from "@/lib/app-nav-state";

interface BackButtonProps {
  fallbackHref?: string;
}

export function BackButton({ fallbackHref = "/professional" }: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (hasNavigatedWithinApp()) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Voltar"
      onClick={handleClick}
      className="text-foreground hover:bg-muted hover:text-foreground"
    >
      <ArrowLeft className="size-5" />
    </Button>
  );
}