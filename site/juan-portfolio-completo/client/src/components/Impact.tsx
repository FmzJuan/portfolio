import { BarChart3, Clock, TrendingUp, Zap } from "lucide-react";

const impactMetrics = [
  {
    icon: Clock,
    label: "Horas Economizadas",
    value: "50+",
    description: "Redução de trabalho manual por mês",
  },
  {
    icon: TrendingUp,
    label: "Aumento de Produtividade",
    value: "300%",
    description: "Mais tarefas executadas automaticamente",
  },
  {
    icon: Zap,
    label: "Erros Reduzidos",
    value: "95%",
    description: "Eliminação de erros manuais",
  },
  {
    icon: BarChart3,
    label: "ROI de Automação",
    value: "4.5x",
    description: "Retorno sobre investimento médio",
  },
];

export default function Impact() {
  return (
    <section id="impact" className="py-20 md:py-32 bg-white">
      <div className="container">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            Impacto Mensurável
          </h2>
          <p className="text-lg text-muted-foreground">
            Resultados concretos que demonstram o valor das automações desenvolvidas.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {impactMetrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div
                key={idx}
                className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-4 p-3 bg-white rounded-lg w-fit group-hover:bg-blue-600 transition-colors">
                  <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
                <p className="font-display text-3xl text-blue-600 mb-2">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.description}</p>
              </div>
            );
          })}
        </div>

        {/* Impact Image */}
        <div className="mt-16">
          <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 p-8">
            <img
              src="/images/impact-metrics.jpg"
              alt="Business Impact Metrics"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="font-display text-xl text-foreground">Eficiência Operacional</h3>
            <p className="text-muted-foreground">
              Processos manuais transformados em workflows automáticos que rodam 24/7 sem intervenção.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="font-display text-xl text-foreground">Redução de Custos</h3>
            <p className="text-muted-foreground">
              Menos horas de trabalho manual, menos erros, menos retrabalho. Economia direta no orçamento.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="font-display text-xl text-foreground">Escalabilidade</h3>
            <p className="text-muted-foreground">
              Automações que crescem com o negócio. Processar 100 ou 10.000 registros com o mesmo esforço.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
