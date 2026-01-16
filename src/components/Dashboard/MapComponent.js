import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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

const MapComponent = ({ userLocation, dangerZones }) => {
  const defaultCenter = [40.7128, -74.0060]; // New York default
  const center = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;
  const zoom = userLocation ? 13 : 10;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapViewUpdater center={center} zoom={zoom} />

      {/* User location marker */}
      {userLocation && (
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={100}
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
        >
          <Popup>Your Location</Popup>
        </Circle>
      )}

      {/* Danger zones */}
      {dangerZones.map((zone) => (
        <Circle
          key={zone.city}
          center={[zone.coordinates.latitude, zone.coordinates.longitude]}
          radius={5000} // 5km radius
          pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.3 }}
        >
          <Popup>
            <strong>{zone.city}</strong>
            <br />
            Incidents: {zone.incidentCount}
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
