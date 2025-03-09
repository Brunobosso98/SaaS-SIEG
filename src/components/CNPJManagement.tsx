
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, Plus, Trash, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCNPJs, addCNPJ, removeCNPJ, CNPJ } from "@/services/cnpj.service";
import { formatCNPJ, validateCNPJ } from "@/utils/validators";

export function CNPJManagement() {
  const [cnpjs, setCnpjs] = useState<CNPJ[]>([]);
  const [formattedCnpjs, setFormattedCnpjs] = useState<string[]>([]);
  const [newCnpj, setNewCnpj] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const { toast } = useToast();

  // Load CNPJs on component mount
  useEffect(() => {
    const loadCNPJs = async () => {
      console.log('Starting to load CNPJs...');
      try {
        console.log('Calling getCNPJs API...');
        const cnpjData = await getCNPJs();
        console.log('CNPJs loaded successfully:', cnpjData);
        setCnpjs(cnpjData);
        // Format CNPJs for display
        setFormattedCnpjs(cnpjData.map(item => formatCNPJ(item.cnpj)));
        console.log('CNPJs formatted for display:', cnpjData.map(item => formatCNPJ(item.cnpj)));
      } catch (error) {
        console.error('Failed to load CNPJs:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        toast({
          title: "Erro ao carregar CNPJs",
          description: "Não foi possível carregar seus CNPJs. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        console.log('CNPJ loading process completed');
      }
    };

    console.log('CNPJManagement component mounted, initiating CNPJ loading...');
    loadCNPJs();
  }, [toast]);

  // Define a proper error type for Axios errors
  interface ApiError {
    response?: {
      data?: {
        message?: string;
      };
    };
    message: string;
  }

  const handleAddCnpj = async () => {
    console.log('Starting CNPJ addition process...');
    console.log('CNPJ to add:', newCnpj);
    
    // Validate CNPJ first
    if (!validateCNPJ(newCnpj)) {
      console.log('CNPJ validation failed:', newCnpj);
      toast({
        title: "CNPJ inválido",
        description: "Por favor, informe um CNPJ válido.",
        variant: "destructive",
      });
      return;
    }

    // Format for checking duplicates
    const formattedCnpj = formatCNPJ(newCnpj.replace(/[^\d]/g, ''));
    console.log('Formatted CNPJ for duplicate check:', formattedCnpj);
    
    if (formattedCnpjs.includes(formattedCnpj)) {
      console.log('Duplicate CNPJ detected:', formattedCnpj);
      console.log('Current CNPJ list:', formattedCnpjs);
      toast({
        title: "CNPJ duplicado",
        description: "Este CNPJ já está na sua lista.",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);
    try {
      // Send only digits to the API
      const cnpjDigits = newCnpj.replace(/[^\d]/g, '');
      console.log('Sending CNPJ to API (digits only):', cnpjDigits);
      console.log('Calling addCNPJ API...');
      const newCnpjData = await addCNPJ(cnpjDigits);
      console.log('CNPJ added successfully, API response:', newCnpjData);
      
      // Update state with the new CNPJ
      setCnpjs(prev => Array.isArray(prev) ? [...prev, newCnpjData] : [newCnpjData]);
      setFormattedCnpjs(prev => Array.isArray(prev) ? [...prev, formatCNPJ(newCnpjData.cnpj)] : [formatCNPJ(newCnpjData.cnpj)]);
      setNewCnpj("");
      console.log('State updated with new CNPJ');
      
      toast({
        title: "CNPJ adicionado",
        description: "O CNPJ foi adicionado com sucesso.",
      });
    } catch (error: unknown) {
      console.error('Failed to add CNPJ:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Error type:', Object.prototype.toString.call(error));
      if ((error as any).response) {
        console.error('API response error:', (error as any).response);
        console.error('Status code:', (error as any).response.status);
        console.error('Response data:', (error as any).response.data);
      }
      toast({
        title: "Erro ao adicionar CNPJ",
        description: (error as ApiError).response?.data?.message || "Não foi possível adicionar o CNPJ. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
      console.log('CNPJ addition process completed');
    }
  };

  const handleRemoveCnpj = async (index: number) => {
    const cnpjToRemove = cnpjs[index];
    console.log('Starting CNPJ removal process for:', cnpjToRemove);
    setRemoving(cnpjToRemove.id);
    
    try {
      console.log('Calling removeCNPJ API with ID:', cnpjToRemove.id);
      await removeCNPJ(cnpjToRemove.id);
      console.log('CNPJ removed successfully from API');
      
      // Update state after successful removal
      setCnpjs(prev => prev.filter(item => item.id !== cnpjToRemove.id));
      setFormattedCnpjs(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
      console.log('State updated after CNPJ removal');
      
      toast({
        title: "CNPJ removido",
        description: "O CNPJ foi removido com sucesso.",
      });
    } catch (error: unknown) {
      console.error('Failed to remove CNPJ:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      if ((error as any).response) {
        console.error('API response error:', (error as any).response);
        console.error('Status code:', (error as any).response.status);
        console.error('Response data:', (error as any).response.data);
      }
      toast({
        title: "Erro ao remover CNPJ",
        description: (error as ApiError).response?.data?.message || "Não foi possível remover o CNPJ. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setRemoving(null);
      console.log('CNPJ removal process completed');
    }
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
              disabled={adding}
            />
            <Button 
              size="icon" 
              onClick={handleAddCnpj}
              className="shrink-0"
              disabled={adding || !newCnpj.trim()}
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : formattedCnpjs.length === 0 ? (
            <div className="flex items-center gap-2 p-3 rounded-md bg-secondary text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <span>Nenhum CNPJ adicionado</span>
            </div>
          ) : (
            <ul className="space-y-2">
              {formattedCnpjs.map((cnpj, index) => (
                <li key={cnpjs[index].id} className="flex items-center justify-between p-3 rounded-md bg-secondary">
                  <span>{cnpj}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveCnpj(index)}
                    className="h-8 w-8 shrink-0 text-destructive"
                    disabled={removing === cnpjs[index].id}
                  >
                    {removing === cnpjs[index].id ? 
                      <Loader2 className="h-4 w-4 animate-spin" /> : 
                      <Trash className="h-4 w-4" />}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          {formattedCnpjs.length} de 10 CNPJs disponíveis no seu plano.
        </div>
      </CardFooter>
    </Card>
  );
}
