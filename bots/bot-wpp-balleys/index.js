require('dotenv').config();
const { connectToWhatsApp } = require('./Engine/whatsapp');
const { query } = require('./DataBase/conection');
const { salvarNoSheets } = require('./Engine/sheets.js');
const { gerarRelatorioPDF } = require('./Engine/report.js');
const fs = require('fs');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configurações da Dashboard
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({ 
    secret: 'charlie-secret', 
    resave: false, 
    saveUninitialized: true 
}));

// Exportamos o 'io' ANTES de iniciar o bot para o whatsapp.js conseguir usar
module.exports = { io };

// Rota de Login
app.get('/login', (req, res) => res.render('login'));
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Sugestão: Use variáveis de ambiente para LOGIN e SENHA futuramente
    if (username === 'admin' && password === '123') { 
        req.session.logged = true;
        return res.redirect('/');
    }
    res.redirect('/login');
});

// Rota Principal (Dashboard)
app.get('/', (req, res) => {
    if (!req.session.logged) return res.redirect('/login');
    res.render('index', { 
        sheetLink: `https://docs.google.com/spreadsheets/d/${process.env.SHEET_ID}` 
    });
});

// Função Principal do Bot
async function start() {
    console.log("🚀 Ligando o motor, preparando banco e planilhas...");

    await connectToWhatsApp(async (sock, msg, onlySave = false) => {
        const from = msg.key.remoteJid;
        const nome = msg.pushName || "Cliente";
        const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

        // --- PREPARAÇÃO DOS DADOS ---
        const numeroLimpo = from.replace(/\D/g, ''); 
        const linkWhatsapp = `https://wa.me/${numeroLimpo}`;
        const dataHora = new Date().toLocaleString('pt-BR');

        try {
            // 1. SALVA NO BANCO (Postgres)
            await query(
                `INSERT INTO contatos (numero, nome) 
                 VALUES ($1, $2) 
                 ON CONFLICT (numero) DO UPDATE SET ultima_interacao = CURRENT_TIMESTAMP`,
                [from, nome]
            );

            // 2. SALVA NA PLANILHA (Google Sheets)
            const dadosParaPlanilha = [
                dataHora,      
                nome,          
                numeroLimpo,   
                linkWhatsapp,  
                "Lead Novo",   
                from           
            ];
            await salvarNoSheets(dadosParaPlanilha);
            console.log(`✅ Dados de ${nome} sincronizados (DB + Sheets)`);

            // 3. COMANDO DE RELATÓRIO
            if (!onlySave && texto.toLowerCase() === '/relatorio') {
                await sock.sendMessage(from, { text: "⏳ Gerando seu relatório PDF..." });
                try {
                    const { filePath } = await gerarRelatorioPDF();
                    await sock.sendMessage(from, { 
                        document: fs.readFileSync(filePath), 
                        fileName: 'Relatorio_Leads.pdf', 
                        mimetype: 'application/pdf' 
                    });
                    fs.unlinkSync(filePath); 
                } catch (error) {
                    console.error("Erro PDF:", error);
                }
                return; 
            }

            // 4. LÓGICA DE RESPOSTA
            if (onlySave) {
                console.log(`👤 Lead ${nome} (${from}) salvo.`);
                return; 
            }

            await sock.sendMessage(from, { 
                text: `Olá ${nome}! O sistema está online. Use */relatorio* para baixar a lista.` 
            });

        } catch (err) {
            console.error("❌ Erro no fluxo:", err);
        }
    });
}

// Inicia o Servidor e o Bot
server.listen(3000, () => {
    console.log("🌐 Dashboard rodando em http://localhost:3000");
    start(); 
});