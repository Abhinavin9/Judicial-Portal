import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Video, MapPin } from 'lucide-react';
import Layout from '../components/common/Layout';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const HearingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    case_id: '',
    hearing_date: new Date().toISOString().split('T')[0],
    hearing_time: '10:00',
    hearing_type: 'pre_trial',
    room_number: '',
    judge_id: user?.role === 'judge' ? user.id : '',
    notes: '',
    duration_minutes: 60,
    is_online: true,
    participant_ids: [],
  });

  const [cases, setCases] = useState([]);
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Access control checks
    if (!['super_admin', 'court_admin', 'clerk', 'judge'].includes(user?.role)) {
      navigate('/hearings');
      return;
    }

    fetchFormData();
    if (isEdit) {
      fetchHearingDetail();
    }
  }, [id, user, navigate, isEdit]);

  const fetchFormData = async () => {
    try {
      const [casesRes, judgesRes] = await Promise.all([
        api.get('/cases', { params: { per_page: 100 } }),
        api.get('/users/judges'),
      ]);
      setCases(casesRes.data.data || casesRes.data || []);
      setJudges(judgesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch form data:', error);
    } finally {
      setFetching(false);
    }
  };

  const fetchHearingDetail = async () => {
    try {
      const response = await api.get(`/hearings/${id}`);
      const data = response.data;
      setFormData({
        case_id: data.case_id || '',
        hearing_date: data.hearing_date || '',
        hearing_time: data.hearing_time || '',
        hearing_type: data.hearing_type || 'pre_trial',
        room_number: data.room_number || '',
        judge_id: data.judge_id || '',
        notes: data.notes || '',
        duration_minutes: data.duration_minutes || 60,
        is_online: data.is_online || false,
        participant_ids: data.participants?.map(p => p.id) || [],
      });
    } catch (error) {
      console.error('Failed to fetch hearing details:', error);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await api.put(`/hearings/${id}`, formData);
      } else {
        await api.post('/hearings', formData);
      }
      navigate('/hearings');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save hearing');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/hearings')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Hearing' : 'Schedule Hearing'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEdit ? 'Update hearing information' : 'Set up a new in-person or virtual court session'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="label">Select Case *</label>
            <select
              name="case_id"
              value={formData.case_id}
              onChange={handleChange}
              className="input"
              required
              disabled={isEdit}
            >
              <option value="">-- Choose a Case --</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.case_number} - {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="label">Date *</label>
            <div className="flex gap-2">
              <input
                type="date"
                name="hearing_date"
                value={formData.hearing_date}
                onChange={handleChange}
                className="input flex-1"
                required
              />
              <button type="button" className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white transition-all hover:bg-primary-600 hover:border-primary-500">OK</button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="label">Time *</label>
            <div className="flex gap-2">
              <input
                type="time"
                name="hearing_time"
                value={formData.hearing_time}
                onChange={handleChange}
                className="input flex-1"
                required
              />
              <button type="button" className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white transition-all hover:bg-primary-600 hover:border-primary-500">OK</button>
            </div>
          </div>

          <div>
            <label className="label">Hearing Type *</label>
            <select
              name="hearing_type"
              value={formData.hearing_type}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="pre_trial">Pre-Trial</option>
              <option value="trial">Trial</option>
              <option value="bail">Bail</option>
              <option value="motion">Motion</option>
              <option value="final">Final Hearing</option>
            </select>
          </div>

          {user?.role !== 'judge' && (
            <div>
              <label className="label">Assigned Judge *</label>
              <select
                name="judge_id"
                value={formData.judge_id}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="">-- Select Judge --</option>
                {judges.map((judge) => (
                  <option key={judge.id} value={judge.id}>
                    {judge.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="md:col-span-2 mt-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <label className="flex items-center space-x-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                name="is_online"
                checked={formData.is_online}
                onChange={handleChange}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="font-medium text-gray-900 dark:text-white flex items-center">
                <Video className="h-5 w-5 mr-2 text-primary-500" />
                Virtual Court Session (Jitsi Meet)
              </span>
            </label>

            {!formData.is_online && (
              <div className="animate-fade-in pl-8">
                <label className="label flex items-center">
                  <MapPin className="h-4 w-4 mr-1" /> Physical Room Number
                </label>
                <input
                  type="text"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Court Room 4B"
                />
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="label">Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input min-h-[100px]"
              placeholder="Instructions for participants, docket references, etc."
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate('/hearings')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                {isEdit ? 'Update Hearing' : 'Schedule Hearing'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HearingForm;
