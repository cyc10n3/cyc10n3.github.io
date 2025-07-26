import React, { useState } from 'react';
import { Card, Button } from '@/components/common';

interface MapLocation {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  phone: string;
  email: string;
  hours: string;
  services: string[];
  description: string;
  timezone: string;
  languages: string[];
  type: 'headquarters' | 'regional' | 'manufacturing' | 'emergency';
}

interface InteractiveMapProps {
  locations: MapLocation[];
  className?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ locations, className = '' }) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(locations[0] || null);
  const [mapView, setMapView] = useState<'world' | 'region'>('world');

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'headquarters': return '🏢';
      case 'regional': return '🌍';
      case 'manufacturing': return '🏭';
      case 'emergency': return '🚨';
      default: return '📍';
    }
  };

  const getLocationColor = (type: string) => {
    switch (type) {
      case 'headquarters': return 'primary';
      case 'regional': return 'secondary';
      case 'manufacturing': return 'accent';
      case 'emergency': return 'error';
      default: return 'primary';
    }
  };

  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location);
  };

  const handleDirections = (location: MapLocation) => {
    const query = encodeURIComponent(location.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\D/g, '')}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Map Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-semibold text-gray-900">Our Global Locations</h3>
        <div className="flex space-x-2">
          <Button
            variant={mapView === 'world' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMapView('world')}
          >
            World View
          </Button>
          <Button
            variant={mapView === 'region' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMapView('region')}
          >
            Regional View
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map Area */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-96 border-0 relative overflow-hidden">
            {/* Mock World Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              {/* Simulated World Map */}
              <div className="relative w-full h-full">
                {/* Map Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <svg width="100%" height="100%" viewBox="0 0 400 200" className="w-full h-full">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#3B82F6" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Location Markers */}
                {locations.map((location, index) => {
                  // Mock coordinates for visual positioning
                  const positions = {
                    'houston': { x: '25%', y: '45%' }, // USA
                    'dubai': { x: '65%', y: '40%' },   // UAE
                    'vadodara': { x: '70%', y: '50%' }, // India
                    'emergency': { x: '50%', y: '30%' } // Global
                  };
                  
                  const position = positions[location.id as keyof typeof positions] || { x: '50%', y: '50%' };
                  
                  return (
                    <div
                      key={location.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                        selectedLocation?.id === location.id ? 'scale-125 z-10' : 'hover:scale-110'
                      }`}
                      style={{ left: position.x, top: position.y }}
                      onClick={() => handleLocationClick(location)}
                    >
                      <div className={`relative group`}>
                        {/* Marker */}
                        <div className={`w-8 h-8 bg-${getLocationColor(location.type)}-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white`}>
                          {getLocationIcon(location.type)}
                        </div>
                        
                        {/* Pulse Animation for Selected */}
                        {selectedLocation?.id === location.id && (
                          <div className={`absolute inset-0 bg-${getLocationColor(location.type)}-400 rounded-full animate-ping opacity-75`}></div>
                        )}
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            {location.name}
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Map Legend */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Location Types</h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                      <span>Headquarters</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-3 h-3 bg-secondary-500 rounded-full"></div>
                      <span>Regional Office</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-3 h-3 bg-accent-500 rounded-full"></div>
                      <span>Manufacturing</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="w-3 h-3 bg-error-500 rounded-full"></div>
                      <span>Emergency Support</span>
                    </div>
                  </div>
                </div>

                {/* Map Controls */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                  <button className="w-8 h-8 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  <button className="w-8 h-8 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Location Details Panel */}
        <div className="space-y-4">
          {/* Location Selector */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Select Location:</h4>
            <div className="grid grid-cols-1 gap-2">
              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleLocationClick(location)}
                  className={`p-3 text-left rounded-lg border transition-all duration-200 ${
                    selectedLocation?.id === location.id
                      ? `border-${getLocationColor(location.type)}-300 bg-${getLocationColor(location.type)}-50`
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">{getLocationIcon(location.type)}</div>
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${
                        selectedLocation?.id === location.id ? `text-${getLocationColor(location.type)}-900` : 'text-gray-900'
                      }`}>
                        {location.name}
                      </div>
                      <div className="text-xs text-gray-500">{location.type.charAt(0).toUpperCase() + location.type.slice(1)}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Location Details */}
          {selectedLocation && (
            <Card className="p-4 border-0">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getLocationIcon(selectedLocation.type)}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{selectedLocation.name}</h4>
                    <p className="text-sm text-gray-600">{selectedLocation.description}</p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <div className="text-sm text-gray-600 whitespace-pre-line">{selectedLocation.address}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <button
                      onClick={() => handleCall(selectedLocation.phone)}
                      className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      {selectedLocation.phone}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <button
                      onClick={() => handleEmail(selectedLocation.email)}
                      className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      {selectedLocation.email}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">{selectedLocation.hours}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">{selectedLocation.timezone}</span>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Services Available:</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedLocation.services.map((service, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Languages:</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedLocation.languages.map((language, index) => (
                      <span key={index} className="px-2 py-1 bg-primary-50 text-primary-600 rounded text-xs">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 pt-3 border-t border-gray-100">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDirections(selectedLocation)}
                    className="w-full"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Get Directions
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCall(selectedLocation.phone)}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEmail(selectedLocation.email)}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;