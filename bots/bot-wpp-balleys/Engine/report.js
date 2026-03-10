const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { query } = require('../DataBase/conection');

async function gerarRelatorioPDF() {
    return new Promise(async (resolve, reject) => {
        try {
            // Busca os dados do banco
            const res = await query('SELECT * FROM contatos ORDER BY ultima_interacao DESC');
            
            const doc = new PDFDocument({ margin: 50 });
            const fileName = `Relatorio_Leads_${Date.now()}.pdf`;
            const filePath = path.join(__dirname, '..', fileName);
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Cabeçalho Bonito
            doc.fontSize(20).text('PROJETO CHARLIE - RELATÓRIO DE LEADS', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'right' });
            doc.text('__________________________________________________________');
            doc.moveDown();

            // Listagem
            res.rows.forEach((lead, index) => {
                doc.fontSize(12).text(`${index + 1}. Nome: ${lead.nome}`);
                doc.fontSize(10).fillColor('blue').text(`   WhatsApp: ${lead.numero}`);
                doc.fillColor('black').text(`   Última Interação: ${new Date(lead.ultima_interacao).toLocaleString('pt-BR')}`);
                doc.moveDown(0.5);
            });

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