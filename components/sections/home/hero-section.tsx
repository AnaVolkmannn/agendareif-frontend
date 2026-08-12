import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";

const navLinks = ["Início", "Serviços", "Inspirações", "Contato"];

export function HeroSection() {
  return (
    <section className="bg-white text-foreground dark:bg-black dark:text-primary-foreground px-6 pb-10 pt-6 md:px-12 lg:px-20">
      {/* Nav */}
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Menu className="size-6" />
      </div>

      {/* Conteúdo */}
      <div className="mx-auto mt-6 max-w-6xl text-center md:mt-16">
        <h1 className="font-barbra text-4xl text-secondary md:text-6xl">
          Reif
        </h1>
        <p className="font-barbra text-sm tracking-widest md:text-base">
          BEAUTY STUDIO
        </p>

        <p className="mt-4 text-sm font-medium md:text-lg">
          Unhas &nbsp;•&nbsp; Tranças &nbsp;•&nbsp; Cílios
        </p>
        <p className="mt-1 text-sm text-foreground/80 dark:text-primary-foreground/80 md:text-base">
          Realce sua beleza com profissionais especializadas
        </p>

        <Button
          render={<Link href="/selecprofissional">Agendar agora</Link>}
          size="lg"
          variant="secondary"
          className="mt-6 w-full rounded-full py-6 text-base transition hover:bg-primary hover:text-primary-foreground md:mx-auto md:w-auto md:px-14 md:py-7 md:text-lg"
        />
      </div>
    </section>
  );
}