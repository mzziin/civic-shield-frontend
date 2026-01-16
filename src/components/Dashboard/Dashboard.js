import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { locationAPI, incidentAPI } from '../../services/api';
import { getCurrentPosition } from '../../services/geolocation';
import {
  subscribeToUpdates,
  subscribeToDeletions,
  unsubscribeFromUpdates,
  unsubscribeFromDeletions
} from '../../services/socket';
import { evacuationApi } from '../../services/evacuationApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MapComponent from './MapComponent';
import ReportButton from './ReportButton';
import EvacuationButton from '../Evacuation/EvacuationButton';
import RouteSelector from '../Evacuation/RouteSelector';
import FollowRouteMode from '../Evacuation/FollowRouteMode';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [dangerZones, setDangerZones] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evacuationRoutes, setEvacuationRoutes] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isFollowingRoute, setIsFollowingRoute] = useState(false);
  const [routeDangerZones, setRouteDangerZones] = useState([]);

  useEffect(() => {
    // Get user's current location on mount
    getCurrentPosition()
      .then(async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        // Update location on server
        try {
          await locationAPI.updateLocation(latitude, longitude);
        } catch (error) {
          console.error('Failed to update location:', error);
        }
        
        setLoading(false);
      })
      .catch((error) => {
        console.error('Geolocation error:', error);
        setLoading(false);
      });

    // Fetch initial danger zones
    fetchDangerZones();

    // Subscribe to WebSocket updates
    subscribeToUpdates((newZone) => {
      setDangerZones((prev) => {
        const existing = prev.find((z) => z.city === newZone.city);
        if (existing) {
          return prev.map((z) =>
            z.city === newZone.city ? newZone : z
          );
        }
        return [...prev, newZone];
      });
      
      // If following a route and new danger zone appears, recalculate
      if (isFollowingRoute) {
        toast.warning('⚠️ New danger zone detected! Recalculating route...');
        handleRecalculateRoute();
      }
    });

    subscribeToDeletions((data) => {
      setDangerZones((prev) =>
        prev.filter((z) => z.city !== data.city)
      );
    });

    return () => {
      unsubscribeFromUpdates();
      unsubscribeFromDeletions();
    };
  }, [isFollowingRoute]);

  const fetchDangerZones = async () => {
    try {
      const response = await incidentAPI.getDangerZones();
      if (response.data.success) {
        setDangerZones(response.data.dangerZones);
      }
    } catch (error) {
      console.error('Failed to fetch danger zones:', error);
    }
  };

  const handleReportSuccess = () => {
    // Refresh danger zones after reporting
    fetchDangerZones();
  };

  const handleRoutesCalculated = (routes, zones) => {
    setEvacuationRoutes(routes);
    setRouteDangerZones(zones);
  };

  const handleRouteSelected = (route) => {
    setSelectedRoute(route);
    setEvacuationRoutes(null); // Close route selector
    setIsFollowingRoute(true);
  };

  const handleRecalculateRoute = async () => {
    if (!userLocation) return;
    
    try {
      const response = await evacuationApi.calculateRoutes(
        userLocation.lat,
        userLocation.lng
      );
      
      if (response.routes && response.routes.length > 0) {
        // Auto-select safest route
        setSelectedRoute(response.routes[0]);
        setRouteDangerZones(response.dangerZones);
        toast.success('✅ Route updated to avoid new danger zones');
      }
    } catch (error) {
      toast.error('Failed to recalculate route');
      console.error('Recalculate route error:', error);
    }
  };

  const handleExitNavigation = () => {
    setIsFollowingRoute(false);
    setSelectedRoute(null);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Armed Incident Alert System</h1>
          <div className="header-actions">
            <span className="user-info">Welcome, {user?.username}</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className="dashboard-content">
        <div className="map-container">
          {isFollowingRoute && selectedRoute ? (
            <FollowRouteMode
              route={selectedRoute}
              dangerZones={routeDangerZones}
              onRecalculate={handleRecalculateRoute}
              onExit={handleExitNavigation}
            />
          ) : (
            <MapComponent
              userLocation={userLocation}
              dangerZones={dangerZones}
            />
          )}
          
          {/* Evacuation Button - only show when not following route */}
          {!isFollowingRoute && (
            <EvacuationButton onRoutesCalculated={handleRoutesCalculated} />
          )}
        </div>
        
        <div className="dashboard-sidebar">
          <ReportButton
            userLocation={userLocation}
            onReportSuccess={handleReportSuccess}
          />
          
          <div className="danger-zones-list">
            <h2>Active Danger Zones</h2>
            {dangerZones.length === 0 ? (
              <p className="no-zones">No active danger zones</p>
            ) : (
              <ul>
                {dangerZones.map((zone) => (
                  <li key={zone.city} className="danger-zone-item">
                    <strong>{zone.city}</strong>
                    <span>{zone.incidentCount} incidents</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      {/* Route Selector Modal */}
      {evacuationRoutes && (
        <RouteSelector
          routes={evacuationRoutes}
          onRouteSelected={handleRouteSelected}
          onClose={() => setEvacuationRoutes(null)}
        />
      )}
      
      {/* Toast Notifications */}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default Dashboard;
