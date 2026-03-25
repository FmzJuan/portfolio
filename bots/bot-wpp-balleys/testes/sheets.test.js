const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

describe('Teste de Integração Google Sheets', () => {
    test('Deve conseguir localizar e carregar as credenciais do Google', async () => {
        // Resolve o caminho absoluto para o arquivo na raiz do bot
        const credentialsPath = path.join(__dirname, '../credentials.json');
        
        // Verifica se o arquivo físico existe
        const existeArquivo = fs.existsSync(credentialsPath);
        expect(existeArquivo).toBe(true);

        const auth = new google.auth.GoogleAuth({
            keyFile: credentialsPath,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const client = await auth.getClient();
        expect(client).toBeDefined();
    });
});