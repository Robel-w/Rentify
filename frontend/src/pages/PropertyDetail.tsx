import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { propertiesAPI, applicationsAPI } from '../services/api';
import { Property } from '../types';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  DollarSign, 
  Car,
  Wifi,
  Snowflake,
  Home,
  TreePine,
  Waves,
  Dumbbell,
  Building,
  Wind,
  Droplets,
  Heart,
  Share2,
  Phone,
  Mail,
  CheckCircle
} from 'lucide-react';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      try {
        const response = await propertiesAPI.getProperty(parseInt(id));
        setProperty(response.data);
      } catch (err) {
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleApplyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!property) {
      alert('Property not found. Please try again.');
      return;
    }

    try {
      const response = await applicationsAPI.createApplication({ 
        property: property.id 
      });
      if (response.status === 201) {
        setApplicationSuccess(true);
      }
    } catch (error) {
      console.error('Application error:', error);
      alert('Failed to apply. Please try again.');
    }
  };



  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'parking': <Car className="h-5 w-5" />,
      'wifi': <Wifi className="h-5 w-5" />,
      'air_conditioning': <Snowflake className="h-5 w-5" />,
      'heating': <Wind className="h-5 w-5" />,
      'washer_dryer': <Droplets className="h-5 w-5" />,
      'garden': <TreePine className="h-5 w-5" />,
      'pool': <Waves className="h-5 w-5" />,
      'gym': <Dumbbell className="h-5 w-5" />,
      'elevator': <Building className="h-5 w-5" />,
    };
    return iconMap[amenity] || <Home className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The property you are looking for does not exist.'}</p>
          <Link
            to="/properties"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  const images = property.images || [];
  const primaryImage = property.primary_image;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link to="/" className="text-gray-400 hover:text-gray-500">Home</Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <Link to="/properties" className="text-gray-400 hover:text-gray-500">Properties</Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <span className="text-gray-900 font-medium">{property.title}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-8">
              {images.length > 0 ? (
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                    <img
                      src={images[currentImageIndex]?.image || primaryImage}
                      alt={property.title}
                      className="w-full h-96 object-cover"
                    />
                  </div>
                  
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => 
                          prev === 0 ? images.length - 1 : prev - 1
                        )}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => 
                          prev === images.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      >
                        →
                      </button>
                      
                      <div className="flex justify-center mt-4 space-x-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full ${
                              index === currentImageIndex ? 'bg-primary-600' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                  <Home className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{property.full_address}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Heart className="h-6 w-6" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Share2 className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center text-gray-600">
                  <Bed className="h-5 w-5 mr-2" />
                  <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Bath className="h-5 w-5 mr-2" />
                  <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                </div>
                {property.square_feet && (
                  <div className="flex items-center text-gray-600">
                    <Square className="h-5 w-5 mr-2" />
                    <span>{property.square_feet.toLocaleString()} sq ft</span>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{property.description}</p>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.has_parking && (
                    <div className="flex items-center text-gray-600">
                      {getAmenityIcon('parking')}
                      <span className="ml-2">Parking</span>
                    </div>
                  )}
                  {property.has_air_conditioning && (
                    <div className="flex items-center text-gray-600">
                      {getAmenityIcon('air_conditioning')}
                      <span className="ml-2">Air Conditioning</span>
                    </div>
                  )}
                  {property.has_heating && (
                    <div className="flex items-center text-gray-600">
                      {getAmenityIcon('heating')}
                      <span className="ml-2">Heating</span>
                    </div>
                  )}
                  {property.has_washer_dryer && (
                    <div className="flex items-center text-gray-600">
                      {getAmenityIcon('washer_dryer')}
                      <span className="ml-2">Washer & Dryer</span>
                    </div>
                  )}
                  {property.has_balcony && (
                    <div className="flex items-center text-gray-600">
                      {getAmenityIcon('garden')}
                      <span className="ml-2">Balcony</span>
                    </div>
                  )}
                  {property.has_garden && (
                    <div className="flex items-center text-gray-600">
                      {getAmenityIcon('garden')}
                      <span className="ml-2">Garden</span>
                    </div>
                  )}
                  {property.has_pool && (
                    <div className="flex items-center text-gray-600">
                      {getAmenityIcon('pool')}
                      <span className="ml-2">Pool</span>
                    </div>
                  )}
                  {property.has_gym && (
                    <div className="flex items-center text-gray-600">
                      {getAmenityIcon('gym')}
                      <span className="ml-2">Gym</span>
                    </div>
                  )}
                  {property.has_elevator && (
                    <div className="flex items-center text-gray-600">
                      {getAmenityIcon('elevator')}
                      <span className="ml-2">Elevator</span>
                    </div>
                  )}
                  {property.pet_friendly && (
                    <div className="flex items-center text-gray-600">
                      <Heart className="h-5 w-5" />
                      <span className="ml-2">Pet Friendly</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center text-3xl font-bold text-gray-900 mb-2">
                  <DollarSign className="h-8 w-8 mr-2" />
                  {property.monthly_rent.toLocaleString()}
                  <span className="text-lg font-normal text-gray-600 ml-1">/month</span>
                </div>
                {property.security_deposit && (
                  <p className="text-gray-600">
                    Security deposit: ${property.security_deposit.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Available from:</span>
                  <span className="font-medium">{new Date(property.available_from).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Property type:</span>
                  <span className="font-medium capitalize">{property.property_type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Furnishing:</span>
                  <span className="font-medium capitalize">{property.furnishing.replace('_', ' ')}</span>
                </div>
                {property.utilities_included && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm">Utilities included</span>
                  </div>
                )}
              </div>

              {user?.role === 'renter' && (
                <button
                  onClick={handleApplyNow}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Apply Now
                </button>
              )}

              {!user && (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors block text-center"
                  >
                    Sign In to Apply
                  </Link>
                  <Link
                    to="/register"
                    className="w-full border-2 border-primary-600 text-primary-600 py-3 px-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors block text-center"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>

            {/* Owner Contact */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Owner</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Home className="h-5 w-5 mr-3" />
                  <span>{property.owner.full_name}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-5 w-5 mr-3" />
                  <span>{property.owner.email}</span>
                </div>
                {property.owner.phone_number && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-3" />
                    <span>{property.owner.phone_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Success Modal */}
      {applicationSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Submitted!</h3>
              <p className="text-gray-600 mb-6">
                Your rental application has been submitted successfully. The property owner will review it and get back to you soon.
              </p>
              <button
                onClick={() => setApplicationSuccess(false)}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;

