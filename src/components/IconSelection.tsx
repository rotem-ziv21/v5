import React from 'react';
import * as Icons from 'lucide-react';

interface IconSelectionProps {
  currentIcon: string;
  onIconChange: (icon: string) => void;
}

const IconSelection: React.FC<IconSelectionProps> = ({ currentIcon, onIconChange }) => {
  const iconList = Object.keys(Icons).filter(key => key !== 'createLucideIcon' && typeof Icons[key as keyof typeof Icons] === 'function');

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">בחירת אייקון עסק</h3>
      <div className="grid grid-cols-6 gap-4">
        {iconList.map((iconName) => {
          const IconComponent = Icons[iconName as keyof typeof Icons] as React.ElementType;
          return (
            <button
              key={iconName}
              onClick={() => onIconChange(iconName)}
              className={`p-2 rounded-lg flex flex-col items-center justify-center ${
                currentIcon === iconName ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <IconComponent size={24} />
              <span className="mt-1 text-xs">{iconName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IconSelection;