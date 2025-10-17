
import React from 'react';

interface MonitorProps {
  children: React.ReactNode;
}

const Monitor: React.FC<MonitorProps> = ({ children }) => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-4">
      <div 
        className="w-full h-full max-w-full max-h-full aspect-[16/9] bg-black text-green-400 text-2xl md:text-3xl lg:text-4xl overflow-hidden"
        style={{ imageRendering: 'pixelated' }}
      >
        <div className="w-full h-full overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Monitor;
