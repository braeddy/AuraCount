import React from 'react';

interface DatabaseStatusProps {
  isConnected?: boolean;
  isLoading?: boolean;
}

export default function DatabaseStatus({ isConnected = false, isLoading = false }: DatabaseStatusProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span>Caricamento...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div 
        className={`w-2 h-2 rounded-full ${
          isConnected 
            ? 'bg-green-500' 
            : 'bg-orange-500'
        }`}
      ></div>
      <span className={isConnected ? 'text-green-600' : 'text-orange-600'}>
        {isConnected ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}
