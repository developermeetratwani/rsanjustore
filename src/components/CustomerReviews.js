import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './CustomerReviews.css';

const reviews = [
  {
    name: 'Rajesh Kumar',
    rating: 5,
    comment: 'Best mobile store in town! Got my Samsung Fold at an amazing price. Highly recommended!',
    avatar: '👨'
  },
  {
    name: 'Priya Sharma',
    rating: 5,
    comment: 'Excellent service! They repaired my iPhone screen in just 30 minutes. Very professional.',
    avatar: '👩'
  },
  {
    name: 'Amit Patel',
    rating: 5,
    comment: 'Great deals on second-hand phones. Got a like-new phone at wholesale price!',
    avatar: '👨‍💼'
  },
  {
    name: 'Sneha Reddy',
    rating: 5,
    comment: 'Amazing customer support! They helped me choose the perfect phone for my needs.',
    avatar: '👩‍💼'
  },
  {
    name: 'Vikram Singh',
    rating: 5,
    comment: 'Best exchange offer I have ever seen! Upgraded my old phone with minimal cost.',
    avatar: '👨‍🦱'
  }
];

const CustomerReviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="customer-reviews" ref={ref}>
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title gradient-text">CUSTOMER REVIEWS</h2>
          <div className="title-line"></div>
          <p className="section-subtitle">What Our Customers Say</p>
        </motion.div>

        <div className="reviews-carousel">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="review-card-main glass"
              initial={{ opacity: 0, x: 100, rotateY: -20 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -100, rotateY: 20 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="review-avatar"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {reviews[currentIndex].avatar}
              </motion.div>

              <div className="review-stars">
                {[...Array(reviews[currentIndex].rating)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="star"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>

              <p className="review-comment">"{reviews[currentIndex].comment}"</p>
              <h4 className="review-name">{reviews[currentIndex].name}</h4>

              <div className="review-glow"></div>
            </motion.div>
          </AnimatePresence>

          <div className="carousel-dots">
            {reviews.map((_, index) => (
              <motion.button
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>

        <div className="reviews-grid">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              className="review-card-small glass"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="review-avatar-small">{review.avatar}</div>
              <div className="review-stars-small">
                {[...Array(review.rating)].map((_, i) => (
                  <span key={i} className="star-small">⭐</span>
                ))}
              </div>
              <p className="review-comment-small">"{review.comment}"</p>
              <h5 className="review-name-small">{review.name}</h5>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="review-stats"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="stat-box glass">
            <motion.h3
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              4.9/5
            </motion.h3>
            <p>Average Rating</p>
          </div>
          <div className="stat-box glass">
            <motion.h3
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
              1000+
            </motion.h3>
            <p>Happy Customers</p>
          </div>
          <div className="stat-box glass">
            <motion.h3
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            >
              98%
            </motion.h3>
            <p>Satisfaction Rate</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CustomerReviews;
