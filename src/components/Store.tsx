import React, { useState, useEffect } from 'react';
import { DataService } from '../services/DataService';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface StoreProps {
  tenantId: string;
}

const Store: React.FC<StoreProps> = ({ tenantId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [tenantId]);

  const loadProducts = async () => {
    try {
      const storeProducts = await DataService.getTenantProducts(tenantId);
      setProducts(storeProducts);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('טעינת המוצרים נכשלה. אנא נסה שוב.');
      setIsLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id);
      if (existingItem) {
        return currentCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...currentCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return currentCart.map(item =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        return currentCart.filter(item => item.id !== productId);
      }
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (isLoading) {
    return <div>טוען מוצרים...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">החנות שלנו</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <p className="text-lg font-bold mb-2">₪{product.price.toFixed(2)}</p>
              <button
                onClick={() => addToCart(product)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
              >
                הוסף לסל
              </button>
            </div>
          </div>
        ))}
      </div>
      {cart.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold mb-4">סל קניות</h3>
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-lg font-semibold">{item.name}</h4>
                <p className="text-gray-600">₪{item.price.toFixed(2)} x {item.quantity}</p>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 mr-2"
                >
                  <Minus size={20} />
                </button>
                <span className="mx-2">{item.quantity}</span>
                <button
                  onClick={() => addToCart(item)}
                  className="text-green-500 hover:text-green-700 ml-2"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          ))}
          <div className="mt-4 text-xl font-bold">
            סה"כ: ₪{getTotalPrice().toFixed(2)}
          </div>
          <button className="mt-4 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-300 flex items-center justify-center w-full">
            <ShoppingCart className="mr-2" size={24} />
            המשך לתשלום
          </button>
        </div>
      )}
    </div>
  );
};

export default Store;