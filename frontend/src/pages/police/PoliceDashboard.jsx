import React, { useState, useEffect } from 'react';
import { Shield, FileText, AlertTriangle, CheckCircle, Clock, Video, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PoliceDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(() => {
    const cached = localStorage.getItem(`police_stats_${user?.id}`);
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(!stats);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/firs/stats');
      setStats(response.data);
      localStorage.setItem(`police_stats_${user?.id}`, JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to fetch police stats', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, link }) => (
    <Link to={link} className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-4 rounded-xl ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </Link>
  );

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="card h-28 bg-gray-100 dark:bg-gray-800/50"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Police Headquarters</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, Officer {user?.name}{(!user?.name?.includes('(')) ? ` (${user?.role === 'police' ? 'police' : user?.role})` : ''}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Shield}
          title="Total FIRs"
          value={stats?.total || 0}
          color="bg-blue-600"
          link="/firs"
        />
        <StatCard
          icon={AlertTriangle}
          title="Pending Investigations"
          value={stats?.pending || 0}
          color="bg-red-500"
          link="/firs?status=pending"
        />
        <StatCard
          icon={Clock}
          title="In Progress"
          value={stats?.investigating || 0}
          color="bg-orange-500"
          link="/firs?status=investigating"
        />
        <StatCard
          icon={CheckCircle}
          title="Closed Cases"
          value={stats?.closed || 0}
          color="bg-green-500"
          link="/firs?status=closed"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly FIR Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.monthly || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary-500" />
            Upcoming Court Hearings
          </h3>
          <div className="space-y-4">
            {stats?.upcoming_hearings?.length > 0 ? (
              stats.upcoming_hearings.map(hearing => (
                <div key={hearing.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">{hearing.case?.case_number}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(hearing.hearing_date).toLocaleDateString()} at {hearing.hearing_time}</p>
                    {hearing.is_online && (
                      <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">Virtual Session</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/hearings/${hearing.id}`} className="btn btn-secondary btn-sm">Details</Link>
                    {hearing.is_online && (
                      <button 
                        onClick={() => navigate(`/video-court/${hearing.id}`)}
                        className="btn btn-primary btn-sm px-4"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        JOIN
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming hearings scheduled.</p>
            )}
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent FIRs</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-sm font-medium text-gray-500">FIR No.</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Title</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats?.recent?.map(fir => (
                  <tr key={fir.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3">
                      <Link to={`/firs/${fir.id}`} className="text-primary-600 hover:underline">{fir.fir_number}</Link>
                    </td>
                    <td className="py-3 text-gray-900 dark:text-white">{fir.title}</td>
                    <td className="py-3">
                      <span className={`badge ${fir.status === 'pending' ? 'badge-warning' : fir.status === 'investigating' ? 'badge-info' : 'badge-success'}`}>
                        {fir.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoliceDashboard;
