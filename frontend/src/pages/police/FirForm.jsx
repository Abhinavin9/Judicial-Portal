import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, MapPin, Calendar, AlertCircle, Shield, ChevronLeft, Send, Save } from 'lucide-react';
import Layout from '../../components/common/Layout';
import api from '../../services/api';

const FirForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    incident_date: '',
    location: '',
    police_station_id: 'Central Station',
  });

  useEffect(() => {
    if (isEdit) {
      fetchFir();
    }
  }, [id, isEdit]);

  const fetchFir = async () => {
    try {
      const response = await api.get(`/firs/${id}`);
      const data = response.data;
      setFormData({
        title: data.title,
        description: data.description,
        incident_date: data.incident_date ? data.incident_date.replace(' ', 'T').substring(0, 16) : '',
        location: data.location,
        police_station_id: data.police_station_id,
      });
    } catch (err) {
      setError('Failed to fetch FIR details');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await api.put(`/firs/${id}`, formData);
      } else {
        await api.post('/firs', formData);
      }
      navigate('/firs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save FIR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative z-10">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/firs')}
        className="flex items-center text-gray-500 hover:text-white transition-colors group"
      >
        <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-black uppercase tracking-widest">Back to Database</span>
      </button>

      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="p-5 bg-rose-600/20 rounded-3xl shadow-2xl shadow-rose-500/10 border border-rose-500/20">
          <Shield className="h-10 w-10 text-rose-500" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {isEdit ? 'Update FIR Record' : 'Register New FIR'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-1 font-medium">
            {isEdit ? `Modifying Official Record for FIR-${id}` : 'Official First Information Report Entry'}
          </p>
        </div>
      </div>

      <div className="glass-card p-8 md:p-12 relative overflow-hidden">
        {/* Background Gradient Accent */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-500/5 blur-3xl rounded-full"></div>
        
        {error && (
          <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 animate-shake">
            <div className="p-2 bg-rose-500/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-rose-500" />
            </div>
            <p className="text-sm text-rose-400 font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Case Title / Incident Subject</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input bg-black/20 border-white/10 focus:border-rose-500/50 text-lg font-bold"
              placeholder="Briefly state the nature of the crime/incident"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Date & Time of Incident</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-500 group-focus-within:text-rose-500 transition-colors" />
                </div>
                <input
                  type="datetime-local"
                  name="incident_date"
                  value={formData.incident_date}
                  onChange={handleChange}
                  className="input pl-12 bg-black/20 border-white/10 focus:border-rose-500/50"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Location of Incident</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-500 group-focus-within:text-rose-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input pl-12 bg-black/20 border-white/10 focus:border-rose-500/50"
                  placeholder="Area, Street or Landmark"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Jurisdiction / Police Station</label>
            <select 
              name="police_station_id" 
              value={formData.police_station_id} 
              onChange={handleChange} 
              className="input bg-black/20 border-white/10 focus:border-rose-500/50 font-bold"
            >
              <option value="Central Station">Central Police Station</option>
              <option value="North District">North District Station</option>
              <option value="South Precinct">South Precinct</option>
              <option value="East Zone HQ">East Zone HQ</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Detailed Incident Narrative</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input min-h-[200px] py-5 bg-black/20 border-white/10 focus:border-rose-500/50 leading-relaxed"
              placeholder="Describe the events in detail as reported..."
              required
            ></textarea>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-white/5">
            <button 
              type="button" 
              onClick={() => navigate('/firs')} 
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl font-black transition-all order-2 sm:order-1"
            >
              CANCEL
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-2 px-12 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black shadow-2xl shadow-rose-500/40 transition-all transform hover:-translate-y-1 disabled:opacity-50 flex items-center justify-center gap-3 order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  FILING...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  SUBMIT OFFICIAL FIR
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FirForm;
