import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import './BookingModal.css';

const BookingModal = ({ service, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deviceModel: '',
    issueDescription: '',
    preferredDate: '',
    preferredTime: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (!/^[6-9]\d{9}$/.test(formData.customerPhone)) {
      alert('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    const appointment = {
      ...formData,
      service: service.title,
      serviceIcon: service.icon,
      estimatedPrice: service.price,
      bookingTime: new Date().toISOString(),
      status: 'pending'
    };

    try {
      await addDoc(collection(db, 'appointments'), appointment);
      onSubmit(appointment);
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="booking-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="booking-modal glass"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose}>✕</button>
          
          <div className="modal-header">
            <div className="service-icon-large">{service.icon}</div>
            <h2 className="gradient-text">Book Repair Service</h2>
            <p className="service-name">{service.title}</p>
            <p className="service-price-modal">{service.price}</p>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label>Your Name *</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                required
                placeholder="10-digit mobile number"
                pattern="[6-9][0-9]{9}"
                maxLength="10"
              />
            </div>

            <div className="form-group">
              <label>Device Model *</label>
              <input
                type="text"
                name="deviceModel"
                value={formData.deviceModel}
                onChange={handleChange}
                required
                placeholder="e.g., iPhone 13, Samsung S21"
              />
            </div>

            <div className="form-group">
              <label>Issue Description *</label>
              <textarea
                name="issueDescription"
                value={formData.issueDescription}
                onChange={handleChange}
                required
                placeholder="Describe the problem with your device"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Preferred Date *</label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Preferred Time *</label>
                <input
                  type="time"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-buttons">
              <motion.button
                type="button"
                className="btn-cancel-booking"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="btn-submit-booking"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Appointment
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingModal;
