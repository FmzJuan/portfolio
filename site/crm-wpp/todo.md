# CRM WhatsApp - TODO

## Base de Dados
- [x] Definir esquema PostgreSQL com Drizzle (contatos, mensagens, funil, usuarios, roles)
- [x] Configurar migracao do banco de dados
- [ ] Criar seeds iniciais (usuarios admin, etapas do funil)

## API tRPC
- [x] Endpoints para CRUD de contatos
- [x] Endpoints para salvar e listar mensagens
- [x] Endpoints para mover clientes entre etapas do funil
- [x] Endpoints para autenticacao e autorizacao de administradores
- [x] Endpoints para webhook do bot de WhatsApp
- [x] Testes vitest para endpoints criticos

## Dashboard Administrativo
- [x] Layout principal com sidebar de navegacao (DashboardLayout)
- [x] Dashboard com metricas (novos leads por dia, taxa de conversao)
- [x] Visualizacao Kanban do funil de vendas
- [ ] Lista de contatos com filtros e busca
- [ ] Historico de conversas por contato

## Chat em Tempo Real
- [x] Interface de chat para administradores (ChatModal)
- [x] Capacidade de pausar/retomar bot
- [ ] Envio de mensagens diretas ao cliente via WhatsApp (integracao bot)
- [ ] Notificacoes de novas mensagens

## Controle de Acesso
- [x] Sistema de roles (admin, vendedor)
- [x] Permissoes diferenciadas por role
- [x] Restricao de visualizacao de leads por vendedor
- [ ] Auditoria de acoes de administradores

## Integracao com Bot WhatsApp
- [x] Endpoint webhook para receber mensagens do bot
- [x] Identificacao/criacao automatica de contatos
- [x] Salvamento de mensagens no banco de dados
- [x] Documentacao de integracao

## Testes e Qualidade
- [x] Testes vitest para endpoints criticos
- [x] Testes de autenticacao e autorizacao
- [x] Testes de integracao com webhook

## Documentacao
- [ ] README com instrucoes de setup
- [x] Guia de integracao com bot de WhatsApp
- [ ] Documentacao da API
