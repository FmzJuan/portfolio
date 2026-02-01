# Setup - Automação WordPress com n8n

## 🔐 Dados Sensíveis Mascarados

Este arquivo JSON contém placeholders para dados sensíveis. Antes de executar o workflow, você precisa substituir os seguintes valores:

### 1. **Google Drive IDs**

- **Folder ID de Entrada**: `SEU_GOOGLE_DRIVE_FOLDER_ID_AQUI`
  - Este é o ID da pasta do Google Drive que contém seus documentos com os roteiros de viagem
  - Encontre em: `https://drive.google.com/drive/folders/COLOQUE_AQUI_O_ID`

- **Folder ID de Saída**: `SEU_GOOGLE_DRIVE_OUTPUT_FOLDER_ID`
  - Pasta onde o n8n salvará os arquivos HTML processados
  - Encontre em: `https://drive.google.com/drive/folders/COLOQUE_AQUI_O_ID`

### 2. **Connection IDs do n8n**

Após criar as conexões no n8n, substitua os seguintes IDs:

#### Google Drive Connection
```json
"googleDriveOAuth2Api": {
  "id": "SEU_GOOGLE_DRIVE_CONNECTION_ID",
  "name": "Google Drive account"
}
```

#### Google Docs Connection
```json
"googleDocsOAuth2Api": {
  "id": "SEU_GOOGLE_DOCS_CONNECTION_ID",
  "name": "Google Docs account"
}
```

#### WordPress API Connection
```json
"wordpressApi": {
  "id": "SEU_WORDPRESS_CONNECTION_ID",
  "name": "Wordpress account"
}
```

#### OpenRouter API Connection
```json
"openRouterApi": {
  "id": "SEU_OPENROUTER_CONNECTION_ID",
  "name": "OpenRouter account"
}
```

### 3. **Webhook ID**

Substitua o webhook ID para receber chamadas externas:
```json
"webhookId": "SEU_WEBHOOK_ID_AQUI"
```

---

## 🚀 Como Encontrar Esses Valores

### IDs do Google Drive:
1. Abra a pasta do Google Drive
2. Copie a URL: `https://drive.google.com/drive/folders/`**`ESTE_É_O_ID`**
3. Cole no lugar de `SEU_GOOGLE_DRIVE_FOLDER_ID_AQUI`

### Connection IDs no n8n:
1. Vá para **Connections** (Conexões) no painel do n8n
2. Crie novas conexões para:
   - Google Drive OAuth2
   - Google Docs OAuth2
   - WordPress API
   - OpenRouter API
3. Após criadas, você verá um ID associado a cada uma
4. Substitua os valores correspondentes

### Webhook ID:
1. O webhook é gerado automaticamente pelo n8n
2. Você pode encontrá-lo no painel do workflow ou usar `curl` para testá-lo

---

## 📋 Estrutura do Workflow

Este workflow automatiza a publicação de roteiros de viagem no WordPress:

1. **Search Files** - Busca documentos no Google Drive
2. **Parse Nodes** - Parseia:
   - Títulos
   - Prévia/Resumo
   - Itinerário (dias e cidades)
   - Observações
   - Documentos necessários
   - Itens inclusos/não-inclusos
   - Calendário de partidas
   - Hotéis previstos

3. **Template HTML Nodes** - Gera HTML formatado para WordPress
4. **Create/Update Pages** - Publica no WordPress
5. **AI Agent** - Gera mapas automáticos com geolocalização

---

## ⚙️ Dependências Externas

Este workflow requer:

- **Google Drive API** - Para ler documentos
- **Google Docs API** - Para extrair tabelas e conteúdo
- **WordPress REST API** - Para publicar páginas
- **OpenRouter API** - Para gerar mapas com IA

---

## 📌 Notas Importantes

- Não compartilhe os valores reais destes placeholders publicamente
- Mantenha seus IDs de conexão seguros
- Use variáveis de ambiente em produção para maior segurança

---

## ✅ Próximos Passos

1. Clone o repositório
2. Abra o arquivo `n8n-finaly.json` no n8n
3. Substitua todos os placeholders com seus valores reais
4. Teste o workflow com um documento de exemplo
5. Configure o agendamento desejado

---

**Criado com n8n** | Automação de Publicação de Roteiros Turísticos
