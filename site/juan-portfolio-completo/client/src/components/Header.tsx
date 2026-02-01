import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-display text-lg">JM</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display text-lg text-foreground">Juan Meneghesso</h1>
            <p className="text-xs text-muted-foreground">Especialista em Automação</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("projects")}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Projetos
          </button>
          <button
            onClick={() => scrollToSection("impact")}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Impacto
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Contato
          </button>
          <Button
            onClick={() => window.open("https://github.com/FmzJuan/portfolio", "_blank")}
            variant="default"
            size="sm"
          >
            GitHub
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden border-t border-border bg-white">
          <div className="container py-4 flex flex-col gap-4">
            <button
              onClick={() => scrollToSection("projects")}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors text-left"
            >
              Projetos
            </button>
            <button
              onClick={() => scrollToSection("impact")}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors text-left"
            >
              Impacto
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors text-left"
            >
              Contato
            </button>
            <Button
              onClick={() => window.open("https://github.com/FmzJuan/portfolio", "_blank")}
              variant="default"
              className="w-full"
            >
              GitHub
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
