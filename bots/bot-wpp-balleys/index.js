const { connectToWhatsApp } = require('./Engine/whatsapp');
const { query } = require('./DataBase/conection'); // Ajuste o nome do arquivo se necessário

async function start() {
    console.log("🚀 Ligando o motor e preparando o banco...");

    await connectToWhatsApp(async (sock, msg) => {
    const from = msg.key.remoteJid;
    const nome = msg.pushName || "Cliente";
    const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

    try {
        // 1. SALVA NO BANCO (Você já confirmou que isso está funcionando!)
        await query(
            `INSERT INTO contatos (numero, nome) 
             VALUES ($1, $2) 
             ON CONFLICT (numero) DO UPDATE SET ultima_interacao = CURRENT_TIMESTAMP`,
            [from, nome]
        );

        // 2. ENVIA A RESPOSTA (O que estava faltando)
        await sock.sendMessage(from, { 
            text: `Olá ${nome}! seu cadastro foi atualizado no nosso banco. Como posso ajudar?` 
        });
        
        console.log(`✉️ Resposta enviada para ${from}`);

    } catch (err) {
        console.error("❌ Erro ao processar/responder:", err);
    }
});
}

start();