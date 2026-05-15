import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Video, PhoneOff, Users } from 'lucide-react';

const VideoCourt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hearing, setHearing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  useEffect(() => {
    fetchHearing();
    
    // Cleanup jitsi instance on unmount
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, [id]);

  const fetchHearing = async () => {
    try {
      const response = await api.get(`/hearings/${id}`);
      setHearing(response.data.data || response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch hearing:', err);
      setError('Failed to load hearing details or you do not have permission to access it.');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only initialize Jitsi when hearing is loaded and container is ready
    if (!loading && hearing && jitsiContainerRef.current && !jitsiApiRef.current) {
      initJitsi();
    }
  }, [loading, hearing]);

  const initJitsi = () => {
    const domain = 'meet.jit.si';
    // Generate a unique room name based on hearing ID and case number
    const roomName = `JudicialPortal_Hearing_${hearing.id}_${hearing.case?.case_number?.replace(/[^a-zA-Z0-9]/g, '') || 'Room'}`;
    
    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: user.name,
        email: user.email
      },
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        prejoinPageEnabled: false, // Skip prejoin since they are already in the portal
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', 'settings',
          'raisehand', 'videoquality', 'filmstrip', 'tileview'
        ],
      },
    };

    // Make sure Jitsi Meet API script is loaded. Since we don't want to mess with index.html directly,
    // we dynamically inject it if not present.
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = `https://${domain}/external_api.js`;
      script.async = true;
      script.onload = () => {
        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
        setupJitsiEvents();
      };
      document.body.appendChild(script);
    } else {
      jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
      setupJitsiEvents();
    }
  };

  const setupJitsiEvents = () => {
    if (!jitsiApiRef.current) return;

    jitsiApiRef.current.addEventListeners({
      videoConferenceJoined: handleUserJoin,
      videoConferenceLeft: handleUserLeave,
    });
  };

  const handleUserJoin = () => {
    console.log('Joined video court');
  };

  const handleUserLeave = () => {
    navigate('/hearings');
  };

  const leaveRoom = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    navigate('/hearings');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing Virtual Courtroom...</p>
        </div>
      </div>
    );
  }

  if (error || !hearing) {
    return (
      <div className="card text-center py-12">
        <div className="text-red-500 mb-4">
          <Video className="h-12 w-12 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Accessing Virtual Court</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Hearing not found'}</p>
        <button onClick={() => navigate('/hearings')} className="btn btn-primary">
          Return to Hearings
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in relative z-10">
      {/* Header */}
      <div className="glass-card !bg-gray-950/80 !border-white/10 rounded-t-2xl p-6 flex flex-col sm:flex-row justify-between items-center shrink-0 shadow-2xl">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="p-3 bg-primary-600 rounded-xl mr-4 shadow-lg shadow-primary-500/20">
            <Video className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Virtual Court: {hearing.case?.case_number}</h1>
            <p className="text-sm text-gray-400 font-medium">
              Presiding: <span className="text-primary-400">{hearing.judge?.name || 'Assigned Judge'}</span>
            </p>
          </div>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-bold">
            <div className="h-2 w-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
            IN SESSION
          </div>
          <button 
            onClick={leaveRoom}
            className="flex items-center px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-lg shadow-red-500/30 font-bold"
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            Leave Court
          </button>
        </div>
      </div>

      {/* Jitsi Container */}
      <div 
        ref={jitsiContainerRef} 
        className="flex-grow bg-black/40 backdrop-blur-sm rounded-b-2xl overflow-hidden shadow-2xl border-x border-b border-white/10"
      />
    </div>
  );
};

export default VideoCourt;
