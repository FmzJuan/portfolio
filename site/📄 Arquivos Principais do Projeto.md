# 📄 Arquivos Principais do Projeto

## Componentes Criados

### 1. **Header.tsx** - Navegação Principal
- Logo com iniciais "JM"
- Navegação responsiva (desktop e mobile)
- Links para seções: Projetos, Impacto, Contato
- Botão GitHub
- Menu mobile com hamburger

### 2. **Hero.tsx** - Seção Principal
- Imagem de fundo com overlay
- Título principal com gradient
- Subtítulo descritivo
- Dois botões CTA (Ver Projetos, GitHub)
- Estatísticas rápidas (3+ Projetos, 50+ Horas, 100% Automação)

### 3. **ProjectCard.tsx** - Card de Projeto
- Imagem do projeto
- Título e descrição
- Seção Problema/Solução
- Métricas de impacto em grid
- Tags de tecnologias
- Links para GitHub

### 4. **Projects.tsx** - Grid de Projetos
- Exibe 3 projetos principais:
  1. Automação WordPress com n8n
  2. Organização de Dados Google Sheets
  3. Envio de Cotações por E-mail
- Cada projeto com métricas específicas
- CTA para GitHub

### 5. **Impact.tsx** - Seção de Impacto
- 4 cards de KPIs:
  - 50+ Horas Economizadas
  - 300% Aumento de Produtividade
  - 95% Erros Reduzidos
  - 4.5x ROI de Automação
- Imagem de métricas
- 3 benefícios principais (Eficiência, Custos, Escalabilidade)

### 6. **Contact.tsx** - Seção de Contato
- 3 cards de contato (Email, LinkedIn, GitHub)
- Botão "Enviar E-mail"
- Box de disponibilidade (CLT, PJ, Freelas, Consultoria)

### 7. **Footer.tsx** - Rodapé
- Informações sobre você
- Links rápidos
- Ícones de redes sociais
- Copyright

### 8. **Home.tsx** - Página Principal
- Integra todos os componentes
- Comentário com filosofia de design

## Arquivo de Estilos

### **index.css** - Estilos Globais
- Cores: Azul (#3B82F6), Branco, Cinza
- Tipografia: Poppins, Inter, IBM Plex Mono
- Classes utilitárias customizadas
- Tema claro (light mode)

## Arquivo de Configuração

### **package.json**
- Dependências React 19
- Tailwind CSS 4
- shadcn/ui
- Lucide React (ícones)
- Scripts: dev, build, preview

## Imagens Geradas

1. **hero-automation.jpg** (1920x1080)
   - Fundo do hero com visualização de automação
   - Cores: Azul e branco
   
2. **n8n-workflow.jpg** (1920x1080)
   - Workflow n8n com nós conectados
   - Mostra integração WordPress → Redes Sociais
   
3. **google-sheets-data.jpg** (1920x1080)
   - Fluxo de organização de dados
   - Raw Data → Clean & Structured Data
   
4. **email-automation.jpg** (1920x1080)
   - Fluxo de automação de e-mails
   - Templates → Envio automático
   
5. **impact-metrics.jpg** (1920x1080)
   - Gráficos de impacto e KPIs
   - Métricas de negócio

## Estrutura de Dados

### Projetos (Projects.tsx)
```typescript
{
  id: number
  title: string
  description: string
  image: string
  problem: string
  solution: string
  impact: { label: string; value: string }[]
  technologies: string[]
  githubUrl: string
}
```

### Métricas de Impacto (Impact.tsx)
```typescript
{
  icon: IconComponent
  label: string
  value: string
  description: string
}
```

## Paleta de Cores

| Cor | Hex | Uso |
|-----|-----|-----|
| Azul Primário | #3B82F6 | Botões, links, acentos |
| Azul Escuro | #0F172A | Texto principal, foreground |
| Branco | #FFFFFF | Fundo principal |
| Cinza Claro | #F8FAFC | Fundo de cards |
| Cinza Médio | #CBD5E1 | Borders |
| Cinza Escuro | #64748B | Texto secundário |

## Tipografia

| Fonte | Uso | Peso |
|-------|-----|------|
| Poppins | Títulos (h1-h6) | 700 |
| Inter | Corpo e texto | 400, 500, 600 |
| IBM Plex Mono | Código | 400, 500 |

## Responsividade

- **Mobile:** 320px+
- **Tablet:** 640px+
- **Desktop:** 1024px+

Todos os componentes são totalmente responsivos usando Tailwind CSS.

## Animações

- Fade-in ao carregar
- Slide-up ao scroll
- Hover effects nos cards
- Transições suaves (200-300ms)
- Pulse suave em números

---

**Total de linhas de código:** ~2000+ linhas
**Componentes:** 8 principais + 50+ componentes shadcn/ui
**Imagens:** 5 de alta qualidade
