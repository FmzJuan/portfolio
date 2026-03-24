const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { query } = require('../DataBase/conection');

async function gerarRelatorioPDF() {
    return new Promise(async (resolve, reject) => {
        try {
            // Busca os dados do banco
            const res = await query('SELECT * FROM contatos ORDER BY ultima_interacao DESC');
            
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const fileName = `Relatorio_Leads_${Date.now()}.pdf`;
            const filePath = path.join(__dirname, '..', fileName);
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // --- CABEÇALHO ---
            // Retângulo decorativo no topo
            doc.rect(0, 0, 612, 100).fill('#1e1b4b'); 
            
            doc.fillColor('#ffffff')
               .fontSize(24)
               .font('Helvetica-Bold')
               .text('LeadsFlow', 50, 40);
            
            doc.fontSize(10)
               .font('Helvetica')
               .text('RELATÓRIO DE INTERAÇÕES CRM', 50, 70);

            doc.fontSize(10)
               .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 400, 55, { align: 'right' });

            doc.moveDown(5);

            // --- ESTRUTURA DA TABELA ---
            const tableTop = 150;
            const itemCodeX = 50;
            const descriptionX = 100;
            const phoneX = 300;
            const dateX = 450;

            // Cabeçalho da Tabela
            doc.fillColor('#4b5563')
               .font('Helvetica-Bold')
               .fontSize(10);
            
            doc.text('ID', itemCodeX, tableTop);
            doc.text('NOME DO CLIENTE', descriptionX, tableTop);
            doc.text('WHATSAPP', phoneX, tableTop);
            doc.text('ÚLTIMA INTERAÇÃO', dateX, tableTop);

            doc.moveTo(50, tableTop + 15)
               .lineTo(550, tableTop + 15)
               .strokeColor('#e5e7eb')
               .stroke();

            // --- LINHAS DA TABELA ---
            let currentY = tableTop + 30;
            doc.font('Helvetica').fillColor('#374151');

            res.rows.forEach((lead, index) => {
                // Alternar cor de fundo para leitura fácil (zebra)
                if (index % 2 === 0) {
                    doc.rect(50, currentY - 5, 500, 20).fill('#f9fafb');
                    doc.fillColor('#374151');
                }

                doc.text(index + 1, itemCodeX, currentY);
                doc.text(lead.nome || 'Cliente s/ nome', descriptionX, currentY, { width: 180, ellipsis: true });
                doc.text(lead.numero.split('@')[0], phoneX, currentY);
                doc.text(new Date(lead.ultima_interacao).toLocaleString('pt-BR'), dateX, currentY);

                currentY += 20;

                // Gerar nova página se atingir o limite
                if (currentY > 750) {
                    doc.addPage();
                    currentY = 50; // Reinicia o Y na nova página
                }
            });

            // Rodapé
            const pageCount = doc.bufferedPageRange().count;
            for (let i = 0; i < pageCount; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).fillColor('#9ca3af').text(
                    `LeadsFlow - Gestão Inteligente de Leads | Página ${i + 1} de ${pageCount}`,
                    50,
                    780,
                    { align: 'center' }
                );
            }

            doc.end();

            stream.on('finish', () => {
                resolve({ fileName, filePath });
            });
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = { gerarRelatorioPDF };