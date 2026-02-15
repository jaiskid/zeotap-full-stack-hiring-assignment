import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, runAsync, allAsync, db } from './db.js';

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

const SEVERITIES = ['SEV1', 'SEV2', 'SEV3', 'SEV4'];
const STATUSES = ['OPEN', 'MITIGATED', 'RESOLVED'];

function generateIncident(index) {
  const now = new Date();
  const createdDaysAgo = Math.floor(Math.random() * 90);
  const createdAt = new Date(now.getTime() - createdDaysAgo * 24 * 60 * 60 * 1000);
  
  return {
    id: uuidv4(),
    title: generateTitle(index),
    service: SERVICES[Math.floor(Math.random() * SERVICES.length)],
    severity: SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)],
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    owner: Math.random() > 0.3 ? `engineer-${Math.floor(Math.random() * 20) + 1}` : null,
    summary: generateSummary(),
    createdAt: createdAt.toISOString(),
    updatedAt: new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  };
}

function generateTitle(index) {
  const titles = [
    'API timeout errors',
    'Database connection pool exhausted',
    'Memory leak in background service',
    'SSL certificate expiration warning',
    'High latency detected',
    'Increased error rate',
    'Payment processing delays',
    'Notification delivery failures',
    'Search index corruption',
    'Cache invalidation issue'
  ];
  return titles[index % titles.length] + ` #${index}`;
}

function generateSummary() {
  const summaries = [
    'The service is experiencing intermittent failures. Root cause analysis in progress.',
    'Traffic spike detected. Scaling up resources to handle increased load.',
    'Database queries timing out. Query optimization needed.',
    'Third-party service dependency is degraded. Waiting for vendor resolution.',
    'Configuration change caused unexpected behavior. Rolling back changes.',
    'Resource limit reached. Need to provision additional infrastructure.',
    'Suspicious activity detected in logs. Security team investigating.',
    'Customer complaints about feature unavailability. Engineering team on it.'
  ];
  return summaries[Math.floor(Math.random() * summaries.length)];
}

async function seed() {
  try {
    await initializeDatabase();
    
    // Clear existing data
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM incidents', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Seeding database with 200 incidents...');
    
    for (let i = 0; i < 200; i++) {
      const incident = generateIncident(i);
      await runAsync(
        `INSERT INTO incidents (id, title, service, severity, status, owner, summary, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [incident.id, incident.title, incident.service, incident.severity, incident.status, 
         incident.owner, incident.summary, incident.createdAt, incident.updatedAt]
      );
    }

    console.log('✓ Successfully seeded 200 incidents');
    
    // Verify seed
    const count = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM incidents', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    console.log(`✓ Database contains ${count} incidents`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
