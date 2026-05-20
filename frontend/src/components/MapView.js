import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const activeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  if (center) map.setView(center, zoom);
  return null;
}

function MapView({ lat, lng, markers = [], zoom = 10, height = "300px", showPath = true }) {
  const validMarkers = markers.filter(m => 
    m && typeof m.lat === 'number' && typeof m.lng === 'number' && !isNaN(m.lat) && !isNaN(m.lng)
  );

  const defaultLat = 17.3850;
  const defaultLng = 78.4867;
  
  // Center on the LATEST marker if available
  const center = validMarkers.length > 0 
    ? [validMarkers[validMarkers.length - 1].lat, validMarkers[validMarkers.length - 1].lng]
    : (lat && lng) ? [lat, lng] : [defaultLat, defaultLng];

  // Path coordinates for Polyline
  const pathPositions = validMarkers.map(m => [m.lat, m.lng]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: height, width: "100%", borderRadius: "12px" }}
    >
      <ChangeView center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {showPath && pathPositions.length > 1 && (
        <Polyline 
          positions={pathPositions} 
          color="var(--secondary)" 
          weight={4} 
          opacity={0.6} 
          dashArray="10, 10"
        />
      )}

      {validMarkers.map((marker, idx) => {
        const isLast = idx === validMarkers.length - 1;
        return (
          <Marker key={idx} position={[marker.lat, marker.lng]} icon={isLast ? activeIcon : defaultIcon}>
            <Popup>
              <div style={{ padding: '0.25rem' }}>
                <strong style={{ color: 'var(--primary)' }}>{isLast ? '📍 Current: ' : '🏁 Step: '}{marker.label || 'Location'}</strong>
                {marker.timestamp && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{marker.timestamp}</div>}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {validMarkers.length === 0 && lat && lng && (
        <Marker position={[lat, lng]} icon={activeIcon}>
          <Popup>Current Location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default MapView;