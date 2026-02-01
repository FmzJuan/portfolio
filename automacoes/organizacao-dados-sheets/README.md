# Automação de Organização e Normalização de Dados no Google Sheets

## 📌 Problema
A empresa recebia dados a partir de múltiplas fontes:
- Google Forms
- Inserções manuais feitas por diferentes usuários

Isso gerava diversos problemas:
- Registros duplicados (ex: CPFs repetidos)
- Dados desatualizados
- Inconsistência de horários e ordens de preenchimento
- Dificuldade de análise confiável das informações
- Linhas sem carimbo de data/hora necessitavam preenchimento manual

---

## 🛠️ Solução
Foi desenvolvida uma automação utilizando **Google Apps Script** integrada ao Google Sheets para organizar, validar e normalizar os dados automaticamente.

A solução executa:
- ✅ Organização cronológica correta dos registros, incluindo entradas manuais
- ✅ Preenchimento automático de datas faltantes (com interpolação inteligente)
- ✅ Identificação e remoção de CPFs duplicados
- ✅ Manutenção automática apenas do registro mais recente de cada CPF
- ✅ Preparação dos dados para análise através de fórmulas no Google Sheets

---

## 📚 Funções Principais

### 1. **`atualizarOrdenado()`** - [atualizandoordenado.js](atualizandoordenado.js)
Reorganiza todas as linhas de forma cronológica.

**Função:** Ordena os registros por data e hora (coluna "CARIMBO DE DATA/HORA"), garantindo que a sequência temporal fique correta mesmo quando há inserções manuais.

**Quando executa:** Disparado automaticamente ao abrir a planilha (gatilho `onOpen`).

---

### 2. **`preencherDatasIntermediarias()`** - [preenchendo.js](preenchendo.js)
Preenche automaticamente datas faltantes com lógica inteligente.

**Função:** Analisa linhas sem data e aplica um dos 4 cenários:
- **Cenário 1:** Sem data anterior nem posterior → Usa data/hora atuais
- **Cenário 2:** Apenas data anterior existe → Usa anterior + 1 minuto
- **Cenário 3:** Apenas data posterior existe → Usa posterior - 1 minuto
- **Cenário 4:** Data anterior E posterior existem → **Interpola** a data entre as duas

**Quando executa:** Disparado automaticamente ao abrir a planilha (gatilho `onOpen`).

---

### 3. **`dedupeCpfKeepLatestDate(sheetName)`** - [Codigo.js](Codigo.js)
Remove duplicatas mantendo apenas o registro mais recente.

**Função:** Identifica CPFs duplicados na aba e remove as versões antigas, mantendo apenas a linha com a data mais recente.

**Quando executa:** Disparado automaticamente ao abrir a planilha via função `onOpen()`.

**Parâmetros:**
- `sheetName` (string): Nome da aba onde a verificação será realizada (padrão: "FORMULARIO")

---

## ⚙️ Como Funciona o Fluxo de Execução

```
┌─────────────────────────────────────┐
│   Planilha é Aberta pelo Usuário    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       onOpen() é Disparado          │ (Gatilho automático)
└──────────────┬──────────────────────┘
               │
               ├─► dedupeCpfKeepLatestDate()
               │   └─► Remove CPFs duplicados, mantém mais recente
               │
               ▼
┌─────────────────────────────────────┐
│   Planilha Pronta para Uso          │ (Limpa e organizada)
└─────────────────────────────────────┘
```

**Nota:** As funções `atualizarOrdenado()` e `preencherDatasIntermediarias()` também possuem gatilhos `onOpen` configurados em seus respectivos arquivos e podem ser executadas manualmente conforme necessário.

---

## 📋 Requisitos

### Aba Obrigatória
- **Nome da aba:** `FORMULARIO`
- **Colunas necessárias:**
  - `CPF` - Deve conter o CPF para validação de duplicatas
  - `CARIMBO DE DATA/HORA` - Deve armazenar data e hora dos registros

### Estrutura de Dados
A planilha deve ter:
- Linha 1: Cabeçalhos
- Linhas 2+: Dados dos registros

---

## 🚀 Como Configurar

### 1️⃣ No Google Sheets
1. Abra seu Google Sheet
2. Vá para **Extensões** → **Apps Script**
3. Copie o código de cada arquivo para o editor:
   - [Codigo.js](Codigo.js) - Função `onOpen()` e `dedupeCpfKeepLatestDate()`
   - [atualizandoordenado.js](atualizandoordenado.js) - Função `atualizarOrdenado()`
   - [preenchendo.js](preenchendo.js) - Função `preencherDatasIntermediarias()`

### 2️⃣ Configurar Gatilhos (Triggers)
Na seção de **Triggers** do Apps Script:
1. Clique em **+ Adicionar Gatilho**
2. Configure:
   - **Selecione a função a executar:** `onOpen`
   - **Selecione o tipo de evento:** `De evento aberto`
   - Clique em **Salvar**

---

## 📊 Tecnologias Utilizadas
- **Google Apps Script** - Automação
- **Google Sheets** - Armazenamento de dados
- **Google Forms** - Coleta de dados (opcional)
- **JavaScript** - Linguagem de programação

---

## 📈 Resultados e Benefícios
| Benefício | Antes | Depois |
|-----------|-------|--------|
| Duplicatas de CPF | ❌ Presentes | ✅ Removidas |
| Ordem cronológica | ❌ Inconsistente | ✅ Perfeita |
| Datas faltantes | ❌ Manuais | ✅ Automáticas |
| Confiabilidade | ❌ Baixa | ✅ Alta |
| Tempo de organização | ❌ 30min+ | ✅ Automático |

---

## 🔍 Logs e Monitoramento
O script registra informações úteis no **Console** do Apps Script:
- ✅ Confirmação de datas preenchidas
- ℹ️ Quantidade de duplicatas removidas
- ⚠️ Erros e exceções

Para acessar: **Extensões** → **Apps Script** → **Execução** (ou Ctrl+Enter)

---

## 📝 Notas Importantes

⚠️ **Backup Recomendado:** Faça uma cópia de segurança da planilha antes de executar pela primeira vez

🔧 **Customização:** Se sua aba tiver nome diferente de "FORMULARIO", edite a linha:
```javascript
const sheetName = "FORMULARIO"; // Altere para o nome da sua aba
```

⏱️ **Performance:** Com grandes volumes de dados (10k+ linhas), a execução pode levar alguns segundos

📞 **Suporte:** Verifique os logs no Apps Script para diagnosticar problemas

---

## 🔒 Observações
Dados sensíveis e regras internas da empresa não são expostos neste repositório.
