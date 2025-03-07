
import { useState } from "react";
import { ArrowRight, Download, Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface AuthPageProps {
  type: "login" | "register";
}

export function AuthPage({ type }: AuthPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      if (type === "login") {
        await login(email, password);
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo de volta!"
        });
        navigate("/dashboard");
      } else {
        // Check if passwords match for registration
        if (password !== confirmPassword) {
          setErrorMessage("As senhas não coincidem");
          setIsLoading(false);
          return;
        }
        
        await register(name, email, password);
        toast({
          title: "Conta criada com sucesso",
          description: "Verifique seu email para ativar sua conta."
        });
        navigate("/email-verification", { state: { email } });
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 
        (type === "login" ? "Falha ao fazer login. Verifique suas credenciais." : "Falha ao criar conta. Tente novamente."));
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">
              {type === "login" ? "Entre na sua conta" : "Crie sua conta"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {type === "login" 
                ? "Acesse sua conta para gerenciar seus XMLs" 
                : "Comece a automatizar o download de XMLs"}
            </p>
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {type === "register" && (
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">
                  Nome
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

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

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {type === "register" && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {type === "login" && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Esqueceu sua senha?
                </Link>
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-full transition-all duration-300 hover:translate-y-[-2px] mt-6"
              disabled={isLoading}
            >
              {isLoading ? "Processando..." : (type === "login" ? "Entrar" : "Criar conta")}
              {!isLoading && <ArrowRight className="ml-1 h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            {type === "login" ? (
              <p>
                Não tem uma conta?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Registre-se
                </Link>
              </p>
            ) : (
              <p>
                Já tem uma conta?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Entre
                </Link>
              </p>
            )}
          </div>
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
