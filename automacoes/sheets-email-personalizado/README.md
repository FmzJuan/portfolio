# Automação de envio de dados do Google Sheets por e-mail personalizado

## 📌 Problema
A empresa precisava enviar informações específicas de uma planilha do Google Sheets
para clientes e parceiros de forma rápida, organizada e visualmente profissional.

O processo manual gerava:
- retrabalho
- erros de cópia
- falta de padronização visual
- dependência de conhecimento técnico do operador

---

## 🛠️ Solução
Foi desenvolvida uma automação utilizando Google Apps Script integrada ao Google Sheets,
permitindo que qualquer usuário execute o envio de e-mails sem conhecimento técnico.

A solução inclui:
- Botão personalizado dentro da planilha
- Modal em HTML para seleção dinâmica de registros
- Identificação dos dados com base em um número de referência (ex: INV/ID)
- Geração de e-mails estilizados com logo, cores e layout corporativo
- Possibilidade de adicionar destinatários adicionais no momento do envio

---

## ⚙️ Funcionamento
1. O usuário clica no botão dentro do Google Sheets
2. Um modal em HTML é exibido
3. O usuário informa o identificador do registro desejado
4. O sistema coleta automaticamente os dados da linha correspondente
5. O e-mail é montado com layout profissional e enviado via Gmail

---

## 🚀 Tecnologias Utilizadas
- Google Apps Script
- Google Sheets
- HTML
- CSS
- Gmail API

---

## 📈 Resultados
- Redução significativa do tempo operacional
- Eliminação de erros manuais
- Padronização da comunicação corporativa
- Maior autonomia para usuários não técnicos

---

## 🔒 Observações
Por se tratar de um sistema interno, códigos sensíveis e dados reais
não estão expostos neste repositório.
