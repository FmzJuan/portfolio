const { google } = require('googleapis');
const path = require('path');

// 1. Configura a autenticação
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../credentials.json'), 
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const MODO_SIMULACAO = true; // Mude para false quando quiser enviar de verdade

/**
 * Função Auxiliar para Log de Simulação
 */
function logSimulacao(cliente, mensagem) {
    console.log("-----------------------------------------");
    console.log(`[SIMULAÇÃO DE ENVIO]`);
    console.log(`PARA: ${cliente.nome} (${cliente.numeroJid})`);
    console.log(`DATA CADASTRO: ${cliente.dataCadastro}`);
    console.log(`MENSAGEM: "${mensagem}"`);
    console.log("-----------------------------------------");
}

/**
 * Executa a campanha de pós-venda
 */
async function processarCampanhaPosVenda(sock) { 
    // CORREÇÃO 1: Você precisa buscar os clientes antes de iniciar o loop
    const clientes = await obterClientesPosVenda();

    if (clientes.length === 0) {
        console.log("⚠️ Nenhum cliente autorizado encontrado para disparo.");
        return;
    }
    
    for (const cliente of clientes) {
        const mensagem = `Olá ${cliente.nome}, tudo bem? Aqui é da oficina. Notamos que seu último serviço foi em ${cliente.dataCadastro}. Gostaria de agendar uma revisão?`;

        if (MODO_SIMULACAO) {
            // CORREÇÃO 2: Agora a função logSimulacao existe acima
            logSimulacao(cliente, mensagem);
        } else {
            // Envio real pelo Baileys
            await sock.sendMessage(cliente.numeroJid, { text: mensagem });
            
            // Delay anti-ban (30 segundos)
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
    }
    
    if (MODO_SIMULACAO) {
        console.log(`\n✅ Simulação concluída! ${clientes.length} mensagens processadas no log.`);
    } else {
        console.log(`\n✅ Envio real concluído para ${clientes.length} clientes.`);
    }
}

/**
 * Limpa e formata o número para o padrão do Baileys
 */
function formatarNumero(celularBruto) {
    if (!celularBruto) return null;
    let numeroLimpo = celularBruto.toString().replace(/\D/g, ''); 
    
    if (numeroLimpo.length >= 12 && numeroLimpo.startsWith('55')) {
        return numeroLimpo;
    } else {
        return '55' + numeroLimpo;
    }
}

/**
 * Salva os dados do cliente na planilha
 */
async function salvarNoSheets(dados) {
    try {
        const spreadsheetId = process.env.SHEET_ID;
        
        // Verifica se o ID foi carregado do .env
        if (!spreadsheetId) {
            console.error("❌ ERRO: SHEET_ID não definido no .env");
            return;
        }

        let values;
        if (Array.isArray(dados)) {
            values = [dados];
        } else {
            const { nome, telefone, servico = 'Oficina' } = dados;
            values = [[new Date().toLocaleString(), nome, telefone, servico, 'Pendente']];
        }

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Página1!A2', // Nome da aba de logs automáticos
            valueInputOption: 'RAW',
            resource: { values },
        });

        console.log(`✅ [Sheets] Lead registrado na Página1.`);
    } catch (error) {
        console.error("❌ Erro ao salvar no Google Sheets:", error.message);
    }
}

/**
 * Lê a planilha para a campanha de pós-venda
 */
async function obterClientesPosVenda() {
    try {
        const spreadsheetId = process.env.SHEET_ID;
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Clientes!A2:D', // MUDANÇA AQUI: Apontando para a aba do ERP
        });

        const linhas = response.data.values;
        if (!linhas || linhas.length === 0) {
            console.log("⚠️ Aba 'Clientes' está vazia.");
            return [];
        }

        let clientesParaDisparo = [];
        const numerosPermitidos = ['5511984878461', '5511976378041']; // Seus números de teste

        linhas.forEach(linha => {
            const nome = linha[1];
            const celularBruto = linha[2];
            const dataCadastro = linha[3];

            if (celularBruto) {
                let numeroPronto = formatarNumero(celularBruto);
                if (numerosPermitidos.includes(numeroPronto)) {
                    clientesParaDisparo.push({
                        nome: nome,
                        numeroJid: numeroPronto + '@s.whatsapp.net',
                        dataCadastro: dataCadastro
                    });
                }
            }
        });

        console.log(`✅ [Sheets] ${clientesParaDisparo.length} clientes prontos para simulação.`);
        return clientesParaDisparo;
    } catch (error) {
        console.error("❌ Erro ao ler aba Clientes:", error.message);
        return [];
    }
}

module.exports = { salvarNoSheets, obterClientesPosVenda, processarCampanhaPosVenda };