import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GoogleSheets from '@/components/GoogleSheets/GoogleSheets';

const GoogleSheetPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <GoogleSheets />
      </main>
      <Footer />
    </div>
  );
};

export default GoogleSheetPage;