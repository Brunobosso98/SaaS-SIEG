
import { ArrowRight, BarChart2, CheckCircle, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export function LandingPage() {
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
            <Link to="/register">Começar agora</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 px-8 max-w-6xl mx-auto text-center">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 animate-scale-in">
            Automatize o download de XMLs
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-6 animate-slide-in">
            Baixe XMLs de notas fiscais <br /> com apenas alguns cliques
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in">
            Economize tempo e recursos automatizando o download de XMLs do SIEG para escritórios de contabilidade.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Button asChild size="lg" className="rounded-full px-8 transition-all duration-300 hover:translate-y-[-2px]">
              <Link to="/register">
                Começar agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full transition-all duration-300">
              <Link to="/plans">Ver planos</Link>
            </Button>
          </div>

          <div className="relative w-full max-w-4xl mx-auto aspect-video overflow-hidden rounded-xl border border-border/50 shadow-xl animate-scale-in">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
            <div className="bg-gradient-to-br from-secondary to-background absolute inset-0 opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center text-4xl font-semibold">
              Dashboard preview
            </div>
          </div>
        </section>

        <section className="py-20 px-8 max-w-6xl mx-auto">
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
                className="glass-card p-6 flex flex-col items-start"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="w-full py-8 px-8 border-t border-border/30">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} XMLFiscal. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
