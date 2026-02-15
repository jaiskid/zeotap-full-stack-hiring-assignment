import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAsync, allAsync, runAsync } from './db.js';

const router = express.Router();

// Validation helper
function validateIncident(data, isUpdate = false) {
  const errors = {};
  
  if (!isUpdate || data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      errors.title = 'Title is required and must be a non-empty string';
    }
  }
  
  if (!isUpdate || data.service !== undefined) {
    if (!data.service || typeof data.service !== 'string' || data.service.trim().length === 0) {
      errors.service = 'Service is required and must be a non-empty string';
    }
  }
  
  if (!isUpdate || data.severity !== undefined) {
    if (!['SEV1', 'SEV2', 'SEV3', 'SEV4'].includes(data.severity)) {
      errors.severity = 'Severity must be one of: SEV1, SEV2, SEV3, SEV4';
    }
  }
  
  if (!isUpdate || data.status !== undefined) {
    if (!['OPEN', 'MITIGATED', 'RESOLVED'].includes(data.status)) {
      errors.status = 'Status must be one of: OPEN, MITIGATED, RESOLVED';
    }
  }
  
  if (data.owner !== undefined && data.owner !== null) {
    if (typeof data.owner !== 'string') {
      errors.owner = 'Owner must be a string';
    }
  }
  
  if (data.summary !== undefined && data.summary !== null) {
    if (typeof data.summary !== 'string') {
      errors.summary = 'Summary must be a string';
    }
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
}

// POST /api/incidents - Create incident
router.post('/', async (req, res) => {
  try {
    const { title, service, severity, status, owner, summary } = req.body;
    
    const validation = validateIncident({ title, service, severity, status, owner, summary });
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Validation failed', details: validation.errors });
    }
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await runAsync(
      `INSERT INTO incidents (id, title, service, severity, status, owner, summary, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, service, severity, status, owner || null, summary || null, now, now]
    );
    
    const incident = await getAsync('SELECT * FROM incidents WHERE id = ?', [id]);
    res.status(201).json(incident);
  } catch (error) {
    console.error('POST /incidents error:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

// GET /api/incidents - List incidents with pagination, filtering, sorting
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      service,
      severity,
      status,
      search
    } = req.query;
    
    // Validation
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Max 100 per page
    const validSortFields = ['createdAt', 'updatedAt', 'severity', 'status', 'service', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = ['ASC', 'DESC'].includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
    
    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];
    
    if (service) {
      whereConditions.push('service = ?');
      queryParams.push(service);
    }
    if (severity) {
      whereConditions.push('severity = ?');
      queryParams.push(severity);
    }
    if (status) {
      whereConditions.push('status = ?');
      queryParams.push(status);
    }
    if (search) {
      whereConditions.push('(title LIKE ? OR summary LIKE ? OR owner LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
    
    // Get total count
    const countResult = await getAsync(
      `SELECT COUNT(*) as total FROM incidents ${whereClause}`,
      queryParams
    );
    const total = countResult.total;
    
    // Get paginated results
    const offset = (pageNum - 1) * limitNum;
    const incidents = await allAsync(
      `SELECT * FROM incidents ${whereClause} ORDER BY ${sortField} ${order} LIMIT ? OFFSET ?`,
      [...queryParams, limitNum, offset]
    );
    
    const totalPages = Math.ceil(total / limitNum);
    
    res.json({
      incidents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('GET /incidents error:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// GET /api/incidents/:id - Get incident details
router.get('/:id', async (req, res) => {
  try {
    const incident = await getAsync('SELECT * FROM incidents WHERE id = ?', [req.params.id]);
    
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    res.json(incident);
  } catch (error) {
    console.error('GET /incidents/:id error:', error);
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

// PATCH /api/incidents/:id - Update incident
router.patch('/:id', async (req, res) => {
  try {
    const incident = await getAsync('SELECT * FROM incidents WHERE id = ?', [req.params.id]);
    
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    
    const validation = validateIncident(req.body, true);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Validation failed', details: validation.errors });
    }
    
    // Only update provided fields
    const updates = {};
    const allowedFields = ['title', 'service', 'severity', 'status', 'owner', 'summary'];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return res.json(incident);
    }
    
    updates.updatedAt = new Date().toISOString();
    
    // Build update query
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];
    
    await runAsync(
      `UPDATE incidents SET ${setClause} WHERE id = ?`,
      values
    );
    
    const updatedIncident = await getAsync('SELECT * FROM incidents WHERE id = ?', [req.params.id]);
    res.json(updatedIncident);
  } catch (error) {
    console.error('PATCH /incidents/:id error:', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

export default router;
