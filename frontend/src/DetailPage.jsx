import React, { useState, useEffect } from 'react';
import { fetchIncident, updateIncident } from './api';

export default function DetailPage({ incidentId, onNavigate }) {
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    service: '',
    severity: '',
    status: '',
    owner: '',
    summary: ''
  });

  useEffect(() => {
    loadIncident();
  }, [incidentId]);

  const loadIncident = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIncident(incidentId);
      setIncident(data);
      setFormData({
        title: data.title,
        service: data.service,
        severity: data.severity,
        status: data.status,
        owner: data.owner || '',
        summary: data.summary || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setValidationErrors({});
    setSaveSuccess(false);
    try {
      const updated = await updateIncident(incidentId, formData);
      setIncident(updated);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      if (err.details) {
        setValidationErrors(err.details);
      } else {
        setError(err.message || 'Failed to save incident');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: incident.title,
      service: incident.service,
      severity: incident.severity,
      status: incident.status,
      owner: incident.owner || '',
      summary: incident.summary || ''
    });
    setIsEditing(false);
    setValidationErrors({});
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading incident details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button className="secondary" onClick={() => onNavigate('list')}>
          ← Back to List
        </button>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="container">
        <div className="error">Incident not found</div>
        <button className="secondary" onClick={() => onNavigate('list')}>
          ← Back to List
        </button>
      </div>
    );
  }

  return (
    <>
      <header>
        <h1>Incident Details</h1>
      </header>

      <div className="container">
        <div style={{ marginBottom: '24px' }}>
          <button className="secondary" onClick={() => onNavigate('list')}>
            ← Back to List
          </button>
        </div>

        {saveSuccess && <div className="success">Incident updated successfully!</div>}
        {error && <div className="error">{error}</div>}

        <div className="detail-page">
          <div className="detail-header">
            <div>
              <h1>{formData.title}</h1>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Created {new Date(incident.createdAt).toLocaleString()}
              </p>
            </div>
            {!isEditing && (
              <button className="primary" onClick={() => setIsEditing(true)}>
                Edit
              </button>
            )}
          </div>

          <div className="detail-info">
            <div className="info-item">
              <label>Title</label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                  />
                  {validationErrors.title && (
                    <div className="form-error">{validationErrors.title}</div>
                  )}
                </>
              ) : (
                <p>{incident.title}</p>
              )}
            </div>

            <div className="info-item">
              <label>Service</label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                  />
                  {validationErrors.service && (
                    <div className="form-error">{validationErrors.service}</div>
                  )}
                </>
              ) : (
                <p>{incident.service}</p>
              )}
            </div>

            <div className="info-item">
              <label>Severity</label>
              {isEditing ? (
                <>
                  <select name="severity" value={formData.severity} onChange={handleChange}>
                    <option value="SEV1">SEV1 - Critical</option>
                    <option value="SEV2">SEV2 - High</option>
                    <option value="SEV3">SEV3 - Medium</option>
                    <option value="SEV4">SEV4 - Low</option>
                  </select>
                  {validationErrors.severity && (
                    <div className="form-error">{validationErrors.severity}</div>
                  )}
                </>
              ) : (
                <p className={`severity-${incident.severity.toLowerCase()}`}>
                  {incident.severity}
                </p>
              )}
            </div>

            <div className="info-item">
              <label>Status</label>
              {isEditing ? (
                <>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="OPEN">OPEN</option>
                    <option value="MITIGATED">MITIGATED</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                  {validationErrors.status && (
                    <div className="form-error">{validationErrors.status}</div>
                  )}
                </>
              ) : (
                <p>
                  <span className={`status-${incident.status.toLowerCase()}`}>
                    {incident.status}
                  </span>
                </p>
              )}
            </div>

            <div className="info-item">
              <label>Owner</label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="owner"
                    value={formData.owner}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                  {validationErrors.owner && (
                    <div className="form-error">{validationErrors.owner}</div>
                  )}
                </>
              ) : (
                <p>{incident.owner || '—'}</p>
              )}
            </div>

            <div className="info-item">
              <label>Last Updated</label>
              <p>{new Date(incident.updatedAt).toLocaleString()}</p>
            </div>

            <div className="info-item" style={{ gridColumn: '1 / -1' }}>
              <label>Summary</label>
              {isEditing ? (
                <>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                  {validationErrors.summary && (
                    <div className="form-error">{validationErrors.summary}</div>
                  )}
                </>
              ) : (
                <p>{incident.summary || '—'}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="modal-actions" style={{ justifyContent: 'flex-end', marginTop: '32px' }}>
              <button
                className="secondary"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="primary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
