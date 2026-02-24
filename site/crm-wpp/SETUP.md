# Guia de Setup do CRM WhatsApp para Windows

Este guia explica como configurar e iniciar o CRM WhatsApp no seu computador Windows.

## Pré-requisitos

Você precisa ter instalado:

1. **Node.js** (versão 18 ou superior)
   - Baixe em: https://nodejs.org/
   - Instale a versão LTS

2. **PostgreSQL** (versão 12 ou superior)
   - Baixe em: https://www.postgresql.org/download/windows/
   - Instale e lembre-se da senha do usuário `postgres`
   - OU use um banco em nuvem (Supabase, Railway, etc)

3. **Git** (opcional, mas recomendado)
   - Baixe em: https://git-scm.com/

4. **Visual Studio Code** (recomendado)
   - Baixe em: https://code.visualstudio.com/

---

## Passo 1: Clonar ou Baixar o Projeto

### Opção A: Com Git (Recomendado)

```bash
git clone https://github.com/seu-usuario/crm-whatsapp.git
cd crm-whatsapp
```

### Opção B: Sem Git

1. Baixe o projeto como ZIP
2. Extraia em uma pasta (ex: `C:\Users\seu-usuario\crm-whatsapp`)
3. Abra o terminal nessa pasta

---

## Passo 2: Instalar Dependências

Abra o terminal na pasta do projeto e execute:

```bash
npm install --legacy-peer-deps
```

**Nota:** O `--legacy-peer-deps` é necessário por conflitos de versão do Vite. Isso é normal e seguro.

---

## Passo 3: Configurar Banco de Dados

### Opção A: PostgreSQL Local (Recomendado para Desenvolvimento)

1. **Abra o PostgreSQL**
   - No Windows, procure por "SQL Shell (psql)" no menu Iniciar
   - Ou use pgAdmin (interface gráfica)

2. **Crie o banco de dados**
   ```sql
   CREATE DATABASE crm_whatsapp;
   ```

3. **Crie o arquivo `.env.local`**
   - Na pasta do projeto, crie um arquivo chamado `.env.local`
   - Adicione esta linha:
   ```
   DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/crm_whatsapp
   ```
   - Substitua `sua_senha` pela senha que você definiu ao instalar PostgreSQL

### Opção B: Banco em Nuvem (Mais Rápido, sem Instalar)

Se não quiser instalar PostgreSQL, use um serviço gratuito:

**Supabase (Recomendado):**
1. Vá em https://supabase.com
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a `DATABASE_URL` fornecida
5. Crie o arquivo `.env.local` e cole:
   ```
   DATABASE_URL=sua_url_do_supabase
   ```

**Railway:**
1. Vá em https://railway.app
2. Crie um novo projeto
3. Adicione PostgreSQL
4. Copie a connection string
5. Crie o arquivo `.env.local` e cole

---

## Passo 4: Criar as Tabelas do Banco

No terminal, execute:

```bash
npm run db:push
```

Isso criará todas as tabelas necessárias no banco de dados.

---

## Passo 5: Iniciar o Servidor

No terminal, execute:

```bash
npm run dev
```

Você verá uma saída como:
```
Server running on http://localhost:3000/
```

---

## Passo 6: Acessar o App

1. Abra seu navegador
2. Vá para: `http://localhost:3000`
3. Você verá o dashboard do CRM

**Nota:** Na primeira vez, você pode ver um erro de autenticação. Isso é normal em desenvolvimento. O dashboard funcionará mesmo assim.

---

## Estrutura de Pastas

Depois de instalar, você terá esta estrutura:

```
crm-whatsapp/
├── client/                    # Frontend (React)
│   └── src/
│       ├── pages/            # Páginas (Dashboard, etc)
│       ├── components/       # Componentes reutilizáveis
│       └── App.tsx           # Arquivo principal
├── server/                    # Backend (Node.js)
│   ├── routers.ts            # Endpoints da API
│   └── db.ts                 # Funções do banco
├── drizzle/                   # Banco de dados
│   └── schema.ts             # Estrutura das tabelas
├── .env.local                 # Suas configurações (criar)
├── package.json              # Dependências
└── README.md                 # Documentação
```

---

## Comandos Úteis

| Comando | O que faz |
|---------|----------|
| `npm run dev` | Inicia o servidor em desenvolvimento |
| `npm run build` | Compila para produção |
| `npm run test` | Executa os testes |
| `npm run db:push` | Atualiza o banco de dados |
| `npm run format` | Formata o código |

---

## Solução de Problemas

### Erro: "DATABASE_URL is required"

**Solução:** Verifique se o arquivo `.env.local` existe e tem a linha:
```
DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/crm_whatsapp
```

### Erro: "Cannot connect to PostgreSQL"

**Solução:** 
1. Verifique se PostgreSQL está rodando
2. Verifique se a senha está correta
3. Ou use um banco em nuvem (Supabase, Railway)

### Erro: "Port 3000 already in use"

**Solução:** Outra aplicação está usando a porta 3000. Escolha uma porta diferente:

Edite `server/_core/index.ts` e mude:
```typescript
const PORT = process.env.PORT || 3000;
```

Para:
```typescript
const PORT = process.env.PORT || 3001;
```

Depois reinicie com `npm run dev`.

### Erro: "npm: command not found"

**Solução:** Node.js não está instalado. Baixe em https://nodejs.org/

---

## Próximos Passos

Depois de iniciar o app:

1. **Explorar o Dashboard**
   - Veja as métricas de vendas
   - Clique nos contatos para abrir o chat

2. **Integrar com seu Bot de WhatsApp**
   - Leia o arquivo `WEBHOOK_INTEGRATION.md`
   - Conecte seu bot Baileys ao CRM

3. **Customizar o App**
   - Edite os arquivos em `client/src/` para mudar a interface
   - Edite `server/routers.ts` para adicionar novos endpoints

---

## Suporte

Se tiver problemas:

1. Verifique este guia novamente
2. Consulte o `README.md` para mais detalhes
3. Abra uma issue no GitHub

---

**Desenvolvido com ❤️ para gerenciar suas vendas no WhatsApp**
