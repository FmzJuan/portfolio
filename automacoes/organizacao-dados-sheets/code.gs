// Roda ao abrir a planilha
function onOpen(e) {
  // Nome da aba onde quer rodar a verificação:
  const sheetName = "FORMULARIO"; // ajuste se necessário
  dedupeCpfKeepLatestDate(sheetName);
}

/**
 * Verifica duplicatas de CPF na aba e mantém apenas
 * a linha com a data mais recente (coluna de data determinada pelo cabeçalho).
 */
function dedupeCpfKeepLatestDate(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    SpreadsheetApp.getActiveSpreadsheet().toast(`Aba "${sheetName}" não encontrada.`, "Dedupe CPF", 5);
    return;
  }

  const dataRange = sheet.getDataRange();
  const allData = dataRange.getValues();
  if (allData.length <= 1) {
    SpreadsheetApp.getActiveSpreadsheet().toast("Planilha sem dados suficientes.", "Dedupe CPF", 3);
    return;
  }

  const headers = allData[0].map(h => String(h).trim());
  // Localiza coluna CPF
  const cpfIndex = headers.map(h => String(h).trim().toUpperCase()).indexOf("CPF");
  if (cpfIndex === -1) {
    SpreadsheetApp.getActiveSpreadsheet().toast("Coluna 'CPF' não encontrada.", "Dedupe CPF", 5);
    return;
  }

  // Localiza coluna de data: tenta vários cabeçalhos comuns
  const possibleDateHeaders = ["CARIMBO", "CARIMBO DE DATA", "CARIMBO DE DATA/HORA", "TIMESTAMP", "DATA", "DATA/HORA", "DATE", "TIMESTAMP"];
  let dateIndex = -1;
  for (let i = 0; i < headers.length; i++) {
    const h = String(headers[i]).toUpperCase();
    if (possibleDateHeaders.some(ph => h.indexOf(ph) !== -1)) {
      dateIndex = i;
      break;
    }
  }
  // Se não encontrou automaticamente, assume a primeira coluna (índice 0)
  if (dateIndex === -1) dateIndex = 0;

  // Map CPF -> { row: númeroDaLinha, date: Date, values: [...] }
  const cpfMap = new Map();
  const rowsToDelete = [];

  // Percorre linhas (i = 1 -> linha 2)
  for (let i = 1; i < allData.length; i++) {
    const rowNumber = i + 1; // 1-based
    const row = allData[i];
    let cpf = String(row[cpfIndex]).trim();
    if (!cpf) continue; // pula sem CPF

    // Pegar data da linha:
    let cellVal = row[dateIndex];
    let rowDate = null;
    if (cellVal instanceof Date) {
      rowDate = cellVal;
    } else {
      // tenta converter string/numero em Date
      // se for número (timestamp serial do Sheets) já estará como number; Date accepts number
      try {
        rowDate = new Date(cellVal);
      } catch (ex) {
        rowDate = new Date(NaN);
      }
    }
    if (!rowDate || isNaN(rowDate.getTime())) {
      // data inválida: considera muito antiga (para não ser escolhida)
      rowDate = new Date(0);
    }

    if (!cpfMap.has(cpf)) {
      cpfMap.set(cpf, { row: rowNumber, date: rowDate });
    } else {
      const existing = cpfMap.get(cpf);
      // Se a data atual for mais recente, mantemos a atual e marcamos a antiga para exclusão.
      // Caso contrário, marcamos a atual para exclusão.
      if (rowDate.getTime() >= existing.date.getTime()) {
        // nova linha é mais recente (ou igual) -> excluir antiga, manter nova
        rowsToDelete.push(existing.row);
        cpfMap.set(cpf, { row: rowNumber, date: rowDate });
      } else {
        // atual é mais antiga -> excluir atual
        rowsToDelete.push(rowNumber);
      }
    }
  }

  if (rowsToDelete.length === 0) {
    SpreadsheetApp.getActiveSpreadsheet().toast("Nenhuma duplicata de CPF encontrada.", "Ajustando CPF", 4);
    return;
  }

  // Remove duplicatas: ordenar decrescente e deletar
  rowsToDelete.sort((a, b) => b - a);
  let deleted = 0;
  for (const r of rowsToDelete) {
    try {
      sheet.deleteRow(r);
      deleted++;
    } catch (err) {
      Logger.log("Erro ao deletar linha " + r + ": " + err);
    }
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(`${deleted} linha(s) duplicada(s) removida(s).`, "Ajustando CPF", 6);
}
