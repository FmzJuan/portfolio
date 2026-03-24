const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    fetchLatestBaileysVersion 
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const pino = require("pino");
const path = require("path");
const { iniciarWorker } = require('../Chat/RissatoMotors/worker');

let botStatus = 'desconectado';

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
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "120.0.6099.129"], 
        markOnlineOnConnect: true,
    });
    iniciarWorker(sock);

    // 4. Monitora Conexão e envia para o IO (Dashboard)
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            botStatus = 'desconectado';
            qrcode.generate(qr, { small: true });
            io.emit('qr', qr); 
            io.emit('status', 'desconectado');
        }

        if (connection === 'close') {
            botStatus = 'desconectado';
            io.emit('status', 'desconectado');
            // ... (sua lógica de reconectar igual)
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            if (statusCode !== DisconnectReason.loggedOut) {
                setTimeout(() => connectToWhatsApp(onMessage), 5000);
            }
        } else if (connection === 'open') {
            botStatus = 'conectado'; // ATUALIZA STATUS
            console.log('✅ BOT ONLINE!');
            io.emit('status', 'conectado'); // AVISA O FRONT
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // 5. Escuta as mensagens
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return; // Removi o msg.key.fromMe daqui para você poder testar

        const from = msg.key.remoteJid;
        if (from.endsWith('@g.us')) return; 

        // Pega o texto da mensagem para verificar o comando
        const texto = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "").toLowerCase();

        // 🛡️ NOVA TRAVA DE AUTOTESTE:
        // Se a mensagem for minha (fromMe) mas NÃO for o comando !disparar, eu ignoro para não dar loop.
        if (msg.key.fromMe && texto !== '!disparar' && texto !== '/relatorio') return;

        // Verifica se é o Admin (Você ou a Amanda)
        // DICA: Certifique-se que o ADMIN_NUMBER no .env está APENAS os números (ex: 5511984...)
        const isAdmin = from.includes(process.env.ADMIN_NUMBER) || msg.key.fromMe;

        if (isAdmin) {
            console.log("✅ Admin/Self identificado. Executando comando...");
            await onMessage(sock, msg);
        } else {
            console.log(`👤 Lead (${from}) detectado. Apenas salvando...`);
            await onMessage(sock, msg, true); 
        }
    });

    return sock;
}
// Exportamos essa função para o index.js conseguir consultar o status a qualquer momento
function getBotStatus() {
    return botStatus;
}
module.exports = { connectToWhatsApp, getBotStatus };