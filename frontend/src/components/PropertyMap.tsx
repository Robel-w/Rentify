import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { propertiesAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  DollarSign,
  Calendar,
  Building
} from 'lucide-react';

// Fix for default markers in React
const iconRetinaUrl = require('leaflet/dist/images/marker-icon-2x.png');
const iconUrl = require('leaflet/dist/images/marker-icon.png');
const shadowUrl = require('leaflet/dist/images/marker-shadow.png');

// Create custom icon for properties
const propertyIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Property interface
interface Property {
  id: number;
  title: string;
  property_type: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  monthly_rent: number;
  available_from: string;
  status: string;
  is_featured: boolean;
  primary_image?: string;
  latitude?: number;
  longitude?: number;
  square_feet?: number;
  full_address?: string;
}

interface PropertyMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  width?: string;
  showControls?: boolean;
  className?: string;
}

// Component to handle map updates when properties change
const MapUpdater: React.FC<{ properties: Property[] }> = ({ properties }) => {
  const map = useMap();
  
  useEffect(() => {
    if (properties.length > 0) {
      const validProperties = properties.filter(prop => prop.latitude && prop.longitude);
      
      if (validProperties.length > 0) {
        const markers = validProperties.map(prop => 
          L.marker([prop.latitude!, prop.longitude!])
        );
        
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [properties, map]);
  
  return null;
};

const PropertyMap: React.FC<PropertyMapProps> = ({
  center = [9.03, 38.74], // Default to Addis Ababa, Ethiopia
  zoom = 12,
  height = '80vh',
  width = '100%',
  showControls = true,
  className = ''
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fix Leaflet icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
    });
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await propertiesAPI.getProperties();
        const fetchedProperties = response.data.results || response.data;
        
        // Filter properties that have valid coordinates and are available
        const validProperties = fetchedProperties.filter((prop: Property) => 
          prop.latitude && prop.longitude && prop.status === 'available'
        );
        setProperties(validProperties);
      } catch (err) {
        console.error('Error fetching properties for map:', err);
        setError('Failed to load properties for map');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={{ height, width }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties on map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={{ height, width }}>
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-primary-600 hover:text-primary-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const validProperties = properties.filter(prop => prop.latitude && prop.longitude);

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={showControls}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        dragging={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        
        <MapUpdater properties={validProperties} />
        
        {validProperties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude!, property.longitude!]}
            icon={propertyIcon}
          >
            <Popup
              maxWidth={300}
              minWidth={250}
              className="property-popup"
              closeButton={true}
              autoClose={false}
              closeOnClick={false}
            >
              <div className="property-popup-content">
                {/* Property Image */}
                {property.primary_image && (
                  <div className="mb-3">
                    <img
                      src={property.primary_image}
                      alt={property.title}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* Property Title */}
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {property.title}
                </h3>
                
                {/* Property Type and Location */}
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Building className="h-4 w-4 mr-1" />
                  <span className="capitalize">{property.property_type}</span>
                  <span className="mx-1">•</span>
                  <span>{property.city}, {property.state}</span>
                </div>
                
                {/* Property Details */}
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    <span>{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    <span>{property.bathrooms}</span>
                  </div>
                  {property.square_feet && (
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span>{property.square_feet.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                {/* Price */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-lg font-bold text-primary-600">
                    <DollarSign className="h-5 w-5 mr-1" />
                    <span>{property.monthly_rent.toLocaleString()}</span>
                    <span className="text-sm font-normal text-gray-600 ml-1">/month</span>
                  </div>
                  {property.is_featured && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                
                {/* Available From */}
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Available: {new Date(property.available_from).toLocaleDateString()}</span>
                </div>
                
                {/* Action Button */}
                <Link
                  to={`/properties/${property.id}`}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center block"
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Info Overlay */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{validProperties.length} properties available</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;
