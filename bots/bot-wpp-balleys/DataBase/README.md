# 🗄️ DataBase

A pasta `DataBase` contém os arquivos responsáveis pela **conexão e estruturação** do banco de dados PostgreSQL do projeto.

---

## 📁 Estrutura

```
DataBase/
├── conection.js   → Pool de conexão com o PostgreSQL
└── init.sql       → Script de criação das tabelas e dados iniciais
```

---

## 📄 `conection.js`

Cria e exporta o pool de conexão com o banco de dados PostgreSQL usando a biblioteca `pg`.

### Configuração

O pool é configurado via variáveis de ambiente do `.env`. Se alguma variável estiver ausente, usa os seguintes valores padrão:

| Variável | Padrão |
|---|---|
| `DB_USER` | `postgres` |
| `DB_HOST` | `localhost` |
| `DB_NAME` | `leadsflow` |
| `DB_PASS` | `suasenha` |
| `DB_PORT` | `5432` |

### Funções

#### Inicialização do pool
Ao carregar o módulo, testa automaticamente a conexão via `pool.connect()`. Exibe `✅ Conectado ao PostgreSQL com sucesso!` em caso de sucesso ou `❌ Erro ao conectar` em caso de falha, sem derrubar a aplicação.

#### `query(text, params)`
Função wrapper assíncrona em torno do `pool.query()` do `pg`. Recebe uma string SQL e um array de parâmetros, e executa a consulta no banco.

**Retorna:** o objeto de resultado do `pg`, contendo `rows`, `rowCount`, etc.

Usada por todos os outros módulos do projeto que precisam interagir com o banco — como o `index.js` (salvar leads e contatos) e o `Engine/report.js` (buscar dados para o PDF).

**Exporta:** `{ query, pool }`

---

## 📄 `init.sql`

Script SQL de **inicialização do banco de dados**. É executado automaticamente pelo Docker quando o container do PostgreSQL sobe pela primeira vez (via `docker-entrypoint-initdb.d`).

### O que ele cria:

#### Tabela `clientes_config`
Tabela central do modelo SaaS. Cada linha representa uma oficina/empresa que usa o sistema.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL PK | Identificador único |
| `nome_oficina` | VARCHAR(255) | Nome da empresa |
| `subdominio` | VARCHAR(50) UNIQUE | Subdomínio de acesso (ex: `rissato`) |
| `google_sheets_id` | VARCHAR(255) | ID da planilha Google vinculada |
| `email_contato` | VARCHAR(255) | E-mail de login na dashboard |
| `senha_dashboard` | VARCHAR(255) | Senha de acesso |
| `status_assinatura` | VARCHAR(20) | Status (`ativo` por padrão) |
| `criado_at` | TIMESTAMP | Data de criação |

#### Tabela `leads`
Armazena os leads (contatos) de cada oficina, vinculados à `clientes_config` por `cliente_id`.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL PK | Identificador único |
| `cliente_id` | INTEGER FK | Referência à oficina dona do lead |
| `nome` | VARCHAR(255) | Nome do lead |
| `celular` | VARCHAR(50) | Número de telefone |
| `veiculo` | VARCHAR(100) | Veículo do lead |
| `data_cadastro` | DATE | Data de entrada |
| `status_envio` | VARCHAR(50) | Status (`pendente` por padrão) |
| `ultima_interacao` | TIMESTAMP | Última interação registrada |

#### Dado inicial
Insere a **Rissato Motors** como cliente padrão para ambiente de desenvolvimento, usando `ON CONFLICT DO NOTHING` para evitar duplicatas em reinícios.

---

## 🔐 Variáveis de Ambiente necessárias

```env
DB_USER=      # Usuário do PostgreSQL
DB_HOST=      # Host do banco (ex: localhost ou nome do serviço Docker)
DB_NAME=      # Nome do banco (ex: leadsflow)
DB_PASS=      # Senha do usuário
DB_PORT=      # Porta (padrão: 5432)
```
