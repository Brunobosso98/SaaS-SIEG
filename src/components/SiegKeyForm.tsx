
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, Save, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SiegKeyForm() {
  const [key, setKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveKey = () => {
    if (!key.trim()) {
      toast({
        title: "Chave não informada",
        description: "Por favor, informe a chave de administrador do SIEG.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsSaved(true);
      toast({
        title: "Chave salva com sucesso",
        description: "Sua chave de administrador do SIEG foi salva com sucesso.",
      });
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Chave do SIEG
        </CardTitle>
        <CardDescription>
          Informe a chave de administrador do SIEG para permitir o download automático de XMLs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isSaved ? (
            <div className="flex items-center gap-2 p-3 rounded-md bg-primary/10 text-primary">
              <CheckCircle className="h-5 w-5" />
              <span>Chave configurada com sucesso</span>
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="sieg-key" className="text-sm font-medium">
                Chave de Administrador
              </label>
              <Input
                id="sieg-key"
                type="password"
                placeholder="Insira sua chave de administrador do SIEG"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Esta chave é fornecida pelo SIEG e permite acesso aos XMLs de seus clientes.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {!isSaved ? (
          <Button 
            onClick={handleSaveKey} 
            disabled={loading}
            className="w-full rounded-md"
          >
            {loading ? "Salvando..." : "Salvar Chave"}
            {!loading && <Save className="ml-2 h-4 w-4" />}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => setIsSaved(false)}
            className="w-full rounded-md"
          >
            Alterar Chave
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
