import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Contact.css';

const Contact = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for contacting us! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="contact" ref={ref}>
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title gradient-text">CONTACT US</h2>
          <div className="title-line"></div>
          <p className="section-subtitle">Get in Touch with Us</p>
        </motion.div>

        <div className="contact-content">
          <motion.div
            className="contact-info"
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="info-card glass">
              <motion.div 
                className="info-icon"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📍
              </motion.div>
              <h3>Visit Us</h3>
              <p>R Sanju Store</p>
              <p>207, 2h7rgvj, Hub Town, St Bus Stand</p>
              <p>Dharmyug Colony, Gita Mandir</p>
              <p>Gita Mandir Road, Raipur Gate</p>
              <p>Ahmedabad-380002, Gujarat</p>
            </div>

            <div className="info-card glass">
              <motion.div 
                className="info-icon"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📞
              </motion.div>
              <h3>Call Us</h3>
              <p>Second Hand & Accessories: +91 8140087845</p>
              <p>Repairing Queries: +91 8511282930</p>
              <p>Mon - Sun: 9 AM - 9 PM</p>
            </div>

            <div className="info-card glass">
              <motion.div 
                className="info-icon"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✉️
              </motion.div>
              <h3>Email Us</h3>
              <p>rsanjustore41@gmail.com</p>
              <p>24/7 Email Support</p>
            </div>

            <div className="info-card glass">
              <motion.div 
                className="info-icon"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                🕐
              </motion.div>
              <h3>Store Hours</h3>
              <p>Monday - Saturday</p>
              <p>9:00 AM - 9:00 PM</p>
              <p>Sunday: 10:00 AM - 8:00 PM</p>
            </div>
          </motion.div>

          <motion.div
            className="contact-form-wrapper"
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <form className="contact-form glass" onSubmit={handleSubmit}>
              <h3 className="form-title gradient-text">Send us a Message</h3>
              
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Your Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="form-textarea"
                  rows="5"
                />
              </div>

              <motion.button
                type="submit"
                className="form-submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>

        <motion.div
          className="map-container glass"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="map-placeholder">
            <div className="map-icon">🗺️</div>
            <h3>Find Us on Map</h3>
            <p>R Sanju Store - Gita Mandir Road, Ahmedabad</p>
            <motion.button
              className="map-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://maps.app.goo.gl/jf9DvPm4ByUyWSdd7', '_blank')}
            >
              Open in Google Maps
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
