import React from 'react';
import './RouteCard.css';

function RouteCard({ route, isSelected, onSelect }) {
  const formatDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };
  
  const formatDuration = (seconds) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  const getSafetyColor = (level) => {
    switch (level) {
      case 'safe': return 'safety-safe';
      case 'moderate': return 'safety-moderate';
      case 'risky': return 'safety-risky';
      default: return 'safety-default';
    }
  };
  
  const getSafetyIcon = (level) => {
    switch (level) {
      case 'safe': return '✅';
      case 'moderate': return '⚠️';
      case 'risky': return '❌';
      default: return '';
    }
  };
  
  const getSafetyLabel = (level) => {
    switch (level) {
      case 'safe': return 'Safe Route';
      case 'moderate': return 'Moderate Risk';
      case 'risky': return 'High Risk';
      default: return '';
    }
  };
  
  return (
    <div
      onClick={onSelect}
      className={`route-card ${isSelected ? 'selected' : ''}`}
    >
      {/* Safety Badge */}
      <div className="route-card-header">
        <span className={`safety-badge ${getSafetyColor(route.safetyLevel)}`}>
          {getSafetyIcon(route.safetyLevel)} {getSafetyLabel(route.safetyLevel)}
        </span>
        {isSelected && (
          <span className="selected-label">Selected</span>
        )}
      </div>
      
      {/* Destination */}
      <h3 className="route-destination">
        To: {route.destination.name}
      </h3>
      <p className="route-destination-type">
        {route.destination.type === 'escape_point' 
          ? 'Safe Area Outside Danger Zone' 
          : route.destination.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </p>
      
      {/* Stats */}
      <div className="route-stats">
        <div className="stat-item">
          <div className="stat-label">Distance</div>
          <div className="stat-value">
            {formatDistance(route.distance)}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Time</div>
          <div className="stat-value">
            {formatDuration(route.duration)}
          </div>
        </div>
      </div>
      
      {/* First Turn Preview */}
      {route.simplifiedInstructions && route.simplifiedInstructions.length > 0 && (
        <div className="first-turn-preview">
          <strong>First turn:</strong> {route.simplifiedInstructions[0].instruction}
        </div>
      )}
    </div>
  );
}

export default RouteCard;
