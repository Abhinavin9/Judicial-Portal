import React from 'react';
import { ShieldAlert, ChevronLeft, Home, Lock, EyeOff, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 security-grid opacity-20"></div>
      
      {/* Scanning Line Effect */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-rose-500/30 blur-[1px] animate-scan z-0"></div>
      
      {/* Glowing Accents */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-600/10 blur-[60px] rounded-full animate-pulse-soft"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-rose-600/10 blur-[60px] rounded-full animate-pulse-soft"></div>

      <div className="relative z-10 max-w-2xl w-full">
        <div className="glass-card border-rose-500/30 bg-black/60 backdrop-blur-2xl p-1 w-full rounded-[2rem] overflow-hidden group transition-all duration-700 hover:border-rose-500/50">
          <div className="bg-gradient-to-br from-rose-500/5 to-transparent p-12 md:p-16 space-y-10">
            
            {/* Warning Header */}
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-rose-500 blur-xl opacity-20"></div>
                <div className="relative p-6 bg-rose-500/10 rounded-full border border-rose-500/20">
                  <ShieldAlert className="h-16 w-16 text-rose-500" />
                </div>
                <div className="absolute -top-2 -right-2 bg-rose-500 p-2 rounded-full border-4 border-black"></div>
                  <Lock className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                  Access <span className="text-rose-500">Restricted</span>
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-[1px] w-12 bg-rose-500/30"></div>
                  <span className="text-rose-500 font-black text-[10px] uppercase tracking-[0.4em]">Security Clearance Level 0</span>
                  <div className="h-[1px] w-12 bg-rose-500/30"></div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6 relative group/msg">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <AlertTriangle className="h-6 w-6 text-rose-500 opacity-50" />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-200 text-lg md:text-xl font-medium leading-relaxed">
                    Your current credentials do not hold the required clearance to access this judicial module.
                  </p>
                  <p className="text-gray-500 text-sm font-mono tracking-tight">
                    ERR_UNAUTHORIZED_ACCESS_LEVEL: {new Date().toISOString().split('T')[0].replace(/-/g, '')}
                  </p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                  <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest">Incident Logged</span>
                </div>
                <EyeOff className="h-4 w-4 text-gray-600" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl font-black transition-all border border-white/5 hover:border-white/20 active:scale-95 group/back"
              >
                <ChevronLeft className="h-5 w-5 transition-transform group-hover/back:-translate-x-1" />
                RETURN TO PREVIOUS
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black shadow-2xl shadow-rose-600/20 transition-all active:scale-95 group/home"
              >
                <Home className="h-5 w-5 transition-transform group-hover/home:-translate-y-1" />
                RE-AUTHORIZE
              </button>
            </div>

            {/* Footer Audit Info */}
            <p className="text-center text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
              Judicial Portal Security Enforcement &copy; 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
