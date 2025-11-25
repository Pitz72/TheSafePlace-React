import React from 'react';

export const CRTOverlay: React.FC = () => {
    return (
        <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-lg">
            {/* Scanlines */}
            <div className="scanlines absolute inset-0 opacity-30"></div>

            {/* Vignette */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)'
                }}
            ></div>

            {/* Screen Glow */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    boxShadow: 'inset 0 0 50px rgba(51, 255, 51, 0.2)'
                }}
            ></div>
        </div>
    );
};
