import React from 'react';

interface CheckmarkIconProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

const CheckmarkIcon: React.FC<CheckmarkIconProps> = ({ 
  size = 32, 
  className = '', 
  animated = true 
}) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animated ? 'animate-checkmark' : ''}
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="checkmark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.15"/>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle
          cx="16"
          cy="16"
          r="15"
          fill="url(#checkmark-gradient)"
          filter="url(#shadow)"
          className={animated ? 'animate-scale-in' : ''}
        />
        
        {/* Checkmark path */}
        <path
          d="M9 16.5L13.5 21L23 11.5"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className={animated ? 'animate-draw-checkmark' : ''}
          style={{
            strokeDasharray: animated ? '20' : 'none',
            strokeDashoffset: animated ? '20' : '0'
          }}
        />
      </svg>
    </div>
  );
};

export default CheckmarkIcon;
