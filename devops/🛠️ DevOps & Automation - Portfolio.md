# 🛠️ DevOps & Automation - Portfolio

![GitHub Workflow Status](https://img.shields.io/badge/status-active-brightgreen?style=for-the-badge) ![Node.js Version](https://img.shields.io/badge/node-v20%2B-green?style=for-the-badge) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4285F4?style=for-the-badge&logo=postgresql&logoColor=white) ![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)

Este diretório centraliza as soluções de **DevOps** e **Automação** do projeto. Aqui você encontrará scripts de integração, bots de atendimento e ferramentas de monitoramento configuradas para rodar de forma contínua e resiliente.

---

## 📂 Estrutura do Diretório

A pasta está organizada em três módulos principais, gerenciados centralizadamente pelo PM2:

1.  **`apiwordpressform/`**: Integração entre formulários WordPress e Google Sheets via API.
2.  **`Bot-investur/`**: Assistente virtual para WhatsApp utilizando a biblioteca Baileys.
3.  **`loop-email-titan/`**: Sistema de monitoramento e fallback de e-mails entre servidores Titan e Gmail.

---

## 🚀 Tecnologias Utilizadas

| Tecnologia | Descrição |
| :--- | :--- |
| **Node.js** | Ambiente de execução para a API e o Bot de WhatsApp. |
| **Python** | Utilizado para scripts de automação de e-mail e monitoramento. |
| **PM2** | Gerenciador de processos para manter as aplicações rodando 24/7. |
| **Google Sheets API** | Armazenamento e manipulação de dados em planilhas. |
| **Baileys** | Biblioteca para conexão e automação do WhatsApp. |
| **IMAP/SMTP** | Protocolos de comunicação para o sistema de fallback de e-mails. |

---

## 📖 Manual de Uso

### 1. Pré-requisitos
Certifique-se de ter instalado em seu servidor:
- [Node.js](https://nodejs.org/) (v20 ou superior)
- [Python 3.x](https://www.python.org/)
- [PM2](https://pm2.keymetrics.io/) (`npm install pm2 -g`)

### 2. Configuração
Cada subpasta possui suas próprias dependências e configurações:

- **Instalação de Dependências Node.js:**
  ```bash
  cd apiwordpressform && npm install
  cd ../Bot-investur && npm install
  ```
- **Instalação de Dependências Python:**
  ```bash
  cd loop-email-titan && pip install -r requirements.txt
  ```

- **Variáveis de Ambiente:**
  Certifique-se de configurar os arquivos `.env` em cada pasta conforme os exemplos ou códigos-fonte, incluindo credenciais de APIs e servidores.

---

## ⚡ Gerenciamento com PM2

O arquivo `ecosystem.config.js` na raiz desta pasta permite gerenciar todos os serviços de uma só vez.

### Comandos Principais

| Comando | Descrição |
| :--- | :--- |
| `pm2 start ecosystem.config.js` | Inicia todos os serviços configurados. |
| `pm2 list` | Lista todos os processos em execução e seus status. |
| `pm2 logs` | Exibe os logs em tempo real de todas as aplicações. |
| `pm2 stop all` | Para todos os processos. |
| `pm2 restart <nome_ou_id>` | Reinicia um processo específico. |
| `pm2 monit` | Abre um painel de monitoramento visual no terminal. |
| `pm2 save` | Salva a lista atual para reiniciar automaticamente após o reboot do servidor. |

---

## 🔧 Detalhes dos Serviços

### API WordPress to Sheets (`api-wordpress-sheets`)
Recebe webhooks de formulários do WordPress e insere os dados automaticamente em uma planilha do Google Sheets, organizando colunas de Nome, Email e Telefone.

### Bot Investur (`bot-investur-baileys`)
Um bot de WhatsApp que oferece um menu interativo para clientes, permitindo a geração de PDFs informativos e triagem de atendimento para agentes de viagem ou passageiros.

### Fallback Email Titan (`fallback-email-titan`)
Script Python que monitora caixas de entrada Titan via IMAP. Caso identifique falhas ou necessidade de alerta, realiza o envio via Gmail como contingência, garantindo que nenhuma comunicação seja perdida.

---

> **Nota:** Este repositório é parte de um portfólio pessoal. Para contribuições ou dúvidas, entre em contato com o proprietário.

---

## 👨‍💻 Autor

**FmzJuan - Juan Meneghesso Vildoso**

- [GitHub](https://github.com/FmzJuan)
- [LinkedIn](https://www.linkedin.com/in/juanmeneghesso/)

---

© 2026 - Desenvolvido por Juan Meneghesso **Vildoso**.