import React from 'react';

interface iPhoneMockupProps {
  children: React.ReactNode;
}

export function IPhoneMockup({ children }: iPhoneMockupProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
      {/* iPhone Frame */}
      <div className="relative">
        {/* iPhone Body */}
        <div className="relative bg-black rounded-[3rem] p-2 shadow-2xl">
          {/* Screen */}
          <div className="bg-black rounded-[2.5rem] overflow-hidden">
            {/* Notch */}
            <div className="relative bg-black h-6 flex justify-center">
              <div className="absolute top-0 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
            </div>
            
            {/* Screen Content */}
            <div className="relative bg-white dark:bg-gray-900 w-[375px] h-[750px] overflow-hidden">
              {children}
            </div>
            
            {/* Home Indicator */}
            <div className="bg-black h-6 flex justify-center items-center">
              <div className="w-32 h-1 bg-white rounded-full opacity-60"></div>
            </div>
          </div>
        </div>
        
        {/* Side Buttons */}
        {/* Volume Buttons */}
        <div className="absolute left-[-3px] top-[120px] w-1 h-8 bg-black rounded-r"></div>
        <div className="absolute left-[-3px] top-[160px] w-1 h-8 bg-black rounded-r"></div>
        
        {/* Power Button */}
        <div className="absolute right-[-3px] top-[140px] w-1 h-12 bg-black rounded-l"></div>
        
        {/* Camera */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-full flex items-center justify-center z-20">
          <div className="w-2 h-2 bg-gray-800 rounded-full mr-2"></div>
          <div className="w-8 h-2 bg-gray-800 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}