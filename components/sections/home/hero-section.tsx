import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ModeToggle } from "@/components/theme/mode-toggle";

export function HeroSection() {
  return (
    <section className="bg-background text-foreground px-6 pb-10 pt-6 md:px-12 lg:px-20">
      <div className="mx-auto flex max-w-6xl items-center">
        <ModeToggle />
      </div>

      {/* Conteúdo */}
      <div className="mx-auto mt-6 max-w-6xl text-center md:mt-16">
        <h1 className="font-barbra text-7xl text-primary md:text-9xl">
          Reif
        </h1>
        <p className="font-barbra text-base tracking-widest md:text-lg">
          BEAUTY STUDIO
        </p>

        <p className="mt-4 text-base font-medium md:text-xl">
          Unhas &nbsp;•&nbsp; Tranças &nbsp;•&nbsp; Cílios
        </p>
        <p className="mt-1 text-base text-foreground/80 dark:text-foreground md:text-lg">
          Realce sua beleza com profissionais especializadas
        </p>

        <Button
          render={<Link href="/pages/client/select-professional">Agendar agora</Link>}
          size="lg"
          className="mt-6 w-full rounded-xl py-7 text-lg transition md:mx-auto md:w-auto md:px-16 md:py-8 md:text-xl"
        />
      </div>
    </section>
  );
}