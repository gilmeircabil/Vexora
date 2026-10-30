import React from 'react';
import { Outlet } from 'react-router';
import { Header } from './Header.js';
import { Footer } from './Footer.js';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
