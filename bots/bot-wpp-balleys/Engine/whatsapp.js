const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    fetchLatestBaileysVersion 
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const pino = require("pino");
const path = require("path");

async function connectToWhatsApp(onMessage) {
    // 1. Importa o socket da Dashboard (index.js)
    const { io } = require('../index'); 

    // 2. Busca a versão mais recente
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`- Usando WhatsApp Web v${version.join('.')}, isLatest: ${isLatest}`);

    const authPath = path.resolve(__dirname, '..', 'auth_info_baileys');
    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    // 3. Cria a instância do Bot
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false, // Vamos imprimir manualmente abaixo
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "120.0.6099.129"], 
        markOnlineOnConnect: true,
    });

    // 4. Monitora Conexão e envia para o IO (Dashboard)
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("✅ QR CODE GERADO! Escaneie agora:");
            qrcode.generate(qr, { small: true });
            
            // MANDA PARA A TELA (Dashboard)
            io.emit('qr', qr); 
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            console.log(`⚠️ Conexão fechada. Status: ${statusCode}`);
            io.emit('status', 'desconectado');

            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log("🔄 Tentando reconectar em 5s...");
                setTimeout(() => connectToWhatsApp(onMessage), 5000);
            }
        } else if (connection === 'open') {
            console.log('✅ BOT ONLINE E CONECTADO COM SUCESSO!');
            io.emit('status', 'conectado'); // AVISA A TELA QUE FICOU VERDE
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // 5. Escuta as mensagens
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        if (from.endsWith('@g.us')) return; 

        // 🛡️ TRAVA: Admin vs Lead
        const isAmanda = from.includes(process.env.ADMIN_NUMBER) || from === process.env.ADMIN_LID;

        if (isAmanda) {
            console.log("✅ Admin identificado. Respondendo...");
            onMessage(sock, msg);
        } else {
            console.log(`👤 Lead (${from}) detectado. Apenas salvando...`);
            onMessage(sock, msg, true); 
        }
    });

    return sock;
}

module.exports = { connectToWhatsApp };