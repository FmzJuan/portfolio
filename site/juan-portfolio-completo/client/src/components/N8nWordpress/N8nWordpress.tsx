import React from 'react';
import './N8nWordpress.css';

const N8nWordpress: React.FC = () => {
  return (
    <section className="n8n-section" id="n8n-wordpress">
      <div className="container">
        <h1>Automação de Publicação em WordPress com n8n</h1>
        <p className="subtitle">
          Sistema completo de automação para publicar conteúdo no WordPress com processamento de imagens, SEO e distribuição em redes sociais.
        </p>
        <p>
          Nesta página você encontrará detalhes sobre o workflow desenvolvido em n8n que elimina tarefas manuais e garante consistência e velocidade na publicação de posts.
        </p>
        {/* TODO: adicionar mais detalhes, screenshots e explicações do pipeline */}
      </div>
    </section>
  );
};

export default N8nWordpress;