import { useCallback, useRef } from 'react';

export const useRetroSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const clickBufferRef = useRef<AudioBuffer | null>(null);

  const initAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Pre-load the PS5 click sound if not already loaded
    if (!clickBufferRef.current && audioContextRef.current) {
      try {
        const response = await fetch('https://raw.githubusercontent.com/hstle/gamestation/304117cfdc1a2c1d58da012bb708aa0efe9bcb32/ps5-selection-button.mp3');
        const arrayBuffer = await response.arrayBuffer();
        clickBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
      } catch (error) {
        console.error('Failed to load PS5 sound:', error);
      }
    }
  }, []);

  const playSound = useCallback(async (type: 'hover' | 'click' | 'success') => {
    await initAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (type === 'click' && clickBufferRef.current) {
      const source = ctx.createBufferSource();
      source.buffer = clickBufferRef.current;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
      return;
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'hover') {
      // PS5-inspired soft shimmer/ping
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, now);
      oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gainNode.gain.setValueAtTime(0.015, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      oscillator.start(now);
      oscillator.stop(now + 0.1);
    } else if (type === 'click') {
      // Fallback if buffer didn't load
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(220, now);
      oscillator.frequency.exponentialRampToValueAtTime(110, now + 0.15);
      gainNode.gain.setValueAtTime(0.04, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      oscillator.start(now);
      oscillator.stop(now + 0.15);
    } else if (type === 'success') {
      // PS5-inspired clean melodic chime
      oscillator.type = 'sine';
      const notes = [659.25, 830.61, 987.77, 1318.51]; // E5, G#5, B5, E6 (Major 7th feel)
      notes.forEach((freq, i) => {
        oscillator.frequency.setValueAtTime(freq, now + i * 0.08);
      });
      gainNode.gain.setValueAtTime(0.03, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      oscillator.start(now);
      oscillator.stop(now + 0.4);
    }
  }, [initAudio]);

  return { playSound };
};
