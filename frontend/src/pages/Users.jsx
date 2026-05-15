import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, Trash2, UserPlus, Shield, Scale, User as UserIcon, Briefcase, Calendar, CheckCircle2, XCircle, Users as UsersGroup } from 'lucide-react';
import Layout from '../components/common/Layout';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const UserRow = memo(({ userItem, onEdit, onDelete }) => (
  <tr className="hover:bg-white/5 transition-colors border-b border-white/5 group">
    <td className="py-4 px-6">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold border ${
          userItem.role === 'judge' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
          userItem.role === 'lawyer' ? 'bg-primary-500/10 text-primary-500 border-primary-500/20' :
          userItem.role === 'police' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
          'bg-gray-500/10 text-gray-400 border-white/10'
        }`}>
          {userItem.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-white font-bold tracking-tight">{userItem.name}</p>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">
            {userItem.role === 'lawyer' ? `BAR: ${userItem.bar_number || 'N/A'}` : 
             userItem.role === 'judge' ? `CRT: ${userItem.court_id || 'N/A'}` : 
             `ID: #${userItem.id.toString().padStart(4, '0')}`}
          </p>
        </div>
      </div>
    </td>
    <td className="py-4 px-6">
      <div className="space-y-1">
        <p className="text-gray-300 text-sm font-medium">{userItem.email}</p>
        <p className="text-[10px] text-gray-500 font-black">{userItem.phone || 'NO PHONE'}</p>
      </div>
    </td>
    <td className="py-4 px-6">
      <div className="flex items-center gap-2">
        {userItem.role === 'judge' && <Scale className="h-3 w-3 text-amber-500" />}
        {userItem.role === 'lawyer' && <Briefcase className="h-3 w-3 text-primary-500" />}
        {userItem.role === 'police' && <Shield className="h-3 w-3 text-blue-500" />}
        {userItem.role === 'super_admin' && <Shield className="h-3 w-3 text-rose-500" />}
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
          {userItem.role.replace('_', ' ')}
        </span>
      </div>
    </td>
    <td className="py-4 px-6">
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Registered</span>
        <span className="text-xs text-gray-300 font-bold mt-1">
          {new Date(userItem.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </td>
    <td className="py-4 px-6">
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
        userItem.is_active 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
      }`}>
        {userItem.is_active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        {userItem.is_active ? 'Active' : 'Inactive'}
      </div>
    </td>
    <td className="py-4 px-6 text-right">
      <div className="flex items-center justify-end space-x-2">
        <button
          onClick={() => onEdit(userItem.id)}
          className="p-2 text-primary-400 hover:bg-primary-500/10 rounded-xl transition-colors border border-transparent hover:border-primary-500/20"
          title="Edit Record"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(userItem.id)}
          className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"
          title="Delete Record"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </td>
  </tr>
));

const Users = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const cacheKey = `users_list_${currentUser?.id}`;
  const cachedData = localStorage.getItem(cacheKey);

  const [users, setUsers] = useState(cachedData ? JSON.parse(cachedData) : []);
  const [loading, setLoading] = useState(!cachedData);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });

  const roles = [
    { id: 'all', name: 'All Personnel', icon: UsersGroup },
    { id: 'judge', name: 'Judges', icon: Scale },
    { id: 'lawyer', name: 'Lawyers', icon: Briefcase },
    { id: 'client', name: 'Clients', icon: UserIcon },
    { id: 'police', name: 'Police', icon: Shield },
  ];

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/users', {
        params: {
          page: currentPage,
          search,
          role: activeTab === 'all' ? '' : activeTab,
        }
      });
      setUsers(response.data.data);
      localStorage.setItem(cacheKey, JSON.stringify(response.data.data));
      setPagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, activeTab, cacheKey]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm('CRITICAL ACTION: Are you sure you want to permanently delete this user record? This cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            Identity Management
          </h1>
          <p className="text-gray-500 font-bold mt-1 uppercase text-[10px] tracking-[0.4em]">
            Central Judicial Personnel Registry
          </p>
        </div>
        <button 
          onClick={() => navigate('/users/create')}
          className="btn btn-primary flex items-center gap-3 px-8 py-4 shadow-2xl shadow-primary-600/30 group"
        >
          <UserPlus className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="font-black uppercase tracking-widest text-[11px]">Enroll New Personnel</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-1">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              onClick={() => {
                setActiveTab(role.id);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-6 py-4 rounded-t-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                activeTab === role.id 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20 border-b-2 border-white' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === role.id && <Icon className="h-3 w-3" />}
              {role.name}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 border border-white/5 bg-black/20">
        <div className="flex-1 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
          <input
            type="text"
            placeholder={`Search within ${activeTab === 'all' ? 'all users' : activeTab + 's'}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border-0 text-white rounded-2xl pl-14 pr-6 py-5 text-sm font-bold focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-gray-700"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="glass-card overflow-hidden border border-white/5 shadow-2xl bg-black/10">
        {loading ? (
          <div className="p-24 flex flex-col items-center">
            <div className="h-14 w-14 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] mt-8 animate-pulse">Syncing Registry...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-32 text-center">
            <div className="h-20 w-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/5">
              <UserIcon className="h-10 w-10 text-gray-700" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">No Personnel Found</h3>
            <p className="text-gray-500 mt-2 font-bold max-w-xs mx-auto">No identity records match the current filter criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="py-6 px-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Identity / Credentials</th>
                    <th className="py-6 px-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Contact Points</th>
                    <th className="py-6 px-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Authority Role</th>
                    <th className="py-6 px-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Timeline</th>
                    <th className="py-6 px-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Clearance</th>
                    <th className="py-6 px-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => (
                    <UserRow 
                      key={u.id} 
                      userItem={u} 
                      onEdit={(id) => navigate(`/users/${id}/edit`)}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.lastPage > 1 && (
              <div className="p-8 flex flex-col sm:flex-row items-center justify-between bg-black/20 gap-6">
                <div className="flex flex-col">
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Registry Coverage</p>
                  <p className="text-sm font-bold text-gray-400 mt-1">
                    Viewing {((currentPage - 1) * 15) + 1} - {Math.min(currentPage * 15, pagination.total)} of {pagination.total} records
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all border border-white/10"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(pagination.lastPage, prev + 1))}
                    disabled={currentPage === pagination.lastPage}
                    className="px-8 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-xl shadow-primary-600/30"
                  >
                    Next Page
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Users;
