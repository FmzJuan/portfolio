const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

const auth = new google.auth.GoogleAuth({
    // Isso garante que ele procure na raiz do projeto, subindo uma pasta a partir da Engine
    keyFile: path.resolve(__dirname, '..', 'credentials.json'), 
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function salvarNoSheets(dados) {
    try {
        const spreadsheetId = process.env.SHEET_ID; // Coloque o ID da planilha no seu .env
        const range = 'Página1!A:C'; // Nome da aba e colunas

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [dados], // Ex: [from, nome, mensagem]
            },
        });
        console.log('📊 Dados espelhados no Google Sheets!');
    } catch (error) {
        console.error('❌ Erro no Google Sheets:', error);
    }
}

module.exports = { salvarNoSheets };