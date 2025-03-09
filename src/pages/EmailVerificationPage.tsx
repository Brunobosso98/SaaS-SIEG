import { useState } from "react";
import { ArrowRight, Download, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import authService from "@/services/auth.service";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/services/auth.service";

export function EmailVerificationPage() {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get email from location state or use user's email from context
  const email = location.state?.email || user?.email || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      await authService.verifyEmail(verificationCode, email);
      setIsVerified(true);
      toast({
        title: "Email verificado com sucesso",
        description: "Seu email foi verificado com sucesso!"
      });
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      setErrorMessage(apiError.response?.data?.message || "Código de verificação inválido. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
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
          {!isVerified ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">Verificação de Email</h1>
                <p className="text-muted-foreground mt-2">
                  Digite o código de verificação enviado para <strong>{email}</strong>
                </p>
              </div>

              {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="verificationCode" className="block text-sm font-medium">
                    Código de Verificação
                  </label>
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="Digite o código de 6 dígitos"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-full transition-all duration-300 hover:translate-y-[-2px]"
                  disabled={isLoading}
                >
                  {isLoading ? "Verificando..." : "Verificar Email"}
                  {!isLoading && <ArrowRight className="ml-1 h-4 w-4" />}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Não recebeu o código?{" "}
                  <button 
                    type="button" 
                    className="text-primary hover:underline"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        await authService.resendVerificationCode(email);
                        toast({
                          title: "Código reenviado",
                          description: "Um novo código foi enviado para seu email."
                        });
                      } catch (error: unknown) {
                        const apiError = error as ApiError;
                        toast({
                          title: "Erro ao reenviar código",
                          description: apiError.response?.data?.message || "Não foi possível reenviar o código. Tente novamente.",
                          variant: "destructive"
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    Reenviar código
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Email Verificado!</h2>
              <p className="text-muted-foreground">
                Seu email foi verificado com sucesso. Você será redirecionado para o dashboard.
              </p>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/dashboard">Ir para o Dashboard</Link>
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