const { google } = require('googleapis');
const path = require('path');

// 1. Configura a autenticação (O arquivo 'credentials.json' deve estar na raiz do projeto)
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../../credentials.json'), 
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * Limpa e formata o número para o padrão do Baileys
 */
function formatarNumero(celularBruto) {
    if (!celularBruto) return null;
    let numeroLimpo = celularBruto.toString().replace(/\D/g, ''); 
    
    // Verifica se já tem o código do Brasil (55), senão adiciona
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
        const spreadsheetId = process.env.SHEET_ID_CLIENTE; // ID da planilha no seu .env
        const { nome, telefone, servico = 'Oficina' } = dados;

        const values = [
            [new Date().toLocaleString(), nome, telefone, servico, 'Pendente']
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Página1!A2',
            valueInputOption: 'RAW',
            resource: { values },
        });

        console.log(`✅ [Sheets] Dados de ${nome} salvos com sucesso!`);
    } catch (error) {
        console.error("❌ Erro ao salvar no Google Sheets:", error);
    }
}

/**
 * Lê a planilha da oficina para a campanha de pós-venda
 */
async function obterClientesPosVenda() {
    try {
        // Se a planilha da Júlia for diferente da principal, você pode criar uma 
        // variável nova no .env (ex: process.env.SHEET_ID_OFICINA)
        const spreadsheetId = process.env.SHEET_ID_CLIENTE; 
        
        // Puxa os dados da coluna A até a D, ignorando o cabeçalho (linha 1)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Página1!A2:D', 
        });

        const linhas = response.data.values;
        if (!linhas || linhas.length === 0) {
            console.log('Nenhum dado encontrado na planilha.');
            return [];
        }

        let clientesParaDisparo = [];
        
        // Trava estrita de segurança exigida para os testes
        const numerosPermitidos = ['5511984878461', '5511976378041'];

        linhas.forEach(linha => {
            // Mapeando as colunas do array (A=0, B=1, C=2, D=3)
            const id_cliente = linha[0];
            const nome = linha[1];
            const celularBruto = linha[2];
            const dataCadastro = linha[3];

            if (celularBruto) {
                let numeroPronto = formatarNumero(celularBruto);
                
                // Aplica a trava de segurança antes de adicionar na fila
                if (numerosPermitidos.includes(numeroPronto)) {
                    clientesParaDisparo.push({
                        id: id_cliente,
                        nome: nome,
                        numeroJid: numeroPronto + '@s.whatsapp.net',
                        dataCadastro: dataCadastro
                    });
                }
            }
        });

        console.log(`✅ [Sheets] Encontrados ${clientesParaDisparo.length} clientes autorizados para teste.`);
        return clientesParaDisparo;

    } catch (error) {
        console.error("❌ Erro ao ler o Google Sheets:", error);
        return [];
    }
}

module.exports = { salvarNoSheets, obterClientesPosVenda };