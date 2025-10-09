import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { applicationsAPI } from '../services/api';
import { RentalApplication } from '../types';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MessageSquare,
  Calendar,
  DollarSign,
  MapPin,
  User,
  Filter,
  Search
} from 'lucide-react';

const Applications: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<RentalApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<RentalApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await applicationsAPI.getApplications();
        setApplications(response.data.results || response.data);
      } catch (err) {
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleStatusUpdate = async (applicationId: number, newStatus: string) => {
    try {
      await applicationsAPI.updateApplication(applicationId, { status: newStatus });
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus as any, reviewed_at: new Date().toISOString() }
            : app
        )
      );
      setSelectedApplication(null);
    } catch (err) {
      console.error('Failed to update application status:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'withdrawn':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      app.property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Applications</h1>
          <p className="text-gray-600">
            {user?.role === 'homeowner' 
              ? 'Manage applications for your properties'
              : 'Track your rental applications'
            }
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Applications Found</h2>
            <p className="text-gray-600 mb-8">
              {user?.role === 'homeowner' 
                ? 'You don\'t have any applications yet. List properties to start receiving applications.'
                : 'You haven\'t submitted any applications yet. Browse properties to get started.'
              }
            </p>
            {user?.role === 'homeowner' ? (
              <Link
                to="/create-property"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                List a Property
              </Link>
            ) : (
              <Link
                to="/properties"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Browse Properties
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Applications List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredApplications.map((application) => (
                <div key={application.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(application.status)}
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        <Link 
                          to={`/properties/${application.property.id}`}
                          className="hover:text-primary-600 transition-colors"
                        >
                          {application.property.title}
                        </Link>
                      </h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{application.property.city}, {application.property.state}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-lg font-bold text-gray-900 mb-1">
                        <DollarSign className="h-5 w-5 mr-1" />
                        <span>{application.property.monthly_rent.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          Move-in: {new Date(application.move_in_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {user?.role === 'homeowner' 
                          ? `Applicant: ${application.applicant.full_name}`
                          : `Applied on ${new Date(application.submitted_at).toLocaleDateString()}`
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">View Details</span>
                      </button>
                      {user?.role === 'homeowner' && application.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'approved')}
                            className="text-green-600 hover:text-green-700 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'rejected')}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Application Details Sidebar */}
            {selectedApplication && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Application Details</h3>
                    <button
                      onClick={() => setSelectedApplication(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Property Information</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Title:</strong> {selectedApplication.property.title}</p>
                        <p><strong>Address:</strong> {selectedApplication.property.full_address}</p>
                        <p><strong>Rent:</strong> ${selectedApplication.property.monthly_rent.toLocaleString()}/month</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Applicant Information</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Name:</strong> {selectedApplication.applicant.full_name}</p>
                        <p><strong>Email:</strong> {selectedApplication.applicant.email}</p>
                        {selectedApplication.applicant.phone_number && (
                          <p><strong>Phone:</strong> {selectedApplication.applicant.phone_number}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Application Details</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Move-in Date:</strong> {new Date(selectedApplication.move_in_date).toLocaleDateString()}</p>
                        <p><strong>Lease Duration:</strong> {selectedApplication.lease_duration_months} months</p>
                        {selectedApplication.monthly_income && (
                          <p><strong>Monthly Income:</strong> ${selectedApplication.monthly_income.toLocaleString()}</p>
                        )}
                        {selectedApplication.employment_status && (
                          <p><strong>Employment:</strong> {selectedApplication.employment_status}</p>
                        )}
                        {selectedApplication.has_pets && (
                          <p><strong>Pets:</strong> Yes - {selectedApplication.pet_details}</p>
                        )}
                      </div>
                    </div>

                    {selectedApplication.message && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                          {selectedApplication.message}
                        </p>
                      </div>
                    )}

                    {selectedApplication.additional_notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                          {selectedApplication.additional_notes}
                        </p>
                      </div>
                    )}

                    {user?.role === 'homeowner' && selectedApplication.status === 'pending' && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleStatusUpdate(selectedApplication.id, 'approved')}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve Application</span>
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject Application</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <button className="w-full flex items-center justify-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors">
                        <MessageSquare className="h-4 w-4" />
                        <span>Send Message</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;

