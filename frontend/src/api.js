const API_BASE = '/api';

export async function fetchIncidents(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  if (params.service) queryParams.append('service', params.service);
  if (params.severity) queryParams.append('severity', params.severity);
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);
  
  const response = await fetch(`${API_BASE}/incidents?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch incidents');
  return response.json();
}

export async function fetchIncident(id) {
  const response = await fetch(`${API_BASE}/incidents/${id}`);
  if (!response.ok) throw new Error('Failed to fetch incident');
  return response.json();
}

export async function createIncident(data) {
  const response = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  return response.json();
}

export async function updateIncident(id, data) {
  const response = await fetch(`${API_BASE}/incidents/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  return response.json();
}
