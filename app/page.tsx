import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-8">
      <div className="absolute right-6 top-6">
        <ModeToggle />
      </div>

      <h1 className="text-3xl font-heading font-semibold">agendareif</h1>
      <p className="text-muted-foreground">
        Alterne o tema no botão do canto superior direito.
      </p>
      <Button>Botão de exemplo</Button>
    </main>
  );
}