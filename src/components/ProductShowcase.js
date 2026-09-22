import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import './ProductShowcase.css';

const ProductShowcase = () => {
  const [products, setProducts] = useState([]);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  const navigate = useNavigate();

  const productsRef = useRef([]);

  // Load products from Firestore with real-time listener
  useEffect(() => {
    const productsQuery = query(
      collection(db, 'products'),
      where('inStock', '==', true)
    );
    
    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        images: doc.data().images || []
      }));
      setProducts(productsData);
    }, (error) => {
      console.error('Error fetching products:', error);
      // Fallback to localStorage if Firestore fails
      const loadProducts = () => {
        const saved = localStorage.getItem('rsanju_products');
        return saved ? JSON.parse(saved) : [];
      };
      const loadedProducts = loadProducts().map(p => ({
        ...p,
        images: p.images || []
      }));
      setProducts(loadedProducts.filter(p => p.inStock));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (inView) {
      productsRef.current.forEach((product, index) => {
        gsap.fromTo(product,
          { 
            rotationY: -180,
            opacity: 0,
            scale: 0.5
          },
          {
            rotationY: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            delay: index * 0.2,
            ease: 'back.out(1.7)'
          }
        );
      });
    }
  }, [inView]);

  useEffect(() => {
    // Mouse follow effect
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const moveX = (clientX - centerX) / 50;
      const moveY = (clientY - centerY) / 50;

      productsRef.current.forEach((product, index) => {
        if (product) {
          gsap.to(product, {
            x: moveX * (index % 2 === 0 ? 1 : -1),
            y: moveY * (index % 2 === 0 ? 1 : -1),
            duration: 0.5,
            ease: 'power2.out'
          });
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="product-showcase" ref={ref}>
      <div className="showcase-background">
        <div className="grid-lines"></div>
      </div>

      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="section-title gradient-text">3D PRODUCT SHOWCASE</h2>
          <div className="title-line"></div>
          <p className="section-subtitle">Premium Devices in Stunning 3D</p>
        </motion.div>

        <div className="products-grid">
          {products.map((product, index) => (
            <div
              key={product.id || index}
              ref={el => productsRef.current[index] = el}
              className="product-card-3d"
            >
              <motion.div
                className="product-inner glass"
                whileHover={{ 
                  scale: 1.1,
                  rotateY: 15,
                  z: 100
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="product-glow" style={{ background: product.color }}></div>
                
                {product.images && product.images.length > 0 ? (
                  <div className="product-image-slider">
                    <img src={product.images[0]} alt={product.name} className="product-main-image" />
                    {product.images.length > 1 && (
                      <div className="product-image-dots">
                        {product.images.map((_, i) => (
                          <span key={i} className={i === 0 ? 'active' : ''}></span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <motion.div 
                    className="product-emoji"
                    animate={{ 
                      rotateY: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {product.emoji}
                  </motion.div>
                )}

                <div className="product-reflection"></div>

                <h3 className="product-name">{product.name}</h3>
                <p className="product-price" style={{ color: product.color }}>
                  {product.price}
                </p>
                
                {product.stock !== undefined && (
                  <p className="product-stock">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </p>
                )}

                <motion.button 
                  className="product-btn"
                  style={{ 
                    background: `linear-gradient(135deg, ${product.color}, ${product.color}88)`
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  View Details
                </motion.button>

                <div className="product-specs">
                  <span>✓ Latest Model</span>
                  <span>✓ Quality Assured</span>
                  <span>✓ Best Price</span>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
