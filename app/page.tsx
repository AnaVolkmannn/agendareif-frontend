import { HeroSection } from "@/components/sections/hero-section";
import { InspirationGallery } from "@/components/sections/inspiration-gallery";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <HeroSection />
      <InspirationGallery />
    </main>
  );
}