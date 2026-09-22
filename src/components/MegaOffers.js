import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './MegaOffers.css';

const offers = [
  {
    title: 'Display Replacement',
    description: 'Starting at',
    price: '₹899',
    icon: '🔧',
    gradient: 'linear-gradient(135deg, #7b2ff7, #b24bf3)'
  },
  {
    title: 'Second-Hand Phones',
    description: 'Wholesale Rates',
    price: 'Best Price',
    icon: '💰',
    gradient: 'linear-gradient(135deg, #ff00ff, #ff6b9d)'
  },
  {
    title: 'Free Gifts',
    description: 'On Selected Purchases',
    price: 'Limited',
    icon: '🎁',
    gradient: 'linear-gradient(135deg, #00ff88, #00d4aa)'
  },
  {
    title: 'Exchange Offers',
    description: 'Get Best Value',
    price: 'Available',
    icon: '🔄',
    gradient: 'linear-gradient(135deg, #ffd700, #ffaa00)'
  },
  {
    title: 'Accessories',
    description: 'Huge Discounts',
    price: 'Up to 70%',
    icon: '🎧',
    gradient: 'linear-gradient(135deg, #ff4757, #ff6348)'
  },
  {
    title: 'Battery Replacement',
    description: 'Original Quality',
    price: '₹599',
    icon: '🔋',
    gradient: 'linear-gradient(135deg, #00d4ff, #0080ff)'
  }
];

const MegaOffers = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        let { hours, minutes, seconds } = prevTime;
        
        // Decrease seconds
        seconds--;
        
        // Handle minute rollover
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        
        // Handle hour rollover
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        
        // Reset to 24 hours when countdown reaches 0
        if (hours < 0) {
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="mega-offers" ref={ref}>
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title gradient-text">MEGA OFFERS</h2>
          <div className="title-line"></div>
          <p className="section-subtitle">Unbeatable Deals You Can't Miss!</p>
        </motion.div>

        <div className="offers-grid">
          {offers.map((offer, index) => (
            <motion.div
              key={index}
              className="offer-card glass"
              initial={{ opacity: 0, y: 50, rotateY: -20 }}
              animate={inView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                z: 50,
                transition: { duration: 0.3 }
              }}
            >
              <div className="offer-shine"></div>
              
              <motion.div 
                className="offer-icon"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                {offer.icon}
              </motion.div>

              <h3 className="offer-title">{offer.title}</h3>
              <p className="offer-description">{offer.description}</p>
              
              <motion.div 
                className="offer-price"
                style={{ background: offer.gradient }}
                whileHover={{ scale: 1.1 }}
              >
                {offer.price}
              </motion.div>

              <div className="offer-badge">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  HOT DEAL 🔥
                </motion.span>
              </div>

              <motion.button 
                className="offer-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Grab Now
              </motion.button>

              <div className="offer-glow" style={{ background: offer.gradient }}></div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="limited-time-banner"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.div
            className="banner-content glass"
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(0, 212, 255, 0.5)',
                '0 0 40px rgba(123, 47, 247, 0.8)',
                '0 0 20px rgba(0, 212, 255, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <h3>⚡ LIMITED TIME OFFER ⚡</h3>
            <p>Hurry! These deals won't last forever</p>
            <div className="countdown">
              <div className="countdown-item">
                <span className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="countdown-label">Hours</span>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-item">
                <span className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="countdown-label">Minutes</span>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-item">
                <span className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="countdown-label">Seconds</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default MegaOffers;
