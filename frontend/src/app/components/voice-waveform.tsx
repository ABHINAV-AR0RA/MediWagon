import React from 'react';

interface VoiceWaveformProps {
  isActive?: boolean;
  className?: string;
  bars?: number;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ 
  isActive = false, 
  className = '',
  bars = 5 
}) => {
  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-primary rounded-full transition-all ${
            isActive ? 'animate-wave' : 'h-2'
          }`}
          style={{
            height: isActive ? '20px' : '8px',
            animation: isActive ? `wave 0.6s ease-in-out infinite` : 'none',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};
