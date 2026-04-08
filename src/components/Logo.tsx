import React from 'react';

export const Logo: React.FC<{ className?: string; showText?: boolean }> = ({ className = "w-12 h-12", showText = true }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg viewBox="0 0 512 512" className="w-full h-full" fill="currentColor">
        {/* Rounded Square Background */}
        <rect x="0" y="0" width="512" height="512" rx="80" className="text-emerald-600" />
        
        {/* Trowel (Colher de Pedreiro) */}
        <path 
          d="M150 240 L260 170 L300 210 L190 280 Z" 
          fill="white" 
        />
        <path 
          d="M260 170 L280 140 C290 120 310 120 320 140 L340 170" 
          stroke="white" 
          strokeWidth="20" 
          fill="none" 
          strokeLinecap="round"
        />
        <rect x="330" y="170" width="20" height="60" rx="10" fill="white" transform="rotate(-30 340 170)" />

        {/* Calculator */}
        <rect x="320" y="250" width="120" height="160" rx="10" fill="white" />
        <rect x="340" y="270" width="80" height="30" rx="2" className="text-emerald-600" />
        <circle cx="350" cy="320" r="8" className="text-emerald-600" />
        <circle cx="380" cy="320" r="8" className="text-emerald-600" />
        <circle cx="410" cy="320" r="8" className="text-emerald-600" />
        <circle cx="350" cy="350" r="8" className="text-emerald-600" />
        <circle cx="380" cy="350" r="8" className="text-emerald-600" />
        <circle cx="410" cy="350" r="8" className="text-emerald-600" />
        <rect x="400" y="370" width="20" height="30" rx="5" className="text-emerald-600" />

        {/* Brick Wall */}
        <g fill="white">
          <rect x="80" y="320" width="70" height="35" rx="2" />
          <rect x="155" y="320" width="70" height="35" rx="2" />
          <rect x="230" y="320" width="70" height="35" rx="2" />
          
          <rect x="115" y="360" width="70" height="35" rx="2" />
          <rect x="190" y="360" width="70" height="35" rx="2" />
          <rect x="265" y="360" width="70" height="35" rx="2" />
          
          <rect x="80" y="400" width="70" height="35" rx="2" />
          <rect x="155" y="400" width="70" height="35" rx="2" />
          <rect x="230" y="400" width="70" height="35" rx="2" />
        </g>

        {/* Text */}
        {showText && (
          <text 
            x="256" 
            y="480" 
            textAnchor="middle" 
            fill="white" 
            style={{ fontSize: '54px', fontWeight: 'bold', fontFamily: 'sans-serif' }}
          >
            CalcConstrução
          </text>
        )}
      </svg>
    </div>
  );
};
