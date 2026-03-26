# 💬 Chat

A pasta `Chat` contém os módulos de lógica de conversa segmentados por cliente. Cada subpasta representa um cliente/oficina integrado ao sistema, isolando completamente o fluxo de mensagens, agendamentos e integrações de cada um.

---

## 📁 Estrutura

```
Chat/
└── RissatoMotors/
    ├── api.js         → Endpoint webhook para receber dados do ERP
    ├── erpSync.js     → RPA: extrai dados do ERP via Puppeteer
    ├── fluxo.js       → Lógica de resposta às mensagens dos clientes
    ├── mensagens.js   → Banco de frases para os disparos automáticos
    ├── scheduler.js   → Agendador de mensagens via BullMQ + Redis
    └── worker.js      → Consumidor da fila: envia as mensagens agendadas
```

---

## 📄 `RissatoMotors/api.js`

Controlador HTTP que recebe dados do ERP da Rissato Motors via **webhook**.

### Funções

#### `receberDadosERP(req, res)`
Processa requisições `POST` enviadas pelo ERP quando um serviço é finalizado.

- Extrai do `body` os campos `nome`, `telefone`, `veiculo` e `data_saida`.
- Valida se `nome` e `telefone` estão presentes; retorna `400` se faltar algum.
- Chama `agendarMensagens()` do `scheduler.js` para inserir o cliente na fila de pós-venda.
- Retorna `200` com sucesso ao ERP, ou `500` em caso de erro interno.

---

## 📄 `RissatoMotors/erpSync.js`

Robot de automação (RPA) que usa **Puppeteer** para fazer login no ERP da oficina, exportar a lista de clientes em CSV e sincronizar os dados com o Google Sheets.

### Funções

#### `extrairDadosDoERP()`
Orquestra todo o fluxo de extração automatizada:

1. Abre um navegador Chromium (headless em produção, visível em desenvolvimento).
2. Configura a pasta `downloads/` para receber o arquivo CSV.
3. Acessa `https://sistema.oficinaintegrada.com.br/login.asp` e preenche os campos de credenciais do `.env`.
4. Clica em `#btnLogar` e aguarda o redirecionamento.
5. Detecta e fecha automaticamente o tutorial do sistema (se presente).
6. Navega até o menu **Clientes → Listar Clientes**.
7. Clica no botão de exportação e aguarda 15 segundos para o download concluir.
8. Chama `processarCSVBaixado()` ao final.
9. Fecha o navegador no bloco `finally`.

#### `processarCSVBaixado()`
Lê e processa o arquivo CSV mais recente da pasta `downloads/`:

1. Lista os arquivos `.csv` ou `.xls` na pasta e pega o mais recente.
2. Lê o arquivo usando `csv-parser` com separador `;`.
3. Para cada linha: salva os dados brutos em um array e usa `formatarLeadParaSheets()` para gerar o formato limpo.
4. Ao terminar a leitura, chama `salvarDadosBrutosERP()` para gravar tudo na aba `Dados_ERP` da planilha.
5. Chama `atualizarAbaClientes()` para adicionar os clientes formatados na aba `Clientes`.
6. Deleta o arquivo CSV após o processamento.

---

## 📄 `RissatoMotors/fluxo.js`

Gerencia as **respostas automáticas** do bot quando clientes respondem às mensagens de pós-venda.

### Funções

#### `executar(sock, msg)`
Avalia o texto recebido e executa a ação correspondente:

- Se o cliente digitar `1` (satisfeito): envia uma mensagem de agradecimento e registra `"Feedback Positivo"` no Google Sheets com data/hora.
- Se o cliente digitar `2` (insatisfeito): envia uma mensagem de suporte e registra `"ALERTA: Problema relatado"` no Sheets, sinalizando para a equipe humana.
- Qualquer outra mensagem é ignorada silenciosamente.

---

## 📄 `RissatoMotors/mensagens.js`

Arquivo de **configuração de conteúdo** — centraliza todas as frases usadas nos disparos automáticos.

Não contém funções. Exporta dois arrays:

- `mensagens24h` — 3 variações de mensagem para o follow-up de 24 horas após o serviço. Usam a tag `{nome}` como placeholder.
- `mensagens6meses` — 3 variações de mensagem para o lembrete de revisão após 6 meses. Também usam `{nome}`.

O `worker.js` sorteia aleatoriamente uma frase de cada array a cada disparo.

---

## 📄 `RissatoMotors/scheduler.js`

Responsável por **agendar os jobs** de pós-venda na fila do Redis usando **BullMQ**.

### Configuração
Cria uma conexão com o Redis via `ioredis` usando `REDIS_HOST` e `REDIS_PORT` do `.env`. Cria a fila `pos-venda-rissato`.

### Funções

#### `agendarMensagens(cliente)`
Insere dois jobs na fila para cada cliente processado:

- **Job `feedback_24h`**: agendado com delay de 24 horas (86.400.000 ms). Pode ser sobrescrito pela variável `DELAY_24H` no `.env` para facilitar testes.
- **Job `revisao_6meses`**: agendado com delay de 180 dias (15.552.000.000 ms). Pode ser sobrescrito por `DELAY_6MESES`.
- Ambos usam `jobId` único no formato `tipo-telefone-dataSaida` para evitar duplicatas.

Exporta também a instância `posVendaQueue` para que outros módulos possam interagir com a fila.

---

## 📄 `RissatoMotors/worker.js`

Consumidor da fila BullMQ — **executa os jobs** de envio quando o tempo de delay expira.

### Funções

#### `enviarMensagemHumana(sock, jid, texto)`
Envia mensagens de forma humanizada para evitar banimento pelo WhatsApp:

1. Emite o evento `composing` ("digitando...") para o contato via `sock.sendPresenceUpdate`.
2. Aguarda um tempo **aleatório entre 10 e 20 segundos** simulando digitação real.
3. Envia a mensagem de texto via `sock.sendMessage`.
4. Emite `paused` para parar o indicador de digitação.

#### `iniciarWorker(sock)`
Inicializa o worker que escuta a fila `pos-venda-rissato`:

1. Para cada job consumido, extrai `telefone`, `nome` e `tipo` (`24h` ou `6meses`).
2. Formata o JID do WhatsApp: `telefone@s.whatsapp.net`.
3. Seleciona o array de mensagens correto (`mensagens24h` ou `mensagens6meses`).
4. Sorteia aleatoriamente uma frase do array.
5. Substitui `{nome}` pelo primeiro nome real do cliente.
6. Chama `enviarMensagemHumana()` para disparar com comportamento natural.
7. Loga `completed` ou `failed` para cada job processado.

---

## 🔗 Dependências

| Módulo | Arquivo | Finalidade |
|---|---|---|
| `bullmq` | `scheduler.js`, `worker.js` | Fila de jobs com Redis |
| `ioredis` | `scheduler.js`, `worker.js` | Conexão com Redis |
| `puppeteer` | `erpSync.js` | Automação de navegador (RPA) |
| `csv-parser` | `erpSync.js` | Leitura de arquivos CSV |

---

## 🔐 Variáveis de Ambiente necessárias

```env
ERP_CHAVE=         # Chave de acesso do ERP
ERP_USER=          # Usuário do ERP
ERP_PASS=          # Senha do ERP
REDIS_HOST=        # Host do Redis (padrão: localhost)
REDIS_PORT=        # Porta do Redis (padrão: 6379)
DELAY_24H=         # (Opcional) Delay em ms para testes do job de 24h
DELAY_6MESES=      # (Opcional) Delay em ms para testes do job de 6 meses
RISSATO_API_TOKEN= # Token de segurança para o webhook do ERP
```
