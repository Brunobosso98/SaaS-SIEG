# API de CNPJs - Documentação
Este documento descreve os endpoints disponíveis para gerenciamento de CNPJs no sistema SaaS-SIEG.

## Gerenciamento de CNPJs
### Adicionar CNPJ
MÉTODO: POST 
URL: http://localhost:5000/api/cnpjs 
AUTHORIZATION: Bearer Token 
BODY (json):

{
  "cnpj": "12345678000199"
}

RESPOSTA:

{
  "message": "CNPJ added successfully",
  "cnpj": {
    "id": "uuid-do-cnpj",
    "cnpj": "12345678000199",
    "userId": "uuid-do-usuario",
    "active": true,
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
      "active": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid-do-cnpj-2",
      "cnpj": "98765432000199",
      "active": true,
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
  "active": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}

### Atualizar CNPJ
MÉTODO: PUT 
URL: http://localhost:5000/api/cnpjs/:id 
AUTHORIZATION: Bearer Token 
BODY (json):

{
  "active": true
}

RESPOSTA:

{
  "message": "CNPJ updated successfully",
  "cnpj": {
    "id": "uuid-do-cnpj",
    "cnpj": "12345678000199",
    "active": true,
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
- As configurações de download (tipos de documentos, diretório, agendamento) são definidas no nível do usuário através das configurações do perfil
- O formato do CNPJ deve conter exatamente 14 dígitos numéricos