import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface Image {
  id: number;
  url: string;
  title: string;
}

interface GalleryContextType {
  images: Image[];
  setImages: React.Dispatch<React.SetStateAction<Image[]>>;
  addImage: (image: Image) => void;
  deleteImage: (id: number) => void;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};

export const GalleryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<Image[]>([]);

  useEffect(() => {
    const storedImages = localStorage.getItem('galleryImages');
    if (storedImages) {
      setImages(JSON.parse(storedImages));
    }
  }, []);

  const addImage = (image: Image) => {
    setImages(prevImages => {
      const newImages = [...prevImages, image];
      localStorage.setItem('galleryImages', JSON.stringify(newImages));
      return newImages;
    });
  };

  const deleteImage = (id: number) => {
    setImages(prevImages => {
      const newImages = prevImages.filter(image => image.id !== id);
      localStorage.setItem('galleryImages', JSON.stringify(newImages));
      return newImages;
    });
  };

  return (
    <GalleryContext.Provider value={{ images, setImages, addImage, deleteImage }}>
      {children}
    </GalleryContext.Provider>
  );
};