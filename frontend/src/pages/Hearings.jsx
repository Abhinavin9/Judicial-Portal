import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar as CalendarIcon, Eye, Edit, Video, Clock, MapPin } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Layout from '../components/common/Layout';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const HearingItem = memo(({ hearing, getStatusBadge }) => (
  <div className="group glass-card p-4 hover:shadow-2xl transition-all duration-300 border border-white/5 hover:border-primary-500/30">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-primary-600/10 rounded-xl">
          <Clock className="h-6 w-6 text-primary-400" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-black text-gray-900 dark:text-white tracking-tight">{hearing.hearing_time || 'TBD'}</h4>
            <span className={`badge ${getStatusBadge(hearing.status || 'scheduled')} text-[10px]`}>{hearing.status || 'scheduled'}</span>
          </div>
          <p className="text-sm text-primary-400 font-bold mt-1">{hearing.case?.case_number || 'No Case Ref'}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {hearing.location || 'Virtual Courtroom'}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2 self-end sm:self-center">
        <Link
          to={`/hearings/${hearing.id}`}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          title="View Details"
        >
          <Eye className="h-5 w-5" />
        </Link>
        {hearing.is_online && (
          <Link
            to={`/video-court/${hearing.id}`}
            className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Video className="h-4 w-4 mr-2" />
            JOIN COURT
          </Link>
        )}
      </div>
    </div>
  </div>
));

const Hearings = () => {
  const { user } = useAuth();
  const cachedData = localStorage.getItem(`hearings_list_${user?.id}`);
  const [hearings, setHearings] = useState(cachedData ? JSON.parse(cachedData) : []);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(!cachedData);

  const fetchHearings = useCallback(async () => {
    try {
      const response = await api.get('/hearings', {
        params: {
          start_date: view === 'calendar' ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toISOString().split('T')[0] : undefined,
          end_date: view === 'calendar' ? new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).toISOString().split('T')[0] : undefined,
        }
      });
      const data = response.data.data || response.data || [];
      setHearings(data);
      localStorage.setItem(`hearings_list_${user?.id}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to fetch hearings:', error);
    } finally {
      setLoading(false);
    }
  }, [view, selectedDate, user?.id]);

  const getHearingsForDate = useCallback((date) => {
    const dateString = date.toISOString().split('T')[0];
    return hearings.filter(h => h.hearing_date?.split(' ')[0] === dateString || h.hearing_date?.split('T')[0] === dateString);
  }, [hearings]);

  useEffect(() => {
    fetchHearings();
  }, [fetchHearings]);

  const getStatusBadge = (status) => {
    const classes = {
      scheduled: 'badge-info',
      in_progress: 'badge-warning',
      completed: 'badge-success',
      cancelled: 'badge-danger',
      rescheduled: 'badge-warning',
    };
    return classes[status] || 'badge-info';
  };

  const tileContent = useCallback(({ date, view }) => {
    if (view === 'month') {
      const dayHearings = getHearingsForDate(date);
      if (dayHearings.length > 0) {
        return (
          <div className="flex justify-center mt-1">
            <div className="h-1.5 w-1.5 bg-primary-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
          </div>
        );
      }
    }
    return null;
  }, [getHearingsForDate]);

  const canCreate = ['super_admin', 'court_admin', 'clerk'].includes(user?.role);

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Court Hearings</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">View and manage scheduled judicial proceedings</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex p-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl">
            <button
              onClick={() => setView('list')}
              className={`flex items-center px-6 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm ${view === 'list' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-gray-400 hover:text-white'}`}
            >
              List View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center px-6 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm ${view === 'calendar' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-gray-400 hover:text-white'}`}
            >
              Calendar
            </button>
          </div>
          {canCreate && (
            <Link to="/hearings/create" className="flex items-center px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black shadow-2xl shadow-primary-500/40 transition-all transform hover:-translate-y-1">
              <Plus className="h-5 w-5 mr-2" />
              SCHEDULE
            </Link>
          )}
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2 glass-card p-8 border border-white/10 shadow-2xl overflow-hidden">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={tileContent}
              className="judicial-calendar"
            />
          </div>

          {/* Selected Date Hearings */}
          <div className="flex flex-col space-y-6">
            <div className="glass-card p-6 border-l-4 border-l-primary-500 !bg-primary-500/5">
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <p className="text-sm text-gray-500 mt-1 uppercase font-black tracking-tighter">Day Schedule</p>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-50">
                  <div className="h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-black uppercase text-primary-400 tracking-widest">Updating...</p>
                </div>
              ) : (
                <>
                  {getHearingsForDate(selectedDate).length > 0 ? (
                    getHearingsForDate(selectedDate).map((hearing) => (
                      <HearingItem 
                        key={hearing.id} 
                        hearing={hearing} 
                        getStatusBadge={getStatusBadge} 
                      />
                    ))
                  ) : (
                    <div className="glass-card p-12 text-center border-dashed border-2 border-white/10 !bg-transparent">
                      <CalendarIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 font-bold">No hearings for this date</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-32 bg-white/5 animate-pulse rounded-2xl border border-white/10"></div>
                ))}
             </div>
          ) : hearings.length === 0 ? (
            <div className="glass-card p-20 text-center">
               <CalendarIcon className="h-16 w-16 text-gray-600 mx-auto mb-6" />
               <h3 className="text-2xl font-black text-white mb-2 tracking-tight">No Hearings Found</h3>
               <p className="text-gray-500 max-w-md mx-auto font-medium">There are currently no judicial proceedings scheduled in the system for your profile.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hearings.map((hearing) => (
                <HearingItem 
                  key={hearing.id} 
                  hearing={hearing} 
                  getStatusBadge={getStatusBadge} 
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Hearings;
