function preencherDatasIntermediarias() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("FORMULARIO");

  // Identifica coluna do carimbo
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const dateIndex = headers.map(h => String(h).trim().toUpperCase()).indexOf("CARIMBO DE DATA/HORA");

  if (dateIndex === -1) throw new Error("Coluna 'Carimbo de data/hora' não encontrada.");

  let data = sheet.getDataRange().getValues();

  function linhaTemConteudo(row, ignoreIndex) {
    return row.some((valor, idx) => idx !== ignoreIndex && valor !== "" && valor !== null);
  }

  for (let i = 1; i < data.length; i++) {
    // Se não tem data, MAS a linha tem outros valores preenchidos → deve gerar data
    if (!data[i][dateIndex] && linhaTemConteudo(data[i], dateIndex)) {
      let nextRow = i + 1;

      // Procura a próxima linha que tem data
      while (nextRow < data.length && !data[nextRow][dateIndex]) {
        nextRow++;
      }

      const previousHasDate = i > 0 && data[i - 1][dateIndex];
      const nextHasDate = nextRow < data.length && data[nextRow][dateIndex];

      // 🟢 CASO 1: Não existe data antes nem depois → usa data e hora atuais
      if (!previousHasDate && !nextHasDate) {
        const now = new Date();
        sheet.getRange(i + 1, dateIndex + 1).setValue(now);
        continue;
      }

      // 🟡 CASO 2: Existe apenas data anterior → usa anterior + 1 minuto
      if (previousHasDate && !nextHasDate) {
        const previousDate = new Date(data[i - 1][dateIndex]);
        const newDate = new Date(previousDate.getTime() + 60000);
        sheet.getRange(i + 1, dateIndex + 1).setValue(newDate);
        continue;
      }

      // 🟡 CASO 3: Existe apenas data posterior → usa posterior - 1 minuto
      if (!previousHasDate && nextHasDate) {
        const nextDate = new Date(data[nextRow][dateIndex]);
        const newDate = new Date(nextDate.getTime() - 60000);
        sheet.getRange(i + 1, dateIndex + 1).setValue(newDate);
        continue;
      }

      // 🟢 CASO 4: Existe data antes e depois → interpolar
      const previousDate = new Date(data[i - 1][dateIndex]);
      const nextDate = new Date(data[nextRow][dateIndex]);
      const emptyCount = nextRow - i;
      const timeDiff = (nextDate - previousDate) / (emptyCount + 1);

      for (let j = 1; j <= emptyCount; j++) {
        const newDate = new Date(previousDate.getTime() + timeDiff * j);
        sheet.getRange(i + j, dateIndex + 1).setValue(newDate);
      }

      i = nextRow;
    }
  }

  SpreadsheetApp.flush();
  Logger.log("✅ Datas foram atribuídas corretamente às linhas com conteúdo!");
}
