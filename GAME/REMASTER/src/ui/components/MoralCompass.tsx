import React from 'react';

export const MoralCompass: React.FC = () => {
    return (
        <div className="h-24 border border-green-800 bg-black p-2 rounded">
            <h2 className="text-center border-b border-green-900 mb-2 text-xs font-bold">BUSSOLA MORALE</h2>
            <div className="flex justify-between text-xs mb-1 px-1">
                <span className="text-blue-400">Lena</span>
                <span className="text-red-400">Elian</span>
            </div>
            <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden relative border border-gray-700">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 via-gray-900 to-red-900/50"></div>

                {/* Center Marker */}
                <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-500 transform -translate-x-1/2"></div>

                {/* Indicator */}
                <div
                    className="absolute top-0 h-full w-1 bg-white shadow-[0_0_5px_white] transition-all duration-500"
                    style={{ left: '50%', transform: 'translateX(-50%)' }}
                ></div>
            </div>
            <div className="text-center text-[10px] mt-2 text-gray-400 tracking-widest">NEUTRALE</div>
        </div>
    );
};
