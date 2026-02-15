import React, { useState } from 'react';
import ListPage from './ListPage';
import DetailPage from './DetailPage';
import './index.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState('list');
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  const handleNavigate = (page, incidentId = null) => {
    setCurrentPage(page);
    if (incidentId) {
      setSelectedIncidentId(incidentId);
    }
  };

  return (
    <div className="app">
      {currentPage === 'list' ? (
        <ListPage onNavigate={handleNavigate} />
      ) : (
        <DetailPage incidentId={selectedIncidentId} onNavigate={handleNavigate} />
      )}
    </div>
  );
}
