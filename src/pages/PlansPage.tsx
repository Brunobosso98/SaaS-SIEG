
import { useState } from "react";
import { Check, Download, BarChart2, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  buttonText: string;
  popular?: boolean;
  maxCNPJs: number;
  scheduleOptions: string[];
}

export function PlansPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const plans: Plan[] = [
    {
      name: "Starter",
      price: billingCycle === "monthly" ? "R$ 97/mês" : "R$ 970/ano",
      description: "Ideal para contadores autônomos com poucos clientes.",
      maxCNPJs: 3,
      scheduleOptions: ["1x ao dia"],
      features: [
        { text: "Até 3 CNPJs", included: true },
        { text: "Download automático 1x ao dia", included: true },
        { text: "7 dias de retenção de arquivos", included: true },
        { text: "Suporte por email", included: true },
        { text: "Relatórios básicos", included: true },
        { text: "Download manual", included: true },
        { text: "Múltiplos horários de download", included: false },
        { text: "Suporte prioritário", included: false },
        { text: "Acesso a API", included: false },
      ],
      buttonText: "Começar grátis",
    },
    {
      name: "Professional",
      price: billingCycle === "monthly" ? "R$ 197/mês" : "R$ 1970/ano",
      description: "Para escritórios de contabilidade em crescimento.",
      maxCNPJs: 10,
      scheduleOptions: ["1x ao dia", "2x ao dia"],
      popular: true,
      features: [
        { text: "Até 10 CNPJs", included: true },
        { text: "Download automático 2x ao dia", included: true },
        { text: "30 dias de retenção de arquivos", included: true },
        { text: "Suporte prioritário", included: true },
        { text: "Relatórios avançados", included: true },
        { text: "Download manual", included: true },
        { text: "Múltiplos horários de download", included: true },
        { text: "Acesso a API", included: false },
        { text: "White label", included: false },
      ],
      buttonText: "Escolher plano",
    },
    {
      name: "Enterprise",
      price: billingCycle === "monthly" ? "R$ 297/mês" : "R$ 2970/ano",
      description: "Para grandes escritórios com muitos clientes.",
      maxCNPJs: 30,
      scheduleOptions: ["1x ao dia", "2x ao dia", "4x ao dia", "Personalizado"],
      features: [
        { text: "Até 30 CNPJs", included: true },
        { text: "Download automático 4x ao dia", included: true },
        { text: "90 dias de retenção de arquivos", included: true },
        { text: "Suporte dedicado", included: true },
        { text: "Relatórios personalizados", included: true },
        { text: "Download manual ilimitado", included: true },
        { text: "Múltiplos horários de download", included: true },
        { text: "Acesso a API", included: true },
        { text: "White label", included: true },
      ],
      buttonText: "Contato comercial",
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Planos e Preços</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano que melhor atende às necessidades do seu escritório de contabilidade.
          </p>
          
          <div className="mt-6 inline-flex items-center rounded-full border p-1 bg-muted/50">
            <Button
              variant={billingCycle === "monthly" ? "default" : "ghost"}
              className="rounded-full px-4"
              onClick={() => setBillingCycle("monthly")}
            >
              Mensal
            </Button>
            <Button
              variant={billingCycle === "annual" ? "default" : "ghost"}
              className="rounded-full px-4"
              onClick={() => setBillingCycle("annual")}
            >
              Anual <span className="ml-1 text-xs font-normal">(-15%)</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col h-full border-2 ${
                plan.popular ? "border-primary" : "border-border"
              } transition-all duration-300 hover:shadow-lg ${
                plan.popular ? "scale-105 shadow-md" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-md rounded-tr-md font-medium">
                  Mais Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span
                        className={`mr-2 mt-1 flex h-4 w-4 items-center justify-center rounded-full ${
                          feature.included ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {feature.included ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <span className="h-0.5 w-0.5 rounded-full bg-current"></span>
                        )}
                      </span>
                      <span
                        className={
                          feature.included ? "text-foreground" : "text-muted-foreground"
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full"
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
