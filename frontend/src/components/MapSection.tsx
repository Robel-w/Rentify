import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { MapContainerProps } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

interface Property {
  id: number;
  title: string;
  latitude: number;
  longitude: number;
}

interface MapSectionProps {
  properties: Property[];
}

const MapSection: React.FC<MapSectionProps> = ({ properties }) => {
  useEffect(() => {
    // Fix leaflet marker icons in React
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });
  }, []);

  return (
    <MapContainer center={[0, 0]} zoom={2} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {properties.map((prop) => (
        <Marker key={prop.id} position={[prop.latitude, prop.longitude]}>
          <Popup>{prop.title}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapSection;
