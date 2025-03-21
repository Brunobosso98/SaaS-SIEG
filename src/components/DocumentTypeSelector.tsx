
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { FileCheck, Loader2 } from "lucide-react";
import { fetchDocumentTypes, addDocumentType, removeDocumentType, saveDocumentTypePreferences } from "@/services/document-types.service";

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

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Map document type IDs to API numeric values
  const documentTypeMap: Record<string, number> = {
    "nfe": 1,
    "cte": 2,
    "nfse": 3,
    "nfce": 4,
    "cfe": 5
  };

  // Fetch document types on component mount
  useEffect(() => {
    const loadDocumentTypes = async () => {
      try {
        const response = await fetchDocumentTypes();
        setSelectedTypes(response.documentTypes || []);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching document types:', error);
        setError(error.message || 'Erro ao carregar tipos de documentos');
        setLoading(false);
      }
    };

    loadDocumentTypes();
  }, []);

  // Handle document type change (add or remove)
  const handleTypeChange = async (typeId: string) => {
    const isRemoving = selectedTypes.includes(typeId);
    const documentType = documentTypeMap[typeId];
    
    try {
      setSaving(true);
      
      if (isRemoving) {
        // Remove document type
        await removeDocumentType(documentType);
        
        setSelectedTypes(prev => prev.filter(id => id !== typeId));
        
        toast({
          title: "Tipo de documento removido",
          description: `${documentTypes.find(t => t.id === typeId)?.name} foi removido com sucesso.`
        });
      } else {
        // Add document type
        await addDocumentType(documentType);
        
        setSelectedTypes(prev => [...prev, typeId]);
        
        toast({
          title: "Tipo de documento adicionado",
          description: `${documentTypes.find(t => t.id === typeId)?.name} foi adicionado com sucesso.`
        });
      }
    } catch (error: any) {
      console.error('Error updating document type:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar tipo de documento",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAll = async () => {
    try {
      setSaving(true);
      
      // Get all document type IDs that are not already selected
      const typesToAdd = documentTypes
        .filter(type => !selectedTypes.includes(type.id))
        .map(type => type.id);
      
      // Add each document type
      for (const typeId of typesToAdd) {
        const documentType = documentTypeMap[typeId];
        await addDocumentType(documentType);
      }
      
      setSelectedTypes(documentTypes.map(type => type.id));
      
      toast({
        title: "Todos os tipos selecionados",
        description: "Todos os tipos de documentos foram adicionados com sucesso."
      });
    } catch (error: any) {
      console.error('Error selecting all document types:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao selecionar todos os tipos",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      
      // Update all settings at once
      await saveDocumentTypePreferences(selectedTypes);
      
      toast({
        title: "Preferências salvas",
        description: "Seus tipos de documentos foram atualizados com sucesso."
      });
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar preferências",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            <span>Tipos de Documentos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando tipos de documentos...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            <span>Tipos de Documentos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6 text-destructive">
          <p>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

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
                disabled={saving}
              />
              <Label htmlFor={`doc-type-${type.id}`} className="flex cursor-pointer items-center gap-1.5">
                <span className="font-medium">{type.name}</span>
                <span className="text-xs text-muted-foreground">({type.description})</span>
              </Label>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSelectAll} 
            disabled={saving || documentTypes.length === selectedTypes.length}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Selecionar Todos"
            )}
          </Button>
          <Button 
            size="sm" 
            onClick={handleSavePreferences}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Salvar Preferências"
            )}
          </Button>
          </div>
      </CardContent>
    </Card>
)}
