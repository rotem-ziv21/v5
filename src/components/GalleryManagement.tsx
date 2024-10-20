import React, { useState, useEffect } from 'react';
import { Trash, Upload } from 'lucide-react';
import { DataService } from '../services/DataService';

interface Image {
  id: number;
  url: string;
  title: string;
}

interface GalleryManagementProps {
  tenantId: string;
}

const GalleryManagement: React.FC<GalleryManagementProps> = ({ tenantId }) => {
  const [images, setImages] = useState<Image[]>([]);

  useEffect(() => {
    loadImages();
  }, [tenantId]);

  const loadImages = async () => {
    try {
      // כאן צריך להיות קריאה לשרת להביא את התמונות של העסק הספציפי
      // לדוגמה: const loadedImages = await DataService.getTenantImages(tenantId);
      // setImages(loadedImages);
      
      // בינתיים, נשתמש בנתונים מקומיים
      const storedImages = localStorage.getItem(`gallery_${tenantId}`);
      if (storedImages) {
        setImages(JSON.parse(storedImages));
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = {
          id: Date.now(),
          url: reader.result as string,
          title: file.name
        };
        const updatedImages = [...images, newImage];
        setImages(updatedImages);
        saveImages(updatedImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = (id: number) => {
    const updatedImages = images.filter(image => image.id !== id);
    setImages(updatedImages);
    saveImages(updatedImages);
  };

  const saveImages = async (updatedImages: Image[]) => {
    try {
      // כאן צריך להיות קריאה לשרת לשמור את התמונות
      // לדוגמה: await DataService.updateTenantImages(tenantId, updatedImages);
      
      // בינתיים, נשמור בלוקל סטורג'
      localStorage.setItem(`gallery_${tenantId}`, JSON.stringify(updatedImages));
    } catch (error) {
      console.error('Error saving images:', error);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">ניהול גלריה</h3>
      <div className="grid grid-cols-3 gap-4 mb-4">
        {images.map(({ id, url, title }) => (
          <div key={id} className="relative">
            <img src={url} alt={title} className="w-full h-32 object-cover rounded" />
            <button
              onClick={() => handleDeleteImage(id)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition duration-300"
            >
              <Trash size={14} />
            </button>
          </div>
        ))}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className="bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500 transition duration-300 cursor-pointer flex items-center justify-center"
      >
        <Upload size={18} className="mr-2" />
        העלה תמונה חדשה
      </label>
    </div>
  );
};

export default GalleryManagement;