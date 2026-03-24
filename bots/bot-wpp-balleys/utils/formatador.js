// src/utils/formatador.js
function formatarNumeroBaileys(celularBruto) {
    if (!celularBruto) return null;
    let numeroLimpo = celularBruto.toString().replace(/\D/g, ''); 
    
    if (numeroLimpo.length >= 12 && numeroLimpo.startsWith('55')) {
        return numeroLimpo + '@s.whatsapp.net';
    } else {
        return '55' + numeroLimpo + '@s.whatsapp.net';
    }
}

module.exports = { formatarNumeroBaileys };