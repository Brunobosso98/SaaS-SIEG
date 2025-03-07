# API de CNPJs - Documentação
Este documento descreve os endpoints disponíveis para gerenciamento de CNPJs no sistema SaaS-SIEG.

## Gerenciamento de CNPJs
### Adicionar CNPJ
MÉTODO: POST 
URL: http://localhost:5000/api/cnpjs 
AUTHORIZATION: Bearer Token 
BODY (json):

{
  "cnpj": "12345678000199",
  "razaoSocial": "Empresa Teste",
  "nomeFantasia": "Teste LTDA",
  "downloadConfig": {
    "documentTypes": ["nfe", "nfce"],
    "directory": "downloads",
    "schedule": {
      "frequency": "daily",
      "times": ["08:00"]
    }
  }
}


RESPOSTA:

{
  "message": "CNPJ added successfully",
  "cnpj": {
    "id": "uuid-do-cnpj",
    "cnpj": "12345678000199",
    "razaoSocial": "Empresa Teste",
    "nomeFantasia": "Teste LTDA",
    "userId": "uuid-do-usuario",
    "active": true,
    "downloadConfig": {
      "documentTypes": ["nfe", "nfce"],
      "directory": "downloads",
      "schedule": {
        "frequency": "daily",
        "times": ["08:00"]
      }
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}


### Listar CNPJs
MÉTODO: GET 
URL: http://localhost:5000/api/cnpjs 
AUTHORIZATION: Bearer Token 
RESPOSTA:

{
  "cnpjs": [
    {
      "id": "uuid-do-cnpj-1",
      "cnpj": "12345678000199",
      "razaoSocial": "Empresa Teste",
      "nomeFantasia": "Teste LTDA",
      "active": true,
      "downloadConfig": {
        "documentTypes": ["nfe", "nfce"],
        "directory": "downloads",
        "schedule": {
          "frequency": "daily",
          "times": ["08:00"]
        }
      },
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid-do-cnpj-2",
      "cnpj": "98765432000199",
      "razaoSocial": "Segunda Empresa",
      "nomeFantasia": "Empresa 2 LTDA",
      "active": true,
      "downloadConfig": {
        "documentTypes": ["nfe", "cte"],
        "directory": "downloads/empresa2",
        "schedule": {
          "frequency": "weekly",
          "times": ["10:00"]
        }
      },
      "createdAt": "2023-01-02T00:00:00.000Z",
      "updatedAt": "2023-01-02T00:00:00.000Z"
    }
  ]
}

### Detalhes do CNPJ
MÉTODO: GET 
URL: http://localhost:5000/api/cnpjs/:id 
AUTHORIZATION: Bearer Token 
RESPOSTA:

{
  "id": "uuid-do-cnpj",
  "cnpj": "12345678000199",
  "razaoSocial": "Empresa Teste",
  "nomeFantasia": "Teste LTDA",
  "active": true,
  "downloadConfig": {
    "documentTypes": ["nfe", "nfce"],
    "directory": "downloads",
    "schedule": {
      "frequency": "daily",
      "times": ["08:00"]
    }
  },
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}

### Atualizar CNPJ
MÉTODO: PUT 
URL: http://localhost:5000/api/cnpjs/:id 
AUTHORIZATION: Bearer Token 
BODY (json):

{
  "razaoSocial": "Empresa Atualizada",
  "nomeFantasia": "Nova Fantasia LTDA",
  "active": true,
  "downloadConfig": {
    "documentTypes": ["nfe", "nfce", "cte"],
    "directory": "downloads/nova-pasta",
    "schedule": {
      "frequency": "daily",
      "times": ["08:00", "18:00"]
    }
  }
}

RESPOSTA:

{
  "message": "CNPJ updated successfully",
  "cnpj": {
    "id": "uuid-do-cnpj",
    "cnpj": "12345678000199",
    "razaoSocial": "Empresa Atualizada",
    "nomeFantasia": "Nova Fantasia LTDA",
    "active": true,
    "downloadConfig": {
      "documentTypes": ["nfe", "nfce", "cte"],
      "directory": "downloads/nova-pasta",
      "schedule": {
        "frequency": "daily",
        "times": ["08:00", "18:00"]
      }
    },
    "updatedAt": "2023-01-03T00:00:00.000Z"
  }
}

### Excluir CNPJ
MÉTODO: DELETE 
URL: http://localhost:5000/api/cnpjs/:id 
AUTHORIZATION: Bearer Token 
RESPOSTA:

{
  "message": "CNPJ deleted successfully"
}

## Observações
- Todos os endpoints requerem autenticação via token JWT
- O parâmetro :id nas URLs deve ser substituído pelo UUID do CNPJ
- O número de CNPJs que um usuário pode cadastrar depende do seu plano de assinatura
- Os tipos de documentos suportados incluem: "nfe", "nfce", "cte", entre outros
- As frequências de download suportadas são: "daily", "weekly", "monthly"