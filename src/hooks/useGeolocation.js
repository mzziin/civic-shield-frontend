import { useState, useEffect } from 'react';

export function useGeolocation(options = {}) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { watch = false, enableHighAccuracy = true } = options;
  
  useEffect(() => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocation not supported'));
      setLoading(false);
      return;
    }
    
    const handleSuccess = (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
      setError(null);
      setLoading(false);
    };
    
    const handleError = (error) => {
      setError(error);
      setLoading(false);
    };
    
    const geoOptions = {
      enableHighAccuracy,
      timeout: 10000,
      maximumAge: 0
    };
    
    let watchId;
    
    if (watch) {
      watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        geoOptions
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        geoOptions
      );
    }
    
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watch, enableHighAccuracy]);
  
  return { location, error, loading };
}
