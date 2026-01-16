import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useGeolocation } from '../../hooks/useGeolocation';
import TurnInstructions from './TurnInstructions';
import { calculateDistance } from '../../utils/mapUtils';
import { toast } from 'react-toastify';
import './FollowRouteMode.css';

// Component to handle map view updates
function MapViewUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

function FollowRouteMode({ route, dangerZones, onRecalculate, onExit }) {
  const { location } = useGeolocation({ watch: true });
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [hasArrived, setHasArrived] = useState(false);
  
  // Check if user has reached destination
  useEffect(() => {
    if (!location || !route) return;
    
    const distanceToDestination = calculateDistance(
      location.latitude,
      location.longitude,
      route.destination.latitude,
      route.destination.longitude
    );
    
    // Within 50 meters = arrived
    if (distanceToDestination < 0.05) {
      setHasArrived(true);
      toast.success('🎉 You have arrived at your destination!');
    }
  }, [location, route]);
  
  // Update current instruction based on location
  // Note: This is a simplified implementation
  // In production, you'd calculate actual distance along route using instruction coordinates
  useEffect(() => {
    if (!location || !route || !route.simplifiedInstructions) return;
    // Future: Implement instruction progression based on actual location
  }, [location, route, currentInstructionIndex]);
  
  // Convert route geometry to lat/lng array for Polyline
  const routePath = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
  
  const getRouteColor = () => {
    switch (route.safetyLevel) {
      case 'safe': return '#00ff00';
      case 'moderate': return '#ffa500';
      case 'risky': return '#ff0000';
      default: return '#007bff';
    }
  };

  // Calculate center point for map (midpoint of route or user location)
  const center = location 
    ? [location.latitude, location.longitude]
    : routePath.length > 0 
      ? routePath[Math.floor(routePath.length / 2)]
      : [route.destination.latitude, route.destination.longitude];
  
  return (
    <div className="follow-route-container">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%', position: 'relative' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapViewUpdater center={center} zoom={13} />
        
        {/* Route Path */}
        <Polyline
          positions={routePath}
          color={getRouteColor()}
          weight={5}
          opacity={0.7}
        />
        
        {/* Danger Zones */}
        {dangerZones && dangerZones.map((zone, index) => (
          <Circle
            key={index}
            center={[zone.coordinates.latitude, zone.coordinates.longitude]}
            radius={5000}
            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }}
          />
        ))}
        
        {/* User Location */}
        {location && (
          <Marker
            position={[location.latitude, location.longitude]}
            icon={L.divIcon({
              className: 'custom-marker',
              html: `<div style="width: 16px; height: 16px; background: #007bff; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
              iconSize: [16, 16]
            })}
          />
        )}
        
        {/* Destination Marker */}
        <Marker
          position={[route.destination.latitude, route.destination.longitude]}
          icon={L.divIcon({
            className: 'custom-marker',
            html: `<div style="font-size: 24px;">📍</div>`,
            iconSize: [30, 30]
          })}
        />
      </MapContainer>
      
      {/* Control Panel - positioned outside MapContainer to ensure visibility */}
      <div className="follow-route-controls">
        {/* Status Banner */}
        <div className={`follow-route-status ${hasArrived ? 'arrived' : 'navigating'}`}>
          {hasArrived ? (
            '🎉 Arrived at Safe Location!'
          ) : (
            `Following ${route.safetyLevel === 'safe' ? 'Safe' : route.safetyLevel === 'moderate' ? 'Moderate' : 'Risky'} Route to ${route.destination.name}`
          )}
        </div>
        
        {/* Turn Instructions */}
        {!hasArrived && (
          <TurnInstructions
            instructions={route.simplifiedInstructions}
            currentInstructionIndex={currentInstructionIndex}
          />
        )}
        
        {/* Action Buttons */}
        <div className="follow-route-actions">
          {hasArrived ? (
            <button
              onClick={onExit}
              className="follow-route-button exit"
            >
              Exit Navigation
            </button>
          ) : (
            <>
              <button
                onClick={onRecalculate}
                className="follow-route-button recalculate"
              >
                Recalculate
              </button>
              <button
                onClick={onExit}
                className="follow-route-button exit"
              >
                Exit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FollowRouteMode;
