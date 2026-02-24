import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, TrendingUp, CheckCircle, Clock } from "lucide-react";
import KanbanBoard from "@/components/KanbanBoard";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: metrics, isLoading } = trpc.dashboard.getMetrics.useQuery();

  if (isLoading) {
    return <div className="p-8">Carregando métricas...</div>;
  }

  const conversionData = [
    { name: "Fechados", value: metrics?.byStage?.fechado || 0, fill: "#10b981" },
    { name: "Perdidos", value: metrics?.byStage?.perdido || 0, fill: "#ef4444" },
    { name: "Em Negociação", value: metrics?.byStage?.negociacao || 0, fill: "#f59e0b" },
    { name: "Leads", value: metrics?.byStage?.lead || 0, fill: "#3b82f6" },
  ];

  const stageData = [
    { stage: "Leads", count: metrics?.byStage?.lead || 0 },
    { stage: "Negociação", count: metrics?.byStage?.negociacao || 0 },
    { stage: "Fechado", count: metrics?.byStage?.fechado || 0 },
    { stage: "Perdido", count: metrics?.byStage?.perdido || 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Vendas</h1>
        <p className="text-gray-500 mt-2">Bem-vindo, {user?.name}!</p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Leads (24h)</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.newLeads || 0}</div>
            <p className="text-xs text-gray-500">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalContacts || 0}</div>
            <p className="text-xs text-gray-500">Todos os contatos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.conversionRate || 0}%</div>
            <p className="text-xs text-gray-500">Fechados / Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Fechadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.byStage?.fechado || 0}</div>
            <p className="text-xs text-gray-500">Negócios concluídos</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Kanban */}
      <Tabs defaultValue="kanban" className="w-full">
        <TabsList>
          <TabsTrigger value="kanban">Quadro Kanban</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <KanbanBoard />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6 mt-6">
          {/* Gráfico de Barras */}
          <Card>
            <CardHeader>
              <CardTitle>Contatos por Etapa</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Pizza */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição do Funil</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={conversionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {conversionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
