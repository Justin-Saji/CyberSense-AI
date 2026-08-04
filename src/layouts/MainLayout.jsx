import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BackgroundCanvas } from '../components/BackgroundCanvas';
import { Toast } from '../components/common/Toast';

export const MainLayout = () => {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#0B0F19]">
      <BackgroundCanvas />
      <Navbar />
      <main className="relative z-10 flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </div>
  );
};
