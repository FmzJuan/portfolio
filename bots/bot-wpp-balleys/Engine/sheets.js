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
    const auth = new google.auth.GoogleAuth({
        keyFile: path.resolve(__dirname, '..', 'credentials.json'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SHEET_ID;

    // 1. Insere os dados na próxima linha vaga
    await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Página1!A:F',
        valueInputOption: 'RAW',
        resource: { values: [dados] },
    });

    // 2. Aplica o Visual (Preto/Branco + Bordas de Fieldset)
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
            requests: [
                {
                    // Cabeçalho: Fundo Preto, Letra Branca, Negrito, Centralizado
                    repeatCell: {
                        range: { startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 6 },
                        cell: {
                            userEnteredFormat: {
                                backgroundColor: { red: 0, green: 0, blue: 0 },
                                textFormat: { 
                                    foregroundColor: { red: 1, green: 1, blue: 1 }, 
                                    bold: true 
                                },
                                horizontalAlignment: 'CENTER'
                            }
                        },
                        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
                    }
                },
                {
                    // Bordas Externas (O efeito de contorno/fieldset)
                    updateBorders: {
                        range: { startRowIndex: 0, endRowIndex: 100, startColumnIndex: 0, endColumnIndex: 6 },
                        top: { style: 'SOLID_MEDIUM', color: { red: 0, green: 0, blue: 0 } },
                        bottom: { style: 'SOLID_MEDIUM', color: { red: 0, green: 0, blue: 0 } },
                        left: { style: 'SOLID_MEDIUM', color: { red: 0, green: 0, blue: 0 } },
                        right: { style: 'SOLID_MEDIUM', color: { red: 0, green: 0, blue: 0 } },
                        innerHorizontal: { style: 'SOLID', color: { red: 0.8, green: 0.8, blue: 0.8 } }
                    }
                }
            ]
        }
    });
}

module.exports = { salvarNoSheets };