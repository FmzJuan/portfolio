# Integração do Bot de WhatsApp com CRM

## Visão Geral

Este documento descreve como integrar o seu bot de WhatsApp existente com o sistema CRM desenvolvido. O CRM fornece um endpoint webhook que recebe mensagens do bot e as armazena automaticamente no banco de dados.

## Endpoint do Webhook

**URL:** `POST /api/trpc/webhook.receiveMessage`

**Descrição:** Recebe uma mensagem do bot de WhatsApp e cria ou atualiza um contato no CRM.

### Parâmetros de Entrada

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `phone` | string | Sim | Número de telefone do cliente (ex: "5511999999999") |
| `message` | string | Sim | Conteúdo da mensagem recebida |
| `senderName` | string | Não | Nome do remetente |
| `senderEmail` | string | Não | E-mail do remetente |

### Exemplo de Requisição

```bash
curl -X POST https://seu-dominio.manus.space/api/trpc/webhook.receiveMessage \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5511999999999",
    "message": "Olá, gostaria de saber mais sobre seus produtos",
    "senderName": "João Silva",
    "senderEmail": "joao@example.com"
  }'
```

### Exemplo de Resposta

```json
{
  "success": true,
  "contactId": 1
}
```

## Integração com o Bot Baileys

Se você está usando o Baileys (como no seu bot atual), aqui está como integrar com o CRM:

### 1. Instalar Dependências

```bash
npm install axios
```

### 2. Adicionar Função de Envio ao CRM

Adicione esta função ao seu `index.js` do bot:

```javascript
const axios = require('axios');

const CRM_API_URL = 'https://seu-dominio.manus.space/api/trpc/webhook.receiveMessage';

async function sendToCRM(phone, message, senderName, senderEmail) {
  try {
    const response = await axios.post(CRM_API_URL, {
      phone,
      message,
      senderName,
      senderEmail,
    });
    console.log('Mensagem salva no CRM:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar para CRM:', error.message);
  }
}

module.exports = { sendToCRM };
```

### 3. Integrar com o Handler de Mensagens

Modifique o seu handler de mensagens para chamar a função `sendToCRM`:

```javascript
const { sendToCRM } = require('./crm-integration');

// No seu event listener de mensagens
client.on('message_create', async (msg) => {
  const phone = msg.from; // Número do remetente
  const message = msg.body; // Conteúdo da mensagem
  const senderName = msg.notifyName || 'Cliente'; // Nome do remetente
  
  // Enviar para CRM
  await sendToCRM(phone, message, senderName);
  
  // Seu processamento do bot continua aqui
  // ...
});
```

## Fluxo de Dados

```
Bot WhatsApp (Baileys)
    ↓
    └─→ [Webhook] POST /api/trpc/webhook.receiveMessage
            ↓
        [Backend Node.js]
            ↓
        Criar/Atualizar Contato
            ↓
        Salvar Mensagem
            ↓
        [Banco de Dados PostgreSQL]
            ↓
        [Frontend React]
            ↓
        Dashboard do Admin
```

## Fluxo de Resposta do Admin

Quando um administrador responde uma mensagem no painel do CRM:

1. Admin clica em "Chat" em um contato no quadro Kanban
2. Admin digita uma mensagem e clica em "Enviar"
3. A mensagem é salva no banco de dados com `sender: 'admin'`
4. **Próximo passo:** Você precisará implementar uma função no bot para buscar mensagens não lidas e enviá-las via WhatsApp

### Implementar Resposta do Admin (Próxima Etapa)

Adicione esta função ao seu bot para verificar mensagens não respondidas:

```javascript
const { getDb } = require('./server/db');
const { eq } = require('drizzle-orm');
const { messages, contacts } = require('./drizzle/schema');

async function sendAdminReplies(client) {
  const db = await getDb();
  
  // Buscar mensagens do admin que não foram enviadas
  const adminMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.sender, 'admin'))
    .limit(100);
  
  for (const msg of adminMessages) {
    const contact = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, msg.contactId))
      .limit(1);
    
    if (contact.length > 0) {
      try {
        await client.sendMessage(contact[0].phone + '@c.us', msg.content);
        console.log(`Mensagem enviada para ${contact[0].phone}`);
      } catch (error) {
        console.error(`Erro ao enviar mensagem: ${error.message}`);
      }
    }
  }
}

// Chamar a cada 5 segundos
setInterval(() => sendAdminReplies(client), 5000);
```

## Controle do Bot

### Pausar Bot

Quando um administrador clica em "Pausar Bot", a flag `botPaused` é definida como `true` para aquele contato. Você pode verificar isso no seu bot:

```javascript
async function shouldProcessMessage(contactPhone) {
  const db = await getDb();
  const contact = await db
    .select()
    .from(contacts)
    .where(eq(contacts.phone, contactPhone))
    .limit(1);
  
  if (contact.length > 0 && contact[0].botPaused) {
    console.log('Bot pausado para este contato');
    return false;
  }
  
  return true;
}

// No seu handler de mensagens
client.on('message_create', async (msg) => {
  if (!(await shouldProcessMessage(msg.from))) {
    return; // Não processar se bot está pausado
  }
  
  // Continuar processamento normal
});
```

## Variáveis de Ambiente

Adicione ao seu `.env` do bot:

```env
CRM_API_URL=https://seu-dominio.manus.space/api/trpc/webhook.receiveMessage
CRM_ENABLED=true
```

## Tratamento de Erros

O webhook é tolerante a falhas. Se houver um erro ao salvar no CRM, o bot continuará funcionando normalmente. Recomenda-se implementar retry logic:

```javascript
async function sendToCRMWithRetry(phone, message, senderName, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sendToCRM(phone, message, senderName);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## Segurança

Para produção, recomenda-se:

1. **Adicionar autenticação ao webhook** - Use um token secreto:
   ```javascript
   // No backend
   if (req.headers['x-crm-token'] !== process.env.CRM_WEBHOOK_TOKEN) {
     throw new Error('Unauthorized');
   }
   ```

2. **Validar origem das requisições** - Whitelist de IPs do seu servidor bot

3. **Rate limiting** - Implementar limite de requisições por minuto

4. **HTTPS obrigatório** - Sempre usar HTTPS em produção

## Próximos Passos

1. ✅ Endpoint webhook criado
2. ⏳ Integrar bot com webhook (seu código)
3. ⏳ Implementar envio de respostas do admin para WhatsApp
4. ⏳ Testar fluxo completo
5. ⏳ Adicionar autenticação e segurança

## Suporte

Para dúvidas sobre a integração, consulte:
- Documentação do Baileys: https://github.com/WhiskeySockets/Baileys
- Documentação da API tRPC: https://trpc.io/docs
