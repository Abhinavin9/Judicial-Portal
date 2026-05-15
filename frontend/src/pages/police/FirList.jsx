import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, Shield, Eye, Calendar, MapPin } from 'lucide-react';
import Layout from '../../components/common/Layout';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const FirRow = memo(({ fir }) => (
  <tr className="hover:bg-white/5 transition-colors border-b border-white/5 group">
    <td className="py-4 px-4 font-black text-primary-400">
      <Link to={`/firs/${fir.id}`} className="hover:text-primary-300 transition-colors">
        {fir.fir_number || 'TBD'}
      </Link>
    </td>
    <td className="py-4 px-4">
      <p className="text-gray-300 font-bold leading-tight">{fir.title || 'Untitled Case'}</p>
      <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter mt-1">{fir.case_type || 'General Offense'}</p>
    </td>
    <td className="py-4 px-4">
      <div className="flex items-center text-gray-400 text-xs">
        <Calendar className="h-3 w-3 mr-2 text-primary-500/50" />
        {fir.incident_date ? new Date(fir.incident_date).toLocaleDateString() : 'N/A'}
      </div>
    </td>
    <td className="py-4 px-4">
      <div className="flex items-center text-gray-400 text-xs">
        <MapPin className="h-3 w-3 mr-2 text-rose-500/50" />
        {fir.location || 'Unknown'}
      </div>
    </td>
    <td className="py-4 px-4">
      <span className={`badge ${
        fir.status === 'pending' ? 'badge-warning' : 
        fir.status === 'closed' ? 'badge-success' : 
        fir.status === 'court_referred' ? 'badge-info' : 'badge-primary'
      } text-[10px] font-black uppercase tracking-widest`}>
        {(fir.status || 'pending').replace('_', ' ')}
      </span>
    </td>
    <td className="py-4 px-4 text-right">
      <Link 
        to={`/firs/${fir.id}`} 
        className="inline-flex items-center p-2 text-primary-400 hover:bg-primary-500/10 rounded-xl transition-all"
        title="View FIR Details"
      >
        <Eye className="h-4 w-4" />
      </Link>
    </td>
  </tr>
));

const FirList = () => {
  const { user } = useAuth();
  const cacheKey = `firs_list_${user?.id}`;
  const cachedData = localStorage.getItem(cacheKey);
  
  const [firs, setFirs] = useState(cachedData ? JSON.parse(cachedData) : []);
  const [loading, setLoading] = useState(!cachedData);
  const [search, setSearch] = useState('');

  const fetchFirs = useCallback(async () => {
    try {
      const response = await api.get('/firs', {
        params: { search }
      });
      const data = response.data.data || response.data;
      setFirs(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to fetch FIRs', error);
    } finally {
      setLoading(false);
    }
  }, [search, user?.id, cacheKey]);

  useEffect(() => {
    fetchFirs();
  }, [fetchFirs]);

  const canCreate = user?.role === 'police';

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary-600 rounded-2xl shadow-2xl shadow-primary-500/20">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">FIR Records</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">Police Database & Investigation Management</p>
          </div>
        </div>
        {canCreate && (
          <Link to="/firs/create" className="flex items-center px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black shadow-2xl shadow-primary-500/40 transition-all transform hover:-translate-y-1">
            <Plus className="h-5 w-5 mr-2" />
            REGISTER FIR
          </Link>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        {/* Search/Filter Bar */}
        <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by FIR number, suspect name or offense..." 
              className="input pl-12 bg-black/20 border-white/10 focus:border-primary-500/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center px-6 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-bold border border-white/10 transition-all">
            <Filter className="h-5 w-5 mr-2" />
            Advanced Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-6 py-4">FIR Number</th>
                <th className="px-6 py-4">Subject & Offense</th>
                <th className="px-6 py-4">Incident Date</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                     <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                        <p className="text-xs font-black uppercase text-primary-400 tracking-widest">Syncing Database...</p>
                     </div>
                  </td>
                </tr>
              ) : firs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="max-w-sm mx-auto opacity-50">
                      <Shield className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 font-bold text-lg">No FIR records found</p>
                      <p className="text-gray-500 text-sm mt-1">Refine your search or check again later.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                firs.map(fir => (
                  <FirRow key={fir.id} fir={fir} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FirList;
