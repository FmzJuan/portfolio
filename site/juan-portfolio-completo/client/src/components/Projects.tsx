import ProjectCard from "./ProjectCard";
import React from 'react';
import { Link } from "wouter";

// 1. Unificamos a lista de projetos com as novas propriedades
const projects = [
  {
    id: 1,
    title: "Automação de Publicação em WordPress com n8n",
    description: "Sistema completo de automação para publicar conteúdo no WordPress com processamento de imagens, SEO e distribuição em redes sociais.",
    image: "/images/n8n-workflow.png",
    problem: "Processo manual de publicação de conteúdo no WordPress era repetitivo, demorado e propenso a erros.",
    solution: "Desenvolvemos um workflow n8n que automatiza: coleta de dados, processamento de imagens e otimização SEO.",
    impact: [
      { label: "Tempo Economizado", value: "15h/mês" },
      { label: "Publicações", value: "+300%" },
    ],
    technologies: ["n8n", "WordPress", "APIs", "Node.js"],
    githubUrl: "https://github.com/FmzJuan/portfolio/tree/main/automacoes/n8n-publicacao-wordpress",
    link: "/n8n-Wordpress",
    isBotProject: true
  },

  {
    id: 2,
    title: "Organização e Normalização de Dados no Google Sheets",
    description: "Automação inteligente para organizar, normalizar e deduplica dados de múltiplas fontes em tempo real.",
    image: "/images/google-sheets-data.jpg",
    problem: "Dados chegavam de múltiplas fontes com inconsistências: CPFs duplicados e datas faltantes.",
    solution: "Desenvolvemos funções Google Apps Script que organizam cronologicamente e removem duplicatas.",
    impact: [
      { label: "Duplicatas Removidas", value: "100%" },
      { label: "Confiabilidade", value: "+99%" },
    ],
    technologies: ["Google Apps Script", "Google Sheets", "JavaScript"],
    githubUrl: "https://github.com/FmzJuan/portfolio/tree/main/automacoes/organizacao-dados-sheets",
    link: "/Google-sheets-organizasao",
    isBotProject: true
  },

  {
    id: 4, 
    title: "Bot de Vendas para WhatsApp",
    description: "Uma solução de automação completa para empresas que vendem por delivery, com cardápio digital, carrinho e checkout via PIX.",
    // ALTERAÇÃO AQUI: Atualizado para o caminho correto da sua imagem
    image: "/images/botatendimento.png", 
    problem: "Atendimento manual lento e perda de vendas por demora na resposta e falta de fechamento automático.",
    solution: "Bot inteligente com fluxo de compra completo integrado ao WhatsApp, reduzindo o tempo de atendimento a zero.",
    impact: [
      { label: "Atendimento", value: "24/7" },
      { label: "Conversão", value: "+45%" },
    ],
    technologies: ["Node.js", "Docker", "React"],
    githubUrl: "https://github.com/FmzJuan/portfolio/tree/main/bot-vendas-whatsapp",
    link: "/bot-vendas-whatsapp", 
    isBotProject: true 
  }
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
    project.isBotProject ? (
      <Link href={project.link!} key={project.id}>
        <a className="block h-full transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <ProjectCard
            title={project.title}
            description={project.description}
            image={project.image}
            problem={project.problem}
            solution={project.solution}
            // VERIFIQUE SE ESTAS DUAS LINHAS ABAIXO ESTÃO ASSIM:
            impact={project.impact} 
            technologies={project.technologies}
            githubUrl={project.githubUrl!}
          />
          <div className="text-center mt-2 text-blue-600 font-medium text-sm">
            Clique para saber mais →
          </div>
        </a>
      </Link>
    ) : (
      <ProjectCard
        key={project.id}
        title={project.title}
        description={project.description}
        image={project.image}
        problem={project.problem}
        solution={project.solution}
        impact={project.impact}
        technologies={project.technologies}
        githubUrl={project.githubUrl!}
      />
    )
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