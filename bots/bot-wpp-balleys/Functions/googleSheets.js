const { google } = require('googleapis');
const path = require('path');

// 1. Configura a autenticação (O arquivo 'credentials.json' deve estar na raiz do projeto)
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, '../../credentials.json'), 
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

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

// ... sua função lerPlanilhaClientes ...

module.exports = { salvarNoSheets };