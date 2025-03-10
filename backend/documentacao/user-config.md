# API de Configurações de Usuário - Documentação

Este documento descreve os endpoints disponíveis para gerenciamento de perfil e configurações de usuário no sistema SaaS-SIEG.

## Perfil de Usuário

### Obter Perfil do Usuário

**MÉTODO:** GET  
**URL:** http://localhost:5000/api/users/profile  
**AUTHORIZATION:** Bearer Token  
**RESPOSTA:**

```json
{
  "id": "uuid-do-usuario",
  "name": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "verified": true,
  "plan": "professional",
  "settings": {
    "documentTypes": ["nfe", "nfce"],
    "downloadConfig": {
      "directory": "downloads",
      "retention": 30
    },
    "notifications": {
      "email": true,
      "downloadComplete": true,
      "downloadFailed": true
    }
  },
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-10T00:00:00.000Z"
}
```

### Atualizar Perfil do Usuário

**MÉTODO:** PUT  
**URL:** http://localhost:5000/api/users/profile  
**AUTHORIZATION:** Bearer Token  
**BODY (json):**

```json
{
  "name": "Novo Nome do Usuário",
  "email": "novo.email@exemplo.com"
}
```

**RESPOSTA:**

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid-do-usuario",
    "name": "Novo Nome do Usuário",
    "email": "novo.email@exemplo.com"
  }
}
```

## Assinatura e Planos

### Obter Detalhes da Assinatura

**MÉTODO:** GET  
**URL:** http://localhost:5000/api/users/subscription
**AUTHORIZATION:** Bearer Token  
**RESPOSTA:**

```json
{
  "currentPlan": "professional",
  "maxCNPJs": 10,
  "downloadFrequency": ["1x ao dia", "2x ao dia"],
  "retentionDays": 30,
  "features": [
    "Até 10 CNPJs",
    "Download automático 2x ao dia",
    "30 dias de retenção de arquivos",
    "Suporte prioritário",
    "Relatórios avançados",
    "Download manual",
    "Múltiplos horários de download"
  ]
}
```

### Atualizar Plano do Usuário

**MÉTODO:** PUT  
**URL:** http://localhost:5000/api/users/subscription  
**AUTHORIZATION:** Bearer Token  
**BODY (json):**

```json
{
  "plan": "professional"
}
```

**RESPOSTA:**

```json
{
  "message": "Plan updated successfully",
  "plan": "professional"
}
```

## Configurações Gerais

### Obter Todas as Configurações do Usuário

**MÉTODO:** GET  
**URL:** http://localhost:5000/api/users/settings  
**AUTHORIZATION:** Bearer Token  
**RESPOSTA:**

```json
{
  "documentTypes": ["nfe", "nfce", "cte"],
  "downloadConfig": {
    "directory": "meus-documentos/xml",
    "retention": 15
  },
  "notifications": {
    "email": true,
    "downloadComplete": false,
    "downloadFailed": true
  }
}
```

### Atualizar Todas as Configurações do Usuário

**MÉTODO:** PUT  
**URL:** http://localhost:5000/api/users/settings  
**AUTHORIZATION:** Bearer Token  
**BODY (json):**

```json
{
  "settings": {
    "documentTypes": ["nfe", "nfce", "cte"],
    "downloadConfig": {
      "directory": "meus-documentos/xml",
      "retention": 15
    },
    "notifications": {
      "email": true,
      "downloadComplete": false,
      "downloadFailed": true
    }
  }
}
```

**RESPOSTA:**

```json
{
  "message": "Settings updated successfully",
  "settings": {
    "documentTypes": ["nfe", "nfce", "cte"],
    "downloadConfig": {
      "directory": "meus-documentos/xml",
      "retention": 15
    },
    "notifications": {
      "email": true,
      "downloadComplete": false,
      "downloadFailed": true
    }
  }
}
```

## Tipos de Documentos

### Obter Tipos de Documentos

**MÉTODO:** GET  
**URL:** http://localhost:5000/api/users/settings/document-types  
**AUTHORIZATION:** Bearer Token  
**RESPOSTA:**

```json
{
  "documentTypes": ["nfe", "nfce", "cte"]
}
```

### Adicionar Tipo de Documento

**MÉTODO:** POST  
**URL:** http://localhost:5000/api/users/settings/document-types  
**AUTHORIZATION:** Bearer Token  
**BODY (json):**

```json
{
  "documentType": 1
}
```

**RESPOSTA:**

```json
{
  "message": "Document type added successfully",
  "documentTypes": ["nfe", "nfce", "cte"]
}
```

### Remover Tipo de Documento

**MÉTODO:** DELETE  
**URL:** http://localhost:5000/api/users/settings/document-types  
**AUTHORIZATION:** Bearer Token  
**BODY (json):**

```json
{
  "documentType": 1
}
```

**RESPOSTA:**

```json
{
  "message": "Document type removed successfully",
  "documentTypes": ["nfce", "cte"]
}
```

> **Nota:** Os tipos de documentos são representados por números:
>
> - 1: NFe (Nota Fiscal Eletrônica)
> - 2: CT-e (Conhecimento de Transporte Eletrônico)
> - 3: NFSe (Nota Fiscal de Serviço Eletrônica)
> - 4: NFCe (Nota Fiscal de Consumidor Eletrônica)
> - 5: CF-e (Cupom Fiscal Eletrônico)

## Diretório de Download

### Obter Diretório de Download

**MÉTODO:** GET  
**URL:** http://localhost:5000/api/users/settings/download-directory  
**AUTHORIZATION:** Bearer Token  
**RESPOSTA:**

```json
{
  "directory": "meus-documentos/xml"
}
```

### Atualizar Diretório de Download

**MÉTODO:** PUT  
**URL:** http://localhost:5000/api/users/settings/download-directory  
**AUTHORIZATION:** Bearer Token  
**BODY (json):**

```json
{
  "directory": "nova-pasta/documentos-fiscais"
}
```

**RESPOSTA:**

```json
{
  "message": "Download directory updated successfully",
  "directory": "nova-pasta/documentos-fiscais"
}
```

## Período de Retenção

### Obter Período de Retenção

**MÉTODO:** GET  
**URL:** http://localhost:5000/api/users/settings/retention  
**AUTHORIZATION:** Bearer Token  
**RESPOSTA:**

```json
{
  "retention": 15
}
```

### Atualizar Período de Retenção

**MÉTODO:** PUT  
**URL:** http://localhost:5000/api/users/settings/retention  
**AUTHORIZATION:** Bearer Token  
**BODY (json):**

```json
{
  "retention": 30
}
```

**RESPOSTA:**

```json
{
  "message": "Retention period updated successfully",
  "retention": 30
}
```

## Configurações de Notificação

### Obter Configurações de Notificação

**MÉTODO:** GET  
**URL:** http://localhost:5000/api/users/settings/notifications  
**AUTHORIZATION:** Bearer Token  
**RESPOSTA:**

```json
{
  "notifications": {
    "email": true,
    "downloadComplete": false,
    "downloadFailed": true
  }
}
```

### Atualizar Configurações de Notificação

**MÉTODO:** PUT  
**URL:** http://localhost:5000/api/users/settings/notifications  
**AUTHORIZATION:** Bearer Token  
**BODY (json):**

```json
{
  "notifications": {
    "email": true,
    "downloadComplete": true,
    "downloadFailed": false
  }
}
```

**RESPOSTA:**

```json
{
  "message": "Notification settings updated successfully",
  "notifications": {
    "email": true,
    "downloadComplete": true,
    "downloadFailed": false
  }
}
```

## Chave SIEG

### Salvar Chave SIEG

**MÉTODO:** POST  
**URL:** http://localhost:5000/api/users/sieg-key
**AUTHORIZATION:** Bearer Token  
**BODY (json):**

```json
{
  "siegKey": "sua-chave-sieg-aqui-12345678"
}
```

**RESPOSTA:**

```json
{
  "message": "SIEG key saved successfully"
}
```

### Obter Chave SIEG

**MÉTODO:** GET  
**URL:** http://localhost:5000/api/users/sieg-key  
**AUTHORIZATION:** Bearer Token  
**RESPOSTA:**

```json
{
  "siegKey": "sua-****-aqui-5678"
}
```

## CNPJs do Usuário

### Listar CNPJs do Usuário

**MÉTODO:** GET  
**URL:** http://localhost:5000/api/users/cnpjs  
**AUTHORIZATION:** Bearer Token  
**RESPOSTA:**

```json
[
  {
    "id": "uuid-do-cnpj-1",
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
  },
  {
    "id": "uuid-do-cnpj-2",
    "cnpj": "98765432000199",
    "razaoSocial": "Segunda Empresa",
    "nomeFantasia": "Empresa 2 LTDA",
    "downloadConfig": {
      "documentTypes": ["nfe", "cte"],
      "directory": "downloads/empresa2",
      "schedule": {
        "frequency": "weekly",
        "times": ["10:00"]
      }
    }
  }
]
```

## Planos Disponíveis

O sistema oferece os seguintes planos de assinatura:

### Plano Free

- 1 CNPJ
- Download automático 1x ao dia
- 7 dias de retenção de arquivos
- Download manual

### Plano Starter

- Até 3 CNPJs
- Download automático 1x ao dia
- 7 dias de retenção de arquivos
- Suporte por email
- Relatórios básicos
- Download manual

### Plano Professional

- Até 10 CNPJs
- Download automático 2x ao dia
- 30 dias de retenção de arquivos
- Suporte prioritário
- Relatórios avançados
- Download manual
- Múltiplos horários de download

### Plano Enterprise

- Até 30 CNPJs
- Download automático 4x ao dia
- 90 dias de retenção de arquivos
- Suporte dedicado
- Relatórios personalizados
- Download manual ilimitado
- Múltiplos horários de download
- Acesso a API
- White label

## Observações

- Todos os endpoints requerem autenticação via token JWT
- As configurações de usuário afetam o comportamento global do sistema para o usuário
- As configurações específicas de cada CNPJ têm precedência sobre as configurações globais do usuário
- A chave SIEG é necessária para acessar os serviços de download de documentos fiscais
