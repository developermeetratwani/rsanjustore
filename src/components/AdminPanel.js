import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import './AdminPanel.css';

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('products'); // products, repairs, sales
  const [bills, setBills] = useState([]);
  const [productSales, setProductSales] = useState([]);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [saleForm, setSaleForm] = useState({
    customerName: '',
    customerPhone: '',
    productName: '',
    quantity: 1,
    purchasePrice: '',
    sellingPrice: '',
    paymentMethod: 'cash',
    notes: ''
  });
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    emoji: '📱',
    color: '#FF6B35',
    description: '',
    inStock: true,
    stock: 0,
    images: [],
    specifications: []
  });
  const [newSpec, setNewSpec] = useState({ label: '', value: '' });

  useEffect(() => {
    // Real-time listener for products
    const productsQuery = query(collection(db, 'products'), orderBy('name'));
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        images: doc.data().images || [],
        specifications: doc.data().specifications || [],
        stock: doc.data().stock || 0
      }));
      setProducts(productsData);
    }, (error) => {
      console.error('Error fetching products:', error);
      // Fallback to localStorage
      const loadProducts = () => {
        const saved = localStorage.getItem('rsanju_products');
        return saved ? JSON.parse(saved) : [];
      };
      const loadedProducts = loadProducts().map(p => ({
        ...p,
        images: p.images || [],
        specifications: p.specifications || [],
        stock: p.stock || 0
      }));
      setProducts(loadedProducts);
    });
    
    // Real-time listener for repair bills
    const billsQuery = query(collection(db, 'bills'), orderBy('createdAt', 'desc'));
    const unsubscribeBills = onSnapshot(billsQuery, (snapshot) => {
      const billsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBills(billsData);
    }, (error) => {
      console.error('Error fetching bills:', error);
      const savedBills = JSON.parse(localStorage.getItem('rsanju_bills') || '[]');
      setBills(savedBills);
    });
    
    // Real-time listener for product sales
    const salesQuery = query(collection(db, 'productSales'), orderBy('createdAt', 'desc'));
    const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProductSales(salesData);
    }, (error) => {
      console.error('Error fetching sales:', error);
      const savedSales = JSON.parse(localStorage.getItem('rsanju_product_sales') || '[]');
      setProductSales(savedSales);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeBills();
      unsubscribeSales();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('rsanju_admin_auth');
    window.location.href = '/';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    const imagePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(images => {
      setFormData({
        ...formData,
        images: [...(formData.images || []), ...images].slice(0, 5)
      });
    });
  };

  const removeImage = (index) => {
    const newImages = (formData.images || []).filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const addSpecification = () => {
    if (newSpec.label && newSpec.value) {
      setFormData({
        ...formData,
        specifications: [...(formData.specifications || []), { ...newSpec }]
      });
      setNewSpec({ label: '', value: '' });
    }
  };

  const removeSpecification = (index) => {
    const newSpecs = (formData.specifications || []).filter((_, i) => i !== index);
    setFormData({
      ...formData,
      specifications: newSpecs
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const newProduct = {
      ...formData,
      stock: parseInt(formData.stock) || 0,
      createdAt: new Date().toISOString()
    };
    
    try {
      await addDoc(collection(db, 'products'), newProduct);
      setShowAddForm(false);
      resetForm();
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product.id);
    setFormData({
      ...product,
      images: product.images || [],
      specifications: product.specifications || [],
      stock: product.stock || 0
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const productRef = doc(db, 'products', editingProduct);
      await updateDoc(productRef, {
        ...formData,
        stock: parseInt(formData.stock) || 0
      });
      setEditingProduct(null);
      resetForm();
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      emoji: '📱',
      color: '#FF6B35',
      description: '',
      inStock: true,
      stock: 0,
      images: [],
      specifications: []
    });
    setNewSpec({ label: '', value: '' });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setShowAddForm(false);
    resetForm();
  };

  // Product Sales Functions
  const handleSaleSubmit = (e) => {
    e.preventDefault();
    
    const profit = parseFloat(saleForm.sellingPrice) - parseFloat(saleForm.purchasePrice);
    const profitPercentage = ((profit / parseFloat(saleForm.purchasePrice)) * 100).toFixed(2);
    
    const newSale = {
      id: 'SALE-' + Date.now(),
      ...saleForm,
      quantity: parseInt(saleForm.quantity),
      purchasePrice: parseFloat(saleForm.purchasePrice),
      sellingPrice: parseFloat(saleForm.sellingPrice),
      profit: profit,
      profitPercentage: profitPercentage,
      totalPurchase: parseFloat(saleForm.purchasePrice) * parseInt(saleForm.quantity),
      totalSelling: parseFloat(saleForm.sellingPrice) * parseInt(saleForm.quantity),
      totalProfit: profit * parseInt(saleForm.quantity),
      createdAt: new Date().toISOString(),
      status: 'completed'
    };

    setProductSales([...productSales, newSale]);
    alert('Sale recorded successfully!');
    setShowSaleForm(false);
    resetSaleForm();
  };

  const resetSaleForm = () => {
    setSaleForm({
      customerName: '',
      customerPhone: '',
      productName: '',
      quantity: 1,
      purchasePrice: '',
      sellingPrice: '',
      paymentMethod: 'cash',
      notes: ''
    });
  };

  const getISTTime = (isoString) => {
    return new Date(isoString).toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="admin-panel">
      <div className="admin-header glass">
        <div className="admin-header-content">
          <div className="admin-logo">
            <span className="admin-icon">⚙️</span>
            <h1 className="gradient-text">Admin Panel</h1>
          </div>
          <div className="admin-actions">
            <motion.button
              className="btn-add"
              onClick={() => setShowAddForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ➕ Add Product
            </motion.button>
            <motion.button
              className="btn-logout"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🚪 Logout
            </motion.button>
          </div>
        </div>
      </div>

      <div className="admin-container">
        <div className="admin-stats">
          <div className="stat-card glass">
            <div className="stat-icon">📱</div>
            <div className="stat-info">
              <h3>{products.length}</h3>
              <p>Total Products</p>
            </div>
          </div>
          <div className="stat-card glass">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{products.filter(p => p.inStock).length}</h3>
              <p>In Stock</p>
            </div>
          </div>
          <div className="stat-card glass">
            <div className="stat-icon">🔧</div>
            <div className="stat-info">
              <h3>{bills.filter(b => b.status === 'completed').length}</h3>
              <p>Repairs Done</p>
            </div>
          </div>
          <div className="stat-card glass">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>₹{(
                bills.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.totalAmount || 0), 0) +
                productSales.reduce((sum, s) => sum + s.totalProfit, 0)
              ).toFixed(0)}</h3>
              <p>Total Profit</p>
            </div>
          </div>
        </div>

        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📱 Products
          </button>
          <button 
            className={`tab-btn ${activeTab === 'repairs' ? 'active' : ''}`}
            onClick={() => setActiveTab('repairs')}
          >
            🔧 Repair Bills
          </button>
          <button 
            className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            💰 Product Sales
          </button>
        </div>

        {activeTab === 'products' && (
        <>
        <AnimatePresence>
          {(showAddForm || editingProduct) && (
            <motion.div
              className="product-form-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelEdit}
            >
              <motion.div
                className="product-form glass"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="form-title gradient-text">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>

                <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Product Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., iPhone 15 Pro"
                      />
                    </div>

                    <div className="form-group">
                      <label>Price *</label>
                      <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., ₹89,999"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Emoji Icon</label>
                      <input
                        type="text"
                        name="emoji"
                        value={formData.emoji}
                        onChange={handleInputChange}
                        placeholder="📱"
                        maxLength="2"
                      />
                    </div>

                    <div className="form-group">
                      <label>Color</label>
                      <input
                        type="color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief product description"
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Product Images (Max 5)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="file-input"
                    />
                    <p className="file-hint">Upload 4-5 high-quality product images</p>
                  </div>

                  {formData.images && formData.images.length > 0 && (
                    <div className="image-preview-grid">
                      {formData.images.map((image, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={image} alt={`Product ${index + 1}`} />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => removeImage(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="form-group specifications-section">
                    <label>Product Specifications</label>
                    <p className="file-hint">Add custom specifications like Battery Life, Date of Purchase, etc.</p>
                    
                    <div className="spec-input-row">
                      <input
                        type="text"
                        placeholder="Label (e.g., Battery Life)"
                        value={newSpec.label}
                        onChange={(e) => setNewSpec({ ...newSpec, label: e.target.value })}
                        className="spec-input"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g., 85%)"
                        value={newSpec.value}
                        onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                        className="spec-input"
                      />
                      <button
                        type="button"
                        className="btn-add-spec"
                        onClick={addSpecification}
                      >
                        ➕
                      </button>
                    </div>

                    {formData.specifications && formData.specifications.length > 0 && (
                      <div className="specs-list">
                        {formData.specifications.map((spec, index) => (
                          <div key={index} className="spec-item-preview">
                            <div className="spec-content">
                              <span className="spec-label-preview">{spec.label}:</span>
                              <span className="spec-value-preview">{spec.value}</span>
                            </div>
                            <button
                              type="button"
                              className="remove-spec-btn"
                              onClick={() => removeSpecification(index)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          name="inStock"
                          checked={formData.inStock}
                          onChange={handleInputChange}
                        />
                        <span>In Stock</span>
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Stock Quantity</label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        min="0"
                        placeholder="e.g., 10"
                      />
                      <small>Number of units available</small>
                    </div>
                  </div>

                  <div className="form-buttons">
                    <motion.button
                      type="button"
                      className="btn-cancel"
                      onClick={cancelEdit}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="btn-save"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {editingProduct ? 'Update' : 'Add'} Product
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="products-section">
          <h2 className="section-title gradient-text">Manage Products</h2>
          
          <motion.button
            className="btn-add"
            onClick={() => setShowAddForm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ➕ Add Product
          </motion.button>
          
          <div className="products-grid">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                className="admin-product-card glass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="product-header">
                  {product.images && product.images.length > 0 ? (
                    <div className="product-image-display">
                      <img src={product.images[0]} alt={product.name} />
                      {product.images.length > 1 && (
                        <span className="image-count">+{product.images.length - 1}</span>
                      )}
                    </div>
                  ) : (
                    <div className="product-emoji" style={{ filter: `drop-shadow(0 0 10px ${product.color})` }}>
                      {product.emoji}
                    </div>
                  )}
                  <div className={`stock-badge ${product.inStock ? 'in-stock' : 'out-stock'}`}>
                    {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                  </div>
                </div>

                <h3 className="product-name">{product.name}</h3>
                <p className="product-price" style={{ color: product.color }}>{product.price}</p>
                {product.stock !== undefined && (
                  <p className="product-stock-count">
                    📦 Stock: <strong>{product.stock} units</strong>
                  </p>
                )}
                <p className="product-description">{product.description}</p>

                <div className="product-actions">
                  <motion.button
                    className="btn-edit"
                    onClick={() => handleEditProduct(product)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ✏️ Edit
                  </motion.button>
                  <motion.button
                    className="btn-delete"
                    onClick={() => handleDeleteProduct(product.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🗑️ Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No Products Yet</h3>
              <p>Click "Add Product" to get started</p>
            </div>
          )}
        </div>
        </>
        )}

        {activeTab === 'repairs' && (
          <div className="repairs-view-section">
            <h2 className="section-title gradient-text">Repair Bills Overview</h2>
            
            {bills.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔧</div>
                <h3>No Repair Bills Yet</h3>
                <p>Repair bills will appear here</p>
              </div>
            ) : (
              <div className="bills-overview-grid">
                {bills.map((bill) => (
                  <motion.div
                    key={bill.id}
                    className="bill-overview-card glass"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="bill-header">
                      <span className="bill-id">{bill.id}</span>
                      <span className={`bill-status status-${bill.status}`}>
                        {bill.status}
                      </span>
                    </div>

                    <h3 className="bill-customer">{bill.customerName}</h3>
                    <p className="bill-phone">📞 {bill.customerPhone}</p>
                    <p className="bill-device">📱 {bill.deviceModel}</p>
                    <p className="bill-service">🔧 {bill.serviceType}</p>
                    <p className="bill-repairer">👨‍🔧 {bill.repairerName} ({bill.repairerType})</p>

                    <div className="bill-cost-breakdown">
                      <h4>Cost Breakdown</h4>
                      {bill.parts && bill.parts.length > 0 && (
                        <div className="parts-breakdown">
                          <p className="breakdown-label">Parts Used:</p>
                          {bill.parts.map((part, idx) => (
                            <p key={idx} className="breakdown-item">
                              • {part.name}: ₹{part.cost}
                            </p>
                          ))}
                        </div>
                      )}
                      <p className="breakdown-row">
                        <span>Parts Total:</span>
                        <span>₹{bill.partsCost || 0}</span>
                      </p>
                      <p className="breakdown-row">
                        <span>Labor Cost:</span>
                        <span>₹{bill.laborCost || 0}</span>
                      </p>
                      {bill.discount > 0 && (
                        <p className="breakdown-row discount">
                          <span>Discount:</span>
                          <span>-₹{bill.discount}</span>
                        </p>
                      )}
                      <p className="breakdown-row total">
                        <span>Customer Paid:</span>
                        <span>₹{bill.totalAmount}</span>
                      </p>
                      {bill.repairerEarning > 0 && (
                        <>
                          <p className="breakdown-row commission">
                            <span>Repairer Commission ({bill.repairerCommission}%):</span>
                            <span>₹{bill.repairerEarning}</span>
                          </p>
                          <p className="breakdown-row profit">
                            <span>Store Profit:</span>
                            <span>₹{(bill.totalAmount - bill.repairerEarning).toFixed(2)}</span>
                          </p>
                        </>
                      )}
                    </div>

                    <p className="bill-time">📅 {getISTTime(bill.createdAt)}</p>
                    {bill.notes && (
                      <p className="bill-notes">📝 {bill.notes}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            <div className="repair-summary glass">
              <h3>Repair Business Summary</h3>
              <div className="summary-stats">
                <div className="summary-item">
                  <span>Total Bills:</span>
                  <span>{bills.length}</span>
                </div>
                <div className="summary-item">
                  <span>Completed:</span>
                  <span>{bills.filter(b => b.status === 'completed').length}</span>
                </div>
                <div className="summary-item">
                  <span>Draft:</span>
                  <span>{bills.filter(b => b.status === 'draft').length}</span>
                </div>
                <div className="summary-item highlight">
                  <span>Total Revenue:</span>
                  <span>₹{bills.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.totalAmount || 0), 0)}</span>
                </div>
                <div className="summary-item highlight">
                  <span>Store Profit:</span>
                  <span>₹{bills.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.totalAmount - (b.repairerEarning || 0)), 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="sales-section">
            <h2 className="section-title gradient-text">Product & Accessory Sales</h2>
            
            <motion.button
              className="btn-add"
              onClick={() => setShowSaleForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ➕ Record New Sale
            </motion.button>

            {productSales.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💰</div>
                <h3>No Sales Recorded Yet</h3>
                <p>Start recording product and accessory sales</p>
              </div>
            ) : (
              <div className="sales-grid">
                {productSales.map((sale) => (
                  <motion.div
                    key={sale.id}
                    className="sale-card glass"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="sale-header">
                      <span className="sale-id">{sale.id}</span>
                      <span className="payment-badge">{sale.paymentMethod}</span>
                    </div>

                    <h3 className="sale-product">{sale.productName}</h3>
                    <p className="sale-customer">👤 {sale.customerName}</p>
                    <p className="sale-phone">📞 {sale.customerPhone}</p>
                    <p className="sale-quantity">📦 Quantity: {sale.quantity}</p>

                    <div className="sale-cost-breakdown">
                      <h4>Cost Breakdown</h4>
                      <p className="breakdown-row">
                        <span>Purchase Price (each):</span>
                        <span>₹{sale.purchasePrice}</span>
                      </p>
                      <p className="breakdown-row">
                        <span>Selling Price (each):</span>
                        <span>₹{sale.sellingPrice}</span>
                      </p>
                      <p className="breakdown-row">
                        <span>Profit per unit:</span>
                        <span className="profit-text">₹{sale.profit} ({sale.profitPercentage}%)</span>
                      </p>
                      <div className="breakdown-divider"></div>
                      <p className="breakdown-row">
                        <span>Total Purchase:</span>
                        <span>₹{sale.totalPurchase}</span>
                      </p>
                      <p className="breakdown-row total">
                        <span>Total Selling:</span>
                        <span>₹{sale.totalSelling}</span>
                      </p>
                      <p className="breakdown-row profit">
                        <span>Total Profit:</span>
                        <span>₹{sale.totalProfit}</span>
                      </p>
                    </div>

                    <p className="sale-time">📅 {getISTTime(sale.createdAt)}</p>
                    {sale.notes && (
                      <p className="sale-notes">📝 {sale.notes}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            <div className="sales-summary glass">
              <h3>Sales Business Summary</h3>
              <div className="summary-stats">
                <div className="summary-item">
                  <span>Total Sales:</span>
                  <span>{productSales.length}</span>
                </div>
                <div className="summary-item">
                  <span>Total Units Sold:</span>
                  <span>{productSales.reduce((sum, s) => sum + s.quantity, 0)}</span>
                </div>
                <div className="summary-item highlight">
                  <span>Total Revenue:</span>
                  <span>₹{productSales.reduce((sum, s) => sum + s.totalSelling, 0)}</span>
                </div>
                <div className="summary-item highlight">
                  <span>Total Profit:</span>
                  <span>₹{productSales.reduce((sum, s) => sum + s.totalProfit, 0).toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Avg Profit Margin:</span>
                  <span>{productSales.length > 0 ? (productSales.reduce((sum, s) => sum + parseFloat(s.profitPercentage), 0) / productSales.length).toFixed(2) : 0}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showSaleForm && (
            <motion.div
              className="product-form-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaleForm(false)}
            >
              <motion.div
                className="product-form glass"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="form-title gradient-text">Record Product Sale</h2>

                <form onSubmit={handleSaleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Customer Name *</label>
                      <input
                        type="text"
                        value={saleForm.customerName}
                        onChange={(e) => setSaleForm({...saleForm, customerName: e.target.value})}
                        required
                        placeholder="Enter customer name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        value={saleForm.customerPhone}
                        onChange={(e) => setSaleForm({...saleForm, customerPhone: e.target.value})}
                        required
                        placeholder="10-digit number"
                        maxLength="10"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Product/Accessory Name *</label>
                    <input
                      type="text"
                      value={saleForm.productName}
                      onChange={(e) => setSaleForm({...saleForm, productName: e.target.value})}
                      required
                      placeholder="e.g., iPhone 13, Charger, Case"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Quantity *</label>
                      <input
                        type="number"
                        value={saleForm.quantity}
                        onChange={(e) => setSaleForm({...saleForm, quantity: e.target.value})}
                        required
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label>Payment Method *</label>
                      <select
                        value={saleForm.paymentMethod}
                        onChange={(e) => setSaleForm({...saleForm, paymentMethod: e.target.value})}
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                        <option value="card">Card</option>
                        <option value="online">Online Transfer</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Purchase Price (per unit) *</label>
                      <input
                        type="number"
                        value={saleForm.purchasePrice}
                        onChange={(e) => setSaleForm({...saleForm, purchasePrice: e.target.value})}
                        required
                        placeholder="Your cost"
                      />
                    </div>

                    <div className="form-group">
                      <label>Selling Price (per unit) *</label>
                      <input
                        type="number"
                        value={saleForm.sellingPrice}
                        onChange={(e) => setSaleForm({...saleForm, sellingPrice: e.target.value})}
                        required
                        placeholder="Customer pays"
                      />
                    </div>
                  </div>

                  {saleForm.purchasePrice && saleForm.sellingPrice && (
                    <div className="profit-preview">
                      <p>Profit per unit: ₹{(parseFloat(saleForm.sellingPrice) - parseFloat(saleForm.purchasePrice)).toFixed(2)}</p>
                      <p>Total Profit: ₹{((parseFloat(saleForm.sellingPrice) - parseFloat(saleForm.purchasePrice)) * parseInt(saleForm.quantity || 1)).toFixed(2)}</p>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      value={saleForm.notes}
                      onChange={(e) => setSaleForm({...saleForm, notes: e.target.value})}
                      placeholder="Any additional notes"
                      rows="3"
                    />
                  </div>

                  <div className="form-buttons">
                    <motion.button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setShowSaleForm(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="btn-save"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Record Sale
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPanel;
