import React, { useState, useEffect } from 'react';
import { DataService } from '../services/DataService';
import { Plus, Edit, Trash, Image, AlertCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

interface StoreManagementProps {
  tenantId: string;
}

const StoreManagement: React.FC<StoreManagementProps> = ({ tenantId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    description: '',
    imageUrl: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadProducts();
  }, [tenantId]);

  const loadProducts = async () => {
    try {
      const storeProducts = await DataService.getTenantProducts(tenantId);
      setProducts(storeProducts);
      setError(null);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('טעינת המוצרים נכשלה. אנא נסה שוב.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleAddProduct = async () => {
    try {
      if (!newProduct.name || newProduct.price <= 0) {
        setError('אנא מלא את כל השדות הנדרשים');
        return;
      }

      let imageUrl = '';
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const productToAdd = { ...newProduct, imageUrl };
      const addedProduct = await DataService.addProduct(tenantId, productToAdd);
      setProducts([...products, addedProduct]);
      setNewProduct({ name: '', price: 0, description: '', imageUrl: '' });
      setSelectedFile(null);
      setError(null);
    } catch (err) {
      console.error('Error adding product:', err);
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        setError('לא ניתן להוסיף מוצר חדש. נפח האחסון מלא. נסה למחוק מוצרים ישנים.');
      } else {
        setError('הוספת המוצר נכשלה. אנא נסה שוב.');
      }
    }
  };

  const uploadImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      const updated = await DataService.updateProduct(tenantId, id, updatedProduct);
      setProducts(products.map(p => p.id === id ? { ...p, ...updated } : p));
      setError(null);
    } catch (err) {
      console.error('Error updating product:', err);
      setError('עדכון המוצר נכשל. אנא נסה שוב.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await DataService.deleteProduct(tenantId, id);
      setProducts(products.filter(p => p.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('מחיקת המוצר נכשלה. אנא נסה שוב.');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">ניהול חנות</h3>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={18} />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          placeholder="שם המוצר"
          className="p-2 border rounded"
        />
        <input
          type="number"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
          placeholder="מחיר"
          className="p-2 border rounded"
        />
        <input
          type="text"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          placeholder="תיאור המוצר"
          className="p-2 border rounded"
        />
        <div className="flex items-center">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="p-2 border rounded"
          />
          {selectedFile && (
            <span className="ml-2 text-sm text-gray-600">{selectedFile.name}</span>
          )}
        </div>
      </div>
      <button
        onClick={handleAddProduct}
        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-300 flex items-center"
      >
        <Plus size={20} className="mr-2" />
        הוסף מוצר
      </button>

      <div className="mt-8">
        <h4 className="text-lg font-semibold mb-4">מוצרים קיימים</h4>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded mr-4" />
                )}
                <div>
                  <h5 className="font-semibold">{product.name}</h5>
                  <p className="text-sm text-gray-600">{product.description}</p>
                  <p className="text-sm font-bold">₪{product.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdateProduct(product.id, { /* Updated fields */ })}
                  className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition duration-300"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition duration-300"
                >
                  <Trash size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreManagement;