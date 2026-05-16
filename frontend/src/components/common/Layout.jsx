import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

import { useAuth } from '../../contexts/AuthContext';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const getThemeOverlay = () => {
    switch (user?.role) {
      case 'judge':
        return 'from-blue-900/40 to-indigo-900/40';
      case 'lawyer':
        return 'from-emerald-900/40 to-teal-900/40';
      case 'police':
        return 'from-slate-900/40 to-zinc-900/40';
      case 'super_admin':
      case 'court_admin':
        return 'from-rose-900/40 to-red-900/40';
      case 'client':
        return 'from-amber-900/40 to-orange-900/40';
      default:
        return 'from-gray-900/40 to-gray-800/40';
    }
  };

  return (
    <div className="min-h-screen relative bg-gray-50 dark:bg-gray-950 overflow-x-hidden">
      {/* Thematic Background Image */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ 
          backgroundImage: 'url("/images/supreme-court-bg.png")',
          filter: 'blur(4px)'
        }}
      />
      <div className="fixed inset-0 z-0 bg-gray-950/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900/40 via-gray-950/90 to-black"></div>
      </div>
      
      {/* Role-based Gradient Overlay */}
      <div className={`fixed inset-0 z-1 bg-gradient-to-br ${getThemeOverlay()} opacity-30 transition-all duration-700`} />
      
      {/* Content Wrapper with Glassmorphism */}
      <div className="relative z-10 min-h-screen w-full bg-white/5 dark:bg-gray-950/20">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="lg:pl-64">
        <Header setIsSidebarOpen={setIsSidebarOpen} />
        
        <main className="p-4 lg:p-6 relative z-10">
          {children}
        </main>
      </div>
      </div>
    </div>
  );
};

export default Layout;
