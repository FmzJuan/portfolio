async function lerPlanilhaClientes() {
    const spreadsheetId = process.env.SHEET_ID_CLIENTE; // ID da planilha da oficina
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Página1!A2:E', // Pega da linha 2 em diante (pulando o cabeçalho)
    });
    return response.data.values; // Retorna a lista de clientes para o scheduler processar
}