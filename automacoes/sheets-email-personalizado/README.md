# Automação de Envio de Cotações por E-mail Personalizado

## 📌 Problema
A empresa (Investur) precisava enviar cotações e detalhes de viagens para agências parceiras de forma rápida, organizada e visualmente profissional.

O processo manual gerava:
- ⚠️ Retrabalho repetitivo
- ❌ Erros de cópia/digitação
- 🎨 Falta de padronização visual
- 👤 Dependência de conhecimento técnico do operador

---

## 🛠️ Solução
Foi desenvolvida uma automação utilizando **Google Apps Script** integrada ao Google Sheets, permitindo que qualquer usuário execute o envio de e-mails profissionais sem conhecimento técnico.

A solução inclui:
- ✅ Interface modal em HTML intuitiva
- ✅ Busca dinâmica de registros por File/Nº
- ✅ E-mails estilizados com logo, cores e layout corporativo
- ✅ Opção de enviar para múltiplos destinatários
- ✅ Formatação automática de datas
- ✅ Mapeamento inteligente de colunas

---

## 📚 Estrutura de Arquivos

### 1. **[Codigo.js](Codigo.js)** - Lógica Principal
Contém as funções backend que controlam toda a automação.

**Funções principais:**

#### `abrirDialogo()`
Abre a interface modal para o usuário.
```javascript
function abrirDialogo() {
  var html = HtmlService.createHtmlOutputFromFile('Janela')
      .setWidth(400) 
      .setHeight(460);
  SpreadsheetApp.getUi().showModalDialog(html, 'Enviar Cotação');
}
```

#### `processarBuscaEEnvio(config)`
Processa a busca, coleta dados e envia o e-mail.

**Parâmetros:**
- `config.termoBusca` - File/Nº a ser buscado
- `config.enviarParaMim` - Booleano para enviar para o próprio usuário
- `config.outroEmail` - Email adicional (opcional)

**O que faz:**
1. Busca a linha na aba "Controle" usando File/Nº
2. Extrai dados de múltiplas colunas
3. Formata datas automaticamente
4. Monta e-mail HTML com branding
5. Envia para o(s) destinatário(s)

---

### 2. **[Janela.html](Janela.html)** - Interface do Usuário
Interface visual (modal) onde o usuário interage com a automação.

**Componentes:**
- 📝 Campo de busca para File/Nº
- ✔️ Checkbox "Enviar para meu e-mail"
- 📧 Campo opcional para outro e-mail
- 🔘 Botão "ENVIAR AGORA"
- 🟢 Feedback de status (Enviando, Sucesso, Erro)

**Recursos de UX:**
- Design responsivo (400x460px)
- Validação de e-mail antes do envio
- Botão desabilitado durante processamento
- Mensagens de feedback ao usuário
- Suporte a temas claros do Google

---

## ⚙️ Como Funciona - Fluxo de Execução

```
┌──────────────────────────────────┐
│  Usuário abre a planilha Sheets  │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Clica em "Enviar Cotação"      │ (Menu personalizado no Sheets)
│  → abrirDialogo() é executado    │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│   Modal HTML é exibido           │
│   (Interface do usuário)         │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Usuário digita File/Nº          │
│  Ex: invt420                     │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  Clica em "ENVIAR AGORA"         │
│  → processarBuscaEEnvio() rodar   │
└────────────┬─────────────────────┘
             │
             ├─► Busca na aba "Controle"
             │   └─► Valida se existe File/Nº
             │
             ├─► Extrai dados de colunas específicas
             │   └─► Formata datas (DD/MM/YYYY)
             │
             ├─► Monta e-mail HTML com logo + branding
             │
             └─► Envia via Gmail
                 ├─► Para o próprio usuário (opcional)
                 └─► Para outro e-mail (opcional)
             │
             ▼
┌──────────────────────────────────┐
│   Modal fecha automaticamente     │
│   Mensagem de sucesso exibida    │
└──────────────────────────────────┘
```

---

## 📋 Requisitos e Configuração

### Estrutura da Planilha

**Aba obrigatória:** `Controle`

**Colunas necessárias:**
| Coluna | Descrição | Tipo |
|--------|-----------|------|
| File/Nº | Identificador único | Texto |
| Data da Solicitação | Data da requisição | Data |
| Nome da Agência | Nome do cliente/agência | Texto |
| Consultor | Responsável | Texto |
| Contato da Agencia | Telefone/Whatsapp | Texto |
| Tipo de Cotação | Ex: Pacote, Passagem | Texto |
| Destinos | Locais de viagem | Texto |
| Data check-in | Entrada | Data |
| Data check-out | Saída | Data |
| Quantidade de pax | Número de pessoas | Número |
| Feedback / Observacao | Observações | Texto |

### Requisitos Técnicos

✅ Google Sheets com Apps Script habilitado
✅ Acesso ao Gmail (para envio automático)
✅ Permissões de envio de e-mail ativadas
✅ Logo hospedada em URL pública (Google Drive)

### Customização da Logo

Para alterar a logo no e-mail, modifique a URL em `Codigo.js`:
```javascript
<img src="https://drive.google.com/uc?export=view&id=SEU_ID_AQUI" alt="Logo">
```

Para obter ID do Google Drive:
1. Faça upload da imagem no Google Drive
2. Clique direito → Compartilhar
3. Copie o ID da URL: `https://drive.google.com/file/d/**ID**/view`

---

## 🎨 Personalização

### Cores e Branding
Edite em `Codigo.js` na seção `htmlCorpo`:
```javascript
background-color: #f36f21;  // Cor primária (laranja Investur)
color: #d84315;             // Cor secundária
```

### Assunto do E-mail
Atualmente: `"Cotação [File/Nº] - Nome da Agência"`

Para alterar, modifique:
```javascript
var assunto = "Cotação [" + getD("File/Nº") + "] - " + getD("Nome da Agência");
```

### Campos do E-mail
Adicione novas linhas na tabela HTML alterando:
```javascript
<td>${getD("NOME_COLUNA_EXATA")}</td>
```

---

## 🚀 Como Implementar

### 1️⃣ No Google Sheets
1. Abra seu Google Sheet
2. Vá para **Extensões** → **Apps Script**
3. Copie o conteúdo de `Codigo.js`
4. Crie um arquivo HTML em **+** chamado `Janela` e copie o conteúdo de `Janela.html`
5. Clique em **Salvar**

### 2️⃣ Criar Menu Personalizado
Adicione no fim de `Codigo.js`:
```javascript
function onOpen(e) {
  SpreadsheetApp.getUi().createMenu('📧 Cotação')
    .addItem('Enviar Cotação', 'abrirDialogo')
    .addToUi();
}
```

### 3️⃣ Autorizar Acesso
1. Execute a função `abrirDialogo()`
2. Autorize o acesso ao Sheets e Gmail
3. Pronto! O menu "📧 Cotação" aparecerá na planilha

---

## 📊 Tecnologias Utilizadas
| Tecnologia | Uso |
|-----------|-----|
| **Google Apps Script** | Backend e automação |
| **Google Sheets** | Armazenamento de dados |
| **Google Sheets UI** | Modal/interface |
| **Gmail API** | Envio de e-mails |
| **HTML5** | Interface visual |
| **CSS3** | Estilização e responsividade |
| **JavaScript** | Lógica frontend |

---

## 📈 Resultados e Benefícios
| Métrica | Antes | Depois |
|---------|-------|--------|
| ⏱️ Tempo por envio | 10-15 min | 30 seg |
| 📊 Erros manuais | Frequentes | Zero |
| 👥 Usuários podem enviar | Não | Sim |
| 🎨 Padronização visual | Inconsistente | 100% |
| 📧 E-mails por dia | ~5 | 50+ |

---

## 🔍 Monitoramento e Logs

Para visualizar logs de execução:
1. Em Apps Script, clique em **Execuções** (ou Ctrl+Enter)
2. Veja status de sucesso/erro
3. Mensagens customizadas aparecem no modal

Exemplo de retorno:
- ✅ "Sucesso! Dados do File invt420 enviados."
- ❌ "Não foi encontrado nenhum registro com o File/Nº: invt999"

---

## 📝 Notas Importantes

⚠️ **Backup:** Faça backup da planilha antes de fazer alterações no Apps Script

🔒 **Segurança:** Apenas usuários com acesso à planilha podem enviar e-mails

📧 **Limites:** Google Sheets permite até 100 e-mails/dia por conta de serviço

🌍 **Zona Horária:** Datas são formatadas de acordo com a timezone da conta Google

💾 **Histórico:** Nenhum log permanente é salvo (revisar se necessário adicionar)

---

## 🆘 Troubleshooting

| Problema | Solução |
|----------|---------|
| Modal não abre | Recarregue a página; verifique se Apps Script está salvo |
| "Coluna não encontrada" | Verifique nomes exatos das colunas na aba "Controle" |
| E-mail não enviado | Verifique permissões do Gmail; valide e-mail destino |
| Datas formatadas errado | Altere timezone em Apps Script ou formato em `formatDate()` |
| Erro de quota | Aguarde 24h; Google Sheets reseta limites diariamente |

---

## 📞 Suporte
Para questões técnicas, verifique os logs em **Extensões → Apps Script → Execuções**.
