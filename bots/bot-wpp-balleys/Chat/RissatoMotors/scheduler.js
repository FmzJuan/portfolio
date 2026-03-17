const { Queue } = require('bullmq');
const IORedis = require('ioredis');

// Conexão com o Redis (usando a variável do seu .env)
const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

// Criamos a fila chamada "pos-venda-rissato"
const posVendaQueue = new Queue('pos-venda-rissato', { connection });

/**
 * Agenda as mensagens de 1 dia e 6 meses
 */
async function agendarMensagens(cliente) {
  const { telefone, nome, dataSaida } = cliente;

  // 1. Agendamento de 24 horas (Pós-venda imediato)
  // 24h * 60m * 60s * 1000ms
  const delay24h = 24 * 60 * 60 * 1000; 
  
  await posVendaQueue.add(
    'feedback_24h',
    { telefone, nome, tipo: '24h' },
    { delay: delay24h, jobId: `24h-${telefone}-${dataSaida}` } // jobId evita duplicatas
  );

  // 2. Agendamento de 6 meses (Recorrência)
  // 180 dias * 24h * 60m * 60s * 1000ms
  const delay6meses = 180 * 24 * 60 * 60 * 1000;

  await posVendaQueue.add(
    'revisao_6meses',
    { telefone, nome, tipo: '6meses' },
    { delay: delay6meses, jobId: `6meses-${telefone}-${dataSaida}` }
  );

  console.log(`[Scheduler] Agendamentos criados para ${nome} (${telefone})`);
}

module.exports = { agendarMensagens, posVendaQueue };