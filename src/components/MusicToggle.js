import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './MusicToggle.css';

const MusicToggle = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
    // Note: Actual audio implementation would require an audio file
    // For demo purposes, this just toggles the visual state
  };

  return (
    <motion.button
      className="music-toggle"
      onClick={toggleMusic}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.5 }}
    >
      <motion.div
        className="music-icon"
        animate={isPlaying ? { 
          rotate: 360,
        } : {}}
        transition={{ 
          duration: 2,
          repeat: isPlaying ? Infinity : 0,
          ease: "linear"
        }}
      >
        {isPlaying ? '🎵' : '🔇'}
      </motion.div>
      <span className="music-tooltip">
        {isPlaying ? 'Music On' : 'Music Off'}
      </span>
    </motion.button>
  );
};

export default MusicToggle;
