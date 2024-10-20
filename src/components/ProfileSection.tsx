import React, { useState, useEffect } from 'react';
import { User, Phone, Save, X, AlertCircle } from 'lucide-react';
import { DataService } from '../services/DataService';

interface ProfileSectionProps {
  setContactId: (id: string | null) => void;
  onClose: () => void;
  updateUserName: (name: string | null) => void;
  tenantId: string;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ setContactId, onClose, updateUserName, tenantId }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedName = localStorage.getItem(`userName_${tenantId}`);
    const storedPhone = localStorage.getItem(`userPhone_${tenantId}`);
    const storedContactId = localStorage.getItem(`contactId_${tenantId}`);
    if (storedName) setName(storedName);
    if (storedPhone) setPhone(storedPhone);
    if (storedContactId) setContactId(storedContactId);
  }, [setContactId, tenantId]);

  const createContact = async () => {
    try {
      const tenant = await DataService.getTenantById(tenantId);
      if (!tenant) {
        throw new Error('לא נמצאו נתוני עסק');
      }
      const { apiToken, locationId } = tenant;

      if (!apiToken || !locationId) {
        throw new Error('חסרים פרטי הגדרה. אנא בדוק את הגדרות העסק.');
      }

      setIsLoading(true);
      console.log('Creating contact with:', { name, phone, locationId });
      const response = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          locationId: locationId,
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' '),
          phone: phone
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, response.statusText, errorText);
        throw new Error(`שגיאת שרת: ${response.status} ${response.statusText}. תגובת השרת: ${errorText}`);
      }

      const data = await response.json();
      console.log('Server response data:', data);

      if (!data || !data.contact || !data.contact.id) {
        console.error('Invalid server response:', data);
        throw new Error('לא התקבל מזהה איש קשר תקין מהשרת');
      }

      console.log('Contact created successfully:', data.contact.id);
      return data.contact.id;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    try {
      const newContactId = await createContact();
      console.log('Saving new contact ID:', newContactId);
      setContactId(newContactId);
      localStorage.setItem(`userName_${tenantId}`, name);
      localStorage.setItem(`userPhone_${tenantId}`, phone);
      localStorage.setItem(`contactId_${tenantId}`, newContactId);
      updateUserName(name);
      setSuccessMessage('הפרטים נשמרו בהצלחה!');
      console.log('Profile saved successfully');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to create contact:', error);
      setError(error instanceof Error ? error.message : 'אירעה שגיאה לא צפויה ביצירת איש הקשר');
    }
  };

  return (
    <div className="relative bg-white rounded-lg shadow-sm p-6 max-w-md w-full">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
        <X size={24} />
      </button>
      <h2 className="text-2xl font-bold mb-4">פרופיל</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={18} />
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
          <div className="relative">
            <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pr-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">מספר טלפון</label>
          <div className="relative">
            <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pr-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              שמור פרטים
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ProfileSection;