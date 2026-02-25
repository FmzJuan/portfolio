# 📋 Instruções - Portfólio Juan Meneghesso

## 📦 O que está incluído

Este arquivo ZIP contém o código completo do seu site de portfólio, incluindo:

- **client/** - Código React com todos os componentes
- **package.json** - Dependências do projeto
- **Imagens** - 5 imagens de alta qualidade já geradas

## 🚀 Como usar

### 1. Extrair o arquivo
```bash
unzip juan-portfolio-completo.zip
cd juan-portfolio-site
```

### 2. Instalar dependências
```bash
npm install
# ou
pnpm install
```

### 3. Rodar em desenvolvimento
```bash
npm run dev
# ou
pnpm dev
```

O site estará disponível em `http://localhost:5173`

### 4. Fazer build para produção
```bash
npm run build
# ou
pnpm build
```

## 📁 Estrutura de Arquivos

```
client/
├── public/
│   └── images/          # Imagens do site (5 imagens geradas)
├── src/
│   ├── components/
│   │   ├── Header.tsx           # Navegação superior
│   │   ├── Hero.tsx             # Seção hero com CTA
│   │   ├── Projects.tsx         # Grid de projetos
│   │   ├── ProjectCard.tsx      # Card individual de projeto
│   │   ├── Impact.tsx           # Seção de métricas de impacto
│   │   ├── Contact.tsx          # Seção de contato
│   │   ├── Footer.tsx           # Rodapé
│   │   └── ui/                  # Componentes shadcn/ui
│   ├── pages/
│   │   └── Home.tsx             # Página principal
│   ├── App.tsx                  # Configuração de rotas
│   ├── index.css                # Estilos globais
│   └── main.tsx                 # Entrada React
└── index.html                   # HTML principal
```

## 🎨 Design

**Filosofia de Design:** Modern Tech Minimalism

- **Cores:** Azul profissional (#3B82F6) + Branco
- **Tipografia:** 
  - Poppins (títulos/display)
  - Inter (corpo/texto)
  - IBM Plex Mono (código)
- **Paleta:** Minimalista, limpa, profissional

## 🔧 Personalizações Recomendadas

### 1. Atualize seus dados de contato
Edite o arquivo `client/src/components/Contact.tsx`:
```tsx
// Linha 8: Altere o email
href="mailto:seu-email@example.com"

// Linha 15: Altere o LinkedIn
href="https://linkedin.com/in/seu-usuario"

// Linha 22: Altere o GitHub
href="https://github.com/seu-usuario"
```

### 2. Atualize o Footer
Edite `client/src/components/Footer.tsx`:
```tsx
// Altere os links de contato para seus dados reais
```

### 3. Adicione mais projetos
Edite `client/src/components/Projects.tsx` e adicione novos objetos ao array `projects`:
```tsx
{
  id: 4,
  title: "Seu novo projeto",
  description: "...",
  image: "/images/sua-imagem.jpg",
  // ... outros campos
}
```

### 4. Personalize as métricas
Edite `client/src/components/Impact.tsx` para atualizar os números de impacto.

## 📸 Imagens Incluídas

1. **hero-automation.jpg** - Imagem de fundo do hero
2. **n8n-workflow.jpg** - Visualização do workflow n8n
3. **google-sheets-data.jpg** - Organização de dados no Sheets
4. **email-automation.jpg** - Automação de e-mails
5. **impact-metrics.jpg** - Métricas de impacto

## 🌐 Deploy

### Opção 1: Manus (Recomendado)
Use a plataforma Manus para fazer deploy automático com domínio personalizado.

### Opção 2: Vercel
```bash
npm install -g vercel
vercel
```

### Opção 3: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Opção 4: GitHub Pages
Configure no seu repositório GitHub e faça deploy automático.

## 📝 Tecnologias Utilizadas

- **React 19** - Framework UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilos
- **shadcn/ui** - Componentes UI
- **Lucide React** - Ícones
- **Vite** - Build tool

## 🎯 Próximos Passos

1. ✅ Extrair e instalar dependências
2. ✅ Atualizar dados de contato (email, LinkedIn, GitHub)
3. ✅ Testar localmente (`npm run dev`)
4. ✅ Fazer build (`npm run build`)
5. ✅ Deploy em sua plataforma preferida

## 💡 Dicas

- Mantenha as imagens em `client/public/images/`
- Use `npm run dev` para desenvolvimento
- Use `npm run build` antes de fazer deploy
- Todos os componentes usam Tailwind CSS para estilização
- Customize as cores editando `client/src/index.css`

## 🆘 Problemas Comuns

**Erro: "Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Porta 5173 já em uso**
```bash
npm run dev -- --port 3000
```

**Build falha**
```bash
npm run check  # Verifica erros de TypeScript
npm run build  # Tenta fazer build novamente
```

---

Boa sorte com seu portfólio! 🚀
