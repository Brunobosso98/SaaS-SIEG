
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart2, FileText, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function ReportsPage() {
  const [reportType, setReportType] = useState("downloads");
  const [period, setPeriod] = useState("month");

  // Mock data for charts
  const downloadData = [
    { name: "1 Mai", downloads: 4 },
    { name: "2 Mai", downloads: 3 },
    { name: "3 Mai", downloads: 7 },
    { name: "4 Mai", downloads: 5 },
    { name: "5 Mai", downloads: 6 },
    { name: "6 Mai", downloads: 4 },
    { name: "7 Mai", downloads: 8 },
  ];

  const cnpjData = [
    { name: "CNPJ 1", downloads: 45 },
    { name: "CNPJ 2", downloads: 32 },
    { name: "CNPJ 3", downloads: 18 },
    { name: "CNPJ 4", downloads: 27 },
    { name: "CNPJ 5", downloads: 10 },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Relatórios</h1>
          <p className="text-muted-foreground">
            Visualize estatísticas e métricas dos seus downloads de XMLs.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Card className="w-full sm:w-64">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tipo de Relatório</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="downloads">Downloads por Dia</SelectItem>
                  <SelectItem value="cnpjs">Downloads por CNPJ</SelectItem>
                  <SelectItem value="errors">Erros por CNPJ</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="w-full sm:w-64">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Período</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última Semana</SelectItem>
                  <SelectItem value="month">Último Mês</SelectItem>
                  <SelectItem value="quarter">Último Trimestre</SelectItem>
                  <SelectItem value="year">Último Ano</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="w-full sm:w-auto sm:flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ações</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Exportar PDF
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {reportType === "downloads" && "Downloads por Dia"}
              {reportType === "cnpjs" && "Downloads por CNPJ"}
              {reportType === "errors" && "Erros por CNPJ"}
            </CardTitle>
            <CardDescription>
              {period === "week" && "Dados da última semana"}
              {period === "month" && "Dados do último mês"}
              {period === "quarter" && "Dados do último trimestre"}
              {period === "year" && "Dados do último ano"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reportType === "downloads" ? downloadData : cnpjData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="downloads"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Downloads
              </CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,248</div>
              <p className="text-xs text-muted-foreground">
                +15% em relação ao período anterior
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                XML Processados
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,186</div>
              <p className="text-xs text-muted-foreground">
                95% de taxa de sucesso
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Downloads Falhos
              </CardTitle>
              <div className="text-red-500">
                <BarChart2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">62</div>
              <p className="text-xs text-muted-foreground">
                5% de taxa de falha
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
