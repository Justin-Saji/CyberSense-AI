import React from 'react';
import { Outlet } from 'react-router-dom';
import { BackgroundCanvas } from '../components/BackgroundCanvas';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Toast } from '../components/common/Toast';

export const AuthLayout = () => {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#0B0F19]">
      <BackgroundCanvas />
      <Navbar />
      <main className="relative z-10 flex-grow flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </div>
  );
};
