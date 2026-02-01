import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const scrollToProjects = () => {
    const element = document.getElementById("projects");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 md:py-32">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-30">
        <img
          src="/images/hero-automation.jpg"
          alt="Automation Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>

      {/* Content */}
      <div className="container relative z-10 max-w-4xl">
        <div className="space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-blue-900">Especialista em Automação</span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl md:text-6xl text-foreground leading-tight">
            Transforme Processos em{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
              Automações Inteligentes
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Desenvolvo soluções de automação que reduzem custos, eliminam erros e aumentam a produtividade. 
            Especializado em n8n, Google Apps Script e WordPress.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={scrollToProjects}
              size="lg"
              className="gap-2"
            >
              Ver Projetos <ArrowRight size={20} />
            </Button>
            <Button
              onClick={() => window.open("https://github.com/FmzJuan/portfolio", "_blank")}
              variant="outline"
              size="lg"
            >
              GitHub
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-12 border-t border-border">
            <div>
              <p className="font-display text-3xl text-blue-600">3+</p>
              <p className="text-sm text-muted-foreground">Projetos</p>
            </div>
            <div>
              <p className="font-display text-3xl text-blue-600">50+</p>
              <p className="text-sm text-muted-foreground">Horas Economizadas</p>
            </div>
            <div>
              <p className="font-display text-3xl text-blue-600">100%</p>
              <p className="text-sm text-muted-foreground">Automação</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
