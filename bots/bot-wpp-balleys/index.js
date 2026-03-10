const { connectToWhatsApp } = require('./Engine/whatsapp');
const { query } = require('./DataBase/conection');
const { salvarNoSheets } = require('./Engine/sheets.js');

async function start() {
    console.log("🚀 Ligando o motor, preparando banco e planilhas...");

    // O onMessage agora recebe o terceiro parâmetro: onlySave
    await connectToWhatsApp(async (sock, msg, onlySave = false) => {
        const from = msg.key.remoteJid;
        const nome = msg.pushName || "Cliente";
        
        try {
            // 1. SEMPRE SALVA NO BANCO (Postgres)
            await query(
                `INSERT INTO contatos (numero, nome) 
                 VALUES ($1, $2) 
                 ON CONFLICT (numero) DO UPDATE SET ultima_interacao = CURRENT_TIMESTAMP`,
                [from, nome]
            );

            // 2. SEMPRE SALVA NA PLANILHA (Google Sheets)
            // Formato: [Número, Nome, Data/Hora]
            await salvarNoSheets([from, nome, new Date().toLocaleString()]);

            // 3. LOGICA DE RESPOSTA
            if (onlySave) {
                console.log(`👤 Lead ${nome} (${from}) salvo silenciosamente.`);
                return; // Para aqui, não envia mensagem
            }

            // Se chegou aqui, é porque a trava deixou passar (é você!)
            await sock.sendMessage(from, { 
                text: `Olá ${nome}! Seu cadastro foi atualizado no nosso banco e no Google Sheets. Como posso ajudar?` 
            });
            
            console.log(`✉️ Resposta enviada para admin: ${from}`);

        } catch (err) {
            console.error("❌ Erro ao processar fluxo:", err);
        }
    });
}

start();