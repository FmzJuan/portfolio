const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

async function testConnection() {
    console.log("Iniciando teste de conexão puro...");

    // Busca a versão mais recente do WhatsApp Web automaticamente
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`📡 Usando a versão do WhatsApp Web: v${version.join('.')}`);

    const { state, saveCreds } = await useMultiFileAuthState('auth_teste_baileys');

    const sock = makeWASocket({
        version, // <-- Essa é a linha que resolve o Erro 405
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }), // Deixei silencioso de novo para o QR Code ficar limpo
        browser: Browsers.macOS('Desktop')
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("\n⚠️ ESCANEIE O QR CODE ABAIXO ⚠️");
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const error = lastDisconnect?.error;
            const statusCode = error?.output?.statusCode;
            
            console.log("\n❌ A CONEXÃO CAIU!");
            console.log("➡️ Status Code:", statusCode);
            console.log("➡️ Erro completo:", error?.message);

            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            if (shouldReconnect) {
                console.log("Tentando reconectar em 5 segundos...\n");
                setTimeout(testConnection, 5000);
            } else {
                console.log("Você foi desconectado do aparelho. Apague a pasta 'auth_teste_baileys' e tente de novo.");
            }
        } else if (connection === 'open') {
            console.log("\n✅ CONECTADO COM SUCESSO! O Baileys está funcionando sem erro 405.");
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

testConnection();