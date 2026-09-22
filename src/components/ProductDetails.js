import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loadProducts } from '../data/products';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const products = loadProducts();
    const foundProduct = products.find(p => p.id === parseInt(id));
    if (foundProduct) {
      setProduct({
        ...foundProduct,
        images: foundProduct.images || [],
        specifications: foundProduct.specifications || []
      });
    }
  }, [id]);

  if (!product) {
    return (
      <div className="product-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  const nextImage = () => {
    if (product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  return (
    <div className="product-details-page">
      <div className="product-details-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
      </div>

      <div className="product-details-container">
        <motion.button
          className="back-button glass"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          ← Back to Home
        </motion.button>

        <div className="product-details-content">
          <motion.div
            className="product-images-section glass"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {product.images && product.images.length > 0 ? (
              <>
                <div className="main-image-container">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={product.images[currentImageIndex]}
                      alt={product.name}
                      className="main-product-image"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>

                  {product.images.length > 1 && (
                    <>
                      <button className="image-nav prev" onClick={prevImage}>
                        ‹
                      </button>
                      <button className="image-nav next" onClick={nextImage}>
                        ›
                      </button>
                    </>
                  )}
                </div>

                <div className="thumbnail-gallery">
                  {product.images.map((image, index) => (
                    <motion.div
                      key={index}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} />
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-image-placeholder">
                <div className="placeholder-emoji" style={{ filter: `drop-shadow(0 0 30px ${product.color})` }}>
                  {product.emoji}
                </div>
                <p>No images available</p>
              </div>
            )}
          </motion.div>

          <motion.div
            className="product-info-section"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="product-header-info glass">
              <div className="product-badge" style={{ background: product.color }}>
                {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
              </div>

              <h1 className="product-title gradient-text">{product.name}</h1>
              
              <p className="product-description">{product.description}</p>

              <div className="product-price-section">
                <span className="price-label">Price:</span>
                <span className="product-price-large" style={{ color: product.color }}>
                  {product.price}
                </span>
              </div>

              <div className="product-actions">
                <motion.button
                  className="btn-buy"
                  style={{ background: `linear-gradient(135deg, ${product.color}, ${product.color}dd)` }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Buy Now
                </motion.button>
                <motion.button
                  className="btn-contact"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open('https://wa.me/918140087845', '_blank')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Contact Us
                </motion.button>
              </div>
            </div>

            <motion.div
              className="product-specifications glass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="specs-title">
                <span className="specs-icon">📋</span>
                Specifications
              </h2>

              {product.specifications && product.specifications.length > 0 ? (
                <div className="specs-grid">
                  {product.specifications.map((spec, index) => (
                    <motion.div
                      key={index}
                      className="spec-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    >
                      <div className="spec-label">{spec.label}</div>
                      <div className="spec-value">{spec.value}</div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="no-specs">
                  <p>No specifications available</p>
                  <p className="no-specs-hint">Contact us for more details</p>
                </div>
              )}
            </motion.div>

            <motion.div
              className="product-features glass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3>Why Buy From Us?</h3>
              <div className="features-list">
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Genuine Products</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Best Price Guarantee</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Free Home Delivery</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Exchange Available</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>24/7 Support</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Quality Assured</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
