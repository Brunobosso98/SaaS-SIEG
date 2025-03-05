
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, FilePlus, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiegKeyForm } from "@/components/SiegKeyForm";
import { CNPJManagement } from "@/components/CNPJManagement";
import { DownloadHistory } from "@/components/DownloadHistory";

export function Dashboard() {
  // In a real app, these would come from an API
  const stats = [
    {
      title: "Downloads Hoje",
      value: "12",
      icon: Download,
      description: "4 em processamento",
    },
    {
      title: "Total de XMLs",
      value: "1,248",
      icon: FileText,
      description: "Últimos 30 dias",
    },
    {
      title: "CNPJs Ativos",
      value: "8",
      icon: FilePlus,
      description: "De 10 disponíveis",
    },
    {
      title: "Próximo Processamento",
      value: "2h",
      icon: Clock,
      description: "Automatizado",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Olá, Usuário</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao seu dashboard. Gerencie seus downloads de XMLs aqui.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <SiegKeyForm />
            <CNPJManagement />
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Downloads</CardTitle>
                <CardDescription>
                  Visualize e baixe XMLs processados nos últimos 30 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DownloadHistory />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
