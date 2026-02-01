import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Impact from "@/components/Impact";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

/**
 * Design Philosophy: Modern Tech Minimalism
 * - Clean, professional aesthetic with blue (#3B82F6) and white palette
 * - Hierarchical typography: Poppins (display) + Inter (body) + IBM Plex Mono (code)
 * - Focus on metrics, impact, and business value
 * - Generous whitespace and clear visual hierarchy
 * - Smooth transitions and subtle animations
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <Projects />
        <Impact />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
