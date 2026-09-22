// Product data storage
// This will be managed by the admin panel

export const initialProducts = [
  { 
    id: 1,
    name: 'Samsung Galaxy Fold', 
    price: '₹1,499', 
    emoji: '📱', 
    color: '#FF6B35',
    description: 'Latest foldable technology',
    inStock: true,
    images: [],
    specifications: [
      { label: 'Date of Purchase', value: '15 Jan 2024' },
      { label: 'Battery Life', value: '85%' },
      { label: 'Storage', value: '256GB' },
      { label: 'RAM', value: '12GB' },
      { label: 'Condition', value: 'Excellent' }
    ]
  },
  { 
    id: 2,
    name: 'iPhone 15 Pro Max', 
    price: '₹89,999', 
    emoji: '📱', 
    color: '#F7931E',
    description: 'Premium Apple flagship',
    inStock: true,
    images: [],
    specifications: [
      { label: 'Date of Purchase', value: '20 Dec 2023' },
      { label: 'Battery Life', value: '92%' },
      { label: 'Storage', value: '512GB' },
      { label: 'RAM', value: '8GB' },
      { label: 'Condition', value: 'Like New' }
    ]
  },
  { 
    id: 3,
    name: 'OnePlus 12', 
    price: '₹64,999', 
    emoji: '📱', 
    color: '#C1121F',
    description: 'Flagship killer performance',
    inStock: true,
    images: [],
    specifications: []
  },
  { 
    id: 4,
    name: 'Google Pixel 8', 
    price: '₹75,999', 
    emoji: '📱', 
    color: '#00B4D8',
    description: 'Best camera phone',
    inStock: true,
    images: [],
    specifications: []
  },
  { 
    id: 5,
    name: 'Xiaomi 14 Ultra', 
    price: '₹59,999', 
    emoji: '📱', 
    color: '#F72585',
    description: 'Photography powerhouse',
    inStock: true,
    images: [],
    specifications: []
  },
  { 
    id: 6,
    name: 'Vivo X100 Pro', 
    price: '₹89,999', 
    emoji: '📱', 
    color: '#4361EE',
    description: 'Premium flagship device',
    inStock: true,
    images: [],
    specifications: []
  }
];

// Load products from localStorage or use initial data
export const loadProducts = () => {
  const stored = localStorage.getItem('rsanju_products');
  return stored ? JSON.parse(stored) : initialProducts;
};

// Save products to localStorage
export const saveProducts = (products) => {
  localStorage.setItem('rsanju_products', JSON.stringify(products));
};
