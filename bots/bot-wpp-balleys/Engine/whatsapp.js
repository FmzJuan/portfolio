const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    fetchLatestBaileysVersion // Adicionado para bater a versão com o WhatsApp
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const pino = require("pino");
const path = require("path");

async function connectToWhatsApp(onMessage) {
    // 1. Busca a versão mais recente do WhatsApp Web para não dar 405
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`- Usando WhatsApp Web v${version.join('.')}, isLatest: ${isLatest}`);

    const authPath = path.resolve(__dirname, '..', 'auth_info_baileys');
    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    const sock = makeWASocket({
        version, // Define a versão oficial
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        // Identidade de navegador atualizada para 2026
        browser: ["Ubuntu", "Chrome", "120.0.6099.129"], 
        markOnlineOnConnect: true,
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("✅ QR CODE GERADO! Escaneie agora:");
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            console.log(`⚠️ Conexão fechada. Status: ${statusCode}`);

            // Se for 405 ou 401, o ideal é limpar a pasta e tentar de novo
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log("🔄 Tentando reconectar em 5s...");
                setTimeout(() => connectToWhatsApp(onMessage), 5000);
            }
        } else if (connection === 'open') {
            console.log('✅ BOT ONLINE E CONECTADO COM SUCESSO!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    
    // 🛡️ A NOVA TRAVA: 
    // Verificamos se é o seu número real OU se é esse LID específico que você já sabe que é seu.
    const isAmanda = from.includes(process.env.ADMIN_NUMBER) || from === process.env.ADMIN_LID;;

    if (from.endsWith('@g.us')) return; // Ignora grupos

    if (isAmanda) {
        console.log("✅ Amanda (Admin) identificada. Respondendo...");
        onMessage(sock, msg);
    } else {
        console.log(`👤 Lead (${from}) detectado. Apenas salvando no banco...`);
        onMessage(sock, msg, true); 
    }
});

    return sock;
}

module.exports = { connectToWhatsApp };