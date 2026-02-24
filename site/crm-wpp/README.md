# CRM WhatsApp - Sistema de Gestão de Vendas

Um sistema CRM completo integrado com bot de WhatsApp para gerenciar leads, conversas automatizadas e pipeline de vendas em tempo real.

## Características

**Dashboard Administrativo**
- Visualização em tempo real de métricas de vendas (novos leads, taxa de conversão)
- Quadro Kanban interativo com etapas do funil (Lead → Negociação → Fechado)
- Chat integrado para administradores intervirem manualmente nas conversas

**Gestão de Contatos**
- Criação automática de perfis de clientes a partir de mensagens do WhatsApp
- Atribuição de contatos a vendedores específicos
- Tags e categorização de leads
- Histórico completo de conversas por contato

**Controle de Acesso**
- Roles diferenciados (Admin, Vendedor)
- Vendedores veem apenas seus próprios contatos
- Admins têm visibilidade total do sistema
- Permissões granulares por operação

**Integração com Bot WhatsApp**
- Webhook para receber mensagens do Baileys
- Salvamento automático de mensagens no banco de dados
- Capacidade de pausar/retomar bot por contato
- Respostas manuais do admin via WhatsApp

## Stack Técnico

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | React 19 + Tailwind CSS 4 |
| Backend | Node.js + Express + tRPC |
| Banco de Dados | PostgreSQL + Drizzle ORM |
| Autenticação | Manus OAuth |
| Gráficos | Recharts |
| UI Components | shadcn/ui + Radix UI |
| Testes | Vitest |

## Instalação e Setup

### Pré-requisitos

- Node.js 22.13.0+
- PostgreSQL 12+
- npm ou pnpm

### Passos de Instalação

1. **Clonar o repositório**
   ```bash
   git clone <seu-repositorio>
   cd crm-whatsapp
   ```

2. **Instalar dependências**
   ```bash
   pnpm install
   ```

3. **Configurar variáveis de ambiente**
   
   O projeto usa Manus para gerenciar secrets automaticamente. As seguintes variáveis são injetadas pelo sistema:
   - `DATABASE_URL` - Conexão PostgreSQL
   - `JWT_SECRET` - Chave para sessões
   - `VITE_APP_ID` - ID da aplicação OAuth
   - `OAUTH_SERVER_URL` - URL do servidor OAuth

4. **Executar migrações do banco de dados**
   ```bash
   pnpm db:push
   ```

5. **Iniciar o servidor de desenvolvimento**
   ```bash
   pnpm dev
   ```

   O servidor estará disponível em `http://localhost:3000`

## Uso

### Acessar o Dashboard

1. Abra `http://localhost:3000` no navegador
2. Faça login com sua conta Manus
3. Você será redirecionado para o dashboard

### Gerenciar Contatos

**Criar um novo contato:**
1. No painel lateral, clique em "Novo Contato"
2. Preencha nome, telefone e e-mail
3. Clique em "Salvar"

**Mover contato entre etapas:**
1. No quadro Kanban, clique no contato
2. Arraste para a coluna desejada (Lead → Negociação → Fechado)

**Responder cliente:**
1. Clique no botão "Chat" no cartão do contato
2. Digite sua mensagem
3. Clique em "Enviar"

### Pausar/Retomar Bot

Quando você toma controle de uma conversa:
1. Abra o chat do contato
2. Clique em "Pausar Bot" para o bot parar de responder
3. Clique em "Retomar Bot" para reativar

## Integração com Bot WhatsApp

Para integrar seu bot de WhatsApp (Baileys) com este CRM, consulte o arquivo `WEBHOOK_INTEGRATION.md` para instruções detalhadas.

### Resumo Rápido

O webhook recebe mensagens em:
```
POST /api/trpc/webhook.receiveMessage
```

Payload:
```json
{
  "phone": "5511999999999",
  "message": "Olá, gostaria de saber mais",
  "senderName": "João Silva",
  "senderEmail": "joao@example.com"
}
```

## API tRPC

A API segue o padrão tRPC com endpoints organizados por domínio:

### Contatos
- `contacts.list` - Listar contatos (vendedores veem apenas seus)
- `contacts.getById` - Obter detalhes de um contato
- `contacts.create` - Criar novo contato
- `contacts.updateStage` - Mover para outra etapa
- `contacts.update` - Atualizar informações

### Mensagens
- `messages.getByContact` - Histórico de mensagens
- `messages.send` - Enviar mensagem do admin
- `messages.markAsRead` - Marcar como lida

### Controle do Bot
- `bot.pause` - Pausar bot para um contato
- `bot.resume` - Retomar bot para um contato

### Dashboard
- `dashboard.getMetrics` - Obter métricas de vendas

### Webhook
- `webhook.receiveMessage` - Receber mensagem do bot

## Testes

Executar todos os testes:
```bash
pnpm test
```

Testes incluem:
- CRUD de contatos com controle de acesso
- Envio e recuperação de mensagens
- Controle do bot (pausar/retomar)
- Webhook de recebimento de mensagens
- Métricas do dashboard

## Estrutura do Projeto

```
crm-whatsapp/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas (Dashboard, etc)
│   │   ├── components/    # Componentes (KanbanBoard, ChatModal)
│   │   └── lib/           # Utilitários (tRPC client)
│   └── public/            # Arquivos estáticos
├── server/                 # Backend Node.js
│   ├── routers.ts         # Endpoints tRPC
│   ├── db.ts              # Funções de banco de dados
│   └── _core/             # Infraestrutura (auth, context)
├── drizzle/               # Schema e migrações do banco
└── shared/                # Código compartilhado
```

## Controle de Acesso (RBAC)

O sistema implementa controle de acesso baseado em roles:

| Operação | Admin | Vendedor |
|----------|-------|----------|
| Ver todos os contatos | ✅ | ❌ (apenas seus) |
| Criar contato | ✅ | ✅ |
| Editar contato | ✅ | ✅ (apenas seus) |
| Enviar mensagem | ✅ | ✅ (apenas seus) |
| Pausar bot | ✅ | ✅ (apenas seus) |
| Ver métricas globais | ✅ | ❌ (apenas suas) |

## Próximos Passos

Funcionalidades planejadas para futuras versões:

1. **Notificações em Tempo Real** - WebSocket para atualizações live
2. **Auditoria de Ações** - Log de todas as operações dos admins
3. **Automações** - Regras para mover contatos automaticamente
4. **Relatórios Avançados** - Análise de performance por período
5. **Integração com CRM Externo** - Sync com Pipedrive, HubSpot
6. **Mobile App** - Aplicativo mobile para gerenciar leads
7. **IA para Respostas** - Sugestões automáticas de respostas

## Troubleshooting

**Erro: "Database not available"**
- Verifique se a variável `DATABASE_URL` está configurada
- Certifique-se de que o PostgreSQL está rodando
- Execute `pnpm db:push` para criar as tabelas

**Erro: "Acesso negado"**
- Vendedores só podem acessar seus próprios contatos
- Verifique se o contato está atribuído ao seu usuário

**Webhook não recebe mensagens**
- Verifique se a URL do webhook está correta
- Certifique-se de que o servidor está rodando
- Verifique os logs do servidor para erros

## Contribuindo

Para contribuir com melhorias:

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## Licença

MIT License - veja LICENSE para detalhes

## Suporte

Para suporte, abra uma issue no repositório ou entre em contato através do email de suporte.

---

**Desenvolvido com ❤️ usando Manus**
