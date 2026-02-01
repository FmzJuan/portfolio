# Automação de organização e normalização de dados no Google Sheets

## 📌 Problema
A empresa recebia dados a partir de múltiplas fontes:
- Google Forms
- inserções manuais feitas por diferentes usuários

Isso gerava diversos problemas:
- registros duplicados (ex: CPFs repetidos)
- dados desatualizados
- inconsistência de horários e ordens de preenchimento
- dificuldade de análise confiável das informações

---

## 🛠️ Solução
Foi desenvolvida uma automação utilizando Google Apps Script integrada ao Google Sheets
para organizar, validar e normalizar os dados automaticamente.

A solução executa:
- Organização cronológica correta dos registros, incluindo entradas manuais
- Identificação e remoção de CPFs duplicados
- Manutenção automática apenas do registro mais recente de cada CPF
- Preparação dos dados para análise através de fórmulas no Google Sheets

---

## ⚙️ Funcionamento
1. Dados são recebidos via Google Forms ou inserção manual
2. A automação é executada automaticamente ou sob demanda
3. Os registros são reorganizados com base em data e hora reais
4. CPFs duplicados são tratados, mantendo apenas o dado mais atual
5. A planilha permanece sempre limpa e confiável para uso operacional

---

## 🚀 Tecnologias Utilizadas
- Google Apps Script
- Google Sheets
- Google Forms
- Fórmulas avançadas no Sheets

---

## 📈 Resultados
- Eliminação de dados duplicados
- Maior confiabilidade das informações
- Redução de erros em relatórios
- Base de dados sempre atualizada e organizada

---

## 🔒 Observações
Dados sensíveis e regras internas da empresa não são expostos neste repositório.
