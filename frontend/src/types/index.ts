export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'homeowner' | 'renter' | 'admin';
  phone_number: string;
  profile_picture?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomeownerProfile {
  id: number;
  user: User;
  bio: string;
  company_name: string;
  license_number: string;
  address: string;
  is_verified_landlord: boolean;
}

export interface RenterProfile {
  id: number;
  user: User;
  bio: string;
  employment_status: string;
  annual_income?: number;
  credit_score?: number;
  references: string;
  preferred_location: string;
  budget_min?: number;
  budget_max?: number;
}

export interface PropertyImage {
  id: number;
  image: string;
  caption: string;
  is_primary: boolean;
  order: number;
}

export interface PropertyAmenity {
  id: number;
  name: string;
  description: string;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  property_type: 'apartment' | 'house' | 'condo' | 'townhouse' | 'studio' | 'duplex';
  furnishing: 'furnished' | 'unfurnished' | 'semi_furnished';
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
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
  owner: User;
  status: 'available' | 'rented' | 'pending' | 'inactive';
  is_featured: boolean;
  is_approved: boolean;
  available_from: string;
  created_at: string;
  updated_at: string;
  images?: PropertyImage[];
  amenities?: PropertyAmenity[];
  full_address: string;
  primary_image?: string;
  image_count: number;
  application_count?: number;
}

export interface ApplicationDocument {
  id: number;
  document_type: 'id' | 'pay_stub' | 'bank_statement' | 'employment_letter' | 'reference_letter' | 'other';
  file: string;
  description: string;
  uploaded_at: string;
}

export interface ApplicationMessage {
  id: number;
  sender: User;
  message: string;
  is_from_owner: boolean;
  created_at: string;
}

export interface RentalApplication {
  id: number;
  property: Property;
  applicant: User;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  message: string;
  move_in_date: string;
  lease_duration_months: number;
  monthly_income?: number;
  employment_status: string;
  employer_name: string;
  employer_phone: string;
  reference1_name: string;
  reference1_phone: string;
  reference1_relationship: string;
  reference2_name: string;
  reference2_phone: string;
  reference2_relationship: string;
  has_pets: boolean;
  pet_details: string;
  additional_notes: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: User;
  documents?: ApplicationDocument[];
  messages?: ApplicationMessage[];
}

export interface AuthResponse {
  user: User;
  tokens: {
    refresh: string;
    access: string;
  };
}

export interface PropertySearchFilters {
  search?: string;
  city?: string;
  state?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_bathrooms?: number;
  max_bathrooms?: number;
  furnishing?: string;
  has_parking?: boolean;
  has_balcony?: boolean;
  has_garden?: boolean;
  has_pool?: boolean;
  has_gym?: boolean;
  has_elevator?: boolean;
  has_air_conditioning?: boolean;
  has_heating?: boolean;
  has_washer_dryer?: boolean;
  pet_friendly?: boolean;
  utilities_included?: boolean;
  available_from?: string;
  ordering?: string;
}

export interface PropertyStats {
  total_properties: number;
  price_stats: {
    average: number;
    minimum: number;
    maximum: number;
  };
  property_types: Array<{
    property_type: string;
    count: number;
  }>;
  top_cities: Array<{
    city: string;
    count: number;
  }>;
}

export interface ApplicationStats {
  total_applications: number;
  pending_applications: number;
  approved_applications: number;
  rejected_applications: number;
}
