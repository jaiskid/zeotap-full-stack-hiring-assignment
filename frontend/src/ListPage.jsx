import React, { useState, useEffect, useCallback } from 'react';
import { fetchIncidents } from './api';
import { IncidentList, Pagination, CreateIncidentModal } from './components';

const SERVICES = [
  'API Gateway',
  'Auth Service',
  'Payment Processor',
  'Database',
  'Cache Layer',
  'Load Balancer',
  'Message Queue',
  'Search Engine',
  'Email Service',
  'Notification Hub'
];

export default function ListPage({ onNavigate }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters and sorting
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    service: '',
    severity: '',
    status: '',
    search: ''
  });

  const [searchInput, setSearchInput] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  const loadIncidents = useCallback(async (newFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchIncidents(newFilters);
      setIncidents(result.incidents);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadIncidents();
  }, [filters, loadIncidents]);

  const handleSort = (field, order) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: order,
      page: 1
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1
    }));
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
    
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const timeout = setTimeout(() => {
      handleFilterChange('search', value);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleSelectIncident = (id) => {
    onNavigate('detail', id);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setFilters((prev) => ({ ...prev, page: 1 }));
    loadIncidents({ ...filters, page: 1 });
  };

  return (
    <>
      <header>
        <h1>Incident Tracker</h1>
        <p>Manage production incidents across services</p>
      </header>

      <div className="container">
        <div style={{ marginBottom: '24px', textAlign: 'right' }}>
          <button className="primary" onClick={() => setShowCreateModal(true)}>
            + New Incident
          </button>
        </div>

        <div className="controls">
          <div>
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by title, summary, or owner..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div>
            <label>Service</label>
            <select
              value={filters.service}
              onChange={(e) => handleFilterChange('service', e.target.value)}
            >
              <option value="">All Services</option>
              {SERVICES.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
            >
              <option value="">All Severities</option>
              <option value="SEV1">SEV1 - Critical</option>
              <option value="SEV2">SEV2 - High</option>
              <option value="SEV3">SEV3 - Medium</option>
              <option value="SEV4">SEV4 - Low</option>
            </select>
          </div>

          <div>
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="MITIGATED">MITIGATED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>

          <div>
            <label>Limit</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <IncidentList
          incidents={incidents}
          loading={loading}
          error={null}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSort={handleSort}
          onSelectIncident={handleSelectIncident}
          pagination={pagination}
        />

        {pagination && <Pagination pagination={pagination} onPageChange={handlePageChange} />}

        <CreateIncidentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (formData, setErrors) => {
            try {
              const response = await fetch('/api/incidents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
              });
              if (!response.ok) {
                const error = await response.json();
                setErrors(error.details || {});
                return;
              }
              handleCreateSuccess();
            } catch (err) {
              setErrors({ submit: err.message });
            }
          }}
          loading={false}
        />
      </div>
    </>
  );
}
