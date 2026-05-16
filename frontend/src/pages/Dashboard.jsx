import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { Briefcase, Calendar, FileText, Users, TrendingUp, Clock, Bell, Video, Scale } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  
  const getFormattedName = useCallback(() => {
    if (!user?.name) return 'User';
    if (user.name.includes('(')) return user.name;
    
    const roleMap = {
      'super_admin': 'Admin',
      'court_admin': 'Admin',
      'judge': 'Judge',
      'lawyer': 'Lawyer',
      'police': 'Police',
      'client': 'Client'
    };
    
    const roleLabel = roleMap[user.role] || user.role.replace('_', ' ');
    return `${user.name} (${roleLabel})`;
  }, [user]);
  const cacheKey = `dashboard_stats_${user?.id}`;
  const cachedData = localStorage.getItem(cacheKey);
  
  const [stats, setStats] = useState(cachedData ? JSON.parse(cachedData) : null);
  const [loading, setLoading] = useState(!cachedData);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get('/dashboard');
      setStats(response.data);
      localStorage.setItem(cacheKey, JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, cacheKey]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const COLORS = useMemo(() => ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'], []);

  const StatCard = memo(({ icon: Icon, title, value, subtitle, color, link }) => (
    <Link to={link} className="glass-card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-2xl shadow-lg ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </Link>
  ));

  const monthlyCasesData = useMemo(() => stats?.monthly_cases || [], [stats?.monthly_cases]);
  const casesByStatusData = useMemo(() => stats?.case_by_status || [], [stats?.case_by_status]);
  const recentActivityData = useMemo(() => stats?.recent_activity || [], [stats?.recent_activity]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-1/3 bg-white/20 dark:bg-gray-800/20 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/20 dark:bg-gray-800/20 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white/20 dark:bg-gray-800/20 rounded-2xl"></div>
          <div className="h-80 bg-white/20 dark:bg-gray-800/20 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const renderRoleDashboard = () => {
    switch (user?.role) {
      case 'super_admin':
      case 'court_admin':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={Users} title="Total Users" value={stats?.users?.total || 0} subtitle="Across all roles" color="bg-indigo-600" link="/users" />
              <StatCard icon={Briefcase} title="Total Cases" value={stats?.cases?.total || 0} subtitle={`${stats?.cases?.this_month || 0} new this month`} color="bg-blue-600" link="/cases" />
              <StatCard icon={Calendar} title="Today's Hearings" value={stats?.hearings?.today || 0} subtitle="Scheduled today" color="bg-rose-600" link="/hearings" />
              <StatCard icon={FileText} title="FIRs Filed" value={stats?.firs?.total || 0} subtitle="Pending review" color="bg-slate-700" link="/firs" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Court Analytics</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyCasesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }} />
                    <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Case Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={casesByStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="count">
                      {casesByStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case 'judge':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={Briefcase} title="Assigned Cases" value={stats?.cases?.total || 0} subtitle="Active litigation" color="bg-blue-700" link="/cases" />
              <StatCard icon={Calendar} title="Upcoming Hearings" value={stats?.hearings?.upcoming || 0} subtitle="Next 7 days" color="bg-indigo-700" link="/hearings" />
              <StatCard icon={Clock} title="Pending Verdicts" value={stats?.cases?.pending_verdict || 0} subtitle="Requires action" color="bg-amber-600" link="/cases?status=pending" />
              <StatCard icon={FileText} title="New Evidence" value={stats?.documents?.new || 0} subtitle="Unreviewed files" color="bg-emerald-600" link="/documents" />
            </div>
            {/* Judge specific section */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Today's Court Schedule</h3>
              <div className="space-y-4">
                {stats?.hearings?.today_list?.length > 0 ? (
                  stats.hearings.today_list.map((h) => (
                    <div key={h.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-600/20 rounded-lg">
                          <Clock className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{h.hearing_time}</p>
                          <p className="text-sm text-gray-500">{h.case?.case_number} - {h.case?.title}</p>
                        </div>
                      </div>
                      <Link to={`/video-court/${h.id}`} className="btn btn-primary flex items-center">
                        <Video className="h-4 w-4 mr-2" />
                        Start Session
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No hearings scheduled for today.</p>
                )}
              </div>
            </div>
          </div>
        );
      case 'lawyer':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={Briefcase} title="My Clients" value={stats?.cases?.total || 0} subtitle="Represented cases" color="bg-emerald-600" link="/cases" />
              <StatCard icon={Calendar} title="My Hearings" value={stats?.hearings?.upcoming || 0} subtitle="Scheduled appearances" color="bg-teal-600" link="/hearings" />
              <StatCard icon={FileText} title="Documents Uploaded" value={stats?.documents?.total || 0} subtitle="Total filings" color="bg-cyan-600" link="/documents" />
              <StatCard icon={Bell} title="Recent Updates" value={stats?.notifications?.unread || 0} subtitle="Unread notifications" color="bg-indigo-600" link="/notifications" />
            </div>
            {/* Lawyer specific section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upcoming Hearings</h3>
                <div className="divide-y divide-white/10">
                  {stats?.hearings?.upcoming_list?.map((h) => (
                    <div key={h.id} className="py-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{new Date(h.hearing_date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">{h.case?.case_number}</p>
                      </div>
                      <span className="badge badge-info">{h.hearing_type}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Client Activity</h3>
                <div className="space-y-4">
                   {/* Recent Activity List */}
                </div>
              </div>
            </div>
          </div>
        );
      case 'client':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard icon={Briefcase} title="My Cases" value={stats?.cases?.total || 0} subtitle="Ongoing litigation" color="bg-amber-600" link="/cases" />
              <StatCard icon={Calendar} title="Next Hearing" value={stats?.hearings?.next || 'None'} subtitle="Date & Time" color="bg-orange-600" link="/hearings" />
              <StatCard icon={FileText} title="My Documents" value={stats?.documents?.total || 0} subtitle="Total uploads" color="bg-yellow-600" link="/documents" />
            </div>
            <div className="glass-card p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Case Status Overview</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Stay updated with your case progress and upcoming court appearances.</p>
              <div className="flex justify-center space-x-4">
                <Link to="/cases" className="btn btn-primary px-8">View Cases</Link>
                <Link to="/hearings" className="btn btn-secondary px-8">My Schedule</Link>
              </div>
            </div>
          </div>
        );
      case 'police':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={FileText} title="FIRs Filed" value={stats?.firs?.total || 0} subtitle="Total registrations" color="bg-slate-700" link="/firs" />
              <StatCard icon={Clock} title="Pending Investigation" value={stats?.firs?.pending || 0} subtitle="Requires attention" color="bg-zinc-700" link="/firs?status=pending" />
              <StatCard icon={Briefcase} title="Court Referred" value={stats?.firs?.court_referred || 0} subtitle="Linked with cases" color="bg-blue-800" link="/firs?status=court_referred" />
              <StatCard icon={Users} title="Criminal Records" value={stats?.criminals?.total || 0} subtitle="Managed profiles" color="bg-neutral-800" link="/firs" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">FIR Filing Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats?.monthly_firs || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: 'none', borderRadius: '12px', color: '#fff' }} />
                    <Bar dataKey="count" fill="#334155" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent FIRs</h3>
                {/* List of recent FIRs */}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Judicial Overview</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium italic">Welcome back, {getFormattedName()}</p>
        </div>
        <div className="flex items-center gap-4 p-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
          <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Current Session</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {renderRoleDashboard()}

      {(user?.role === 'super_admin' || user?.role === 'court_admin') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card overflow-hidden border border-white/10 shadow-2xl">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Recent Judicial Actions</h3>
                <Link to="/cases" className="text-xs font-black text-primary-400 uppercase tracking-widest hover:text-primary-300 transition-colors">View All Cases</Link>
              </div>
              <div className="p-0">
                {stats?.recent_cases?.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {stats.recent_cases.map((c) => (
                      <div key={c.id} className="p-6 hover:bg-white/5 transition-all group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gray-900 flex items-center justify-center text-primary-500 border border-white/10 group-hover:scale-110 transition-transform">
                              <Scale className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-primary-400 transition-colors">{c.case_number}</p>
                              <p className="text-xs text-gray-500 font-medium mt-1">{c.title}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`badge ${
                              c.status === 'filed' ? 'badge-info' : 
                              c.status === 'pending' ? 'badge-warning' : 
                              'badge-success'
                            } px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest`}>
                              {c.status.replace('_', ' ')}
                            </span>
                            <p className="text-[10px] text-gray-600 mt-2 font-bold">{new Date(c.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-20 text-center">
                    <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Scale className="h-10 w-10 text-gray-600" />
                    </div>
                    <p className="text-gray-500 font-bold">No recent case activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass-card p-8 border border-white/10 shadow-2xl bg-primary-600/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary-500/30 transition-all"></div>
              <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest relative z-10">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4 relative z-10">
                <Link to="/cases/create" className="flex items-center p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group/btn">
                  <Briefcase className="h-5 w-5 text-primary-400 mr-4 group-hover/btn:scale-125 transition-transform" />
                  <span className="text-xs font-black text-white uppercase tracking-widest">Register New Case</span>
                </Link>
                <Link to="/documents" className="flex items-center p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group/btn">
                  <FileText className="h-5 w-5 text-emerald-400 mr-4 group-hover/btn:scale-125 transition-transform" />
                  <span className="text-xs font-black text-white uppercase tracking-widest">E-File Document</span>
                </Link>
                <Link to="/hearings" className="flex items-center p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group/btn">
                  <Video className="h-5 w-5 text-amber-400 mr-4 group-hover/btn:scale-125 transition-transform" />
                  <span className="text-xs font-black text-white uppercase tracking-widest">Join Virtual Court</span>
                </Link>
              </div>
            </div>

            <div className="glass-card p-8 border border-white/10 shadow-2xl">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest">Identity Profile</h3>
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white text-2xl font-black shadow-xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{getFormattedName()}</p>
                  {!user?.name?.includes('(') && (
                    <p className="text-xs text-primary-500 font-black uppercase tracking-[0.2em] mt-1">{user?.role?.replace('_', ' ')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
