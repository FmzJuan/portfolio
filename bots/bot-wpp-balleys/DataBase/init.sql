-- Criação da tabela de contatos caso ela não exista
CREATE TABLE IF NOT EXISTS contatos (
    numero VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(150),
    ultima_interacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Se no futuro você precisar salvar logs no banco, a tabela já fica pronta aqui:
CREATE TABLE IF NOT EXISTS logs_sistema (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50),
    mensagem TEXT,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);