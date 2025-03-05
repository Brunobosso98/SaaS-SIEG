
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, Plus, Trash, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Simple CNPJ validation for Brazil
const validateCNPJ = (cnpj: string) => {
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  if (cnpj.length !== 14) return false;
  
  // Check for repeated digits
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  // Simple validation for the demo
  // In a real app, use a more robust validation algorithm
  return true;
};

export function CNPJManagement() {
  const [cnpjs, setCnpjs] = useState<string[]>([
    "12.345.678/0001-90",
    "98.765.432/0001-10",
  ]);
  const [newCnpj, setNewCnpj] = useState("");
  const { toast } = useToast();

  const handleAddCnpj = () => {
    // Format the CNPJ for display
    const formattedCnpj = newCnpj
      .replace(/[^\d]/g, '')
      .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');

    if (!validateCNPJ(newCnpj)) {
      toast({
        title: "CNPJ inválido",
        description: "Por favor, informe um CNPJ válido.",
        variant: "destructive",
      });
      return;
    }

    if (cnpjs.includes(formattedCnpj)) {
      toast({
        title: "CNPJ duplicado",
        description: "Este CNPJ já está na sua lista.",
        variant: "destructive",
      });
      return;
    }

    setCnpjs([...cnpjs, formattedCnpj]);
    setNewCnpj("");
    toast({
      title: "CNPJ adicionado",
      description: "O CNPJ foi adicionado com sucesso.",
    });
  };

  const handleRemoveCnpj = (index: number) => {
    const updatedCnpjs = [...cnpjs];
    updatedCnpjs.splice(index, 1);
    setCnpjs(updatedCnpjs);
    toast({
      title: "CNPJ removido",
      description: "O CNPJ foi removido com sucesso.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Gerenciar CNPJs
        </CardTitle>
        <CardDescription>
          Adicione ou remova CNPJs para download automático de XMLs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="00.000.000/0000-00"
              value={newCnpj}
              onChange={(e) => setNewCnpj(e.target.value)}
            />
            <Button 
              size="icon" 
              onClick={handleAddCnpj}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {cnpjs.length === 0 ? (
            <div className="flex items-center gap-2 p-3 rounded-md bg-secondary text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <span>Nenhum CNPJ adicionado</span>
            </div>
          ) : (
            <ul className="space-y-2">
              {cnpjs.map((cnpj, index) => (
                <li key={index} className="flex items-center justify-between p-3 rounded-md bg-secondary">
                  <span>{cnpj}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveCnpj(index)}
                    className="h-8 w-8 shrink-0 text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          {cnpjs.length} de 10 CNPJs disponíveis no seu plano.
        </div>
      </CardFooter>
    </Card>
  );
}
