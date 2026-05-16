import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import bgImage from '../assets/images/supreme-court-bg.png';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    if (result.success) {
      if (result.user?.role === 'police') {
        navigate('/police-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-black py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Background with Majestic Indian Court / Pillar Vibe */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
        style={{ 
          backgroundImage: `url(${bgImage})`,
          filter: 'brightness(0.3) contrast(1.1) blur(8px)'
        }}
      />
      {/* Deep gradient overlay for text readability and premium feel */}
      <div className="fixed inset-0 z-1 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />
      <div className="fixed inset-0 z-1 bg-gradient-to-r from-primary-900/30 to-transparent mix-blend-multiply" />

      <div className="relative z-10 w-full max-w-md">
        
        {/* Header / Logo */}
        <div className="text-center mb-8 animate-slide-in">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="relative p-4 bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                <Scale className="h-10 w-10 text-primary-400" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-2xl uppercase">
            Judicial Portal
          </h1>
          <p className="mt-2 text-sm text-gray-300 font-medium tracking-widest uppercase">
            Government of India
          </p>
        </div>

        {/* The Premium Glass Card */}
        <div className="relative p-8 sm:p-10 bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in">
          
          {/* Subtle glowing orb inside the card */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Sign In</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-400">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/10 text-white text-sm font-medium rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                  <a href="#" className="text-[10px] font-bold text-primary-400 hover:text-primary-300 transition-colors">Forgot?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-400">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3.5 bg-black/40 border border-white/10 text-white text-sm font-medium rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-primary-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-4 px-4 bg-primary-600 hover:bg-primary-500 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-primary-600/30 group mt-6 disabled:opacity-70 disabled:cursor-not-allowed border border-primary-500/50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3"></div>
                    AUTHENTICATING...
                  </span>
                ) : (
                  <span className="flex items-center tracking-wide">
                    LOGIN
                    <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm font-medium text-gray-400">
                New legal representative?{' '}
                <Link to="/register" className="text-white hover:text-primary-400 font-bold transition-colors">
                  Register here
                </Link>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-black mb-4 text-center">Demo Environment Profiles</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { role: 'Judge', email: 'judge@judicialportal.com' },
                  { role: 'Lawyer', email: 'lawyer@judicialportal.com' },
                  { role: 'Client', email: 'client@judicialportal.com' },
                  { role: 'Police', email: 'police@judicialportal.com' },
                ].map((d) => (
                  <button
                    key={d.role}
                    onClick={() => {
                      setFormData({ email: d.email, password: 'password123' });
                    }}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-bold transition-all border border-white/5 hover:border-white/20"
                  >
                    {d.role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Text */}
        <p className="text-center mt-8 text-xs text-gray-500 font-medium tracking-wide">
          &copy; {new Date().getFullYear()} Judicial Portal of India. All rights reserved.
        </p>

      </div>
    </div>
  );
};

export default Login;
