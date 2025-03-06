import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Key, Lock, User, Mail, CheckCircle, Clock, LogOut, Shield, Database, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScheduleSettings } from "@/components/ScheduleSettings";

export function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [user, setUser] = useState({
    name: "João Silva",
    email: "joao.silva@exemplo.com",
    company: "Contabilidade Silva Ltda",
  });

  const handleSaveProfile = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    }, 1000);
  };

  const handleSavePassword = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso.",
      });
    }, 1000);
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notificações configuradas",
      description: notificationsEnabled
        ? "Você receberá notificações sobre seus downloads."
        : "Você não receberá notificações sobre seus downloads.",
    });
  };

  const handleS3Connect = () => {
    toast({
      title: "Integração com Amazon S3",
      description: "Configurações salvas com sucesso.",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie sua conta e preferências.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="schedule">Agendamento</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
            <TabsTrigger value="billing">Assinatura</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>Informações Pessoais</span>
                </CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e de contato.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="name">
                    Nome Completo
                  </label>
                  <Input
                    id="name"
                    value={user.name}
                    onChange={(e) =>
                      setUser({ ...user, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    onChange={(e) =>
                      setUser({ ...user, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="company">
                    Empresa
                  </label>
                  <Input
                    id="company"
                    value={user.company}
                    onChange={(e) =>
                      setUser({ ...user, company: e.target.value })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    <span>Alterar Senha</span>
                  </CardTitle>
                  <CardDescription>
                    Atualize sua senha para manter sua conta segura.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      htmlFor="current-password"
                    >
                      Senha Atual
                    </label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      htmlFor="new-password"
                    >
                      Nova Senha
                    </label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      htmlFor="confirm-password"
                    >
                      Confirmar Nova Senha
                    </label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSavePassword} disabled={isLoading}>
                    {isLoading ? "Atualizando..." : "Atualizar Senha"}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    <span>SIEG Key</span>
                  </CardTitle>
                  <CardDescription>
                    Chave de administrador para o site SIEG.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="sieg-key">
                      Chave de Administrador
                    </label>
                    <Input
                      id="sieg-key"
                      type="password"
                      placeholder="Sua chave SIEG"
                    />
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      Sua chave é armazenada de forma segura e criptografada em
                      nosso banco de dados.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Salvar Chave</Button>
                </CardFooter>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <span>Segurança da Conta</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Autenticação em Dois Fatores</p>
                      <p className="text-sm text-muted-foreground">
                        Adicione uma camada extra de segurança à sua conta.
                      </p>
                    </div>
                    <Button variant="outline">Configurar</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sessões Ativas</p>
                      <p className="text-sm text-muted-foreground">
                        Gerencie dispositivos conectados à sua conta.
                      </p>
                    </div>
                    <Button variant="outline">Visualizar</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Encerrar Todas as Sessões</p>
                      <p className="text-sm text-muted-foreground">
                        Desconectar de todos os dispositivos.
                      </p>
                    </div>
                    <Button variant="destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Encerrar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <span>Preferências de Notificação</span>
                </CardTitle>
                <CardDescription>
                  Configure como e quando deseja receber notificações.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Notificações</div>
                    <div className="text-sm text-muted-foreground">
                      Ativar ou desativar todas as notificações
                    </div>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>

                {notificationsEnabled && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Notificações por Email</div>
                        <div className="text-sm text-muted-foreground">
                          Receber notificações por email
                        </div>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="font-medium">
                        Tipos de Notificações por Email
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-muted-foreground">
                            Download concluído
                          </label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-muted-foreground">
                            Falha no download
                          </label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-muted-foreground">
                            Novo XML disponível
                          </label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-muted-foreground">
                            Lembretes de processamento
                          </label>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-muted-foreground">
                            Atualizações do sistema
                          </label>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveNotifications}>
                  Salvar Preferências
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleSettings />
          </TabsContent>

          <TabsContent value="integrations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    <span>Amazon S3</span>
                  </CardTitle>
                  <CardDescription>
                    Configure o armazenamento de XMLs na Amazon S3.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      htmlFor="s3-bucket"
                    >
                      Bucket
                    </label>
                    <Input id="s3-bucket" placeholder="nome-do-bucket" />
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      htmlFor="aws-region"
                    >
                      Região
                    </label>
                    <Input id="aws-region" placeholder="us-east-1" />
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      htmlFor="aws-access-key"
                    >
                      Access Key
                    </label>
                    <Input id="aws-access-key" type="password" />
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      htmlFor="aws-secret-key"
                    >
                      Secret Key
                    </label>
                    <Input id="aws-secret-key" type="password" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleS3Connect}>
                    Conectar
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    <span>Email Transacional</span>
                  </CardTitle>
                  <CardDescription>
                    Configure o serviço de email transacional.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="email-provider">
                      Provedor
                    </label>
                    <Input id="email-provider" placeholder="SendGrid" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="email-api-key">
                      API Key
                    </label>
                    <Input id="email-api-key" type="password" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="sender-email">
                      Email do Remetente
                    </label>
                    <Input id="sender-email" type="email" placeholder="noreply@seudominio.com" />
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <Button variant="outline">Testar Conexão</Button>
                  <Button>Salvar</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Informações da Assinatura</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold text-lg">
                          Plano Professional
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Assinatura mensal - R$ 197/mês
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Próxima cobrança
                      </p>
                      <p className="font-medium">15/05/2023</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        CNPJs ativos
                      </p>
                      <p className="font-medium">3 de 10 disponíveis</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Downloads automáticos
                      </p>
                      <p className="font-medium">2x ao dia</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Retenção de arquivos
                      </p>
                      <p className="font-medium">30 dias</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Suporte
                      </p>
                      <p className="font-medium">Prioritário</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <Button variant="outline" className="w-full justify-between">
                    <span>Alterar plano</span>
                    <Clock className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    <span>Histórico de faturas</span>
                    <Clock className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between">
                    <span>Atualizar forma de pagamento</span>
                    <Clock className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
