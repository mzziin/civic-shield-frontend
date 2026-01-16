import React, { useState, useEffect } from 'react';
import { evacuationApi } from '../../services/evacuationApi';
import { useGeolocation } from '../../hooks/useGeolocation';
import './EvacuationButton.css';

function EvacuationButton({ onRoutesCalculated }) {
  const { location } = useGeolocation();
  const [isInDanger, setIsInDanger] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  
  // Check danger status when location changes
  useEffect(() => {
    if (location) {
      checkDangerStatus();
    }
  }, [location]);
  
  const checkDangerStatus = async () => {
    if (!location) return;
    
    try {
      setChecking(true);
      const response = await evacuationApi.checkDangerStatus(
        location.latitude,
        location.longitude
      );
      setIsInDanger(response.isInDanger);
    } catch (error) {
      console.error('Error checking danger status:', error);
    } finally {
      setChecking(false);
    }
  };
  
  const handleCalculateRoutes = async () => {
    if (!location) {
      alert('Unable to get your location. Please enable location services.');
      return;
    }
    
    try {
      setLoading(true);
      const response = await evacuationApi.calculateRoutes(
        location.latitude,
        location.longitude
      );
      
      if (response.routes && response.routes.length > 0) {
        onRoutesCalculated(response.routes, response.dangerZones);
      } else {
        alert(response.message || 'No routes available');
      }
    } catch (error) {
      console.error('Error calculating routes:', error);
      alert('Failed to calculate evacuation routes. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isInDanger && !checking) {
    return null; // Don't show button if not in danger
  }
  
  return (
    <div className="evacuation-button-container">
      <button
        onClick={handleCalculateRoutes}
        disabled={loading || checking || !location}
        className={`evacuation-button ${loading || checking ? 'loading' : ''}`}
      >
        {loading ? (
          <span className="button-content">
            <span className="spinner"></span>
            Calculating...
          </span>
        ) : checking ? (
          'Checking...'
        ) : (
          '🚨 Show Safe Routes'
        )}
      </button>
    </div>
  );
}

export default EvacuationButton;
