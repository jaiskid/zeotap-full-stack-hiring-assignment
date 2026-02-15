import React from 'react';

export function IncidentList({
  incidents,
  loading,
  error,
  sortBy,
  sortOrder,
  onSort,
  onSelectIncident,
  pagination
}) {
  if (loading) return <div className="loading">Loading incidents...</div>;
  if (error) return <div className="error">{error}</div>;

  const getSortClass = (field) => {
    if (sortBy !== field) return 'sortable';
    return sortOrder === 'ASC' ? 'sorted-asc' : 'sorted-desc';
  };

  const handleHeaderClick = (field) => {
    if (sortBy === field) {
      onSort(field, sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      onSort(field, 'DESC');
    }
  };

  return (
    <table>
      <thead>
        <tr>
          <th className={getSortClass('title')} onClick={() => handleHeaderClick('title')}>
            Title
          </th>
          <th className={getSortClass('service')} onClick={() => handleHeaderClick('service')}>
            Service
          </th>
          <th className={getSortClass('severity')} onClick={() => handleHeaderClick('severity')}>
            Severity
          </th>
          <th className={getSortClass('status')} onClick={() => handleHeaderClick('status')}>
            Status
          </th>
          <th>Owner</th>
          <th className={getSortClass('createdAt')} onClick={() => handleHeaderClick('createdAt')}>
            Created
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {incidents.map((incident) => (
          <tr key={incident.id}>
            <td>{incident.title}</td>
            <td>{incident.service}</td>
            <td className={`severity-${incident.severity.toLowerCase()}`}>
              {incident.severity}
            </td>
            <td>
              <span className={`status-${incident.status.toLowerCase()}`}>
                {incident.status}
              </span>
            </td>
            <td>{incident.owner || '—'}</td>
            <td>{new Date(incident.createdAt).toLocaleDateString()}</td>
            <td>
              <button className="secondary" onClick={() => onSelectIncident(incident.id)}>
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Pagination({ pagination, onPageChange }) {
  const { page, totalPages } = pagination;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button
        className="secondary"
        disabled={!pagination.hasPrevPage}
        onClick={() => onPageChange(page - 1)}
      >
        ← Previous
      </button>
      
      {start > 1 && (
        <>
          <button className="secondary" onClick={() => onPageChange(1)}>
            1
          </button>
          {start > 2 && <span>...</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={p === page ? 'primary' : 'secondary'}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span>...</span>}
          <button className="secondary" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        className="secondary"
        disabled={!pagination.hasNextPage}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </button>
    </div>
  );
}

export function CreateIncidentModal({ isOpen, onClose, onSubmit, loading }) {
  const [formData, setFormData] = React.useState({
    title: '',
    service: '',
    severity: 'SEV3',
    status: 'OPEN',
    owner: '',
    summary: ''
  });
  const [errors, setErrors] = React.useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, setErrors);
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Create New Incident</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="service">Service *</label>
            <input
              id="service"
              type="text"
              name="service"
              value={formData.service}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.service && <div className="form-error">{errors.service}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="severity">Severity *</label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="SEV1">SEV1 - Critical</option>
              <option value="SEV2">SEV2 - High</option>
              <option value="SEV3">SEV3 - Medium</option>
              <option value="SEV4">SEV4 - Low</option>
            </select>
            {errors.severity && <div className="form-error">{errors.severity}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="OPEN">OPEN</option>
              <option value="MITIGATED">MITIGATED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
            {errors.status && <div className="form-error">{errors.status}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="owner">Owner</label>
            <input
              id="owner"
              type="text"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              disabled={loading}
              placeholder="Optional"
            />
          </div>

          <div className="form-group">
            <label htmlFor="summary">Summary</label>
            <textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              disabled={loading}
              placeholder="Optional"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
