import React from 'react';
import { motion } from 'framer-motion';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-glow"></div>
      
      <div className="container">
        <div className="footer-content">
          <motion.div 
            className="footer-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="footer-logo gradient-text">R SANJU STORE</h3>
            <p className="footer-tagline">Your Trusted Mobile Partner</p>
            <p className="footer-description">
              Premium mobile devices, expert repairs, and unbeatable deals. 
              Experience the future of mobile shopping with us.
            </p>
            <div className="social-icons">
              <motion.a 
                href="https://www.instagram.com/rsanju_phone_hub" 
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.3 }}
                title="Instagram"
              >
                📷
              </motion.a>
              <motion.a 
                href="https://wa.me/918140087845" 
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.3 }}
                title="WhatsApp"
              >
                💬
              </motion.a>
              <motion.a 
                href="https://maps.app.goo.gl/jf9DvPm4ByUyWSdd7" 
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.3 }}
                title="Google Maps"
              >
                📍
              </motion.a>
              <motion.a 
                href="mailto:rsanjustore41@gmail.com" 
                className="social-icon"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.3 }}
                title="Email"
              >
                ✉️
              </motion.a>
            </div>
          </motion.div>

          <motion.div 
            className="footer-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#offers">Mega Offers</a></li>
              <li><a href="#products">Products</a></li>
              <li><a href="#services">Repair Services</a></li>
              <li><a href="#reviews">Reviews</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </motion.div>

          <motion.div 
            className="footer-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="footer-title">Services</h4>
            <ul className="footer-links">
              <li><a href="#display">Display Replacement</a></li>
              <li><a href="#battery">Battery Replacement</a></li>
              <li><a href="#camera">Camera Repair</a></li>
              <li><a href="#software">Software Update</a></li>
              <li><a href="#water">Water Damage</a></li>
              <li><a href="#exchange">Exchange Offers</a></li>
            </ul>
          </motion.div>

          <motion.div 
            className="footer-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="footer-title">Contact Info</h4>
            <ul className="footer-contact">
              <li>
                <span className="contact-icon">📍</span>
                <span>Gita Mandir Road, Ahmedabad-380002</span>
              </li>
              <li>
                <span className="contact-icon">📞</span>
                <span>Sales: +91 8140087845</span>
              </li>
              <li>
                <span className="contact-icon">🔧</span>
                <span>Repair: +91 8511282930</span>
              </li>
              <li>
                <span className="contact-icon">✉️</span>
                <span>rsanjustore41@gmail.com</span>
              </li>
              <li>
                <span className="contact-icon">📷</span>
                <span>@rsanju_phone_hub</span>
              </li>
              <li>
                <span className="contact-icon">🕐</span>
                <span>Mon-Sun: 9 AM - 9 PM</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="footer-divider"></div>
          <div className="footer-bottom-content">
            <p className="copyright">
              © 2024 R SANJU STORE. All Rights Reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#privacy">Privacy Policy</a>
              <span className="separator">|</span>
              <a href="#terms">Terms & Conditions</a>
              <span className="separator">|</span>
              <a href="#refund">Refund Policy</a>
            </div>
          </div>
          
          <motion.div 
            className="made-with-love"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Made with ❤️ for Mobile Lovers
          </motion.div>
        </motion.div>
      </div>

      <div className="footer-particles">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="footer-particle"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: 0,
              opacity: 0
            }}
            animate={{
              y: -100,
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>
    </footer>
  );
};

export default Footer;
