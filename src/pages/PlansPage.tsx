
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type PlanFeature = {
  text: string;
  included: boolean;
};

type PlanProps = {
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  buttonText: string;
  buttonLink: string;
};

const Plan = ({ name, price, description, features, popular, buttonText, buttonLink }: PlanProps) => {
  return (
    <div className={`rounded-2xl p-6 ${popular ? "bg-primary text-primary-foreground" : "bg-card"} border ${popular ? "border-primary" : "border-border"} flex flex-col h-full relative animate-scale-in`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
            Mais popular
          </span>
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-xl font-medium mb-1">{name}</h3>
        <p className={`text-sm ${popular ? "text-primary-foreground/80" : "text-muted-foreground"} mb-4`}>
          {description}
        </p>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-3xl font-bold">{price}</span>
          <span className={`${popular ? "text-primary-foreground/80" : "text-muted-foreground"} text-sm`}>
            /mês
          </span>
        </div>
      </div>

      <ul className="space-y-3 my-6 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <div className={`rounded-full p-1 ${popular ? "bg-primary-foreground/20" : "bg-primary/10"}`}>
              <Check className={`h-3 w-3 ${popular ? "text-primary-foreground" : "text-primary"}`} />
            </div>
            <span className="text-sm">{feature.text}</span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        className={`w-full rounded-full ${!popular ? "bg-primary text-primary-foreground" : "bg-primary-foreground text-primary"} transition-all duration-300 hover:translate-y-[-2px]`}
      >
        <Link to={buttonLink}>
          {buttonText}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
};

export function PlansPage() {
  const plans = [
    {
      name: "Básico",
      price: "R$ 30",
      description: "Para pequenos escritórios",
      features: [
        { text: "1 CNPJ", included: true },
        { text: "Download automático diário", included: true },
        { text: "Armazenamento por 30 dias", included: true },
        { text: "Suporte por e-mail", included: true },
        { text: "Notificações por e-mail", included: false },
        { text: "API para integração", included: false },
      ],
      popular: false,
      buttonText: "Começar agora",
      buttonLink: "/register",
    },
    {
      name: "Profissional",
      price: "R$ 97",
      description: "Para escritórios médios",
      features: [
        { text: "Até 10 CNPJs", included: true },
        { text: "Download automático diário", included: true },
        { text: "Armazenamento por 90 dias", included: true },
        { text: "Suporte prioritário", included: true },
        { text: "Notificações por e-mail", included: true },
        { text: "API para integração", included: false },
      ],
      popular: true,
      buttonText: "Escolher plano",
      buttonLink: "/register",
    },
    {
      name: "Empresarial",
      price: "R$ 247",
      description: "Para grandes escritórios",
      features: [
        { text: "CNPJs ilimitados", included: true },
        { text: "Download automático horário", included: true },
        { text: "Armazenamento por 1 ano", included: true },
        { text: "Suporte 24/7", included: true },
        { text: "Notificações por e-mail", included: true },
        { text: "API para integração", included: true },
      ],
      popular: false,
      buttonText: "Contatar vendas",
      buttonLink: "/register",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-4 px-8 flex justify-between items-center border-b border-border/30">
        <Link to="/" className="flex items-center space-x-2">
          <div className="rounded-md bg-primary p-1">
            <Download className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">XMLFiscal</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm hover:underline">
            Entrar
          </Link>
          <ThemeToggle />
          <Button asChild className="rounded-full px-5 transition-all duration-300 hover:translate-y-[-2px]">
            <Link to="/register">Cadastrar</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 py-16 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-slide-in">Escolha o plano ideal para seu escritório</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            Automatize o download de XMLs e economize tempo e recursos com nossos planos flexíveis.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Plan key={index} {...plan} />
          ))}
        </div>

        <div className="mt-16 text-center p-8 border border-border/50 rounded-2xl glass-card max-w-3xl mx-auto animate-fade-in">
          <h2 className="text-2xl font-semibold mb-4">Precisa de um plano personalizado?</h2>
          <p className="text-muted-foreground mb-6">
            Entre em contato com nossa equipe de vendas para criar um plano que atenda às necessidades específicas do seu escritório.
          </p>
          <Button asChild className="rounded-full px-6 transition-all duration-300 hover:translate-y-[-2px]">
            <Link to="/contact">Falar com um consultor</Link>
          </Button>
        </div>
      </main>

      <footer className="w-full py-8 px-8 border-t border-border/30">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} XMLFiscal. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
