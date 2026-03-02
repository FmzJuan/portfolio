// Arquivo: src/pages/BotProductPage.tsx

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
// Importe o componente do bot, ajustando o caminho para "subir" um nível
import BotPortfolio from '../components/BotPortfolio/BotPortfolio';

const BotProductPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Esta página contém apenas a seção de apresentação do bot */}
        <BotPortfolio />
      </main>
      <Footer />
    </div>
  );
};

export default BotProductPage;
