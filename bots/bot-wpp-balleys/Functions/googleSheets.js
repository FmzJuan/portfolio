const { google } = require('googleapis');
const path = require('path');

// 1. Configura a autenticação
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../credentials.json'), 
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// PUXA O MODO DE SIMULAÇÃO DO .ENV (Se não existir, por segurança assume como true)
const MODO_SIMULACAO = process.env.MODO_SIMULACAO !== 'false'; 

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
    const clientes = await obterClientesPosVenda();

    if (clientes.length === 0) {
        console.log("⚠️ Nenhum cliente autorizado encontrado para disparo.");
        return;
    }
    
    for (const cliente of clientes) {
        const mensagem = `Olá ${cliente.nome}, tudo bem? Aqui é da oficina. Notamos que seu último serviço foi em ${cliente.dataCadastro}. Gostaria de agendar uma revisão?`;

        if (MODO_SIMULACAO) {
            logSimulacao(cliente, mensagem);
        } else {
            console.log(`🚀 [DISPARO REAL] Enviando para: ${cliente.nome} (${cliente.numeroJid})`);
            
            // Envio real pelo Baileys
            await sock.sendMessage(cliente.numeroJid, { text: mensagem });
            
            // Delay anti-ban (30 segundos entre cada mensagem real)
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
            range: 'Página1!A2', 
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
            range: 'Clientes!A2:D', 
        });

        const linhas = response.data.values;
        if (!linhas || linhas.length === 0) {
            console.log("⚠️ Aba 'Clientes' está vazia.");
            return [];
        }

        let clientesParaDisparo = [];
        
        // PUXA OS NÚMEROS DO .ENV E CRIA UM ARRAY
        const numerosPermitidosString = process.env.NUMEROS_PERMITIDOS || '';
        const numerosPermitidos = numerosPermitidosString
            .split(',')
            .map(num => num.trim())
            .filter(num => num.length > 0); // Remove vazios

        const travaAtiva = numerosPermitidos.length > 0;

        linhas.forEach(linha => {
            const nome = linha[1] || 'Cliente';
            const celularBruto = linha[2];
            const dataCadastro = linha[3] || 'recentemente';

            if (celularBruto) {
                let numeroPronto = formatarNumero(celularBruto);
                
                // Se a trava estiver desativada OU o número estiver na whitelist
                if (!travaAtiva || numerosPermitidos.includes(numeroPronto)) {
                    clientesParaDisparo.push({
                        nome: nome,
                        numeroJid: numeroPronto + '@s.whatsapp.net',
                        dataCadastro: dataCadastro
                    });
                } else {
                    console.log(`[Segurança] Bloqueado: ${nome} (${numeroPronto}) não está na whitelist.`);
                }
            }
        });

        const statusModo = MODO_SIMULACAO ? 'SIMULAÇÃO' : 'DISPARO REAL';
        console.log(`✅ [Sheets] ${clientesParaDisparo.length} clientes carregados. MODO: ${statusModo}.`);
        
        return clientesParaDisparo;
    } catch (error) {
        console.error("❌ Erro ao ler aba Clientes:", error.message);
        return [];
    }
}
/**
 * Salva o CSV inteiro e bruto na aba "Dados_ERP"
 */
async function salvarDadosBrutosERP(cabecalho, linhas) {
    try {
        const spreadsheetId = process.env.SHEET_ID;
        
        // 1. Limpa os dados velhos da aba Dados_ERP
        await sheets.spreadsheets.values.clear({ 
            spreadsheetId, 
            range: 'Dados_ERP!A:ZZ' 
        });

        // 2. Monta a tabela (Cabeçalho na primeira linha, dados nas outras)
        const values = [cabecalho, ...linhas];

        // 3. Cola os dados novos
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Dados_ERP!A1',
            valueInputOption: 'USER_ENTERED',
            resource: { values },
        });

        console.log(`✅ [Sheets] Dados brutos (${linhas.length} linhas) atualizados na aba Dados_ERP.`);
    } catch (error) {
        console.error("❌ Erro ao salvar dados brutos no Sheets:", error.message);
    }
}

/**
 * Envia os dados filtrados para a aba "Clientes"
 */
async function atualizarAbaClientes(dadosLimpos) {
    try {
        const spreadsheetId = process.env.SHEET_ID;
        
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Clientes!A2', 
            valueInputOption: 'USER_ENTERED',
            resource: { values: dadosLimpos },
        });

        console.log(`✅ [Sheets] ${dadosLimpos.length} clientes limpos adicionados à aba Clientes.`);
    } catch (error) {
        console.error("❌ Erro ao salvar clientes no Sheets:", error.message);
    }
}


module.exports = { 
    salvarNoSheets, 
    obterClientesPosVenda, 
    processarCampanhaPosVenda,
    salvarDadosBrutosERP, // <-- Adicionado
    atualizarAbaClientes  // <-- Adicionado
};