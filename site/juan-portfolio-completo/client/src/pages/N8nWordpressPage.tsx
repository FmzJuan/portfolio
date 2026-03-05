import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import N8nWordpress from '@/components/N8nWordpress/N8nWordpress';

const N8nWordpressPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <N8nWordpress />
      </main>
      <Footer />
    </div>
  );
};

export default N8nWordpressPage;