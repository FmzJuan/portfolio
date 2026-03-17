const { Worker } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis({ host: process.env.REDIS_HOST || 'localhost', maxRetriesPerRequest: null });

function iniciarWorker(sock) {
  const worker = new Worker('pos-venda-rissato', async job => {
    const { telefone, nome, tipo } = job.data;
    
    let texto = "";
    if (tipo === '24h') {
      texto = `Olá ${nome}! Tudo bem? Faz 24h que você retirou seu carro na Rissato Motors. Está tudo certo com o veículo?`;
    } else {
      texto = `Oi ${nome}! Já faz 6 meses da sua última revisão na Rissato. Vamos agendar uma verificação preventiva?`;
    }

    console.log(`[Worker] Enviando mensagem agendada para ${nome}...`);
    
    // Envia via Baileys
    await sock.sendMessage(`${telefone}@s.whatsapp.net`, { text: texto });

  }, { connection });

  worker.on('completed', job => console.log(`[Worker] Job ${job.id} finalizado!`));
  worker.on('failed', (job, err) => console.error(`[Worker] Erro no job ${job.id}:`, err));
}

module.exports = { iniciarWorker };