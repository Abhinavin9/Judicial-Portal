import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/common/Layout';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Download, Eye, UploadCloud, Search, Filter, Trash2, X, File, Shield } from 'lucide-react';

const DocumentRow = memo(({ doc, handleDownload, handleDelete, user, formatFileSize }) => (
  <tr className="hover:bg-white/5 transition-colors border-b border-white/5 group">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 group-hover:bg-primary-500/20 transition-all">
          <File className="h-5 w-5" />
        </div>
        <div className="ml-4">
          <div className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">{doc.title || 'Untitled Document'}</div>
          <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{doc.document_type || 'General'}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-white/5 text-primary-400 border border-white/10">
        {doc.case?.case_number || 'N/A'}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
      {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'N/A'}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-500 font-black">
      {formatFileSize(doc.file_size)}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <div className="flex items-center justify-end space-x-2">
        <button 
          onClick={() => handleDownload(doc.id, doc.file_name)} 
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          title="Download File"
        >
          <Download className="h-5 w-5" />
        </button>
        <button 
          onClick={() => handleDelete(doc.id)} 
          className="p-2 text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
          title="Delete Document"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </td>
  </tr>
));

const Documents = () => {
  const { user } = useAuth();
  const location = useLocation();
  const cacheKey = `documents_list_${user?.id}`;
  const cachedData = localStorage.getItem(cacheKey);

  const [documents, setDocuments] = useState(cachedData ? JSON.parse(cachedData) : []);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(!cachedData);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    case_id: '',
    document_type: 'evidence',
    description: '',
    file: null
  });

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await api.get('/documents');
      const data = response.data.data || response.data || [];
      setDocuments(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, cacheKey]);

  const fetchCases = useCallback(async () => {
    try {
      const response = await api.get('/cases', { params: { per_page: 100 }});
      setCases(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch cases for dropdown', error);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    if (['super_admin', 'lawyer', 'judge', 'clerk', 'client'].includes(user?.role)) {
      fetchCases();
    }

    // Handle auto-open upload modal from query params
    const params = new URLSearchParams(location.search);
    if (params.get('upload') === 'true') {
      setShowUploadModal(true);
      const caseId = params.get('case_id');
      if (caseId) {
        setFormData(prev => ({ ...prev, case_id: caseId }));
      }
    }
  }, [fetchDocuments, fetchCases, user?.role, location.search]);

  const handleDownload = async (docId, fileName) => {
    try {
      const response = await api.get(`/documents/${docId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Failed to download document', error);
      alert('Failed to download document');
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      setDocuments(documents.filter(d => d.id !== docId));
    } catch (error) {
      console.error('Failed to delete document', error);
      alert('Failed to delete document');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      setUploadError('Please select a file');
      return;
    }
    
    setUploading(true);
    setUploadError('');
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('case_id', formData.case_id);
    data.append('document_type', formData.document_type);
    data.append('description', formData.description);
    data.append('file', formData.file);
    
    try {
      await api.post('/documents', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setShowUploadModal(false);
      setFormData({
        title: '',
        case_id: '',
        document_type: 'evidence',
        description: '',
        file: null
      });
      fetchDocuments();
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => 
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doc.case?.case_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [documents, searchTerm]);

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Document Vault</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Secure management of judicial records and evidence</p>
        </div>
        <div className="flex items-center gap-4">
          {['super_admin', 'lawyer', 'judge', 'clerk', 'police', 'client'].includes(user?.role) && (
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black shadow-2xl shadow-primary-500/40 transition-all transform hover:-translate-y-1"
            >
              <UploadCloud className="h-5 w-5 mr-2" />
              UPLOAD FILE
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 h-5 w-5 transition-colors" />
          <input
            type="text"
            placeholder="Search by title, case number, or document type..."
            className="input pl-12 bg-black/20 border-white/10 focus:border-primary-500/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center px-6 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-bold border border-white/10 transition-all w-full md:w-auto">
           <Filter className="h-4 w-4 mr-2" />
           Filter Results
        </button>
      </div>

      {/* Document List */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-12 w-12 bg-white/5 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-1/4"></div>
                  <div className="h-3 bg-white/5 rounded w-1/6"></div>
                </div>
                <div className="h-8 w-20 bg-white/5 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-24 opacity-50">
            <div className="p-6 bg-white/5 inline-block rounded-full mb-6">
               <FileText className="h-12 w-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">No records found</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2 font-medium">Try refining your search or uploading a new document to this case.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                  <th className="px-6 py-4">Document Info</th>
                  <th className="px-6 py-4">Case Reference</th>
                  <th className="px-6 py-4">Date Uploaded</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDocs.map((doc) => (
                  <DocumentRow 
                    key={doc.id} 
                    doc={doc} 
                    handleDownload={handleDownload}
                    handleDelete={handleDelete}
                    user={user}
                    formatFileSize={formatFileSize}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card !bg-gray-950/90 !border-white/10 w-full max-w-lg p-8 shadow-2xl relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-600/10 blur-3xl rounded-full"></div>
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-600/20 rounded-xl">
                  <UploadCloud className="h-6 w-6 text-primary-400" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Upload Document</h2>
              </div>
              <button 
                onClick={() => setShowUploadModal(false)} 
                className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="space-y-6 relative z-10">
              {uploadError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-bold flex items-center gap-3">
                   <div className="h-2 w-2 bg-rose-500 rounded-full"></div>
                   {uploadError}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Document Title</label>
                <input 
                  type="text" 
                  className="input bg-black/40 border-white/10 focus:border-primary-500/50" 
                  placeholder="e.g. Evidence Item #42"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Select Case</label>
                  <select 
                    className="input bg-black/40 border-white/10 focus:border-primary-500/50" 
                    value={formData.case_id}
                    onChange={e => setFormData({...formData, case_id: e.target.value})}
                    required
                  >
                    <option value="">Choose a Case</option>
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>{c.case_number}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Type</label>
                  <select 
                    className="input bg-black/40 border-white/10 focus:border-primary-500/50" 
                    value={formData.document_type}
                    onChange={e => setFormData({...formData, document_type: e.target.value})}
                    required
                  >
                    {user?.role === 'client' ? (
                      <option value="evidence">Evidence</option>
                    ) : user?.role === 'lawyer' ? (
                      <>
                        <option value="evidence">Evidence</option>
                        <option value="petition">Petition</option>
                        <option value="affidavit">Affidavit</option>
                        <option value="written_statement">Written Statement</option>
                        <option value="other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="evidence">Evidence</option>
                        <option value="petition">Petition</option>
                        <option value="order">Order</option>
                        <option value="judgment">Judgment</option>
                        <option value="other">Other</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">File Attachment</label>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-white/10 hover:border-primary-500/30 bg-white/5 rounded-2xl p-8 text-center cursor-pointer transition-all group"
                >
                  <UploadCloud className="h-10 w-10 text-gray-500 group-hover:text-primary-400 mx-auto mb-4 transition-colors" />
                  <p className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                    {formData.file ? formData.file.name : 'Click to select or drag and drop'}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-2 font-bold uppercase tracking-tighter">PDF, DOC, JPG, PNG (Max 10MB)</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={e => setFormData({...formData, file: e.target.files[0]})}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required 
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl font-black transition-all"
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="flex-2 px-12 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black shadow-2xl shadow-primary-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'UPLOADING...' : 'SUBMIT FILING'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
