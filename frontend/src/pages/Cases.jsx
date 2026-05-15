import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, Trash2, Scale, Briefcase } from 'lucide-react';
import Layout from '../components/common/Layout';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CaseRow = memo(({ caseItem, canEditDelete, getStatusBadge, getPriorityBadge, onDelete, userRole }) => (
  <tr className="hover:bg-white/5 transition-colors border-b border-white/5">
    <td className="py-4 px-4">
      <Link to={`/cases/${caseItem.id}`} className="text-primary-400 hover:text-primary-300 font-bold tracking-tight">
        {caseItem.case_number}
      </Link>
    </td>
    <td className="py-4 px-4">
      <div className="flex flex-col">
        <p className="text-gray-300 font-bold leading-tight">{caseItem.title}</p>
        <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter mt-1">{caseItem.case_type}</p>
      </div>
    </td>
    {userRole !== 'client' && (
      <td className="py-4 px-6 text-gray-400 text-sm font-medium">{caseItem.client?.name || 'N/A'}</td>
    )}
    <td className="py-4 px-4">
      <span className={`badge ${getStatusBadge(caseItem.status || 'pending')}`}>
        {(caseItem.status || 'pending').replace('_', ' ')}
      </span>
    </td>
    <td className="py-4 px-4">
      <span className={`badge ${getPriorityBadge(caseItem.priority || 'medium')}`}>
        {caseItem.priority || 'medium'}
      </span>
    </td>
    <td className="py-4 px-4 text-gray-500 text-sm">
      {caseItem.filing_date ? new Date(caseItem.filing_date).toLocaleDateString() : 'N/A'}
    </td>
    <td className="py-4 px-4 text-right">
      <div className="flex items-center justify-end space-x-1">
        <Link
          to={`/cases/${caseItem.id}`}
          className="p-2 text-primary-400 hover:bg-primary-500/10 rounded-xl transition-colors"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </Link>
        {canEditDelete && (
          <>
            <Link
              to={`/cases/${caseItem.id}/edit`}
              className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors"
              title="Edit Case"
            >
              <Edit className="h-4 w-4" />
            </Link>
            <button
              onClick={() => onDelete(caseItem.id)}
              className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              title="Archive Case"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </td>
  </tr>
));

const Cases = () => {
  const { user } = useAuth();
  const cacheKey = `cases_list_${user?.id}`;
  const cachedData = localStorage.getItem(cacheKey);

  const [cases, setCases] = useState(cachedData ? JSON.parse(cachedData) : []);
  const [loading, setLoading] = useState(!cachedData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });

  const fetchCases = useCallback(async () => {
    try {
      const params = {
        page: currentPage,
        search: searchTerm,
        status: statusFilter
      };
      const response = await api.get('/cases', { params });
      setCases(response.data.data);
      localStorage.setItem(cacheKey, JSON.stringify(response.data.data));
      setPagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, user?.id, cacheKey]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to archive this case?')) return;
    
    try {
      await api.delete(`/cases/${id}`);
      fetchCases();
    } catch (error) {
      console.error('Failed to archive case:', error);
    }
  };

  const getStatusBadge = useCallback((status) => {
    const classes = {
      filed: 'badge-info',
      pending: 'badge-warning',
      in_progress: 'badge-info',
      adjourned: 'badge-warning',
      closed: 'badge-success',
      dismissed: 'badge-danger',
    };
    return classes[status] || 'badge-info';
  }, []);

  const getPriorityBadge = useCallback((priority) => {
    const classes = {
      low: 'badge-success',
      medium: 'badge-info',
      high: 'badge-warning',
      urgent: 'badge-danger',
    };
    return classes[priority] || 'badge-info';
  }, []);

  const isClient = user?.role === 'client';
  const canCreate = ['super_admin', 'court_admin', 'clerk', 'judge'].includes(user?.role);
  const canEditDelete = ['super_admin', 'court_admin'].includes(user?.role);

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary-600 rounded-2xl shadow-2xl shadow-primary-500/20">
            <Scale className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Case Registry</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">Official Judicial Record Management System</p>
          </div>
        </div>
        {canCreate && (
          <Link to="/cases/create" className="flex items-center px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black shadow-2xl shadow-primary-500/40 transition-all transform hover:-translate-y-1">
            <Plus className="h-5 w-5 mr-2" />
            NEW FILING
          </Link>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by case number, title or petitioner..." 
              className="input pl-12 bg-black/20 border-white/10 focus:border-primary-500/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <div className="relative">
               <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
               <select
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 className="bg-black/40 border-white/10 text-white text-xs font-bold rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary-500/50"
               >
                 <option value="">All Status</option>
                 <option value="filed">Filed</option>
                 <option value="pending">Pending</option>
                 <option value="in_progress">In Progress</option>
                 <option value="adjourned">Adjourned</option>
                 <option value="closed">Closed</option>
                 <option value="dismissed">Dismissed</option>
               </select>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-6 py-4">Case Number</th>
                <th className="px-6 py-4">Case Details</th>
                {!isClient && <th className="px-6 py-4">Petitioner / Client</th>}
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Filing Date</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={isClient ? "6" : "7"} className="py-20 text-center">
                     <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                        <p className="text-xs font-black uppercase text-primary-400 tracking-widest">Accessing Registry...</p>
                     </div>
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={isClient ? "6" : "7"} className="py-20 text-center">
                    <div className="max-w-sm mx-auto opacity-50">
                      <Briefcase className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 font-bold text-lg">No cases found in registry</p>
                      <p className="text-gray-500 text-sm mt-1">Refine your search or check your clearance.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                cases.map(c => (
                  <CaseRow 
                    key={c.id} 
                    caseItem={c} 
                    isClient={isClient}
                    canEditDelete={canEditDelete}
                    getStatusBadge={getStatusBadge}
                    getPriorityBadge={getPriorityBadge}
                    onDelete={handleDelete}
                    userRole={user?.role}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.lastPage > 1 && (
          <div className="flex items-center justify-between p-6 bg-white/5 border-t border-white/5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Page {pagination.currentPage} of {pagination.lastPage}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white transition-all disabled:opacity-30"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.lastPage}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white transition-all disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cases;
