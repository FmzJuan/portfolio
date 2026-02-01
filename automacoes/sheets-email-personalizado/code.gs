/**
 * Função principal que abre a janela na planilha.
 */
function abrirDialogo() {
  var html = HtmlService.createHtmlOutputFromFile('Janela')
      .setWidth(400) 
      .setHeight(460);
  SpreadsheetApp.getUi().showModalDialog(html, 'Enviar Cotação');
}

/**
 * Função adaptada para o novo arquivo de controle de cotações.
 */
function processarBuscaEEnvio(config) {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName("Controle") || planilha.getActiveSheet();
  var termoBusca = config.termoBusca;

  var dadosCompletos = aba.getDataRange().getValues();
  var cabecalhos = dadosCompletos[0];

  // A coluna de busca continua sendo "File/Nº"
  var nomeColunaBusca = "File/Nº";
  var indiceColunaBusca = cabecalhos.indexOf(nomeColunaBusca);

  if (indiceColunaBusca === -1) {
    throw new Error("A coluna '" + nomeColunaBusca + "' não foi encontrada na linha 1.");
  }

  var linhaEncontradaIndex = -1;
  for (var i = 1; i < dadosCompletos.length; i++) {
    if (String(dadosCompletos[i][indiceColunaBusca]).trim().toLowerCase() === termoBusca.toLowerCase()) {
      linhaEncontradaIndex = i;
      break;
    }
  }

  if (linhaEncontradaIndex === -1) {
    return "Não foi encontrado nenhum registro com o File/Nº: " + termoBusca;
  }

  var dadosLinha = dadosCompletos[linhaEncontradaIndex];

  // Função auxiliar para pegar dados com os novos nomes exatos
  function getD(nome) {
    var idx = cabecalhos.indexOf(nome);
    if (idx === -1) return "---"; // Retorna --- se o nome da coluna estiver errado na planilha
    
    var valor = dadosLinha[idx];
    if (!valor && valor !== 0) return "---";

    if (valor instanceof Date) {
      return Utilities.formatDate(valor, Session.getScriptTimeZone(), "dd/MM/yyyy");
    }
    return valor;
  }

  // --- Montagem do Layout com os novos nomes ---
  var htmlCorpo = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; border: 1px solid #ddd; padding: 25px; background-color: #fff;">
      
      <div style="border-bottom: 3px solid #f36f21; padding-bottom: 10px; margin-bottom: 25px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 30%; text-align: left; vertical-align: middle;">
              <img src="https://drive.google.com/uc?export=view&id=1vcAcN1TLiBNQ6a2QbtalTRZKsEsaLGwn" alt="Logo Investur" style="max-width: 180px; height: auto;">
            </td>
            <td style="width: 70%; text-align: center; vertical-align: middle;">
              <h2 style="color: #f36f21; margin: 0; font-size: 24px;">Detalhes da Cotação</h2>
            </td>
          </tr>
        </table>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #333;">
        
        <tr>
          <td style="border: 1px solid #eee; padding: 10px; background: #fff3e0; width: 20%; color: #d84315; font-weight: bold;">File/Nº:</td>
          <td style="border: 1px solid #eee; padding: 10px; font-size: 16px; font-weight: bold;">${getD("File/Nº")}</td>
          <td style="border: 1px solid #eee; padding: 10px; background: #fff3e0; width: 20%; color: #d84315; font-weight: bold;">Data Solic.:</td>
          <td style="border: 1px solid #eee; padding: 10px;">${getD("Data da Solicitação")}</td>
        </tr>

        <tr>
          <td style="border: 1px solid #eee; padding: 10px; background: #fff3e0; color: #d84315; font-weight: bold;">Agência:</td>
          <td style="border: 1px solid #eee; padding: 10px;">${getD("Nome da Agência")}</td>
          <td style="border: 1px solid #eee; padding: 10px; background: #fff3e0; color: #d84315; font-weight: bold;">Consultor:</td>
          <td style="border: 1px solid #eee; padding: 10px;">${getD("Consultor")}</td>
        </tr>

        <tr>
          <td style="border: 1px solid #eee; padding: 10px; background: #fff3e0; color: #d84315; font-weight: bold;">Contato Agência:</td>
          <td style="border: 1px solid #eee; padding: 10px;">${getD("Contato da Agencia")}</td>
          <td style="border: 1px solid #eee; padding: 10px; background: #fff3e0; color: #d84315; font-weight: bold;">Tipo Cotação:</td>
          <td style="border: 1px solid #eee; padding: 10px;">${getD("Tipo de Cotação")}</td>
        </tr>

        <tr>
          <td style="border: 1px solid #eee; padding: 10px; background: #fff3e0; color: #d84315; font-weight: bold;">Destinos:</td>
          <td colspan="3" style="border: 1px solid #eee; padding: 10px; font-weight: bold; color: #f36f21;">${getD("Destinos")}</td>
        </tr>

        <tr>
          <td style="border: 1px solid #eee; padding: 10px; background: #fff3e0; color: #d84315; font-weight: bold;">Check-in:</td>
          <td style="border: 1px solid #eee; padding: 10px;">${getD("Data check-in")}</td>
          <td style="border: 1px solid #eee; padding: 10px; background: #fff3e0; color: #d84315; font-weight: bold;">Check-out:</td>
          <td style="border: 1px solid #eee; padding: 10px;">${getD("Data check-out")}</td>
        </tr>

        <tr>
          <td style="border: 1px solid #eee; padding: 10px; background: #fff3e0; color: #d84315; font-weight: bold;">Qtde Pax:</td>
          <td colspan="3" style="border: 1px solid #eee; padding: 10px;">${getD("Quantidade de pax")}</td>
        </tr>

      </table>

      <div style="margin-top: 25px; padding: 15px; border: 1px solid #eee; background-color: #fafafa; border-radius: 4px;">
        <b style="color: #d84315; font-size: 15px;">Feedback / Observação:</b><br><br>
        <div style="white-space: pre-wrap; color: #555;">${getD("Feedback / Observacao")}</div>
      </div>

      <p style="font-size: 12px; color: #999; text-align: center; margin-top: 35px; border-top: 1px solid #eee; padding-top: 15px;">
        E-mail gerado automaticamente pelo sistema da Investur.
      </p>
    </div>
  `;

  var assunto = "Cotação [" + getD("File/Nº") + "] - " + getD("Nome da Agência");
  
  if (config.enviarParaMim) {
    MailApp.sendEmail({ to: Session.getActiveUser().getEmail(), subject: assunto, htmlBody: htmlCorpo });
  }
  
  if (config.outroEmail && config.outroEmail.includes("@")) {
    MailApp.sendEmail({ to: config.outroEmail, subject: assunto, htmlBody: htmlCorpo });
  }
  
  return "Sucesso! Dados do File " + termoBusca + " enviados.";
}