import React from 'react';

const RainBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Rain drops */}
      {Array.from({ length: 80 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-0.5 bg-gradient-to-b from-blue-500 to-blue-800 opacity-50 animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            height: `${Math.random() * 30 + 20}px`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${Math.random() * 1.5 + 0.8}s`,
          }}
        />
      ))}
      
      {/* Realistic SVG Clouds */}
      <div className="absolute top-12 left-8 opacity-80 cloud-float">
        <svg width="200" height="80" viewBox="0 0 200 80" className="drop-shadow-lg">
          <path
            d="M40 60 C20 60, 10 45, 25 35 C25 25, 35 15, 50 20 C60 10, 80 15, 85 25 C95 20, 110 25, 110 35 C125 30, 140 40, 135 50 C150 50, 160 60, 145 65 Z"
            fill="white"
            opacity="0.9"
          />
          <path
            d="M45 55 C30 55, 25 45, 35 40 C40 30, 50 25, 60 30 C70 20, 85 25, 90 35 C100 30, 115 35, 115 45 C125 40, 135 45, 130 55 Z"
            fill="white"
            opacity="0.7"
          />
        </svg>
      </div>

      <div className="absolute top-20 right-16 opacity-75 cloud-float" style={{ animationDelay: '2s' }}>
        <svg width="240" height="90" viewBox="0 0 240 90" className="drop-shadow-md">
          <path
            d="M50 70 C25 70, 15 50, 30 40 C30 25, 45 15, 65 25 C75 10, 100 15, 110 30 C120 20, 140 25, 145 40 C160 35, 180 45, 175 55 C190 55, 200 65, 185 75 Z"
            fill="white"
            opacity="0.85"
          />
          <path
            d="M55 65 C35 65, 30 50, 40 45 C45 35, 55 30, 70 35 C80 25, 95 30, 100 40 C110 35, 125 40, 125 50 C135 45, 145 50, 140 60 Z"
            fill="white"
            opacity="0.6"
          />
        </svg>
      </div>

      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 opacity-70 cloud-float" style={{ animationDelay: '4s' }}>
        <svg width="180" height="70" viewBox="0 0 180 70" className="drop-shadow-sm">
          <path
            d="M35 55 C20 55, 12 42, 22 35 C22 25, 32 18, 45 22 C52 12, 68 16, 72 28 C80 23, 95 28, 95 38 C105 33, 118 38, 115 48 C125 48, 132 55, 120 60 Z"
            fill="white"
            opacity="0.8"
          />
          <path
            d="M40 50 C28 50, 25 40, 32 37 C37 30, 45 27, 55 32 C62 25, 72 28, 75 37 C82 34, 92 37, 90 47 Z"
            fill="white"
            opacity="0.5"
          />
        </svg>
      </div>

      <div className="absolute bottom-24 left-20 opacity-65 cloud-float" style={{ animationDelay: '1s' }}>
        <svg width="220" height="85" viewBox="0 0 220 85" className="drop-shadow-lg">
          <path
            d="M45 65 C25 65, 15 48, 28 40 C28 28, 40 20, 55 25 C65 15, 85 20, 90 32 C100 27, 118 32, 118 42 C130 37, 145 42, 142 52 C155 52, 165 62, 150 67 Z"
            fill="white"
            opacity="0.9"
          />
          <path
            d="M50 60 C32 60, 28 48, 38 43 C43 33, 53 28, 65 33 C75 23, 88 28, 92 38 C102 33, 115 38, 113 48 Z"
            fill="white"
            opacity="0.6"
          />
        </svg>
      </div>

      <div className="absolute bottom-8 right-24 opacity-60 cloud-float" style={{ animationDelay: '3s' }}>
        <svg width="260" height="95" viewBox="0 0 260 95" className="drop-shadow-md">
          <path
            d="M55 75 C30 75, 20 55, 35 45 C35 30, 50 22, 70 27 C80 17, 105 22, 115 35 C125 30, 145 35, 150 45 C165 40, 185 50, 180 60 C195 60, 205 70, 190 80 Z"
            fill="white"
            opacity="0.85"
          />
          <path
            d="M60 70 C40 70, 35 55, 45 50 C50 40, 60 35, 75 40 C85 30, 100 35, 105 45 C115 40, 130 45, 128 55 Z"
            fill="white"
            opacity="0.55"
          />
        </svg>
      </div>

      <div className="absolute top-32 left-1/3 opacity-55 cloud-float" style={{ animationDelay: '5s' }}>
        <svg width="160" height="65" viewBox="0 0 160 65" className="drop-shadow-sm">
          <path
            d="M30 50 C18 50, 12 38, 20 32 C20 22, 28 16, 40 20 C47 12, 60 16, 63 26 C70 22, 82 26, 82 34 C90 30, 100 34, 98 42 C108 42, 114 50, 105 54 Z"
            fill="white"
            opacity="0.75"
          />
        </svg>
      </div>

      <div className="absolute top-48 right-1/3 opacity-50 cloud-float" style={{ animationDelay: '6s' }}>
        <svg width="190" height="75" viewBox="0 0 190 75" className="drop-shadow-lg">
          <path
            d="M40 58 C22 58, 14 43, 25 36 C25 26, 35 19, 48 23 C55 14, 72 18, 76 28 C84 24, 98 28, 98 36 C108 32, 120 36, 118 44 C128 44, 136 52, 125 57 Z"
            fill="white"
            opacity="0.8"
          />
          <path
            d="M45 53 C30 53, 26 43, 33 40 C38 32, 46 29, 56 34 C63 27, 73 30, 76 39 Z"
            fill="white"
            opacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
};

export default RainBackground;