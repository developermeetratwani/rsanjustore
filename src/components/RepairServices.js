import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import BookingModal from './BookingModal';
import './RepairServices.css';

const services = [
  {
    icon: '📱',
    title: 'Display Replacement',
    description: 'High-quality screen replacement for all models',
    price: 'From ₹899'
  },
  {
    icon: '🔋',
    title: 'Battery Replacement',
    description: 'Original batteries with quality guarantee',
    price: 'From ₹599'
  },
  {
    icon: '📷',
    title: 'Camera Repair',
    description: 'Front & back camera repair services',
    price: 'From ₹799'
  },
  {
    icon: '⚙️',
    title: 'Software Update',
    description: 'Latest OS updates and optimization',
    price: 'From ₹299'
  },
  {
    icon: '💧',
    title: 'Water Damage Repair',
    description: 'Expert water damage restoration',
    price: 'From ₹999'
  },
  {
    icon: '🔧',
    title: 'General Repair',
    description: 'All types of mobile repairs',
    price: 'From ₹499'
  }
];

const RepairServices = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleBookNow = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (appointment) => {
    // Appointment is already saved to Firestore in BookingModal
    // Just show success message
    alert(`Appointment booked successfully! We'll contact you at ${appointment.customerPhone} soon.`);
    setShowBookingModal(false);
    setSelectedService(null);
  };

  return (
    <section className="repair-services" ref={ref}>
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title gradient-text">REPAIR SERVICES</h2>
          <div className="title-line"></div>
          <p className="section-subtitle">Expert Repairs, Quick Turnaround</p>
        </motion.div>

        <div className="services-grid">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="service-card glass"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.05,
                y: -10,
                transition: { duration: 0.3 }
              }}
            >
              <motion.div 
                className="service-icon-wrapper"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <div className="service-icon">{service.icon}</div>
                <div className="icon-glow"></div>
              </motion.div>

              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              <p className="service-price">{service.price}</p>

              <motion.button 
                className="service-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBookNow(service)}
              >
                Book Now
              </motion.button>

              <div className="service-features">
                <span>✓ Quick Service</span>
                <span>✓ Quality Parts</span>
                <span>✓ Expert Technicians</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="service-guarantee glass"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="guarantee-content">
            <motion.div
              className="guarantee-icon"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              ⭐
            </motion.div>
            <h3>100% Satisfaction Guarantee</h3>
            <p>We stand behind our work with quality service on all repairs</p>
            <div className="guarantee-badges">
              <span className="badge">🏆 Certified Technicians</span>
              <span className="badge">⚡ Same Day Service</span>
              <span className="badge">💯 Quality Parts</span>
            </div>
          </div>
        </motion.div>
      </div>

      {showBookingModal && selectedService && (
        <BookingModal
          service={selectedService}
          onClose={() => setShowBookingModal(false)}
          onSubmit={handleBookingSubmit}
        />
      )}
    </section>
  );
};

export default RepairServices;
