import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { propertiesAPI } from '../services/api';
import { 
  Home, 
  MapPin, 
  DollarSign, 
  Bed, 
  Upload, 
  X,
  Plus,
  CheckCircle
} from 'lucide-react';

interface PropertyFormData {
  title: string;
  description: string;
  property_type: 'apartment' | 'house' | 'condo' | 'townhouse' | 'studio' | 'duplex';
  furnishing: 'furnished' | 'unfurnished' | 'semi_furnished';
  address: string;
  city: string;
  state: string;
  zip_code: string;
  bedrooms: number;
  bathrooms: number;
  square_feet?: number;
  floor_number?: number;
  total_floors?: number;
  monthly_rent: number;
  security_deposit?: number;
  utilities_included: boolean;
  has_parking: boolean;
  has_balcony: boolean;
  has_garden: boolean;
  has_pool: boolean;
  has_gym: boolean;
  has_elevator: boolean;
  has_air_conditioning: boolean;
  has_heating: boolean;
  has_washer_dryer: boolean;
  pet_friendly: boolean;
  available_from: string;
}

const CreateProperty: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormData>({
    defaultValues: {
      utilities_included: false,
      has_parking: false,
      has_balcony: false,
      has_garden: false,
      has_pool: false,
      has_gym: false,
      has_elevator: false,
      has_air_conditioning: false,
      has_heating: false,
      has_washer_dryer: false,
      pet_friendly: false,
    }
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newImages = [...uploadedImages, ...files];
    setUploadedImages(newImages);

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const onSubmit = async (data: PropertyFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add images
      uploadedImages.forEach((image, index) => {
        formData.append(`images`, image);
        formData.append(`image_${index}_is_primary`, index === 0 ? 'true' : 'false');
      });

      await propertiesAPI.createProperty(formData);
      setSuccess(true);
      
      // Redirect to properties page after 2 seconds
      setTimeout(() => {
        navigate('/properties');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create property listing');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Created Successfully!</h1>
          <p className="text-gray-600">Your property listing has been submitted and is under review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Property Listing</h1>
          <p className="text-gray-600">Fill out the form below to list your property for rent</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Home className="h-6 w-6 mr-2" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  {...register('title', { required: 'Property title is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Beautiful 2BR Apartment in Downtown"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe your property in detail..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <select
                  {...register('property_type', { required: 'Property type is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select property type</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="studio">Studio</option>
                  <option value="duplex">Duplex</option>
                </select>
                {errors.property_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.property_type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Furnishing *
                </label>
                <select
                  {...register('furnishing', { required: 'Furnishing is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select furnishing</option>
                  <option value="furnished">Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi_furnished">Semi-Furnished</option>
                </select>
                {errors.furnishing && (
                  <p className="mt-1 text-sm text-red-600">{errors.furnishing.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="h-6 w-6 mr-2" />
              Location
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  {...register('address', { required: 'Address is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Street address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  {...register('city', { required: 'City is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="City"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  {...register('state', { required: 'State is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="State"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  {...register('zip_code', { required: 'ZIP code is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="ZIP code"
                />
                {errors.zip_code && (
                  <p className="mt-1 text-sm text-red-600">{errors.zip_code.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Bed className="h-6 w-6 mr-2" />
              Property Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms *
                </label>
                <input
                  {...register('bedrooms', { 
                    required: 'Number of bedrooms is required',
                    min: { value: 0, message: 'Must be 0 or more' }
                  })}
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.bedrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bedrooms.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms *
                </label>
                <input
                  {...register('bathrooms', { 
                    required: 'Number of bathrooms is required',
                    min: { value: 0, message: 'Must be 0 or more' }
                  })}
                  type="number"
                  step="0.5"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.bathrooms && (
                  <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Square Feet
                </label>
                <input
                  {...register('square_feet', { 
                    min: { value: 0, message: 'Must be 0 or more' }
                  })}
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.square_feet && (
                  <p className="mt-1 text-sm text-red-600">{errors.square_feet.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor Number
                </label>
                <input
                  {...register('floor_number', { 
                    min: { value: 0, message: 'Must be 0 or more' }
                  })}
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.floor_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.floor_number.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Floors
                </label>
                <input
                  {...register('total_floors', { 
                    min: { value: 0, message: 'Must be 0 or more' }
                  })}
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.total_floors && (
                  <p className="mt-1 text-sm text-red-600">{errors.total_floors.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <DollarSign className="h-6 w-6 mr-2" />
              Pricing
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Rent *
                </label>
                <input
                  {...register('monthly_rent', { 
                    required: 'Monthly rent is required',
                    min: { value: 0, message: 'Must be 0 or more' }
                  })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.monthly_rent && (
                  <p className="mt-1 text-sm text-red-600">{errors.monthly_rent.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Deposit
                </label>
                <input
                  {...register('security_deposit', { 
                    min: { value: 0, message: 'Must be 0 or more' }
                  })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.security_deposit && (
                  <p className="mt-1 text-sm text-red-600">{errors.security_deposit.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available From *
                </label>
                <input
                  {...register('available_from', { required: 'Available date is required' })}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.available_from && (
                  <p className="mt-1 text-sm text-red-600">{errors.available_from.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Amenities</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { key: 'utilities_included', label: 'Utilities Included' },
                { key: 'has_parking', label: 'Parking' },
                { key: 'has_balcony', label: 'Balcony' },
                { key: 'has_garden', label: 'Garden' },
                { key: 'has_pool', label: 'Pool' },
                { key: 'has_gym', label: 'Gym' },
                { key: 'has_elevator', label: 'Elevator' },
                { key: 'has_air_conditioning', label: 'Air Conditioning' },
                { key: 'has_heating', label: 'Heating' },
                { key: 'has_washer_dryer', label: 'Washer & Dryer' },
                { key: 'pet_friendly', label: 'Pet Friendly' },
              ].map((amenity) => (
                <label key={amenity.key} className="flex items-center">
                  <input
                    {...register(amenity.key as keyof PropertyFormData)}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{amenity.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Upload className="h-6 w-6 mr-2" />
              Property Images
            </h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload property images</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-primary-700 transition-colors"
                >
                  Choose Images
                </label>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF up to 10MB each</p>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/properties')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Create Listing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProperty;

