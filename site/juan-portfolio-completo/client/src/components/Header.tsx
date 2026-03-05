import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isMobileProjectsOpen, setIsMobileProjectsOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
      setIsProjectsOpen(false);
    }
  };

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProjectsOpen && !(event.target as Element).closest('.projects-dropdown')) {
        setIsProjectsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProjectsOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <button
          onClick={() => navigateTo("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-display text-lg">JM</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display text-lg text-foreground">Juan Meneghesso</h1>
            <p className="text-xs text-muted-foreground">Especialista em Automação</p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <div className="relative">
            <button
              onClick={() => setIsProjectsOpen(!isProjectsOpen)}
              className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors projects-dropdown"
            >
              Projetos
              <ChevronDown size={16} className={`transition-transform ${isProjectsOpen ? 'rotate-180' : ''}`} />
            </button>
            {isProjectsOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-border rounded-lg shadow-lg py-2 z-50 projects-dropdown">
                <button
                  onClick={() => navigateTo("/n8n-Wordpress")}
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors"
                >
                  n8n
                </button>
                <button
                  onClick={() => navigateTo("/Google-sheets-organizasao")}
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors"
                >
                  Google
                </button>
                <button
                  onClick={() => navigateTo("/bot-vendas-whatsapp")}
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors"
                >
                  Bot WhatsApp
                </button>
              </div>
            )}
          </div>
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
            <div>
              <button
                onClick={() => setIsMobileProjectsOpen(!isMobileProjectsOpen)}
                className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-primary transition-colors text-left"
              >
                Projetos
                <ChevronDown size={16} className={`transition-transform ${isMobileProjectsOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMobileProjectsOpen && (
                <div className="mt-2 ml-4 flex flex-col gap-2">
                  <button
                    onClick={() => navigateTo("/n8n-Wordpress")}
                    className="text-sm text-foreground hover:text-primary transition-colors text-left"
                  >
                    n8n
                  </button>
                  <button
                    onClick={() => navigateTo("/Google-sheets-organizasao")}
                    className="text-sm text-foreground hover:text-primary transition-colors text-left"
                  >
                    Google
                  </button>
                  <button
                    onClick={() => navigateTo("/bot-vendas-whatsapp")}
                    className="text-sm text-foreground hover:text-primary transition-colors text-left"
                  >
                    Bot WhatsApp
                  </button>
                </div>
              )}
            </div>
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
