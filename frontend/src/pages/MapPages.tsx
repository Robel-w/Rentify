import React from "react";
import PropertyMap from "../components/PropertyMap";
import { MapPin, Filter, List } from "lucide-react";

const MapPages: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Property Map</h1>
                <p className="text-gray-600 mt-1">Discover available rental properties on an interactive map</p>
              </div>
            </div>
            
            {/* Map Controls */}
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <List className="h-4 w-4 mr-2" />
                List View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <PropertyMap 
            center={[9.03, 38.74]} 
            zoom={12}
            height="80vh"
            width="100%"
            showControls={true}
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Map Instructions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <MapPin className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                How to use the map
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Click on any marker to view property details</li>
                  <li>Use mouse wheel or controls to zoom in/out</li>
                  <li>Drag to pan around the map</li>
                  <li>Click "View Details" in popups to see full property information</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPages;
