// Chat/RissatoMotors/erpSync.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const puppeteer = require('puppeteer');
const fs = require('fs');
const csv = require('csv-parser');

// Importa o seu formatador inteligente
const { formatarLeadParaSheets } = require('../../utils/formatador');

// Importa as funções do Google Sheets
const { salvarDadosBrutosERP, atualizarAbaClientes } = require('../../Functions/googleSheets');

const ERP_CHAVE = process.env.ERP_CHAVE; 
const ERP_USER = process.env.ERP_USER;
const ERP_PASS = process.env.ERP_PASS;

async function extrairDadosDoERP() {
    console.log("🤖 [RPA] Iniciando extração de dados...");

    const browser = await puppeteer.launch({
        headless: false, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: null
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 1. Configura a pasta de downloads
    const downloadPath = path.resolve(__dirname, 'downloads');
    if (!fs.existsSync(downloadPath)) fs.mkdirSync(downloadPath);

    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath,
    });

    try {
        // --- ETAPA DE LOGIN ---
        console.log("➡️ Acessando login...");
        await page.goto('https://sistema.oficinaintegrada.com.br/login.asp', { waitUntil: 'networkidle2' });

        await page.type('#chave', ERP_CHAVE, { delay: 50 }); 
        await page.type('#usuario', ERP_USER, { delay: 50 });       
        await page.type('#senha', ERP_PASS, { delay: 50 });         

        console.log("🔑 Fazendo login...");
        await Promise.all([
            page.click('#btnLogar'),
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }) 
        ]);
        console.log("✅ Login efetuado com sucesso!");

        // --- ETAPA DO TUTORIAL ---
        try {
            await page.waitForSelector('button[data-role="end"]', { visible: true, timeout: 5000 });
            console.log("👆 Tutorial detectado! Clicando em Finalizar...");
            await page.click('button[data-role="end"]');
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (e) {
            console.log("👍 Sem tutorial na tela.");
        }

        // --- NAVEGAÇÃO ---
        console.log("🖱️ 1. Navegando até a lista de clientes...");
        await page.evaluate(() => {
            const spans = Array.from(document.querySelectorAll('span.title'));
            const menu = spans.find(span => span.textContent.trim() === 'Clientes');
            if (menu) menu.click();
        });
        await new Promise(resolve => setTimeout(resolve, 1000));

        await page.waitForSelector('a[href="P_LISTAR_CLIENTES.ASP"]', { visible: true });
        await Promise.all([
            page.click('a[href="P_LISTAR_CLIENTES.ASP"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' }) 
        ]);

        console.log("⬇️ 2. Solicitando exportação CSV...");
        await page.waitForSelector('.btn.yellow.dropdown-toggle', { visible: true });
        await page.click('.btn.yellow.dropdown-toggle');
        await new Promise(resolve => setTimeout(resolve, 1000));

        await page.waitForSelector('a[onclick="exportarCSV();"]', { visible: true });
        await page.click('a[onclick="exportarCSV();"]');

        console.log("⏳ Aguardando download (15s)...");
        await new Promise(resolve => setTimeout(resolve, 15000));

        // --- PROCESSAMENTO ---
        await processarCSVBaixado();

    } catch (error) {
        console.error("❌ [RPA] Erro:", error);
    } finally {
        await browser.close();
        console.log("🛑 Navegador fechado.");
    }
}

async function processarCSVBaixado() {
    const downloadPath = path.resolve(__dirname, 'downloads');
    const files = fs.readdirSync(downloadPath).filter(fn => fn.endsWith('.csv') || fn.endsWith('.xls'));
    
    if (files.length === 0) return console.log("⚠️ Nenhum arquivo para processar.");

    const arquivoRecente = path.join(downloadPath, files[files.length - 1]);
    console.log(`📊 Processando: ${arquivoRecente}`);

    let cabecalho = [];
    const linhasBrutas = [];
    const dadosParaOSheets = [];

    fs.createReadStream(arquivoRecente)
        .pipe(csv({ separator: ';' })) 
        .on('headers', (headers) => {
            cabecalho = headers;
        })
        .on('data', (linha) => {
            // 1. Salva tudo para a aba Dados_ERP
            const linhaArray = cabecalho.map(col => linha[col]);
            linhasBrutas.push(linhaArray);

            // 2. Usa o seu formatador para a aba Clientes
            const leadLimpo = formatarLeadParaSheets(linha);
            if (leadLimpo) {
                dadosParaOSheets.push(leadLimpo);
            }
        })
        .on('end', async () => {
            console.log(`✂️ Filtro concluído. Atualizando planilhas...`);
            
            if (linhasBrutas.length > 0) {
                await salvarDadosBrutosERP(cabecalho, linhasBrutas);
            }

            if (dadosParaOSheets.length > 0) {
                await atualizarAbaClientes(dadosParaOSheets);
            }

            fs.unlinkSync(arquivoRecente); 
            console.log('✅ [RPA] Sucesso total!');
        });
}

if (require.main === module) {
    extrairDadosDoERP();
}

module.exports = { extrairDadosDoERP };