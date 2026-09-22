import React from 'react';
import { motion } from 'framer-motion';
import './SpecialBanner.css';

const bannerTexts = [
  '🔥 LIMITED TIME OFFER',
  '💥 BIGGEST MOBILE SALE',
  '💰 WHOLESALE PHONE PRICES',
  '🎁 FREE GIFTS AVAILABLE',
  '⚡ FLASH DEALS LIVE NOW',
  '🎯 EXCHANGE OFFERS'
];

const SpecialBanner = () => {
  return (
    <div className="special-banner">
      <motion.div 
        className="banner-track"
        animate={{ x: [0, -2000] }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {[...bannerTexts, ...bannerTexts, ...bannerTexts].map((text, index) => (
          <motion.span 
            key={index}
            className="banner-text"
            animate={{ 
              scale: [1, 1.1, 1],
              textShadow: [
                '0 0 10px rgba(0, 212, 255, 0.8)',
                '0 0 30px rgba(123, 47, 247, 0.8)',
                '0 0 10px rgba(0, 212, 255, 0.8)'
              ]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: index * 0.2
            }}
          >
            {text}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};

export default SpecialBanner;
