import React, { useRef, useEffect } from 'react';
import { useSound } from '../contexts/SoundContext';

export default function BackgroundAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { volume, isMusicPlaying } = useSound();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (isMusicPlaying) {
        audioRef.current.play().catch(e => console.log("Autoplay blocked", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying, volume]);

  return (
    <audio 
      ref={audioRef} 
      src="https://raw.githubusercontent.com/DavidAnand02/System-V19/d15236bf714c2d44685f0d98eb9fa4eae587808a/Atmosphere%20Phonk%20by%20Alexi%20Action%20(No%20Copyright%20Music)Passion.mp3" 
      loop 
    />
  );
}
