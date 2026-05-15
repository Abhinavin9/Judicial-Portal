import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User as UserIcon, Mail, Phone, MapPin, Briefcase, Shield, Scale } from 'lucide-react';
import Layout from '../components/common/Layout';
import api from '../services/api';

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
    phone: '',
    address: '',
    bar_number: '',
    court_id: '',
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchUserDetail();
    }
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      const userData = response.data;
      setFormData({
        ...userData,
        password: '', // Don't populate password
      });
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      setError('Failed to load user details');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await api.put(`/users/${id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      navigate('/users');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save user record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/users')}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
        >
          <ArrowLeft className="h-5 w-5 text-gray-400" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {isEdit ? 'Modify Personnel' : 'Enroll New Identity'}
          </h1>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">
            Authorized Personnel Access Control
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
            <p className="text-sm text-rose-400 font-bold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info Section */}
          <div className="glass-card p-6 space-y-6 border border-white/5 md:col-span-2">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
              <UserIcon className="h-4 w-4 text-primary-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Core Credentials</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Full Legal Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-black/40 border-0 text-white rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Electronic Mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-black/40 border-0 text-white rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/50"
                    required
                  />
                </div>
              </div>

              {!isEdit && (
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Security Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-black/40 border-0 text-white rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/50"
                    required={!isEdit}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Role & Access */}
          <div className="glass-card p-6 space-y-6 border border-white/5">
             <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
              <Shield className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Authority Level</h3>
            </div>
            
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Designation</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-black/40 border-0 text-white rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/50 appearance-none cursor-pointer"
                required
              >
                <option value="client">Client / Litigant</option>
                <option value="lawyer">Advocate / Lawyer</option>
                <option value="judge">Judicial Officer / Judge</option>
                <option value="police">Police Officer</option>
                <option value="court_admin">Court Administrator</option>
                <option value="super_admin">System Super Admin</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex flex-col">
                 <span className="text-sm font-bold text-white">Account Status</span>
                 <span className="text-[10px] text-gray-500 uppercase font-black">Authorized for Login</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          {/* Contact & Professional */}
          <div className="glass-card p-6 space-y-6 border border-white/5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
              <Briefcase className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Professional Meta</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-black/40 border-0 text-white rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
              </div>

              {formData.role === 'lawyer' && (
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Bar Council Number</label>
                  <input
                    type="text"
                    name="bar_number"
                    value={formData.bar_number}
                    onChange={handleChange}
                    className="w-full bg-black/40 border-0 text-white rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/50"
                    placeholder="BAR-XXXXXXXX"
                  />
                </div>
              )}

              {formData.role === 'judge' && (
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Court Jurisdiction ID</label>
                  <input
                    type="text"
                    name="court_id"
                    value={formData.court_id}
                    onChange={handleChange}
                    className="w-full bg-black/40 border-0 text-white rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/50"
                    placeholder="COURT-XXXX"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6 space-y-4 border border-white/5 md:col-span-2">
            <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
              <MapPin className="h-4 w-4 text-rose-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Geographic Detail</h3>
            </div>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-black/40 border-0 text-white rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/50 min-h-[100px]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-8">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all border border-white/10"
          >
            Discard Changes
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-3 px-10 py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-2xl shadow-primary-600/40"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isEdit ? 'Update Identity' : 'Securely Enroll'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
