import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, User, Mail, Lock, Phone, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import bgImage from '../assets/images/supreme-court-bg.png';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'client',
    phone: '',
    id_proof: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        submitData.append(key, formData[key]);
      }
    });

    const result = await register(submitData);
    
    if (result.success) {
      navigate('/dashboard');
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

      <div className="relative z-10 w-full max-w-2xl">
        
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
            Judicial Portal Registration
          </h1>
          <p className="mt-2 text-sm text-gray-300 font-medium tracking-widest uppercase">
            Government of India
          </p>
        </div>

        {/* The Premium Glass Card */}
        <div className="relative p-8 sm:p-10 bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in">
          
          {/* Subtle glowing orb inside the card */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Create Identity</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-400">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/10 text-white text-sm font-medium rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all outline-none"
                      required
                      autoComplete="nope"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Email</label>
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
                      autoComplete="nope"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-400">
                      <Phone className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/10 text-white text-sm font-medium rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all outline-none"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Designation</label>
                  <div className="relative">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full pl-4 pr-10 py-3.5 bg-black/40 border border-white/10 text-white text-sm font-medium rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all outline-none appearance-none"
                      required
                    >
                      <option value="client" className="bg-gray-900 text-white">client</option>
                      <option value="lawyer" className="bg-gray-900 text-white">lawyer</option>
                      <option value="judge" className="bg-gray-900 text-white">judge</option>
                      <option value="police" className="bg-gray-900 text-white">police</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-5 bg-primary-900/10 rounded-xl border border-primary-500/20 animate-slide-in backdrop-blur-md">
                <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Govt ID Proof Verification
                </label>
                <p className="text-xs text-gray-400 font-medium mb-3">Upload your valid government ID proof document.</p>
                <input
                  type="file"
                  name="id_proof"
                  onChange={handleChange}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-primary-500/20 file:text-primary-400 hover:file:bg-primary-500/30 transition-all cursor-pointer border border-white/5 rounded-xl p-2 bg-black/20"
                  accept=".jpg,.jpeg,.png,.pdf"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
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
                      minLength={8}
                      autoComplete="new-password"
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

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-400">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-3.5 bg-black/40 border border-white/10 text-white text-sm font-medium rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all outline-none"
                      required
                      autoComplete="new-password"
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
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-4 px-4 bg-primary-600 hover:bg-primary-500 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-primary-600/30 group mt-8 disabled:opacity-70 disabled:cursor-not-allowed border border-primary-500/50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full mr-3"></div>
                    REGISTERING...
                  </span>
                ) : (
                  <span className="flex items-center tracking-wide">
                    CREATE IDENTITY
                    <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-white/10 pt-6">
              <p className="text-sm font-medium text-gray-400">
                Already registered?{' '}
                <Link to="/login" className="text-white hover:text-primary-400 font-bold transition-colors">
                  Sign in instead
                </Link>
              </p>
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

export default Register;
