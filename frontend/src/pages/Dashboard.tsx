import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { propertiesAPI, applicationsAPI } from '../services/api';
import { Property, RentalApplication } from '../types';
import { 
  Home, 
  FileText, 
  DollarSign, 
  Users, 
  Calendar,
  MapPin,
  Eye,
  Plus,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [applications, setApplications] = useState<RentalApplication[]>([]);
  const [recentApplications, setRecentApplications] = useState<RentalApplication[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [propertiesResponse, applicationsResponse] = await Promise.all([
          user?.role === 'homeowner' ? propertiesAPI.getUserProperties() : Promise.resolve({ data: [] }),
          applicationsAPI.getApplications()
        ]);

        setProperties(propertiesResponse.data.results || propertiesResponse.data || []);
        setApplications(applicationsResponse.data.results || applicationsResponse.data || []);

        // Get recent applications (last 5)
        const recent = (applicationsResponse.data.results || applicationsResponse.data || [])
          .sort((a: RentalApplication, b: RentalApplication) => 
            new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
          )
          .slice(0, 5);
        setRecentApplications(recent);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your {user?.role === 'homeowner' ? 'properties' : 'rental applications'} today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user?.role === 'homeowner' ? (
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Home className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {applications.filter(app => app.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${properties.reduce((sum, prop) => sum + prop.monthly_rent, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FileText className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {applications.filter(app => app.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {applications.filter(app => app.status === 'approved').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {applications.filter(app => app.status === 'rejected').length}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="h-6 w-6 mr-2" />
                  Recent Applications
                </h2>
                <Link
                  to="/applications"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View all
                </Link>
              </div>

              {recentApplications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No applications yet</p>
                  {user?.role === 'renter' && (
                    <Link
                      to="/properties"
                      className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Browse Properties
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(application.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            <Link 
                              to={`/properties/${application.property.id}`}
                              className="hover:text-primary-600 transition-colors"
                            >
                              {application.property.title}
                            </Link>
                          </h3>
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{application.property.city}, {application.property.state}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-lg font-bold text-gray-900 mb-1">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span>{application.property.monthly_rent.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{new Date(application.submitted_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Properties (for homeowners) */}
            {user?.role === 'homeowner' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Home className="h-6 w-6 mr-2" />
                    Your Properties
                  </h2>
                  <Link
                    to="/create-property"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Property</span>
                  </Link>
                </div>

                {properties.length === 0 ? (
                  <div className="text-center py-8">
                    <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">You haven't listed any properties yet</p>
                    <Link
                      to="/create-property"
                      className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                    >
                      List Your First Property
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {properties.slice(0, 4).map((property) => (
                      <div key={property.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-medium text-gray-900">
                            <Link 
                              to={`/properties/${property.id}`}
                              className="hover:text-primary-600 transition-colors"
                            >
                              {property.title}
                            </Link>
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            property.status === 'available' ? 'bg-green-100 text-green-800' :
                            property.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{property.city}, {property.state}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-lg font-bold text-gray-900">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span>{property.monthly_rent.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{property.application_count || 0} applications</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {user?.role === 'homeowner' ? (
                  <>
                    <Link
                      to="/create-property"
                      className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>List New Property</span>
                    </Link>
                    <Link
                      to="/applications"
                      className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>View Applications</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/properties"
                      className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Home className="h-4 w-4" />
                      <span>Browse Properties</span>
                    </Link>
                    <Link
                      to="/applications"
                      className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>My Applications</span>
                    </Link>
                  </>
                )}
                <Link
                  to="/profile"
                  className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Edit Profile</span>
                </Link>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.role === 'homeowner' 
                      ? `${applications.filter(app => new Date(app.submitted_at).getMonth() === new Date().getMonth()).length} applications`
                      : `${applications.filter(app => new Date(app.submitted_at).getMonth() === new Date().getMonth()).length} applications submitted`
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Properties</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.role === 'homeowner' ? properties.length : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {applications.length > 0 
                      ? `${Math.round((applications.filter(app => app.status === 'approved').length / applications.length) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
