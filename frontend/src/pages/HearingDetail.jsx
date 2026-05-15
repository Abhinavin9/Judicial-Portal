import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Calendar, Clock, MapPin, User } from 'lucide-react';
import api from '../services/api';

const HearingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hearing, setHearing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHearingDetail();
  }, [id]);

  const fetchHearingDetail = async () => {
    try {
      const response = await api.get(`/hearings/${id}`);
      setHearing(response.data);
    } catch (error) {
      console.error('Failed to fetch hearing details:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!hearing) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Hearing not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/hearings')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {hearing.hearing_number}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Case: {hearing.case?.case_number}
            </p>
          </div>
        </div>
        {hearing.is_online && hearing.status === 'scheduled' && (
          <button
            onClick={() => navigate(`/video-court/${hearing.id}`)}
            className="btn btn-primary"
          >
            <Video className="h-5 w-5 mr-2" />
            Join Virtual Courtroom
          </button>
        )}
      </div>

      {/* Hearing Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Date</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {new Date(hearing.hearing_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Time</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {hearing.hearing_time} ({hearing.duration_minutes} minutes)
          </p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-2">
            <MapPin className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Location</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {hearing.is_online ? 'Online (Video Conference)' : hearing.room_number || 'TBD'}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-2">
            <User className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Judge</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{hearing.judge?.name || 'N/A'}</p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Type</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 capitalize">
            {hearing.hearing_type.replace('_', ' ')}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Status</h3>
          </div>
          <span className={`badge ${getStatusBadge(hearing.status)}`}>
            {hearing.status}
          </span>
        </div>
      </div>

      {/* Case Details */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Case Details
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Case Number</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {hearing.case?.case_number}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Case Title</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {hearing.case?.title}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">Case Type</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {hearing.case?.case_type}
            </span>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Participants
        </h3>
        {hearing.participants && hearing.participants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hearing.participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{participant.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {participant.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No participants listed</p>
        )}
      </div>

      {/* Notes */}
      {hearing.notes && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notes
          </h3>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {hearing.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default HearingDetail;
