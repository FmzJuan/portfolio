import ProjectCard from "./ProjectCard";

const projects = [
  {
    id: 1,
    title: "Automação de Publicação em WordPress com n8n",
    description: "Sistema completo de automação para publicar conteúdo no WordPress com processamento de imagens, SEO e distribuição em redes sociais.",
    image: "/images/n8n-workflow.jpg",
    problem: "Processo manual de publicação de conteúdo no WordPress era repetitivo, demorado e propenso a erros. Faltava padronização e integração com redes sociais.",
    solution: "Desenvolvemos um workflow n8n que automatiza: coleta de dados, processamento de imagens, otimização SEO, publicação no WordPress e distribuição em Facebook/Twitter.",
    impact: [
      { label: "Tempo Economizado", value: "15h/mês" },
      { label: "Publicações", value: "+300%" },
      { label: "Erros Reduzidos", value: "-95%" },
    ],
    technologies: ["n8n", "WordPress", "APIs", "Node.js"],
    githubUrl: "https://github.com/FmzJuan/portfolio/tree/main/automacoes/n8n-publicacao-wordpress",
  },
  {
    id: 2,
    title: "Organização e Normalização de Dados no Google Sheets",
    description: "Automação inteligente para organizar, normalizar e deduplica dados de múltiplas fontes (Google Forms, inserções manuais) em tempo real.",
    image: "/images/google-sheets-data.jpg",
    problem: "Dados chegavam de múltiplas fontes com inconsistências: CPFs duplicados, datas faltantes, ordem cronológica incorreta. Análise confiável era impossível.",
    solution: "Desenvolvemos funções Google Apps Script que: organizam cronologicamente, preenchem datas automaticamente, removem duplicatas e mantêm apenas o registro mais recente.",
    impact: [
      { label: "Duplicatas Removidas", value: "100%" },
      { label: "Tempo Manual", value: "-30min" },
      { label: "Confiabilidade", value: "+99%" },
    ],
    technologies: ["Google Apps Script", "Google Sheets", "JavaScript"],
    githubUrl: "https://github.com/FmzJuan/portfolio/tree/main/automacoes/organizacao-dados-sheets",
  },
  {
    id: 3,
    title: "Envio de Cotações Personalizadas por E-mail",
    description: "Interface intuitiva que permite enviar cotações profissionais e personalizadas diretamente do Google Sheets, sem conhecimento técnico.",
    image: "/images/email-automation.jpg",
    problem: "Envio de cotações era manual, repetitivo e propenso a erros. Faltava padronização visual e era necessário conhecimento técnico para enviar.",
    solution: "Criamos um modal HTML integrado ao Google Sheets que permite buscar registros, personalizar e enviar e-mails profissionais com logo, cores corporativas e dados dinâmicos.",
    impact: [
      { label: "Tempo/Cotação", value: "-5min" },
      { label: "Taxa de Envio", value: "+80%" },
      { label: "Profissionalismo", value: "100%" },
    ],
    technologies: ["Google Apps Script", "HTML/CSS", "Gmail API"],
    githubUrl: "https://github.com/FmzJuan/portfolio/tree/main/automacoes/sheets-email-personalizado",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-20 md:py-32 bg-gradient-to-b from-white to-blue-50">
      <div className="container">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Projetos em Destaque
          </h2>
          <p className="text-lg text-muted-foreground">
            Conheça as automações que desenvolvi para empresas, com foco em impacto, 
            eficiência e resultados mensuráveis.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              description={project.description}
              image={project.image}
              problem={project.problem}
              solution={project.solution}
              impact={project.impact}
              technologies={project.technologies}
              githubUrl={project.githubUrl}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Quer ver todos os projetos e detalhes técnicos?
          </p>
          <a
            href="https://github.com/FmzJuan/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Acesse o GitHub →
          </a>
        </div>
      </div>
    </section>
  );
}
