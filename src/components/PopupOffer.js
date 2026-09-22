import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PopupOffer.css';

const PopupOffer = ({ onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="popup-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="popup-content glass"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: "spring", duration: 0.8 }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.button
            className="popup-close"
            onClick={onClose}
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            ✕
          </motion.button>

          <motion.div
            className="popup-icon"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎉
          </motion.div>

          <motion.h2
            className="popup-title gradient-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            SPECIAL OFFER!
          </motion.h2>

          <motion.p
            className="popup-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Get Exclusive Deals Today!
          </motion.p>

          <motion.div
            className="popup-offer-box"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="offer-badge">LIMITED TIME</div>
            <h3 className="offer-text">
              <span className="offer-discount">50% OFF</span>
              <span className="offer-detail">On Display Replacement</span>
            </h3>
            <p className="offer-validity">Valid for Today Only!</p>
          </motion.div>

          <motion.div
            className="popup-features"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Free Gifts Worth ₹500</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Same Day Service</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Quality Assured</span>
            </div>
          </motion.div>

          <motion.button
            className="popup-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
          >
            Claim Offer Now
          </motion.button>

          <motion.p
            className="popup-timer"
            animate={{ 
              color: ['#00d4ff', '#ff00ff', '#00d4ff']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⏰ Offer expires in 2 hours!
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PopupOffer;
