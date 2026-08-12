import { HeroSection } from "@/components/sections/home/hero-section";
import { InspirationGallery } from "@/components/sections/home/inspiration-gallery";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <HeroSection />
      <InspirationGallery />
    </main>
  );
}