import React, { useState } from 'react';
import RouteCard from './RouteCard';
import './RouteSelector.css';

function RouteSelector({ routes, onRouteSelected, onClose }) {
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  
  const handleStartNavigation = () => {
    onRouteSelected(routes[selectedRouteIndex]);
  };
  
  const handleOpenInGoogleMaps = () => {
    const route = routes[selectedRouteIndex];
    const destination = route.destination;
    
    // Create Google Maps URL with waypoints to avoid danger zones
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=driving`;
    
    window.open(url, '_blank');
  };
  
  return (
    <div className="route-selector-overlay">
      <div className="route-selector-modal">
        {/* Header */}
        <div className="route-selector-header">
          <h2 className="route-selector-title">Select Evacuation Route</h2>
          <button
            onClick={onClose}
            className="route-selector-close"
          >
            ×
          </button>
        </div>
        
        {/* Route Cards */}
        <div className="route-selector-content">
          {routes.map((route, index) => (
            <RouteCard
              key={route.routeId}
              route={route}
              isSelected={selectedRouteIndex === index}
              onSelect={() => setSelectedRouteIndex(index)}
            />
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="route-selector-actions">
          <button
            onClick={handleStartNavigation}
            className="route-selector-button primary"
          >
            Follow This Route
          </button>
          <button
            onClick={handleOpenInGoogleMaps}
            className="route-selector-button secondary"
          >
            Open in Google Maps
          </button>
        </div>
      </div>
    </div>
  );
}

export default RouteSelector;
