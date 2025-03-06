
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { FileCheck } from "lucide-react";

interface DocumentType {
  id: string;
  name: string;
  description: string;
}

export function DocumentTypeSelector() {
  const documentTypes: DocumentType[] = [
    { id: "nfe", name: "NFE", description: "Nota Fiscal Eletrônica" },
    { id: "cte", name: "CTE", description: "Conhecimento de Transporte Eletrônico" },
    { id: "nfse", name: "NFSe", description: "Nota Fiscal de Serviços Eletrônica" },
    { id: "nfce", name: "NFCe", description: "Nota Fiscal de Consumidor Eletrônica" },
    { id: "cfe", name: "CF-e", description: "Cupom Fiscal Eletrônico" },
  ];

  const [selectedTypes, setSelectedTypes] = useState<string[]>(["nfe"]);

  const handleTypeChange = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId) 
        : [...prev, typeId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTypes(documentTypes.map(type => type.id));
  };

  const handleSavePreferences = () => {
    toast({
      title: "Preferências salvas",
      description: "Seus tipos de documentos foram atualizados com sucesso."
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          <span>Tipos de Documentos</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {documentTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`doc-type-${type.id}`} 
                checked={selectedTypes.includes(type.id)}
                onCheckedChange={() => handleTypeChange(type.id)}
              />
              <Label htmlFor={`doc-type-${type.id}`} className="flex cursor-pointer items-center gap-1.5">
                <span className="font-medium">{type.name}</span>
                <span className="text-xs text-muted-foreground">({type.description})</span>
              </Label>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Selecionar Todos
          </Button>
          <Button size="sm" onClick={handleSavePreferences}>
            Salvar Preferências
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
