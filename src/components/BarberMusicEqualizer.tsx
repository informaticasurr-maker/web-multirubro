import React, { useEffect, useState } from 'react';
import { globalBarberAudioEngine } from '../utils/barberAudioEngine';

interface EqualizerProps {
  isPlaying: boolean;
  barCount?: number;
  heightClass?: string;
  colorClass?: string;
}

export const BarberMusicEqualizer: React.FC<EqualizerProps> = ({
  isPlaying,
  barCount = 5,
  heightClass = 'h-4',
  colorClass = 'bg-amber-400'
}) => {
  const [frequencies, setFrequencies] = useState<number[]>(() =>
    Array(barCount).fill(15)
  );

  useEffect(() => {
    if (!isPlaying) {
      setFrequencies(Array(barCount).fill(15));
      return;
    }

    let animId: number;
    const updateBars = () => {
      const byteData = globalBarberAudioEngine.getEqualizerData();

      const newHeights: number[] = [];
      for (let i = 0; i < barCount; i++) {
        // Map analyser data or generate dynamic rhythmic pulses
        const rawByte = byteData[i % byteData.length] || 0;
        let percent = Math.min(100, Math.max(15, (rawByte / 255) * 100));

        // If byteData is quiet (e.g. initial load or CORS restricted stream), produce realistic dance bars
        if (rawByte === 0) {
          const time = Date.now() / 150;
          percent = 20 + Math.abs(Math.sin(time + i * 0.8)) * 75;
        }

        newHeights.push(Math.round(percent));
      }

      setFrequencies(newHeights);
      animId = requestAnimationFrame(updateBars);
    };

    animId = requestAnimationFrame(updateBars);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, barCount]);

  return (
    <div className={`flex items-end gap-0.5 ${heightClass}`}>
      {frequencies.map((height, idx) => (
        <span
          key={idx}
          className={`w-0.5 sm:w-1 rounded-full transition-all duration-75 ${colorClass}`}
          style={{
            height: isPlaying ? `${height}%` : '20%',
            opacity: isPlaying ? 0.95 : 0.4
          }}
        />
      ))}
    </div>
  );
};
