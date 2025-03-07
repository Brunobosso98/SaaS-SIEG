# API de XMLs - Documentação
Este documento descreve os endpoints disponíveis para gerenciamento de documentos XML fiscais no sistema SaaS-SIEG.

## Gerenciamento de Documentos XML
### Download de Documentos XML
MÉTODO: POST 
URL: http://localhost:5000/api/xml/download 
AUTHORIZATION: Bearer Token 
BODY (json):

{
  "cnpjId": "uuid-do-cnpj",
  "documentTypes": ["nfe", "nfce"],
  "startDate": "2023-01-01",
  "endDate": "2023-12-31"
}

RESPOSTA:

{
  "message": "XML download initiated",
  "jobId": "uuid-do-job",
  "estimatedCompletion": "2023-01-01T00:05:00.000Z"
}

### Histórico de Downloads
MÉTODO: GET 
URL: http://localhost:5000/api/xml/history 
AUTHORIZATION: Bearer Token 
PARÂMETROS (query):

plaintext
documentType=nfe&startDate=2023-01-01&endDate=2023-12-31&page=1&limit=20

RESPOSTA:

{
  "total": 45,
  "page": 1,
  "limit": 20,
  "xmls": [
    {
      "id": "uuid-do-xml-1",
      "fileName": "35230112345678000199550010000000011234567890.xml",
      "documentType": "nfe",
      "documentNumber": "00000001",
      "documentDate": "2023-01-15T00:00:00.000Z",
      "downloadDate": "2023-01-16T10:30:00.000Z",
      "status": "success",
      "fileSize": 25600,
      "cnpj": {
        "cnpj": "12345678000199",
        "razaoSocial": "Empresa Teste"
      }
    },
    {
      "id": "uuid-do-xml-2",
      "fileName": "35230112345678000199550010000000021234567890.xml",
      "documentType": "nfe",
      "documentNumber": "00000002",
      "documentDate": "2023-01-20T00:00:00.000Z",
      "downloadDate": "2023-01-21T14:15:00.000Z",
      "status": "success",
      "fileSize": 28400,
      "cnpj": {
        "cnpj": "12345678000199",
        "razaoSocial": "Empresa Teste"
      }
    }
  ]
}

### Detalhes do XML
MÉTODO: GET 
URL: http://localhost:5000/api/xml/:id 
AUTHORIZATION: Bearer Token 
RESPOSTA:

{
  "id": "uuid-do-xml",
  "fileName": "35230112345678000199550010000000011234567890.xml",
  "filePath": "/storage/xmls/user-123/2023/01/35230112345678000199550010000000011234567890.xml",
  "fileSize": 25600,
  "documentType": "nfe",
  "documentNumber": "00000001",
  "documentDate": "2023-01-15T00:00:00.000Z",
  "downloadDate": "2023-01-16T10:30:00.000Z",
  "status": "success",
  "errorMessage": null,
  "downloadType": "manual",
  "cnpjId": "uuid-do-cnpj",
  "userId": "uuid-do-usuario",
  "expiryDate": "2023-04-16T10:30:00.000Z",
  "metadata": {
    "emitente": "EMPRESA EMISSORA LTDA",
    "destinatario": "EMPRESA DESTINATARIA LTDA",
    "valor": 1500.75
  },
  "createdAt": "2023-01-16T10:30:00.000Z",
  "updatedAt": "2023-01-16T10:30:00.000Z",
  "cnpj": {
    "cnpj": "12345678000199",
    "razaoSocial": "Empresa Teste"
  }
}

### Visualizar Conteúdo do XML
MÉTODO: GET 
URL: http://localhost:5000/api/xml/view/:id 
AUTHORIZATION: Bearer Token 
RESPOSTA:

{
  "id": "uuid-do-xml",
  "fileName": "35230112345678000199550010000000011234567890.xml",
  "content": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><nfeProc xmlns=\"http://www.portalfiscal.inf.br/nfe\" versao=\"4.00\">...</nfeProc>"
}

### Excluir XML
MÉTODO: DELETE 
URL: http://localhost:5000/api/xml/:id 
AUTHORIZATION: Bearer Token RESPOSTA:

{
  "message": "XML deleted successfully"
}

### Configurar Ajustes de Download
MÉTODO: PUT 
URL: http://localhost:5000/api/xml/settings 
AUTHORIZATION: Bearer Token 
BODY (json):

{
  "documentTypes": ["nfe", "nfce", "cte"],
  "directory": "custom-downloads",
  "retention": 90,
  "schedule": {
    "frequency": "daily",
    "times": ["08:00", "18:00"]
  }
}

RESPOSTA:

{
  "message": "XML download settings updated successfully",
  "settings": {
    "documentTypes": ["nfe", "nfce", "cte"],
    "directory": "custom-downloads",
    "retention": 90,
    "schedule": {
      "frequency": "daily",
      "times": ["08:00", "18:00"]
    }
  }
}

## Tipos de Documentos Suportados
- nfe : Nota Fiscal Eletrônica
- nfce : Nota Fiscal de Consumidor Eletrônica
- cte : Conhecimento de Transporte Eletrônico
- mdfe : Manifesto Eletrônico de Documentos Fiscais
- nfse : Nota Fiscal de Serviços Eletrônica
## Observações
- Todos os endpoints requerem autenticação via token JWT
- O parâmetro :id nas URLs deve ser substituído pelo UUID do documento XML
- Os downloads podem ser iniciados manualmente ou configurados para execução automática
- Os documentos XML têm uma data de expiração baseada na configuração de retenção do usuário
- O histórico de downloads suporta filtragem por tipo de documento, data e paginação