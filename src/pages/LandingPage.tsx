
import { ArrowRight, BarChart2, CheckCircle, Download, Users, Clock, FileCheck, Zap, AreaChart, PieChart, Box, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import { ChatBot } from "@/components/ChatBot";

export function LandingPage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            entry.target.classList.remove('opacity-0');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach((el) => {
      el.classList.add('opacity-0');
      observer.observe(el);
    });

    return () => {
      animateElements.forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-4 px-8 flex justify-between items-center border-b border-border/30 animate-fade-in">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="rounded-md bg-primary p-1 transition-all duration-300 group-hover:scale-110">
            <Download className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">XMLFiscal</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm hover:underline transition-colors duration-300 hover:text-primary">
            Entrar
          </Link>
          <ThemeToggle />
          <Button asChild className="rounded-full px-5 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md">
            <Link to="/register">Começar agora</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 px-8 max-w-6xl mx-auto text-center">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 animate-pulse">
            Automatize o download de XMLs
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6 animate-slide-in">
            Baixe XMLs de notas fiscais <br /> com apenas alguns cliques
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "200ms" }}>
            Economize tempo e recursos automatizando o download de XMLs do SIEG para escritórios de contabilidade.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <Button asChild size="lg" className="rounded-full px-8 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg">
              <Link to="/register" className="group">
                Começar agora
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full transition-all duration-300 hover:scale-105">
              <Link to="/plans">Ver planos</Link>
            </Button>
          </div>

          <div className="relative w-full max-w-4xl mx-auto aspect-video overflow-hidden rounded-xl border border-border/50 shadow-xl animate-float">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 opacity-40" />
            <div className="bg-gradient-to-br from-secondary to-background absolute inset-0 opacity-50" />
            <div className="absolute inset-0 p-8 flex flex-col items-center justify-center">
              <div className="grid grid-cols-2 gap-4 w-full max-w-3xl">
                <Card className="glass shadow-sm border-primary/10 transition-all duration-500 hover:shadow-md hover:scale-105">
                  <CardContent className="p-4 flex items-center space-x-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <AreaChart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Downloads Mensais</h3>
                      <p className="text-2xl font-bold">12,583</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass shadow-sm border-primary/10 transition-all duration-500 hover:shadow-md hover:scale-105" style={{ transitionDelay: "100ms" }}>
                  <CardContent className="p-4 flex items-center space-x-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <PieChart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</h3>
                      <p className="text-2xl font-bold">99.8%</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass shadow-sm border-primary/10 transition-all duration-500 hover:shadow-md hover:scale-105" style={{ transitionDelay: "200ms" }}>
                  <CardContent className="p-4 flex items-center space-x-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">XMLs Processados</h3>
                      <p className="text-2xl font-bold">3.2M+</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass shadow-sm border-primary/10 transition-all duration-500 hover:shadow-md hover:scale-105" style={{ transitionDelay: "300ms" }}>
                  <CardContent className="p-4 flex items-center space-x-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Clientes</h3>
                      <p className="text-2xl font-bold">750+</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-8 w-full max-w-3xl">
                <div className="w-full h-12 rounded-md bg-secondary/30 relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-full w-3/4 bg-primary/30 rounded-md flex items-center justify-center animate-pulse">
                    <span className="text-sm font-medium">Processamento: 75%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-8 max-w-6xl mx-auto animate-on-scroll" ref={featuresRef}>
          <h2 className="text-3xl font-bold text-center mb-12">Recursos principais</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Download Automático",
                description: "Realize downloads automáticos de XMLs do portal SIEG com apenas alguns cliques.",
                icon: Download,
              },
              {
                title: "Multi-CNPJ",
                description: "Gerencie múltiplos CNPJs em uma única interface intuitiva.",
                icon: Users,
              },
              {
                title: "Relatórios Detalhados",
                description: "Acesse relatórios detalhados de downloads e status de processamento.",
                icon: BarChart2,
              },
            ].map((feature, index) => (
              <div 
                key={index} 
                className="glass-card p-6 flex flex-col items-start transition-all duration-500 hover:translate-y-[-5px] hover:shadow-lg animate-on-scroll"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="rounded-full bg-primary/10 p-3 mb-4 transition-all duration-300 hover:scale-110 hover:bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 px-8 bg-secondary/30 animate-on-scroll" ref={statsRef}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Resultados que transformam</h2>
            
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  number: "85%",
                  text: "Redução no tempo de processamento",
                  icon: Clock,
                },
                {
                  number: "100%",
                  text: "Precisão nos downloads",
                  icon: CheckCircle,
                },
                {
                  number: "24/7",
                  text: "Disponibilidade do sistema",
                  icon: Zap,
                },
                {
                  number: "3.2M+",
                  text: "XMLs processados",
                  icon: FileCheck,
                },
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center p-6 animate-on-scroll"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="mx-auto rounded-full bg-primary/10 p-4 w-16 h-16 flex items-center justify-center mb-4 transition-all duration-300 hover:scale-110 hover:bg-primary/20">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-4xl font-bold mb-2 transition-all duration-500 hover:text-primary">{stat.number}</p>
                  <p className="text-muted-foreground">{stat.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-8 max-w-6xl mx-auto animate-on-scroll" ref={ctaRef}>
          <div className="rounded-2xl glass-card p-8 md:p-12 transition-all duration-500 hover:shadow-xl">
            <div className="md:flex items-center justify-between">
              <div className="mb-8 md:mb-0 md:max-w-lg">
                <h2 className="text-3xl font-bold mb-4">Pronto para automatizar seus downloads?</h2>
                <p className="text-muted-foreground mb-6">
                  Junte-se a mais de 750 empresas que economizam tempo e recursos com o XMLFiscal.
                </p>
                <Button asChild size="lg" className="rounded-full px-8 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg">
                  <Link to="/register" className="group">
                    Começar agora
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { text: "Instalação fácil" },
                  { text: "Suporte técnico" },
                  { text: "Sem complexidade" },
                  { text: "Economia de tempo" }
                ].map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-2 text-sm transition-all duration-300 hover:translate-x-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-8 px-8 border-t border-border/30 animate-fade-in">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} XMLFiscal. Todos os direitos reservados.
        </div>
      </footer>

      {/* Add ChatBot component */}
      <ChatBot />
    </div>
  );
}
