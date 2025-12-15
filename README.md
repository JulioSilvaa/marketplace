# 🏡 Lazer - Marketplace de Espaços para Eventos

> Plataforma completa para aluguel de espaços de lazer e eventos, conectando proprietários e clientes de forma simples e segura.

## 🚀 O que é este projeto?

**Lazer** é um marketplace que resolve o problema de encontrar e alugar espaços para eventos, festas e lazer. Proprietários cadastram seus espaços (chácaras, salões, sítios) na plataforma, e clientes podem pesquisar, visualizar detalhes e entrar em contato diretamente **sem necessidade de cadastro**.

**Fluxo Principal:**

1. **Proprietário** realiza cadastro e login na plataforma
2. **Proprietário** cadastra seu espaço com fotos, descrição, comodidades e preços
3. **Cliente** busca espaços disponíveis (sem necessidade de login)
4. **Cliente** visualiza detalhes, fotos e informações de contato
5. Sistema gerencia **assinaturas** para proprietários premium com destaque

---

## 🛠️ Tecnologias Utilizadas

### Backend

- **Node.js 20.11** + **TypeScript 5.9** - Runtime e tipagem estática
- **Express.js** - Framework web minimalista e robusto
- **Prisma 7.1** - ORM moderno com type-safety
- **PostgreSQL 16** - Banco de dados relacional
- **bcryptjs** - Hash seguro de senhas

### Arquitetura & Qualidade

- **Clean Architecture** - Separação em camadas (Core, Infra, HTTP)
- **Domain-Driven Design** - Entidades ricas com validações
- **Vitest** - Framework de testes com coverage
- **ESLint + Prettier** - Padronização de código
- **Husky + Commitlint** - Git hooks e commits convencionais

### Infraestrutura

- **Docker + Docker Compose** - Containerização multi-ambiente
- **Multi-stage Build** - Imagens otimizadas para produção
- **Health Checks** - Monitoramento de saúde dos serviços
- **Resource Limits** - Controle de CPU e memória

---

## 📋 Como Funciona

### Fluxo do Usuário

1. **Cadastro e Autenticação** (Apenas Proprietários)
   - Proprietário se registra na plataforma
   - Senha é criptografada com bcrypt
   - Validações rigorosas de email, telefone e dados pessoais
   - Login seguro para gerenciar seus espaços

2. **Gerenciamento de Espaços** (Proprietário)
   - Cadastra espaço com título, descrição e endereço completo
   - Define capacidade, preços (diária/fim de semana) e comodidades
   - Upload de múltiplas imagens
   - Controle de status (ativo/inativo)
   - Informações de contato para reservas

3. **Busca e Descoberta** (Cliente - Sem Login)
   - Acessa a plataforma sem necessidade de cadastro
   - Pesquisa por localização, capacidade ou características
   - Visualiza galeria de fotos e detalhes completos
   - Compara preços e comodidades
   - Acessa informações de contato do proprietário
   - Realiza reserva diretamente com o proprietário

4. **Sistema de Assinaturas** (Proprietários)
   - Planos para proprietários destacarem seus espaços
   - Maior visibilidade nos resultados de busca
   - Controle de trial, billing e status de pagamento

---

## 🎯 Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER (Port ${PORT})                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Routes     │─▶│ Controllers  │─▶│   Adapters   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CORE LAYER (Business)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Use Cases   │◀─│   Entities   │─▶│ Repositories │          │
│  │  (CRUD)      │  │  (Validation)│  │ (Interfaces) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Prisma     │─▶│  PostgreSQL  │  │   Services   │          │
│  │   Client     │  │   Database   │  │ (Hash, UUID) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🐳 Executando com Docker

### Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+

### Configuração Inicial

1. **Clone o repositório**

```bash
git clone <seu-repositorio>
cd lazer
```

2. **Configure as variáveis de ambiente**

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Database
POSTGRES_USER=lazer_user
POSTGRES_PASSWORD=sua_senha_forte_aqui
POSTGRES_DB=lazer
DATABASE_URL=postgresql://lazer_user:sua_senha_forte_aqui@postgres:5432/lazer?schema=public

# Server
PORT=3000
NODE_ENV=development

# JWT Secrets (IMPORTANTE: Use valores diferentes e seguros em produção)
JWT_ACCESS_SECRET=seu_secret_de_access_token_aqui_mude_em_producao
JWT_REFRESH_SECRET=seu_secret_de_refresh_token_aqui_mude_em_producao

# Bcrypt
BCRYPT_SALT=10

# Resend Email Service (Opcional - para envio de emails de reset de senha)
RESEND_API_KEY=re_sua_api_key_aqui
FRONTEND_URL=http://localhost:3000
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=Lazer
```

#### 📧 Configuração do Resend (Opcional)

O sistema de reset de senha está **totalmente funcional sem email**. Em modo development/test, o token é retornado diretamente na resposta da API.

**Para habilitar envio de emails:**

1.  **Criar conta no Resend** (gratuito)
    - Acesse [resend.com](https://resend.com)
    - Crie sua conta
    - 100 emails/dia grátis

2.  **Obter API Key**
    - Dashboard → API Keys → Create API Key
    - Copie a key (começa com `re_`)

3.  **Configurar no `.env`**

    ```env
    RESEND_API_KEY=re_sua_key_aqui
    FRONTEND_URL=http://localhost:3000  # URL do seu frontend
    EMAIL_FROM=onboarding@resend.dev    # Email de teste (sem domínio)
    EMAIL_FROM_NAME=Lazer
    ```

4.  **Reiniciar container**
    ```bash
    docker compose restart app-dev
    ```

**Sem domínio verificado:**

- Use `EMAIL_FROM=onboarding@resend.dev` (email de teste do Resend)
- Emails podem cair em spam
- Gmail geralmente aceita melhor que Yahoo/Outlook

**Com domínio próprio (produção):**

- Configure domínio no dashboard do Resend
- Adicione registros DNS (SPF, DKIM, DMARC)
- Use `EMAIL_FROM=noreply@seudominio.com`
- Emails chegam direto na caixa de entrada

**⚠️ IMPORTANTE:**

- Nunca commite o arquivo `.env` no Git
- Use secrets fortes e únicos em produção
- Gere secrets com: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 🔧 Modo Desenvolvimento

**Características:**

- ✅ Hot Reload automático (mudanças refletem instantaneamente)
- ✅ Bind mounts em `src/` e `public/`
- ✅ NODE_ENV=development
- ✅ Logs detalhados para debugging
- ✅ Sem necessidade de rebuild

**Comandos:**

```bash
docker compose --profile dev up -d

docker compose logs -f app-dev

docker compose --profile dev down
```

Acesse: **http://localhost:${PORT}** (porta configurada no `.env`)

### 🚀 Modo Produção

**Características:**

- ✅ Multi-stage build otimizado (imagem ~150MB)
- ✅ Código compilado e minificado
- ✅ NODE_ENV=production
- ✅ Restart automático (always)
- ✅ Usuário não-root (segurança)
- ✅ Health checks configurados
- ✅ Código encapsulado na imagem (sem volumes)

**Comandos:**

```bash
docker compose --profile prod build --no-cache

docker compose --profile prod up -d

docker compose logs -f app-prod

docker compose --profile prod down
```

### 📊 Comparação Dev vs Prod

| Característica    | Desenvolvimento  | Produção            |
| ----------------- | ---------------- | ------------------- |
| Hot Reload        | ✅ Sim           | ❌ Não              |
| Bind Mounts       | ✅ src/, public/ | ❌ Não              |
| Tamanho da Imagem | ~800MB           | ~150MB              |
| Build Necessário  | ❌ Não           | ✅ Sim              |
| Restart Policy    | Não              | always              |
| Segurança         | Básica           | Avançada (non-root) |
| Performance       | Moderada         | Otimizada           |

### 🔍 Comandos Úteis

**Acessar o banco de dados:**

```bash
docker exec -it postgres psql -U lazer_user -d lazer
```

**Ver status dos containers:**

```bash
docker compose ps
```

**Rebuild completo (produção):**

```bash
docker compose --profile prod down
docker compose --profile prod build --no-cache
docker compose --profile prod up -d
```

**Limpar volumes (⚠️ apaga dados):**

```bash
docker compose down -v
```

**Testar health check:**

```bash
curl http://localhost:${PORT}/health
```

---

## 📱 Funcionalidades

### 🔐 Segurança

- ✅ **Autenticação JWT** com Access e Refresh Tokens
- ✅ **Hash de senhas** com bcryptjs (salt rounds: 10)
- ✅ **Rate Limiting** em endpoints críticos
  - Login: 5 tentativas / 15 minutos
  - Registro: 3 tentativas / 15 minutos
  - Refresh: 10 tentativas / 15 minutos
  - Forgot Password: 3 tentativas / 15 minutos
  - Reset de senha: 3 tentativas / 15 minutos
- ✅ **Cookies HttpOnly** para Refresh Tokens
- ✅ **Reset de senha seguro** com tokens de expiração (1 hora)
- ✅ **Validação rigorosa** de inputs (email, telefone, CPF)
- ✅ **Proteção contra SQL Injection** (Prisma ORM)
- ✅ **CORS configurado**
- ✅ **Containers com usuário não-root**
- ✅ **Prevenção de reuso de tokens** de reset
- ✅ **Não revelação de informações** (emails existentes)

### 🔑 Autenticação e Autorização

- ✅ **Sistema JWT completo**
  - Access Token (curta duração)
  - Refresh Token (7 dias, HttpOnly cookie)
- ✅ **Registro e Login**
  - Validação de email único
  - Hash bcrypt com salt
  - Login automático após registro
- ✅ **Reset de Senha**
  - Solicitação via email
  - Token seguro de 1 hora
  - Validação de força de senha
  - Prevenção de reuso de tokens
- ✅ **Proteção de Rotas**
  - Middleware de autenticação
  - Validação de tokens
  - Refresh automático
- ✅ **Rate Limiting**
  - Proteção contra brute force
  - Limites por endpoint
  - Headers informativos

### 👥 Gestão de Usuários (Proprietários)

- ✅ Cadastro exclusivo para proprietários de espaços
- ✅ Validação de email único
- ✅ Autenticação segura com senha criptografada
- ✅ Status de conta (Ativo / Inativo)
- ✅ Verificação de conta (campo `checked`)
- ✅ CRUD completo de usuários proprietários

### 🏠 Gestão de Espaços

- ✅ Cadastro com endereço completo (CEP, rua, número, bairro, cidade, estado)
- ✅ Capacidade configurável (1-1000 pessoas)
- ✅ Preços flexíveis (diária e/ou fim de semana)
- ✅ Lista de comodidades (piscina, churrasqueira, etc.)
- ✅ Galeria de imagens (URLs validadas)
- ✅ Controle de status (disponível/indisponível)

### 💳 Sistema de Assinaturas

- ✅ Planos para proprietários
- ✅ Período de trial configurável
- ✅ Controle de próxima cobrança
- ✅ Status de assinatura (ativa/cancelada/vencida)

### 🧪 Qualidade de Código

- ✅ Testes unitários com Vitest
- ✅ Coverage de código
- ✅ Lint automático (ESLint + Prettier)
- ✅ Git hooks com Husky
- ✅ Commits convencionais (Commitlint)

---

## 🔄 Fluxo de Dados

### Exemplo: Criação de Espaço

**1. Cliente envia requisição:**

```http
POST /api/spaces
Content-Type: application/json

{
  "owner_id": "uuid-do-proprietario",
  "title": "Chácara Vista Alegre",
  "description": "Linda chácara com piscina, churrasqueira e área verde de 2000m²",
  "capacity": 50,
  "price_per_day": 800.00,
  "price_per_weekend": 1500.00,
  "comfort": ["Piscina", "Churrasqueira", "Salão de Festas", "Estacionamento"],
  "images": [
    "https://example.com/foto1.jpg",
    "https://example.com/foto2.jpg"
  ],
  "address": {
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Portão Azul",
    "neighborhood": "Jardim Primavera",
    "city": "Campinas",
    "state": "SP",
    "zipcode": "13040-123",
    "country": "Brasil"
  }
}
```

**2. Fluxo interno:**

```
Controller → Adapter → Use Case → Entity (validação) → Repository → Prisma → PostgreSQL
```

**3. Validações automáticas:**

- ✅ Título entre 6-100 caracteres
- ✅ Descrição entre 20-1000 caracteres
- ✅ Capacidade entre 1-1000
- ✅ Pelo menos 1 preço definido
- ✅ CEP no formato válido
- ✅ URLs de imagens válidas
- ✅ Pelo menos 1 comodidade

**4. Resposta de sucesso:**

```json
{
  "id": "uuid-gerado",
  "owner_id": "uuid-do-proprietario",
  "title": "Chácara Vista Alegre",
  "status": 1,
  "created_at": "2025-12-13T12:00:00Z"
}
```

---

## 🔌 Endpoints da API

### Health Check

```http
GET /health
```

Retorna status da aplicação (usado pelo Docker healthcheck)

### 🔐 Autenticação

> [!NOTE]
> **Base URL de Autenticação**: `/auth` (não `/api/auth`)
>
> **Porta**: Configurável via variável `PORT` no `.env` (padrão: 3000)

#### Registro

```http
POST /auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "phone": "11999999999"
}
```

**Resposta (201):**

```json
{
  "message": "Usuário criado com sucesso",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com"
  }
}
```

**Rate Limit:** 3 tentativas/15 minutos

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Resposta (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com"
  }
}
```

**Rate Limit:** 5 tentativas/15min

**Nota:** Refresh Token é enviado via cookie HttpOnly

#### Refresh Token

```http
POST /api/auth/refresh
Cookie: refreshToken=...
```

**Resposta (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Rate Limit:** 10 tentativas/15 minutos

**Nota:** O refresh token é lido automaticamente do cookie HttpOnly. Não é necessário enviar no body ou header.

#### Logout

```http
POST /auth/logout
```

**Resposta (200):**

```json
{
  "message": "Logout realizado com sucesso"
}
```

#### Esqueci Minha Senha

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "joao@example.com"
}
```

**Resposta (200):**

```json
{
  "message": "Se o email existir, você receberá instruções para redefinir sua senha"
}
```

**Rate Limit:** 3 tentativas/15 minutos

**Segurança:** Não revela se o email existe no sistema

#### Resetar Senha

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "token-recebido-por-email",
  "newPassword": "novaSenha123"
}
```

**Resposta (200):**

```json
{
  "message": "Senha redefinida com sucesso"
}
```

**Rate Limit:** 3 tentativas/15 minutos

**Validações:**

- Token válido e não expirado (1 hora)
- Senha mínima de 6 caracteres
- Token não pode ser reutilizado

### 👥 Usuários

> [!IMPORTANT]
> **Rotas Públicas vs Protegidas**
>
> - **Rotas Públicas** (sem autenticação): Visitantes podem listar e buscar usuários
> - **Rotas Protegidas** (requerem autenticação): Criar, atualizar e deletar usuários

```http
# Rotas Públicas (sem token)
GET    /api/user              # Lista todos os usuários
GET    /api/user/search       # Busca usuários (query params)
GET    /api/user/:id          # Busca por ID

# Rotas Protegidas (requerem Authorization: Bearer {token})
POST   /api/user              # Cria novo usuário
PATCH  /api/user/:id          # Atualiza usuário
DELETE /api/user/:id          # Remove usuário
```

### 🏠 Espaços

> [!IMPORTANT]
> **Rotas Públicas vs Protegidas**
>
> - **Rotas Públicas** (sem autenticação): Visitantes podem explorar espaços disponíveis
> - **Rotas Protegidas** (requerem autenticação): Apenas proprietários podem criar/editar/deletar

```http
# Rotas Públicas (sem token)
GET    /api/spaces            # Lista espaços (paginado)
GET    /api/spaces/all        # Lista todos os espaços
GET    /api/spaces/:id        # Detalhes do espaço

# Rotas Protegidas (requerem Authorization: Bearer {token})
POST   /api/spaces            # Cadastra espaço
PATCH  /api/spaces/:id        # Atualiza espaço
DELETE /api/spaces/:id        # Remove espaço
```

### 💳 Assinaturas

> [!WARNING]
> **Todas as rotas protegidas** - Futura implementação de controle SUPER_ADMIN

```http
# Todas requerem Authorization: Bearer {token}
GET    /api/subscription                # Lista assinaturas
GET    /api/subscription/user/:userId   # Assinatura do usuário
POST   /api/subscription                # Cria assinatura
PATCH  /api/subscription/:id            # Atualiza assinatura
```

---

## 📦 Estrutura do Projeto

```
lazer/
├── src/
│   ├── core/                      # Camada de Negócio (Domain)
│   │   ├── entities/              # Entidades com validações
│   │   │   ├── UserEntity.ts
│   │   │   ├── SpaceEntity.ts
│   │   │   └── SubscriptionEntity.ts
│   │   ├── repositories/          # Interfaces dos repositórios
│   │   ├── services/              # Interfaces de serviços
│   │   ├── useCases/              # Casos de uso (CRUD)
│   │   │   ├── users/
│   │   │   ├── spaces/
│   │   │   └── subscriptions/
│   │   └── dtos/                  # Data Transfer Objects
│   │
│   ├── infra/                     # Camada de Infraestrutura
│   │   ├── adapters/              # Adaptadores (Express, etc)
│   │   ├── repositories/          # Implementações Prisma
│   │   ├── services/              # Implementações (Hash, UUID)
│   │   ├── factories/             # Factories de injeção
│   │   └── http/                  # Camada HTTP
│   │       ├── express/
│   │       ├── routes/
│   │       └── controllers/
│   │
│   ├── types/                     # TypeScript types/interfaces
│   ├── tests/                     # Testes unitários
│   └── index.ts                   # Entry point
│
├── prisma/
│   └── schema.prisma              # Schema do banco de dados
│
├── docker-compose.yml             # Orquestração com profiles
├── Dockerfile                     # Multi-stage build
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 🌟 Diferenciais

### Arquitetura Limpa

- **Independência de frameworks**: Core não depende de Express ou Prisma
- **Testabilidade**: Lógica de negócio isolada e testável
- **Manutenibilidade**: Separação clara de responsabilidades

### Validações Robustas

- Entidades com validações no domínio
- Mensagens de erro descritivas
- Prevenção de dados inválidos no banco

### DevOps Moderno

- Docker multi-ambiente (dev/prod)
- Multi-stage build (imagens 80% menores)
- Health checks e resource limits
- CI/CD ready (Husky + Commitlint)

### Type Safety

- TypeScript em 100% do código
- Prisma com tipos gerados automaticamente
- Interfaces bem definidas

---

## 🧪 Testes

### Executar testes

```bash
yarn test:dev

yarn test:coverage

yarn test:ui
```

### Cobertura

Os testes cobrem:

- ✅ Validações de entidades
- ✅ Casos de uso (Use Cases)
- ✅ Repositórios

---

## 🚧 Roadmap

### ✅ Concluído

- [x] Autenticação JWT completa
- [x] Sistema de refresh tokens
- [x] Reset de senha seguro
- [x] Rate limiting
- [x] Testes automatizados (184 testes)

### 🚀 Em Desenvolvimento

- [ ] Serviço de envio de emails (SMTP)
- [ ] Sistema de reservas/agendamento
- [ ] Upload de imagens (S3/Cloudinary)

### 📋 Planejado

- [ ] Painel administrativo
- [ ] API de pagamentos (Stripe/Mercado Pago)
- [ ] Sistema de avaliações
- [ ] Busca geolocalizada
- [ ] Notificações push
- [ ] Chat entre proprietário e cliente

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: add amazing feature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrão de Commits

Seguimos o [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `refactor:` Refatoração de código
- `test:` Testes
- `chore:` Tarefas de build/config

---

## 🤝 Contribuindo

### Workflow de Desenvolvimento

1. **Crie uma branch** a partir de `main`

   ```bash
   git checkout -b feat/sua-feature
   ```

2. **Desenvolva e teste** localmente

   ```bash
   yarn test:dev
   yarn lint
   ```

3. **Commit** seguindo Conventional Commits

   ```bash
   git commit -m "feat: adicionar nova funcionalidade"
   ```

4. **Push** para o repositório

   ```bash
   git push origin feat/sua-feature
   ```

5. **Abra um Pull Request** para `main`

### Proteção da Branch Main

A branch `main` está protegida com as seguintes regras:

- ✅ **Pull Request obrigatório** - Não é possível commit direto
- ✅ **1 aprovação necessária** - PR precisa ser aprovado
- ✅ **CI deve passar** - Todos os testes devem passar
- ✅ **Conversas resolvidas** - Comentários devem ser resolvidos
- ✅ **Branch atualizada** - Deve estar sincronizada com main

**CI Pipeline:**

- Testes em Node.js 20.x, 22.x e 25.x
- Linting com ESLint
- Coverage de testes
- Validação do Prisma

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👨‍💻 Autor

Desenvolvido com ❤️ por **Julio Silva**

---

## 📞 Suporte

- 📧 Email: suporte@lazer.com.br
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/lazer/issues)
- 📖 Docs: [Documentação Completa](./docs)

---

**⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!**
