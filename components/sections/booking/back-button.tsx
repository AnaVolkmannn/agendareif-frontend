"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { hasNavigatedWithinApp } from "@/lib/app-nav-state";

interface BackButtonProps {
  fallbackHref?: string;
}

export function BackButton({ fallbackHref = "/selecprofissional" }: BackButtonProps) {
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
      className="text-white hover:bg-white/10 hover:text-white"
    >
      <ArrowLeft className="size-5" />
    </Button>
  );
}