import { Button } from "@/components/ui/button";
import { Mail, Linkedin, Github } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-20 md:py-32 bg-gradient-to-b from-blue-50 to-white">
      <div className="container max-w-2xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Vamos Conversar?
          </h2>
          <p className="text-lg text-muted-foreground">
            Estou aberto a oportunidades de trabalho (CLT, PJ, Freelas) e sempre pronto para 
            discutir novos projetos de automação.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Email */}
          <a
            href="mailto:juan@example.com"
            className="group p-6 bg-white border border-border rounded-lg hover:shadow-lg transition-all duration-300 text-center"
          >
            <div className="mb-4 p-3 bg-blue-100 rounded-lg w-fit mx-auto group-hover:bg-blue-600 transition-colors">
              <Mail className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-display text-lg text-foreground mb-2">E-mail</h3>
            <p className="text-sm text-muted-foreground">juan@example.com</p>
          </a>

          {/* LinkedIn */}
          <a
            href="https://linkedin.com/in/juanmeneghesso"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 bg-white border border-border rounded-lg hover:shadow-lg transition-all duration-300 text-center"
          >
            <div className="mb-4 p-3 bg-blue-100 rounded-lg w-fit mx-auto group-hover:bg-blue-600 transition-colors">
              <Linkedin className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-display text-lg text-foreground mb-2">LinkedIn</h3>
            <p className="text-sm text-muted-foreground">Juan Meneghesso</p>
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/FmzJuan"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 bg-white border border-border rounded-lg hover:shadow-lg transition-all duration-300 text-center"
          >
            <div className="mb-4 p-3 bg-blue-100 rounded-lg w-fit mx-auto group-hover:bg-blue-600 transition-colors">
              <Github className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-display text-lg text-foreground mb-2">GitHub</h3>
            <p className="text-sm text-muted-foreground">FmzJuan</p>
          </a>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={() => window.location.href = "mailto:juan@example.com"}
            size="lg"
            className="gap-2"
          >
            <Mail size={20} /> Enviar E-mail
          </Button>
        </div>

        {/* Availability */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-2">📍 Disponibilidade</p>
          <p className="font-display text-lg text-foreground">
            Aberto a oportunidades de trabalho em qualquer modelo
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            CLT • PJ • Freelas • Consultoria
          </p>
        </div>
      </div>
    </section>
  );
}
