import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Layout from '../components/common/Layout';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    case_type: '',
    description: '',
    filing_date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    status: 'filed',
    client_id: '',
    assigned_judge_id: user?.role === 'judge' ? user.id : '',
    assigned_lawyer_id: user?.role === 'lawyer' ? user.id : '',
  });

  const [judges, setJudges] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Access control checks
    if (isEdit) {
      if (!['super_admin', 'court_admin', 'judge'].includes(user?.role)) {
        navigate('/cases');
        return;
      }
    } else {
      if (!['super_admin', 'court_admin', 'clerk', 'judge'].includes(user?.role)) {
        navigate('/cases');
        return;
      }
    }

    fetchUsers();
    if (isEdit) {
      fetchCaseDetail();
    }
  }, [id, user, navigate, isEdit]);

  const fetchUsers = async () => {
    try {
      const [judgesRes, lawyersRes, clientsRes] = await Promise.all([
        api.get('/users/judges'),
        api.get('/users/lawyers'),
        api.get('/users/clients'),
      ]);
      setJudges(judgesRes.data);
      setLawyers(lawyersRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchCaseDetail = async () => {
    try {
      const response = await api.get(`/cases/${id}`);
      const caseData = response.data;
      setFormData({
        title: caseData.title,
        case_type: caseData.case_type,
        description: caseData.description,
        filing_date: caseData.filing_date,
        priority: caseData.priority,
        status: caseData.status,
        client_id: caseData.client_id || '',
        assigned_judge_id: caseData.assigned_judge_id || '',
        assigned_lawyer_id: caseData.assigned_lawyer_id || '',
      });
    } catch (error) {
      console.error('Failed to fetch case details:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await api.put(`/cases/${id}`, formData);
      } else {
        await api.post('/cases', formData);
      }
      navigate('/cases');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/cases')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Case' : 'Create New Case'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEdit ? 'Update case information' : 'Fill in the details to create a new case'}
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
            <label className="label">Case Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Enter case title"
              required
            />
          </div>

          <div>
            <label className="label">Case Type *</label>
            <select
              name="case_type"
              value={formData.case_type}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select Type</option>
              <option value="Civil">Civil</option>
              <option value="Criminal">Criminal</option>
              <option value="Family">Family</option>
              <option value="Corporate">Corporate</option>
              <option value="Labor">Labor</option>
              <option value="Property">Property</option>
              <option value="Constitutional">Constitutional</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="label">Filing Date *</label>
            <input
              type="date"
              name="filing_date"
              value={formData.filing_date}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Priority *</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {isEdit && (
            <div>
              <label className="label">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="filed">Filed</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="adjourned">Adjourned</option>
                <option value="closed">Closed</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          )}

          <div>
            <label className="label">Client *</label>
            <select
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {user?.role !== 'judge' && (
            <div>
              <label className="label">Assigned Judge</label>
              <select
                name="assigned_judge_id"
                value={formData.assigned_judge_id}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Judge</option>
                {judges.map((judge) => (
                  <option key={judge.id} value={judge.id}>
                    {judge.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {user?.role !== 'lawyer' && (
            <div>
              <label className="label">Assigned Lawyer</label>
              <select
                name="assigned_lawyer_id"
                value={formData.assigned_lawyer_id}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Lawyer</option>
                {lawyers.map((lawyer) => (
                  <option key={lawyer.id} value={lawyer.id}>
                    {lawyer.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input min-h-32"
              placeholder="Enter case description"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate('/cases')}
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
                Saving...
              </span>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                {isEdit ? 'Update Case' : 'Create Case'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CaseForm;
