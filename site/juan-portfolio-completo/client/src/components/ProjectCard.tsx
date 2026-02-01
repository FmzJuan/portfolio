import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  problem: string;
  solution: string;
  impact: {
    label: string;
    value: string;
  }[];
  technologies: string[];
  githubUrl: string;
  externalUrl?: string;
}

export default function ProjectCard({
  title,
  description,
  image,
  problem,
  solution,
  impact,
  technologies,
  githubUrl,
  externalUrl,
}: ProjectCardProps) {
  return (
    <div className="group bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative h-48 md:h-56 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 space-y-4">
        {/* Title */}
        <h3 className="font-display text-2xl text-foreground">{title}</h3>

        {/* Description */}
        <p className="text-muted-foreground">{description}</p>

        {/* Problem & Solution */}
        <div className="space-y-3 py-4 border-y border-border">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">📌 Problema</p>
            <p className="text-sm text-muted-foreground">{problem}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">🛠️ Solução</p>
            <p className="text-sm text-muted-foreground">{solution}</p>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-blue-50 p-4 rounded-lg">
          {impact.map((metric, idx) => (
            <div key={idx} className="text-center">
              <p className="font-display text-lg md:text-xl text-blue-600">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Technologies */}
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={() => window.open(githubUrl, "_blank")}
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
          >
            <Github size={16} /> GitHub
          </Button>
          {externalUrl && (
            <Button
              onClick={() => window.open(externalUrl, "_blank")}
              size="sm"
              className="flex-1 gap-2"
            >
              <ExternalLink size={16} /> Ver Mais
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
