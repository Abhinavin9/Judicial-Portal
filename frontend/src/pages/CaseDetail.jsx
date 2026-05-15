import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, FileText, Clock, User, Scale, Download, ShieldCheck, Trash2 } from 'lucide-react';
import Layout from '../components/common/Layout';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCaseDetail();
  }, [id]);

  const fetchCaseDetail = async () => {
    try {
      const response = await api.get(`/cases/${id}`);
      setCaseData(response.data);
    } catch (error) {
      console.error('Failed to fetch case details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/cases/${id}`, { status: newStatus });
      fetchCaseDetail();
      // Clear dashboard cache
      localStorage.removeItem(`dashboard_stats_${user?.id}`);
      localStorage.removeItem(`cases_list_${user?.id}`);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      fetchCaseDetail();
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document');
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      filed: 'badge-info',
      pending: 'badge-warning',
      in_progress: 'badge-info',
      adjourned: 'badge-warning',
      closed: 'badge-success',
      dismissed: 'badge-danger',
    };
    return classes[status] || 'badge-info';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Case not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/cases')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {caseData.case_number}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{caseData.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={async () => {
              try {
                const response = await api.get(`/reports/case/${id}`, { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `case_report_${caseData.case_number}.pdf`);
                document.body.appendChild(link);
                link.click();
              } catch (error) {
                console.error('Download failed:', error);
              }
            }}
            className="btn btn-secondary flex items-center"
          >
            <FileText className="h-5 w-5 mr-2" />
            Download Case Record
          </button>
          {['super_admin', 'court_admin'].includes(user?.role) && (
            <Link to={`/cases/${id}/edit`} className="btn btn-primary flex items-center">
              <Edit className="h-5 w-5 mr-2" />
              Edit Case
            </Link>
          )}
        </div>
      </div>

      {/* Case Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-2">
            <Scale className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Status</h3>
          </div>
          <div className="flex flex-col space-y-3">
            <span className={`badge ${getStatusBadge(caseData.status)} text-sm w-fit`}>
              {caseData.status.replace('_', ' ')}
            </span>
            {(user?.role === 'super_admin' || user?.role === 'court_admin' || user?.role === 'clerk' || user?.role === 'judge') && (
              <select
                value={caseData.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="input py-1 text-xs"
              >
                <option value="filed">Filed</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="adjourned">Adjourned</option>
                <option value="closed">Closed</option>
                <option value="dismissed">Dismissed</option>
              </select>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-2">
            <User className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Client</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{caseData.client?.name || 'N/A'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">{caseData.client?.email || ''}</p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-2">
            <User className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Judge</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{caseData.judge?.name || 'Not Assigned'}</p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-2">
            <User className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Lawyer</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{caseData.lawyer?.name || 'Not Assigned'}</p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Filing Date</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {new Date(caseData.filing_date).toLocaleDateString()}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Priority</h3>
          </div>
          <span className={`badge badge-${caseData.priority === 'urgent' ? 'danger' : caseData.priority === 'high' ? 'warning' : 'info'}`}>
            {caseData.priority}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Description</h3>
        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{caseData.description}</p>
      </div>

      {/* Hearings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hearings</h3>
          {['super_admin', 'court_admin', 'clerk', 'judge'].includes(user?.role) && (
            <Link to={`/hearings/create?case_id=${id}`} className="btn btn-primary btn-sm">
              Schedule Hearing
            </Link>
          )}
        </div>
        {caseData.hearings && caseData.hearings.length > 0 ? (
          <div className="space-y-3">
            {caseData.hearings.map((hearing) => (
              <Link
                key={hearing.id}
                to={`/hearings/${hearing.id}`}
                className="block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{hearing.hearing_number}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(hearing.hearing_date).toLocaleDateString()} at {hearing.hearing_time}
                    </p>
                  </div>
                  <span className={`badge ${hearing.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                    {hearing.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No hearings scheduled</p>
        )}
      </div>

      {/* Documents */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Documents</h3>
          <Link to={`/documents?upload=true&case_id=${id}`} className="btn btn-primary btn-sm">
            Upload Document
          </Link>
        </div>
        {caseData.documents && caseData.documents.length > 0 ? (
          <div className="space-y-3">
            {caseData.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{doc.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {doc.document_type} • {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={async () => {
                      try {
                        const response = await api.get(`/documents/${doc.id}/download`, { responseType: 'blob' });
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', doc.file_name);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      } catch (error) {
                        console.error('Download failed:', error);
                        alert('Failed to download document');
                      }
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                    title="Delete Document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No documents uploaded</p>
        )}
      </div>

      {/* Linked FIR Section */}
      {caseData.fir && (
        <div className="card border-l-4 border-primary-500 bg-primary-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-600 rounded-xl shadow-lg shadow-primary-500/20">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Initial FIR Report</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reference: {caseData.fir.fir_number}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  const response = await api.get(`/reports/fir/${caseData.fir.id}`, { responseType: 'blob' });
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', `fir_report_${caseData.fir.fir_number}.pdf`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                } catch (error) {
                  console.error('FIR Download failed:', error);
                  alert('Failed to download FIR report');
                }
              }}
              className="btn btn-primary flex items-center shadow-xl shadow-primary-500/10"
            >
              <Download className="h-5 w-5 mr-2" />
              Download FIR
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Case Timeline</h3>
        {caseData.timeline && caseData.timeline.length > 0 ? (
          <div className="space-y-4">
            {caseData.timeline.map((event, index) => (
              <div key={event.id} className="flex">
                <div className="flex flex-col items-center mr-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full">
                    <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                  </div>
                  {index !== caseData.timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <p className="font-medium text-gray-900 dark:text-white">{event.action}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {new Date(event.created_at).toLocaleString()} by {event.user?.name || 'System'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No timeline events</p>
        )}
      </div>
    </div>
  );
};

export default CaseDetail;
