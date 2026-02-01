import { Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-white py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-display text-lg mb-3">Juan Meneghesso</h3>
            <p className="text-sm text-white/70">
              Especialista em automação de processos com foco em impacto e resultados mensuráveis.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-display text-lg mb-3">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#projects" className="text-white/70 hover:text-white transition-colors">
                  Projetos
                </a>
              </li>
              <li>
                <a href="#impact" className="text-white/70 hover:text-white transition-colors">
                  Impacto
                </a>
              </li>
              <li>
                <a href="#contact" className="text-white/70 hover:text-white transition-colors">
                  Contato
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/FmzJuan/portfolio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-display text-lg mb-3">Redes Sociais</h3>
            <div className="flex gap-4">
              <a
                href="https://github.com/FmzJuan"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="https://linkedin.com/in/juanmeneghesso"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="mailto:juan@example.com"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          <p className="text-center text-sm text-white/70">
            © {currentYear} Juan Meneghesso. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
