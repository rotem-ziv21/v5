import React from 'react';
import { Save } from 'lucide-react';

interface FontSelectionProps {
  currentFont: string;
  onFontChange: (font: string) => void;
}

const FontSelection: React.FC<FontSelectionProps> = ({ currentFont, onFontChange }) => {
  const fontOptions = [
    'Rubik',
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Verdana',
    'Georgia',
    'Palatino',
    'Garamond',
    'Bookman',
    'Comic Sans MS',
    'Trebuchet MS',
    'Arial Black',
    'Impact'
  ];

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFont = e.target.value;
    onFontChange(selectedFont);
  };

  const handleSave = () => {
    // This function will be called when the save button is clicked
    // You can add any additional logic here if needed
    console.log('Saving font:', currentFont);
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">בחירת פונט</h3>
      <select
        value={currentFont}
        onChange={handleFontChange}
        className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
      >
        {fontOptions.map((font) => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </option>
        ))}
      </select>
      <div className="mt-4">
        <h4 className="text-lg font-semibold mb-2">תצוגה מקדימה:</h4>
        <p style={{ fontFamily: currentFont, fontSize: '18px' }}>
          זוהי דוגמה לטקסט בפונט הנבחר. אבגדהוזחטיכלמנסעפצקרשת
        </p>
      </div>
      <button
        onClick={handleSave}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
      >
        <Save className="mr-2" size={18} />
        שמור פונט
      </button>
    </div>
  );
};

export default FontSelection;