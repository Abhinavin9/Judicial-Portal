import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Shield, FileText, Calendar, MapPin, Upload, User, ChevronLeft, Clock, AlertCircle, ExternalLink, BadgeCheck, Trash2 } from 'lucide-react';
import Layout from '../../components/common/Layout';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const FirDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fir, setFir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({ title: '', file: null });

  const fetchFir = useCallback(async () => {
    try {
      const response = await api.get(`/firs/${id}`);
      setFir(response.data);
    } catch (error) {
      console.error('Failed to fetch FIR details', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFir();
  }, [fetchFir]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await api.put(`/firs/${id}`, { status: newStatus });
      setFir({ ...fir, status: newStatus });
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this FIR record? This action cannot be undone.')) return;
    try {
      await api.delete(`/firs/${id}`);
      navigate('/firs');
    } catch (error) {
      console.error('Failed to delete FIR', error);
      alert('Failed to delete FIR record');
    }
  };

  const handleUploadEvidence = async (e) => {
    e.preventDefault();
    if (!uploadFormData.file) return;

    setUploading(true);
    const data = new FormData();
    data.append('fir_id', id);
    data.append('title', uploadFormData.title);
    data.append('file', uploadFormData.file);

    try {
      await api.post('/fir-evidences', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowUploadModal(false);
      setUploadFormData({ title: '', file: null });
      fetchFir();
    } catch (error) {
      console.error('Failed to upload evidence', error);
      alert('Failed to upload evidence');
    } finally {
      setUploading(false);
    }
  };

  const canManageFir = ['super_admin', 'police'].includes(user?.role);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="h-10 w-48 bg-white/5 rounded-xl"></div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 h-96 bg-white/5 rounded-3xl"></div>
          <div className="w-full md:w-80 h-96 bg-white/5 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (!fir) return (
    <div className="max-w-6xl mx-auto py-20 text-center">
      <AlertCircle className="h-16 w-16 text-rose-500 mx-auto mb-6" />
      <h2 className="text-3xl font-black text-white tracking-tight">FIR Not Found</h2>
      <button onClick={() => navigate('/firs')} className="mt-8 text-primary-400 font-bold uppercase tracking-widest hover:text-white transition-colors">Return to Database</button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in relative z-10">
      {/* Navigation */}
      <button 
        onClick={() => navigate('/firs')}
        className="flex items-center text-gray-500 hover:text-white transition-colors group"
      >
        <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-black uppercase tracking-widest">Back to Database</span>
      </button>

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-start gap-6">
          <div className="p-5 bg-primary-600/20 rounded-3xl border border-primary-500/20">
            <Shield className="h-10 w-10 text-primary-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tighter">
                {fir.fir_number}
              </h1>
              <span className={`badge ${
                fir.status === 'pending' ? 'badge-warning' : 
                fir.status === 'closed' ? 'badge-success' : 
                'badge-info'
              } px-4 py-1 text-[10px] font-black uppercase tracking-widest`}>
                {fir.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xl text-gray-500 mt-2 font-medium italic">"{fir.title}"</p>
          </div>
        </div>

        {canManageFir && (
          <div className="flex flex-wrap items-center gap-4">
            <Link 
              to={`/firs/${id}/edit`}
              className="flex items-center px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 font-bold text-sm transition-all"
            >
              <FileText className="h-4 w-4 mr-2" />
              EDIT FIR
            </Link>
            {user?.role === 'super_admin' && (
              <button 
                onClick={handleDelete}
                className="flex items-center px-6 py-3 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 rounded-2xl border border-rose-500/20 font-bold text-sm transition-all"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                DELETE FIR
              </button>
            )}
            <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-xl">
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Update Status:</span>
               <select 
                value={fir.status} 
                onChange={handleStatusChange} 
                className="bg-black/40 border-0 text-white text-sm font-bold rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500/50"
               >
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="court_referred">Court Referral</option>
                <option value="closed">Closed / Dismissed</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Primary Details Card */}
          <div className="glass-card p-8 md:p-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 blur-3xl rounded-full"></div>
             
             <h3 className="text-lg font-black text-white mb-8 uppercase tracking-widest flex items-center gap-3">
               <BadgeCheck className="h-5 w-5 text-primary-400" />
               Official Record Details
             </h3>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-2xl">
                    <Clock className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Incident Timestamp</p>
                    <p className="text-lg font-bold text-white mt-1">{new Date(fir.incident_date).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-2xl">
                    <MapPin className="h-6 w-6 text-rose-500/50" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Incident Location</p>
                    <p className="text-lg font-bold text-white mt-1">{fir.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-2xl">
                    <Shield className="h-6 w-6 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Assigned Station</p>
                    <p className="text-lg font-bold text-white mt-1">{fir.police_station_id || 'Jurisdiction HQ'}</p>
                  </div>
                </div>
             </div>

             <div className="space-y-4">
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Case Narrative & Testimony</label>
               <div className="p-8 bg-black/30 rounded-3xl text-gray-300 leading-relaxed border border-white/5 italic">
                  "{fir.description}"
               </div>
             </div>
          </div>

          {/* Evidence Section */}
          <div className="glass-card p-8 md:p-10">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
               <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                 <FileText className="h-5 w-5 text-emerald-400" />
                 Evidence & Documentation
               </h3>
               {canManageFir && (
                 <button 
                   onClick={() => setShowUploadModal(true)}
                   className="flex items-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all"
                 >
                   <Upload className="h-4 w-4 mr-2" />
                   UPLOAD FILE
                 </button>
               )}
             </div>

             {fir.evidences?.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {fir.evidences.map(ev => (
                   <div key={ev.id} className="flex justify-between items-center p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group">
                     <div className="flex items-center gap-4">
                       <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                         <FileText className="h-5 w-5" />
                       </div>
                       <div>
                         <p className="font-bold text-white text-sm leading-tight">{ev.title}</p>
                         <p className="text-[10px] text-gray-500 font-black uppercase mt-1">Ref: #{ev.id.toString().padStart(4, '0')}</p>
                       </div>
                     </div>
                     <a href={ev.file_path} className="p-2 text-gray-500 hover:text-emerald-400 transition-colors" target="_blank" rel="noreferrer">
                       <ExternalLink className="h-5 w-5" />
                     </a>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="py-12 text-center opacity-30 border-2 border-dashed border-white/10 rounded-3xl">
                  <FileText className="h-10 w-10 mx-auto mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">No evidence files linked</p>
               </div>
             )}
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          {/* Investigating Officers */}
          <div className="glass-card p-6 md:p-8">
             <h3 className="text-xs font-black text-gray-500 mb-6 uppercase tracking-[0.2em]">Investigation Team</h3>
             {fir.assignments?.length > 0 ? (
               <div className="space-y-6">
                 {fir.assignments.map(assignment => (
                   <div key={assignment.id} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl transition-all">
                     <div className="h-12 w-12 bg-primary-600/20 rounded-2xl flex items-center justify-center border border-primary-500/20">
                       <User className="h-6 w-6 text-primary-400" />
                     </div>
                     <div>
                       <p className="font-black text-white text-sm tracking-tight">{assignment.officer?.name}</p>
                       <p className="text-[10px] text-primary-500 font-bold uppercase mt-0.5">Assigned Investigator</p>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-6 opacity-30">
                 <p className="text-[10px] font-black uppercase tracking-widest">No active assignments</p>
               </div>
             )}
          </div>

          {/* Linked Court Case */}
          {fir.linked_case_id ? (
            <div className="glass-card p-8 !bg-primary-600/10 !border-primary-500/20 shadow-2xl shadow-primary-500/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary-600 text-white rounded-2xl">
                  <BadgeCheck className="h-6 w-6" />
                </div>
                <h3 className="font-black text-white uppercase tracking-widest text-sm">Case Referred</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">This FIR has been officially converted into a judicial proceeding.</p>
              <Link to={`/cases/${fir.linked_case_id}`} className="flex items-center justify-center w-full px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-xs transition-all shadow-xl shadow-primary-500/20">
                VIEW COURT CASE
              </Link>
            </div>
          ) : (
            canManageFir && fir.status === 'investigating' && (
              <div className="glass-card p-8 border-dashed border-2 border-white/10 !bg-transparent">
                 <p className="text-xs font-black text-gray-500 uppercase tracking-widest text-center mb-6">Internal Actions</p>
                 <button className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/10">
                    Refer to Court
                 </button>
              </div>
            )
          )}
        </div>
      </div>
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-8 relative">
            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Upload Evidence</h2>
            <form onSubmit={handleUploadEvidence} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Evidence Title</label>
                <input 
                  type="text" 
                  className="input bg-black/40 border-white/10"
                  value={uploadFormData.title}
                  onChange={e => setUploadFormData({...uploadFormData, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Select File</label>
                <input 
                  type="file" 
                  className="input bg-black/40 border-white/10"
                  onChange={e => setUploadFormData({...uploadFormData, file: e.target.files[0]})}
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 btn btn-secondary">CANCEL</button>
                <button type="submit" disabled={uploading} className="flex-1 btn btn-primary">
                  {uploading ? 'UPLOADING...' : 'UPLOAD'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirDetail;
