import React from 'react';
import './GoogleSheets.css';

const GoogleSheets: React.FC = () => {
  return (
    <section className="gs-section" id="google-sheets">
      <div className="container">
        <h1>Organização e Normalização de Dados no Google Sheets</h1>
        <p className="subtitle">
          Automação inteligente para organizar, normalizar e deduplicar dados de múltiplas fontes em tempo real.
        </p>
        <p>
          Nesta página você encontra detalhes sobre a solução desenvolvida com Google Apps Script que
          organiza cronologicamente, remove duplicatas e garante consistência em planilhas.
        </p>
        {/* TODO: adicionar mais conteúdo específico do projeto aqui */}
      </div>
    </section>
  );
};

export default GoogleSheets;