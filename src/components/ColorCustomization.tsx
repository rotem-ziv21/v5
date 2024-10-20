import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

interface ColorCustomizationProps {
  currentColors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  onColorChange: (colors: { primary: string; secondary: string; accent: string; text: string }) => void;
}

const ColorCustomization: React.FC<ColorCustomizationProps> = ({ currentColors, onColorChange }) => {
  const [colors, setColors] = useState({
    primary: '#4A90E2',
    secondary: '#F0F4F8',
    accent: '#FF9966',
    text: '#333333',
    ...currentColors
  });

  useEffect(() => {
    setColors(prevColors => ({
      ...prevColors,
      ...currentColors
    }));
  }, [currentColors]);

  const handleColorChange = (colorType: 'primary' | 'secondary' | 'accent' | 'text', value: string) => {
    setColors(prevColors => ({ ...prevColors, [colorType]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onColorChange(colors);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold mb-4">התאמת צבעים</h3>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {(['primary', 'secondary', 'accent', 'text'] as const).map((colorType) => (
            <div key={colorType}>
              <label htmlFor={`${colorType}Color`} className="block text-sm font-medium text-gray-700 mb-1">
                {colorType === 'primary' && 'צבע ראשי'}
                {colorType === 'secondary' && 'צבע משני'}
                {colorType === 'accent' && 'צבע הדגשה'}
                {colorType === 'text' && 'צבע טקסט'}
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  id={`${colorType}Color`}
                  value={colors[colorType]}
                  onChange={(e) => handleColorChange(colorType, e.target.value)}
                  className="h-10 w-10 border-none rounded-md"
                />
                <input
                  type="text"
                  value={colors[colorType]}
                  onChange={(e) => handleColorChange(colorType, e.target.value)}
                  className="ml-2 p-2 border rounded-md flex-grow"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
        >
          <Save className="mr-2" size={18} />
          שמור שינויים
        </button>
      </form>
    </div>
  );
};

export default ColorCustomization;