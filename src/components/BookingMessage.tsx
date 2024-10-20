import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { DataService } from '../services/DataService';

interface BookingMessageProps {
  tenantId: string;
}

const BookingMessage: React.FC<BookingMessageProps> = ({ tenantId }) => {
  const [message, setMessage] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadMessage();
  }, [tenantId]);

  const loadMessage = async () => {
    try {
      const tenant = await DataService.getTenantById(tenantId);
      if (tenant && tenant.bookingMessage) {
        setMessage(tenant.bookingMessage);
      }
    } catch (error) {
      console.error('Error loading booking message:', error);
    }
  };

  const handleSave = async () => {
    try {
      await DataService.updateTenant(tenantId, { bookingMessage: message });
      setSaveMessage('ההודעה נשמרה בהצלחה!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving booking message:', error);
      setSaveMessage('שגיאה בשמירת ההודעה');
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">הודעת הזמנה</h3>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 h-40"
        placeholder="הזן כאן את ההודעה שתוצג ללקוחות לפני הזמנת התור"
      />
      <button
        onClick={handleSave}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
      >
        <Save className="mr-2" size={18} />
        שמור הודעה
      </button>
      {saveMessage && (
        <p className="mt-2 text-green-600">{saveMessage}</p>
      )}
    </div>
  );
};

export default BookingMessage;