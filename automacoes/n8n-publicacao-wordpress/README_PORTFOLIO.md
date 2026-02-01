# 📋 Portfólio - Automações

Repositório de automações e workflows desenvolvidos com **n8n** (plataforma de automação open-source).

---

## 📂 Projetos

### 1. 🌐 Automação WordPress - Publicação de Roteiros Turísticos

**Pasta**: `n8n-publicacao-wordpress/`

**Descrição**: Workflow completo que automatiza a extração, processamento e publicação de roteiros de viagem em um blog WordPress.

#### 🔄 Fluxo do Processo:

1. **Entrada**: Documentos do Google Drive/Docs com roteiros turísticos
2. **Processamento**: 
   - Extrai informações estruturadas (título, cidades, itinerário, hotéis, etc)
   - Parse de tabelas e textos com IA
   - Geração automática de mapas com geolocalização
3. **Saída**: 
   - Publicação de páginas HTML no WordPress
   - Arquivos de backup no Google Drive
   - Integração com webhooks

#### 🛠️ Tecnologias Utilizadas:

- **n8n** - Orquestração de workflows
- **Google Drive API** - Leitura de documentos
- **Google Docs API** - Extração de tabelas estruturadas
- **WordPress REST API** - Publicação de conteúdo
- **OpenRouter API** - Geolocalização inteligente com IA
- **JavaScript** - Custom code nodes para processamento de dados

#### 📊 Capacidades:

✅ Extração inteligente de:
- Títulos e subtítulos
- Itinerários multi-dia com cidades
- Observações e recomendações
- Documentos necessários
- Serviços inclusos/não-inclusos
- Calendário de partidas
- Informações de hotéis

✅ Formatação automática em HTML responsivo

✅ Integração com WordPress CMS

✅ Mapas interativos com coordenadas automáticas

✅ Suporte a múltiplas idiomas (PT, EN)

#### 📌 Como Usar:

1. Abra o arquivo `n8n-finaly.json` no n8n
2. Siga as instruções em [SETUP.md](n8n-publicacao-wordpress/SETUP.md)
3. Substitua os dados sensíveis conforme indicado em [SUBSTITUICOES.md](n8n-publicacao-wordpress/SUBSTITUICOES.md)
4. Teste e ative o workflow

#### 🔐 Segurança:

Este repositório **NÃO contém**:
- ❌ Chaves de API reais
- ❌ Tokens de autenticação
- ❌ IDs de usuários/folders reais
- ❌ Dados sensíveis

Todos os dados sensíveis foram substituídos por placeholders descritivos.

---

## 🚀 Próximos Passos

- [ ] Customizar conforme suas necessidades
- [ ] Testar com documentos de exemplo
- [ ] Configurar agendamento automático
- [ ] Integrar com seus serviços (Google Drive, WordPress, etc)

---

## 📚 Documentação Adicional

- [SETUP.md](n8n-publicacao-wordpress/SETUP.md) - Guia completo de configuração
- [SUBSTITUICOES.md](n8n-publicacao-wordpress/SUBSTITUICOES.md) - Quick reference dos dados a substituir

---

## 👤 Autor

Juan Meneghesso  
Portfolio: https://github.com/juan-meneghesso

---

## 📄 Licença

Este projeto é fornecido como exemplo de portfólio. Adapt conforme necessário para seus usos.

---

**Desenvolvido com n8n** | Automação Inteligente para WordPress
