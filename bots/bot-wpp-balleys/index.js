require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');

// Importações de Motores e Funções
const { connectToWhatsApp, getBotStatus } = require('./Engine/whatsapp'); // Adicione o getBotStatus aquiconst { salvarNoSheets, processarCampanhaPosVenda } = require('./Functions/googleSheets');
const { query } = require('./DataBase/conection');
const { gerarRelatorioPDF } = require('./Engine/report.js');
const fluxoOficina = require('./Chat/RissatoMotors/fluxo');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const cron = require('node-cron');
const { extrairDadosDoERP } = require('./Chat/RissatoMotors/erpSync');
const { 
    salvarNoSheets, 
    processarCampanhaPosVenda 
} = require('./Functions/googleSheets');

// Agenda para rodar todo dia às 18:00
cron.schedule('0 18 * * *', () => {
    console.log("⏰ Iniciando sincronização diária com o ERP da Rissato Motors...");
    extrairDadosDoERP();
}, {
    timezone: "America/Sao_Paulo"
});

// Variável global para rastrear o status da conexão
let botConectado = false;

// Exportamos o 'io' para o whatsapp.js conseguir usar (QR Code, Status)
module.exports = { io };

// --- CONFIGURAÇÕES DA DASHBOARD ---
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ 
    secret: process.env.SESSION_SECRET || 'secret_flow', 
    resave: false, 
    saveUninitialized: true 
}));

// --- LÓGICA DE SINCRONIZAÇÃO INSTANTÂNEA ---
io.on('connection', (socket) => {
    // Agora o servidor pergunta diretamente para a Engine: "Qual o status agora?"
    const statusAtual = getBotStatus();
    socket.emit('status', statusAtual);
    
    console.log(`📊 Dashboard conectado. Status atual enviado: ${statusAtual}`);
});

// --- ROTAS DE AUTENTICAÇÃO ---
app.get('/login', (req, res) => res.render('login'));

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.PANEL_USER && password === process.env.PANEL_PASS) { 
        req.session.logged = true;
        return res.redirect('/');
    }
    res.redirect('/login');
});

// --- ROTAS DO PAINEL ---
// Importa o controlador da Rissato Motors
const rissatoApi = require('./Chat/RissatoMotors/api');

app.get('/', (req, res) => {
    if (!req.session.logged) return res.redirect('/login');
    res.render('index', { 
        sheetLink: `https://docs.google.com/spreadsheets/d/${process.env.SHEET_ID}`,
        nomeCliente: process.env.CLIENTE_NOME || 'LeadsFlow',
        nomeEmpresa: process.env.NOME_EMPRESA || "Empresa default"
    });
});

// Download do PDF direto pela Web
app.get('/api/relatorio/pdf', async (req, res) => {
    if (!req.session.logged) return res.status(401).send("Não autorizado");
    try {
        const { filePath } = await gerarRelatorioPDF();
        res.download(filePath, 'Relatorio_LeadsFlow.pdf', (err) => {
            if (!err) {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath); 
            }
        });
    } catch (error) {
        console.error("Erro ao gerar PDF via Web:", error);
        res.status(500).send("Erro ao gerar relatório.");
    }
});

// --- WEBHOOKS DE INTEGRAÇÃO (ERP) ---
app.post('/api/webhook/rissatomotors', (req, res) => {
    // 🛡️ Segurança: O ERP precisa enviar um Token Secreto no Header
    const token = req.headers['authorization'];
    // Verifica se o token bate com o do .env
    if (token !== `Bearer ${process.env.RISSATO_API_TOKEN}`) {
        console.log("⚠️ [Segurança] Tentativa de acesso bloqueada na API Rissato.");
        return res.status(403).json({ error: "Acesso Negado. Token inválido." });
    }

    // Se a senha estiver correta, passa a bola para a pasta do cliente
    rissatoApi.receberDadosERP(req, res);
});

// API para finalizar serviço manual via Dashboard
app.post('/api/finalizar-servico', async (req, res) => {
    try {
        const { nome, telefone } = req.body;
        const { agendarMensagens } = require('./Chat/RissatoMotors/scheduler');
        
        await agendarMensagens({
            nome: nome,
            telefone: telefone,
            dataSaida: new Date().toLocaleDateString()
        });

        res.json({ success: true, message: "Agendado no sistema com sucesso!" });
    } catch (error) {
        console.error("Erro na API de agendamento:", error);
        res.status(500).json({ success: false, error: "Erro ao agendar" });
    }
});

// --- FUNÇÃO PRINCIPAL DO BOT ---
async function start() {
    console.log("🚀 LeadsFlow: Ligando o motor e sincronizando dados...");
    
    // Iniciamos a conexão e passamos um callback para tratar as mensagens
    await connectToWhatsApp(async (sock, msg, onlySave = false) => {
        
        // Atualiza a variável global baseada no estado do socket
        // (Isso ajuda o io.on('connection') lá em cima a saber o status)
        botConectado = true; 

        const from = msg.key.remoteJid;
        const nome = msg.pushName || "Cliente";
        const texto = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "").toLowerCase();

        // 1. GATILHO DO MÓDULO OFICINA
        if (process.env.TIPO_SERVICO === 'oficina') {
            await fluxoOficina.executar(sock, msg);
            if (!texto.startsWith('!')) return; 
        }

        // 2. COMANDOS DE ADMINISTRADOR
        if (texto === '!disparar') {
            io.emit('new-log', { msg: `⚡ Comando !disparar recebido de ${nome}`, type: 'success' });
            await sock.sendMessage(from, { text: "⏳ Iniciando processamento da lista de pós-venda..." });
            await processarCampanhaPosVenda(sock); 
            io.emit('new-log', { msg: `✅ Campanha de pós-venda finalizada.`, type: 'success' });
            return;
        }

        if (texto === '/relatorio') {
            io.emit('new-log', { msg: `📄 Gerando PDF para o admin ${nome}...` });
            await sock.sendMessage(from, { text: "⏳ Gerando seu relatório PDF..." });
            try {
                const { filePath } = await gerarRelatorioPDF();
                await sock.sendMessage(from, { 
                    document: fs.readFileSync(filePath), 
                    fileName: 'Relatorio_Leads.pdf', 
                    mimetype: 'application/pdf' 
                });
                fs.unlinkSync(filePath); 
                io.emit('new-log', { msg: `✅ Relatório enviado com sucesso via WhatsApp.`, type: 'success' });
            } catch (error) {
                console.error("Erro PDF via comando:", error);
                io.emit('new-log', { msg: `❌ Erro ao gerar PDF: ${error.message}` });
            }
            return; 
        }

        // 3. SALVAMENTO AUTOMÁTICO DE LEADS
        const numeroLimpo = from.replace(/\D/g, ''); 
        const dataHora = new Date().toLocaleString('pt-BR');

        try {
            io.emit('new-log', { msg: `👤 Novo lead detectado: ${nome} (${numeroLimpo})` });

            await query(
                `INSERT INTO contatos (numero, nome) 
                 VALUES ($1, $2) 
                 ON CONFLICT (numero) DO UPDATE SET ultima_interacao = CURRENT_TIMESTAMP`,
                [from, nome]
            );

            const dadosParaPlanilha = [dataHora, nome, numeroLimpo, `https://wa.me/${numeroLimpo}`, "Lead Novo", from];
            await salvarNoSheets(dadosParaPlanilha);
            
            io.emit('new-log', { msg: `📊 Lead ${nome} sincronizado com Google Sheets.`, type: 'success' });

            if (!onlySave && texto !== '!disparar') {
                await sock.sendMessage(from, { 
                    text: `Olá ${nome}! O sistema LeadsFlow está ativo. Digite */relatorio* para extrair os dados.` 
                });
            }
        } catch (err) {
            console.error("❌ Erro no processamento de lead:", err);
            io.emit('new-log', { msg: `❌ Erro ao processar lead: ${err.message}` });
        }
    });
}

// Inicia o Servidor
server.listen(3000, () => {
    console.log("🌐 Painel LeadsFlow: http://localhost:3000");
    start(); 
});