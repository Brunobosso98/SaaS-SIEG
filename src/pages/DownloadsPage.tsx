
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Download, Play, RefreshCw, Settings } from "lucide-react";
import { DownloadHistory } from "@/components/DownloadHistory";
import { toast } from "@/hooks/use-toast";

export function DownloadsPage() {
  const [downloadMode, setDownloadMode] = useState<"manual" | "scheduled">("manual");
  const [isDownloading, setIsDownloading] = useState(false);
  const [schedule, setSchedule] = useState({
    frequency: "daily",
    time: "08:00",
    daysOfWeek: ["1", "2", "3", "4", "5"],
  });

  const startDownload = () => {
    setIsDownloading(true);
    toast({
      title: "Iniciando download",
      description: "Os arquivos XML começarão a ser processados em breve.",
    });

    // Simulate download process
    setTimeout(() => {
      setIsDownloading(false);
      toast({
        title: "Download concluído",
        description: "Todos os arquivos XML foram processados com sucesso.",
      });
    }, 3000);
  };

  const configureSchedule = () => {
    toast({
      title: "Agendamento configurado",
      description: `Os downloads serão executados ${
        schedule.frequency === "daily"
          ? "diariamente"
          : schedule.frequency === "twice_daily"
          ? "duas vezes ao dia"
          : "semanalmente"
      } às ${schedule.time}.`,
    });
  };

  // Hardcoded CNPJs for demonstration
  const cnpjs = [
    "12.345.678/0001-90",
    "98.765.432/0001-10",
    "45.678.901/0001-23",
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Downloads</h1>
          <p className="text-muted-foreground">
            Gerencie seus downloads de XMLs fiscais.
          </p>
        </div>

        <Tabs defaultValue="download" className="space-y-6">
          <TabsList>
            <TabsTrigger value="download">Download</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="download">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Baixar XMLs</CardTitle>
                    <CardDescription>
                      Inicie o download de XMLs manualmente ou configure um agendamento
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={downloadMode === "manual" ? "default" : "outline"}
                        onClick={() => setDownloadMode("manual")}
                        className="flex-1"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Manual
                      </Button>
                      <Button
                        variant={downloadMode === "scheduled" ? "default" : "outline"}
                        onClick={() => setDownloadMode("scheduled")}
                        className="flex-1"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Agendado
                      </Button>
                    </div>

                    {downloadMode === "manual" ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            CNPJs para download
                          </label>
                          <Select defaultValue="all">
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione CNPJs" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos os CNPJs</SelectItem>
                              {cnpjs.map((cnpj) => (
                                <SelectItem key={cnpj} value={cnpj}>
                                  {cnpj}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Período
                          </label>
                          <Select defaultValue="today">
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o período" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="today">Hoje</SelectItem>
                              <SelectItem value="yesterday">Ontem</SelectItem>
                              <SelectItem value="last_week">Última semana</SelectItem>
                              <SelectItem value="last_month">Último mês</SelectItem>
                              <SelectItem value="custom">Personalizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          className="w-full"
                          onClick={startDownload}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Processando...
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Iniciar Download
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Frequência
                          </label>
                          <Select
                            value={schedule.frequency}
                            onValueChange={(value) =>
                              setSchedule({ ...schedule, frequency: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a frequência" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Diário</SelectItem>
                              <SelectItem value="twice_daily">2x ao dia</SelectItem>
                              <SelectItem value="weekly">Semanal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Horário
                          </label>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Input
                              type="time"
                              value={schedule.time}
                              onChange={(e) =>
                                setSchedule({
                                  ...schedule,
                                  time: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        {schedule.frequency === "weekly" && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Dias da semana
                            </label>
                            <Select defaultValue="workdays">
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione os dias" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="workdays">Dias úteis</SelectItem>
                                <SelectItem value="weekends">Finais de semana</SelectItem>
                                <SelectItem value="all">Todos os dias</SelectItem>
                                <SelectItem value="custom">Personalizado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <Button className="w-full" onClick={configureSchedule}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Configurar Agendamento
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          CNPJs Ativos
                        </span>
                        <span className="font-medium">3 de 10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Próximo Download
                        </span>
                        <span className="font-medium">Hoje às 18:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Downloads Hoje
                        </span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Downloads Este Mês
                        </span>
                        <span className="font-medium">145</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Downloads Recentes
                    </CardTitle>
                    <CardDescription>
                      Últimos 10 downloads realizados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DownloadHistory />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Downloads</CardTitle>
                <CardDescription>
                  Visualize todos os XMLs processados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DownloadHistory />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
