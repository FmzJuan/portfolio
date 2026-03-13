const express = require('express');
const { google } = require('googleapis');
const app = express();

app.use(express.json());

// 1. Configuração da autenticação com o Google
const auth = new google.auth.GoogleAuth({
    keyFile: 'wordpress-sheets.json', // O arquivo que colocou na pasta
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// 2. ID da sua planilha (pegue na URL do Google Sheets)
// Exemplo: https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit
const spreadsheetId = '1JLX9Vzu20B7DES6fHuEb02_Va_CqF6JMkblsCjeppQI';

// 3. Rota receptora isolada
app.post('/receber-dados', async (req, res) => {
    const dadosDoFormulario = req.body;
    
    console.log('--- NOVOS DADOS RECEBIDOS ---');
    console.log(dadosDoFormulario);

    try {
        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: 'v4', auth: client });

        // Organiza os dados na ordem das colunas da planilha (A = Nome, B = Email, C = Mensagem)
        const valoresParaAdicionar = [
            [
                dadosDoFormulario['your-name'], 
                dadosDoFormulario['your-email'], 
                dadosDoFormulario['tel-668']
            ]
        ];

        // Comunicação com a API do Sheets para inserir a linha
        await googleSheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range: 'Página1!A:C', // Ajuste para o nome exato da sua aba na planilha (ex: Sheet1!A:C)
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: valoresParaAdicionar,
            },
        });

        console.log('Dados guardados na planilha com sucesso!');
        console.log('-----------------------------');
        res.status(200).send('Dados recebidos e processados pelo motor!');

    } catch (erro) {
        console.error('Erro ao guardar na planilha:', erro);
        res.status(500).send('Erro interno ao processar os dados.');
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor a correr e a escutar na porta ${PORT}`);
});