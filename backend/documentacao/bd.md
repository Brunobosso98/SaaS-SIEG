# Estrutura do Banco de Dados - SaaS-SIEG

Este documento descreve a estrutura do banco de dados necessária para o funcionamento do sistema SaaS-SIEG, incluindo tabelas, colunas e relacionamentos.

## Tabelas do Banco de Dados

### 1. Tabela `users`

Armazena informações dos usuários do sistema.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único do usuário (PK) |
| name | VARCHAR | Nome completo do usuário |
| email | VARCHAR | Email do usuário (único) |
| password | VARCHAR | Senha criptografada |
| verified | BOOLEAN | Indica se o email foi verificado |
| verification_token | VARCHAR | Token para verificação de email |
| reset_token | VARCHAR | Token para redefinição de senha |
| reset_token_expiry | TIMESTAMP | Data de expiração do token de redefinição |
| plan | ENUM | Plano de assinatura ('free', 'starter', 'professional', 'enterprise') |
| sieg_key | VARCHAR | Chave de API do SIEG |
| settings | JSONB | Configurações do usuário em formato JSON |
| created_at | TIMESTAMP | Data de criação do registro |
| updated_at | TIMESTAMP | Data da última atualização |

### 2. Tabela `cnpjs`

Armazena os CNPJs cadastrados pelos usuários.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único do CNPJ (PK) |
| cnpj | VARCHAR(14) | Número do CNPJ |
| razao_social | VARCHAR | Razão social da empresa |
| nome_fantasia | VARCHAR | Nome fantasia da empresa |
| active | BOOLEAN | Indica se o CNPJ está ativo |
| download_config | JSONB | Configurações de download em formato JSON |
| user_id | UUID | ID do usuário proprietário (FK) |
| created_at | TIMESTAMP | Data de criação do registro |
| updated_at | TIMESTAMP | Data da última atualização |

### 3. Tabela `xmls`

Armazena informações sobre os documentos XML baixados.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Identificador único do XML (PK) |
| file_name | VARCHAR | Nome do arquivo XML |
| file_path | VARCHAR | Caminho do arquivo no sistema |
| file_size | INTEGER | Tamanho do arquivo em bytes |
| document_type | VARCHAR | Tipo de documento (nfe, nfce, cte, etc.) |
| document_number | VARCHAR | Número do documento fiscal |
| document_date | TIMESTAMP | Data de emissão do documento |
| download_date | TIMESTAMP | Data do download |
| status | ENUM | Status do download ('success', 'failed', 'processing') |
| error_message | TEXT | Mensagem de erro (se houver) |
| download_type | ENUM | Tipo de download ('automatic', 'manual') |
| cnpj_id | UUID | ID do CNPJ relacionado (FK) |
| user_id | UUID | ID do usuário proprietário (FK) |
| expiry_date | TIMESTAMP | Data de expiração do arquivo |
| metadata | JSONB | Metadados adicionais em formato JSON |
| created_at | TIMESTAMP | Data de criação do registro |
| updated_at | TIMESTAMP | Data da última atualização |

## Relacionamentos

1. Um usuário pode ter vários CNPJs (1:N)
   - `users.id` → `cnpjs.user_id`

2. Um usuário pode ter vários XMLs (1:N)
   - `users.id` → `xmls.user_id`

3. Um CNPJ pode ter vários XMLs (1:N)
   - `cnpjs.id` → `xmls.cnpj_id`

## Índices Recomendados

Para melhorar a performance do banco de dados:

1. Índice único em `users.email`
2. Índice composto único em `cnpjs.cnpj` e `cnpjs.user_id`
3. Índice em `xmls.cnpj_id`
4. Índice em `xmls.user_id`
5. Índice em `xmls.document_type`
6. Índice em `xmls.document_date`

## Tutorial de Criação do Banco de Dados

### Passo 1: Criar o Banco de Dados

```sql
CREATE DATABASE xmlfiscal;
```

### Passo 2: Conectar ao Banco de Dados

```sql
\c xmlfiscal
```

### Passo 3: Criar Tipos ENUM

```sql
CREATE TYPE user_plan AS ENUM ('free', 'starter', 'professional', 'enterprise');
CREATE TYPE xml_status AS ENUM ('success', 'failed', 'processing');
CREATE TYPE download_type AS ENUM ('automatic', 'manual');
```

### Passo 4: Criar Tabela de Usuários

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMP,
  plan user_plan DEFAULT 'free',
  sieg_key VARCHAR(255),
  settings JSONB DEFAULT '{
    "documentTypes": [],
    "downloadConfig": {
      "directory": "downloads",
      "retention": 7
    },
    "notifications": {
      "email": true,
      "downloadComplete": true,
      "downloadFailed": true
    }
  }',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Passo 5: Criar Tabela de CNPJs

```sql
CREATE TABLE cnpjs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj VARCHAR(14) NOT NULL,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  download_config JSONB DEFAULT '{
    "documentTypes": ["nfe"],
    "directory": null,
    "schedule": {
      "frequency": "daily",
      "times": ["08:00"]
    }
  }',
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cnpj, user_id)
);
```

### Passo 6: Criar Tabela de XMLs

```sql
CREATE TABLE xmls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  document_type VARCHAR(10) NOT NULL,
  document_number VARCHAR(50),
  document_date TIMESTAMP,
  download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status xml_status DEFAULT 'success',
  error_message TEXT,
  download_type download_type DEFAULT 'automatic',
  cnpj_id UUID NOT NULL REFERENCES cnpjs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expiry_date TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Passo 7: Criar Índices

```sql
CREATE INDEX idx_xmls_cnpj_id ON xmls(cnpj_id);
CREATE INDEX idx_xmls_user_id ON xmls(user_id);
CREATE INDEX idx_xmls_document_type ON xmls(document_type);
CREATE INDEX idx_xmls_document_date ON xmls(document_date);
```

### Passo 8: Criar Função para Atualização Automática de updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';
```

### Passo 9: Criar Triggers para Atualização Automática

```sql
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cnpjs_updated_at BEFORE UPDATE ON cnpjs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_xmls_updated_at BEFORE UPDATE ON xmls
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Passo 10: Verificar a Estrutura Criada

```sql
\dt
\d users
\d cnpjs
\d xmls
```

## Observações

1. Este esquema utiliza PostgreSQL com suporte a UUID e JSONB.
2. As colunas de configuração (settings, download_config, metadata) utilizam JSONB para armazenar dados estruturados de forma flexível.
3. Os relacionamentos são implementados com chaves estrangeiras e restrições de exclusão em cascata.
4. Os triggers garantem que o campo updated_at seja atualizado automaticamente.
5. O script de inicialização do banco de dados (init-db.ts) já implementa esta estrutura usando Sequelize.