
import { useState } from "react";
import { ArrowRight, Download, Mail, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, we would send a password reset email here
    // For now, we'll just show a success message
    setIsSubmitted(true);
    toast.success("Instruções enviadas para seu email!");
  };

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
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md p-8 rounded-2xl glass-card animate-fade-in">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Recuperar senha</h1>
                <p className="text-muted-foreground mt-2">
                  Digite seu email e enviaremos as instruções para redefinir sua senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    E-mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-full transition-all duration-300 hover:translate-y-[-2px]"
                >
                  Enviar instruções
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>

                <div className="text-center">
                  <Link to="/login" className="text-primary hover:underline inline-flex items-center">
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Voltar para login
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Verifique seu email</h2>
              <p className="text-muted-foreground">
                Enviamos um link para <strong>{email}</strong> com instruções para redefinir sua senha.
              </p>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/login">Voltar para login</Link>
              </Button>
            </div>
          )}
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
