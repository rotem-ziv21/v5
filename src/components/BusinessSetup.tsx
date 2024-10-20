import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { Save, AlertCircle } from 'lucide-react';

const BusinessSetup: React.FC = () => {
  const { setCurrentTenant } = useTenant();
  const [businessName, setBusinessName] = useState('');
  const [locationId, setLocationId] = useState('');
  const [calendarId, setCalendarId] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!businessName || !locationId || !calendarId || !apiToken) {
      setError('כל השדות הם חובה. אנא מלא את כל הפרטים.');
      return;
    }

    const newTenant = {
      id: Date.now().toString(), // בפרויקט אמיתי, זה יהיה מזהה ייחודי מהשרת
      name: businessName,
      locationId,
      calendarId,
      apiToken
    };

    try {
      setCurrentTenant(newTenant);
      // כאן תוכל להוסיף לוגיקה לשמירת הנתונים בשרת
      console.log('New tenant set:', newTenant);
    } catch (err) {
      console.error('Error setting up business:', err);
      setError('אירעה שגיאה בהגדרת העסק. אנא נסה שוב.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-6">הגדרת העסק</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={18} />
            <span>{error}</span>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">שם העסק</label>
          <input
            id="businessName"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="locationId" className="block text-sm font-medium text-gray-700 mb-1">מזהה מיקום</label>
          <input
            id="locationId"
            type="text"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="calendarId" className="block text-sm font-medium text-gray-700 mb-1">מזהה לוח שנה</label>
          <input
            id="calendarId"
            type="text"
            value={calendarId}
            onChange={(e) => setCalendarId(e.target.value)}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="apiToken" className="block text-sm font-medium text-gray-700 mb-1">טוקן API</label>
          <input
            id="apiToken"
            type="text"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <button 
          type="submit" 
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
        >
          <Save className="mr-2" size={18} />
          שמור הגדרות עסק
        </button>
      </form>
    </div>
  );
};

export default BusinessSetup;