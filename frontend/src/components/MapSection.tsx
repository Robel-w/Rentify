import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { DollarSign } from 'lucide-react';

interface Property {
  id: number;
  title: string;
  latitude: number;
  longitude: number;
  monthly_rent?: number;
  property_type?: string;
  city?: string;
  state?: string;
}

interface MapSectionProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  width?: string;
}

const MapSection: React.FC<MapSectionProps> = ({ 
  properties, 
  center = [9.03, 38.74], 
  zoom = 12,
  height = '500px',
  width = '100%'
}) => {
  useEffect(() => {
    // Fix leaflet marker icons in React
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });
  }, []);

  const validProperties = properties.filter(prop => prop.latitude && prop.longitude);

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height, width }}
      scrollWheelZoom={true}
      doubleClickZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {validProperties.map((prop) => (
        <Marker key={prop.id} position={[prop.latitude, prop.longitude]}>
          <Popup maxWidth={300} minWidth={250}>
            <div className="property-popup">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {prop.title}
              </h3>
              
              {(prop.property_type || prop.city) && (
                <div className="text-sm text-gray-600 mb-2">
                  {prop.property_type && (
                    <span className="capitalize">{prop.property_type}</span>
                  )}
                  {prop.city && prop.state && (
                    <span className="ml-1">
                      {prop.property_type ? ' • ' : ''}
                      {prop.city}, {prop.state}
                    </span>
                  )}
                </div>
              )}
              
              {prop.monthly_rent && (
                <div className="flex items-center text-lg font-bold text-primary-600 mb-3">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>{prop.monthly_rent.toLocaleString()}</span>
                  <span className="text-sm font-normal text-gray-600 ml-1">/month</span>
                </div>
              )}
              
              <Link
                to={`/properties/${prop.id}`}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center block"
              >
                View Details
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapSection;
