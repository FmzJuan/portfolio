const fs = require("fs");
const PDFDocument = require("pdfkit");
const readline = require("readline");
const qrcode = require("qrcode-terminal");
const pino = require("pino");

// Importações do Baileys (Agora com fetchLatestBaileysVersion incluído)
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    delay,
    Browsers,
    fetchLatestBaileysVersion // <--- ADICIONADO AQUI
} = require("@whiskeysockets/baileys");

// ===============================
// Terminal para comandos manuais
// ===============================
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// ===============================
// Variável Global do Socket
// ===============================
let sock; // Necessário para enviar mensagens de fora do evento principal

// ===============================
// Mensagens principais
// ===============================
const welcomeMessage = `👋 *Bem-vindo(a) à Investur Operadora!*\nSou o assistente virtual.\n\n📋 Escolha uma opção:\n\n1️⃣ Agente de viagem\n2️⃣ Passageiro`;
const welcomeMessageContinue = `📋 Escolha uma opção:\n\n1️⃣ Agente de viagem\n2️⃣ Passageiro`;

// ===============================
// Dados e Logs
// ===============================
let contactsLog = [];

function loadContactsLog() {
    if (fs.existsSync("contactsLog.json")) {
        try {
            contactsLog = JSON.parse(fs.readFileSync("contactsLog.json", "utf-8"));
        } catch (e) {
            contactsLog = [];
        }
    }
}
loadContactsLog(); // Carrega ao iniciar

function saveContactsLog() {
    fs.writeFileSync("contactsLog.json", JSON.stringify(contactsLog, null, 2));
}

function addContactToLog(pushName, from) {
    const name = pushName || "Sem nome";
    const date = new Date().toLocaleString("pt-BR");

    if (!contactsLog.some((c) => c.from === from)) {
        contactsLog.push({ from, name, date, type: null });
        saveContactsLog();
        console.log(`📝 Novo contato adicionado: ${name} (${from})`);
    }
}

function updateContactType(from, type) {
    const user = contactsLog.find((c) => c.from === from);
    if (user) {
        user.type = type;
        saveContactsLog();
    }
}

// ===============================
// Números (Seus contatos originais)
// ===============================
const WPP_INTERNACIONAL_AGENCIA = ["5511989306941", "5511913595007"]; // Gleyce e luciana
let internationalIndex = 0;

const WPP_INTERNACIONAL_PAX = ["5511913595007"]; // Luciana
let internacionalpaxIndex = 0;

const WPP_NACIONAL_LIST = ["5511950919992"];
let nationalIndex = 0;

const WPP_JRP = "5511963810995";
const WPP_INTERNACIONAL_AGENTE = "5511997710118";

// ===============================
// Controle manual e Estados
// ===============================
let manualMode = new Map();
let userState = new Map();
let welcomeSent = new Map();
let inactivityTimers = new Map();

// ===============================
// Controle de Inatividade
// ===============================
function resetInactivityTimer(from) {
    // Limpa timers anteriores
    if (inactivityTimers.has(from)) {
        clearTimeout(inactivityTimers.get(from).timer10);
        clearTimeout(inactivityTimers.get(from).timer15);
        inactivityTimers.delete(from);
    }

    // Timer de 10 minutos
    const timer10 = setTimeout(async () => {
        try {
            if (sock) await sock.sendMessage(from, { text: "Olá, você ainda está aí? Digite *4* para voltar ao menu principal." });
        } catch (e) {
            console.error("Erro timer 10 min:", e);
        }
    }, 10 * 60 * 1000);

    // Timer de 15 minutos (Encerra)
    const timer15 = setTimeout(async () => {
        try {
            if (sock) {
                await sock.sendMessage(from, { text: "Agradecemos seu contato. Estamos à disposição!" });
                userState.delete(from);
            }
        } catch (e) {
            console.error("Erro timer 15 min:", e);
        }
    }, 15 * 60 * 1000);

    inactivityTimers.set(from, { timer10, timer15 });
}

// ===============================
// PDF (Mantido igual)
// ===============================
function generatePDFReport(callback) {
    const doc = new PDFDocument();
    const fileName = "relatorio_contatos.pdf";
    const stream = fs.createWriteStream(fileName);
    doc.pipe(stream);

    doc.fontSize(16).text("📊 Relatório de Contatos", { align: "center" });
    doc.moveDown();

    if (contactsLog.length === 0) {
        doc.fontSize(12).text("Nenhum contato registrado.");
    } else {
        contactsLog.forEach((contact, index) => {
            doc.fontSize(12).text(
                `${index + 1}. Nome: ${contact.name}\n   Número: ${contact.from}\n   Tipo: ${contact.type || "Não definido"}\n   Primeiro contato: ${contact.date}\n`
            );
            doc.moveDown();
        });
    }

    doc.end();
    stream.on("finish", () => {
        console.log(`✅ Relatório gerado: ${fileName}`);
        if (callback) callback(fileName);
    });
}

// ===============================
// Funções Auxiliares de Envio
// ===============================
async function sendWelcomeMenu(remoteJid) {
    await sock.sendMessage(remoteJid, { text: welcomeMessage });
}

async function sendContinueMenu(remoteJid) {
    await sock.sendMessage(remoteJid, { text: welcomeMessageContinue });
}

async function sendMainMenu(remoteJid, type) {
    const menuTextAgente = "📋 *Menu Agente de viagem:*\n\n1️⃣-Viagens Internacionais\n2️⃣-Viagens Nacionais\n3️⃣-Japan Rail Pass (JRP)\n4️⃣-Voltar";
    const menuTextPassageiro = "📋 *Menu Passageiro:*\n\n1️⃣-Viagens Internacionais\n2️⃣-Viagens Nacionais\n3️⃣-Japan Rail Pass (JRP)\n4️⃣-Voltar";

    await sock.sendMessage(remoteJid, { text: type === "Agente de viagem" ? menuTextAgente : menuTextPassageiro });
}

// ===============================
// CONEXÃO BAILEYS (Lógica Principal)
// ===============================
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version, isLatest } = await fetchLatestBaileysVersion(); // <--- ADICIONADO AQUI

    // Inicialização correta usando o Browsers pré-definido e a versão correta
    sock = makeWASocket({
        version, // <--- ADICIONADO AQUI
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS('Desktop'), // Isso evita que o WhatsApp bloqueie a conexão
    });

    // Eventos de Conexão
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("✅ QR RECEBIDO (Escaneie agora)");
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('⚠️ Conexão caiu. Reconectando...', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('✅ Bot iniciado e conectado com sucesso!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Evento de Recebimento de Mensagens
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];

        if (!msg.message) return;
        if (msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const pushName = msg.pushName || "Sem nome";
        
        // Extração de texto segura para Baileys
        const text = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || 
                     msg.message.imageMessage?.caption || "";

        const textLower = text.trim().toLowerCase();

        // ✅ Bloqueia STATUS e GRUPOS
        if (from === "status@broadcast" || from.endsWith("@g.us")) return;

        // --- Lógica Modo Manual ---
        if (manualMode.has(from)) {
            console.log(`[MANUAL] ${pushName}: ${text}`);
            return;
        }

        console.log(`📩 ${pushName} (${from}): ${text}`);

        addContactToLog(pushName, from);
        resetInactivityTimer(from);

        // --- Comando Relatório ---
        if (textLower === "relatorio") {
            generatePDFReport(async (fileName) => {
                await sock.sendMessage(from, { text: "📑 Aqui está seu relatório." });
                // Envia o PDF
                await sock.sendMessage(from, { 
                    document: fs.readFileSync(fileName), 
                    mimetype: 'application/pdf', 
                    fileName: fileName
                });
            });
            return;
        }

        // --- Fluxo de Boas Vindas ---
        if (!welcomeSent.has(from)) {
            welcomeSent.set(from, true);
            userState.set(from, { stage: 1 });
            return sendWelcomeMenu(from);
        }

        if (text.trim() === "4" || textLower === "voltar") {
            userState.set(from, { stage: 1 });
            return sendWelcomeMenu(from);
        }

        const state = userState.get(from) || { stage: 1 };

        // ================== ESTÁGIO 1 ==================
        if (state.stage === 1) {
            if (text.trim() === "1") {
                updateContactType(from, "Agente de viagem");
                userState.set(from, { stage: 2, type: "Agente de viagem" });
                return sendMainMenu(from, "Agente de viagem");
            }
            if (text.trim() === "2") {
                updateContactType(from, "Passageiro");
                userState.set(from, { stage: 2, type: "Passageiro" });
                return sendMainMenu(from, "Passageiro");
            }
            
            // Só responde "Opção inválida" se for texto (evita responder stickers/áudios com erro)
            if(text) {
                return sock.sendMessage(from, { text: "Opção inválida. Escolha:\n1️⃣ Agente de viagem\n2️⃣ Passageiro" });
            }
            return;
        }

        // ================== ESTÁGIO 2 ==================
        if (state.stage === 2) {
            let resposta = "";
            const option = text.trim();

            switch (option) {
                case "1":
                    if (state.type === "Agente de viagem") {
                        resposta = `🔸 Atendimento Internacional (Agente)\nhttps://wa.me/${WPP_INTERNACIONAL_AGENCIA[internationalIndex]}`;
                        internationalIndex = (internationalIndex + 1) % WPP_INTERNACIONAL_AGENCIA.length;
                    } else {
                        resposta = `🔸 Atendimento Internacional (Passageiro)\nhttps://wa.me/${WPP_INTERNACIONAL_PAX[internacionalpaxIndex]}`;
                        internacionalpaxIndex = (internacionalpaxIndex + 1) % WPP_INTERNACIONAL_PAX.length;
                    }
                    break;

                case "2":
                    resposta = `🔸 Atendimento Nacional\nhttps://wa.me/${WPP_NACIONAL_LIST[nationalIndex]}`;
                    nationalIndex = (nationalIndex + 1) % WPP_NACIONAL_LIST.length;
                    break;

                case "3":
                    resposta = `🔸 Atendimento Japan Rail Pass (JRP)\nhttps://wa.me/${WPP_JRP}`;
                    break;

                default:
                    if(text) return sock.sendMessage(from, { text: "Opção inválida. Tente novamente." });
                    return;
            }

            await sock.sendMessage(from, { text: resposta });
            userState.set(from, { stage: 1 });
            
            await delay(1000); // Pequena pausa
            await sock.sendMessage(from, { text: "Se precisar de mais alguma coisa, basta escolher uma opção abaixo." });
            return sendContinueMenu(from);
        }
    });
}

// ===============================
// COMANDOS NO TERMINAL
// ===============================
rl.on("line", async (input) => {
    const command = input.trim();

    // Função para ajustar numero para formato do Baileys
    const formatJid = (num) => {
        num = num.replace(/\D/g, ''); 
        return num.includes('@') ? num : `${num}@s.whatsapp.net`;
    };

    if (command.startsWith("/boasvindas ")) {
        const numero = command.replace("/boasvindas ", "").trim();
        const destinatario = formatJid(numero);
        
        if (sock) {
            userState.set(destinatario, { stage: 1 });
            await sendWelcomeMenu(destinatario);
            console.log(`Mensagem de boas vindas enviada para ${destinatario}`);
        } else {
            console.log("Bot desconectado.");
        }
    }

    else if (command === "/relatorio") {
        generatePDFReport();
    }

    else if (command.startsWith("/manual ")) {
        const numero = command.replace("/manual ", "").trim();
        const destinatario = formatJid(numero);

        if (manualMode.has(destinatario)) {
            console.log("⚠️ Já está em modo manual.");
        } else {
            const timeoutId = setTimeout(() => manualMode.delete(destinatario), 4 * 60 * 60 * 1000);
            manualMode.set(destinatario, { timeoutId, expires: Date.now() + 4 * 60 * 60 * 1000 });
            console.log(`✅ Modo manual ativado para: ${destinatario}`);
        }
    }

    else if (command === "/manual-list") {
        console.log("--- Lista Modo Manual ---");
        manualMode.forEach((info, numero) => {
            const restante = Math.max(0, info.expires - Date.now());
            console.log(`- ${numero.split('@')[0]} (expira em ~${Math.ceil(restante / 60000)} min)`);
        });
    }

    else if (command.startsWith("/manual-desative ")) {
        const numero = command.replace("/manual-desative ", "").trim();
        const dest = formatJid(numero);

        if (manualMode.has(dest)) {
            clearTimeout(manualMode.get(dest).timeoutId);
            manualMode.delete(dest);
            console.log("✅ Modo manual desativado.");
        } else {
            console.log("⚠️ Esse número não está em modo manual.");
        }
    }

    rl.prompt();
});

// Inicializa o Bot
connectToWhatsApp();