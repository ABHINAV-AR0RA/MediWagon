import React from 'react';
import { VoiceWaveform } from './voice-waveform';
import { Stethoscope } from 'lucide-react';

interface MediWagonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isListening?: boolean;
  showWaveform?: boolean;
}

export const MediWagonAvatar: React.FC<MediWagonAvatarProps> = ({ 
  size = 'md', 
  isListening = false,
  showWaveform = false 
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary via-cyan-400 to-blue-500 flex items-center justify-center shadow-lg ${
          isListening ? 'animate-pulse-glow' : ''
        }`}
        style={{
          boxShadow: isListening 
            ? '0 0 30px rgba(90, 185, 234, 0.6), 0 0 60px rgba(90, 185, 234, 0.3)' 
            : '0 10px 25px rgba(90, 185, 234, 0.3)'
        }}
      >
        <div className="w-[85%] h-[85%] rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
          <Stethoscope className={`${iconSizes[size]} text-primary`} />
        </div>
      </div>
      {showWaveform && (
        <VoiceWaveform isActive={isListening} bars={5} />
      )}
    </div>
  );
};
