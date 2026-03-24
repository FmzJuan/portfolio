// Chat/RissatoMotors/erpSync.js
const path = require('path');
// 1. Força o carregamento do .env que está duas pastas para trás (na raiz do projeto)
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const puppeteer = require('puppeteer');

// 2. Garanta que você colocou os dados REAIS no seu arquivo .env
const ERP_CHAVE = process.env.ERP_CHAVE; 
const ERP_USER = process.env.ERP_USER;
const ERP_PASS = process.env.ERP_PASS;

async function testarLoginERP() {
    console.log("🤖 [RPA] Iniciando teste de Login...");

    // Validação rápida para você não perder tempo
    if (!ERP_CHAVE || !ERP_USER || !ERP_PASS) {
        console.log("❌ ERRO: As credenciais do ERP não foram encontradas no .env!");
        return;
    }

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: null
    });

    const page = await browser.newPage();

    // DICA NINJA: Isso disfarça o Puppeteer para ele parecer um Chrome 100% normal
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        console.log("➡️ Acessando página de login...");
        await page.goto('https://sistema.oficinaintegrada.com.br/login.asp', { waitUntil: 'networkidle2' });

        // 3. Digitação humanizada (delay de 50 milissegundos entre cada letra)
        console.log("✍️ Preenchendo credenciais reais...");
        await page.type('#chave', ERP_CHAVE, { delay: 50 }); 
        await page.type('#usuario', ERP_USER, { delay: 50 });       
        await page.type('#senha', ERP_PASS, { delay: 50 });         

        console.log("🔑 Clicando no botão Login...");
        await Promise.all([
            page.click('#btnLogar'),
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }) 
        ]);

        console.log("✅ Login efetuado com sucesso! O robô chegou na página inicial.");
        
        console.log("👁️ Mantendo a tela aberta por 10 segundos para conferência...");
        await new Promise(resolve => setTimeout(resolve, 10000));

    } catch (error) {
        console.error("❌ [RPA] Erro durante o login:", error);
    } finally {
        await browser.close();
        console.log("🛑 [RPA] Teste finalizado. Navegador fechado.");
    }
}

if (require.main === module) {
    testarLoginERP();
}

module.exports = { testarLoginERP };