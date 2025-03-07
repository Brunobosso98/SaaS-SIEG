# API de Autenticação de Usuários - Documentação
Este documento descreve os endpoints disponíveis para gerenciamento de usuários no sistema SaaS-SIEG.

## Autenticação e Gerenciamento de Usuários
### Registro de Usuário
MÉTODO: POST 
URL: http://localhost:5000/api/auth/register 
BODY (json): 
{
  "name": "Nome Completo",
  "email": "usuario@exemplo.com",
  "password": "senhaSegura123",
  "confirmPassword": "senhaSegura123"
}

RESPOSTA:
{
  "message": "User registered successfully. Please verify your email.",
  "userId": "uuid-do-usuario"
}

### Login
MÉTODO: POST 
URL: http://localhost:5000/api/auth/login 
BODY (json):
{
  "email": "usuario@exemplo.com",
  "password": "senhaSegura123"
}

RESPOSTA:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-do-usuario",
    "name": "Nome Completo",
    "email": "usuario@exemplo.com",
    "plan": "free"
  }
}

### Informações do Usuário
MÉTODO: GET
URL: URL: http://localhost:5000/api/users/profile
AUTHORIZATION: Bearer Token do usuário

### Esqueci a Senha
MÉTODO: POST 
URL: http://localhost:5000/api/auth/forgot-password 
BODY (json):
{
  "email": "usuario@exemplo.com"
}

RESPOSTA:
{
  "message": "Password reset instructions sent to your email"
}

### Redefinir Senha
MÉTODO: POST 
URL: http://localhost:5000/api/auth/reset-password 
BODY (json):
{
  "token": "token-recebido-por-email",
  "password": "novaSenha123",
  "confirmPassword": "novaSenha123"
}

RESPOSTA:
{
  "message": "Password reset successful"
}

### Verificar Email
MÉTODO: POST 
URL: http://localhost:5000/api/auth/verify-email 
BODY (json):
{
  "token": "token-de-verificacao-recebido-por-email"
}

RESPOSTA:
{
  "message": "Email verified successfully"
}

### Atualizar Plano do Usuário
MÉTODO: PUT
URL: http://localhost:5000/api/users/subscription
AUTHORIZATION: Bearer Token do usuário
BODY (json):
{
  "plan": "professional"
}

RESPOSTA:
{
  "message": "Plan updated successfully",
  "plan": "professional"
}

## Observações
- Todos os endpoints retornam códigos HTTP apropriados (200 para sucesso, 400 para erros de validação, 401 para erros de autenticação, etc.)
- O token JWT recebido após o login deve ser incluído no cabeçalho de autorização para endpoints protegidos: Authorization: Bearer seu-token-jwt
- Os tokens para redefinição de senha e verificação de email são válidos por tempo limitado