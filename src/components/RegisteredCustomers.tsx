import React, { useState, useEffect } from 'react';
import { User, Phone, Hash, AlertCircle, RefreshCw, Key } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
}

const RegisteredCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
      fetchCustomers(storedToken);
    } else {
      setError('טוקן אדמין לא נמצא. אנא הזן טוקן חדש.');
    }
  }, []);

  const fetchCustomers = async (currentToken: string) => {
    const locationId = localStorage.getItem('locationId');

    if (!locationId) {
      setError('מזהה מיקום חסר. אנא בדוק את ההגדרות.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching customers with token:', currentToken, 'and locationId:', locationId);
      const response = await fetch(`/api/contacts?locationId=${locationId}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
          'Version': '2021-07-28'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not OK:', response.status, response.statusText, errorText);
        if (response.status === 401) {
          throw new Error('טוקן לא תקף. אנא הזן טוקן חדש.');
        } else if (response.status === 403) {
          throw new Error('אין הרשאות מתאימות לצפייה ברשימת הלקוחות.');
        } else {
          throw new Error(`שגיאת שרת: ${response.status} ${response.statusText}. פרטים: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('Received data:', data);
      if (Array.isArray(data.contacts)) {
        setCustomers(data.contacts);
      } else {
        console.error('Invalid data format:', data);
        throw new Error('התקבל פורמט נתונים לא תקין מהשרת');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError(`${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToken(event.target.value);
  };

  const handleTokenSubmit = () => {
    if (token) {
      localStorage.setItem('adminToken', token);
      fetchCustomers(token);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">לקוחות רשומים</h3>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={18} />
            <span>{error}</span>
          </div>
          {error.includes('טוקן') && (
            <div className="mt-2">
              <input
                type="text"
                value={token || ''}
                onChange={handleTokenChange}
                placeholder="הזן טוקן חדש"
                className="border rounded px-2 py-1 mr-2"
              />
              <button
                onClick={handleTokenSubmit}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded flex items-center"
              >
                <Key className="mr-2" size={18} />
                עדכן טוקן ונסה שוב
              </button>
            </div>
          )}
          {!error.includes('טוקן') && (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2 flex items-center"
              onClick={() => fetchCustomers(token || '')}
            >
              <RefreshCw className="mr-2" size={18} />
              נסה שוב
            </button>
          )}
        </div>
      )}
      {isLoading ? (
        <div className="text-center py-4">טוען...</div>
      ) : customers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-right">שם</th>
                <th className="py-2 px-4 text-right">טלפון</th>
                <th className="py-2 px-4 text-right">מזהה לקוח</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b">
                  <td className="py-2 px-4">
                    <div className="flex items-center">
                      <User className="text-blue-400 ml-2" size={18} />
                      {customer.name}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center">
                      <Phone className="text-green-400 ml-2" size={18} />
                      {customer.phone}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center">
                      <Hash className="text-purple-400 ml-2" size={18} />
                      {customer.id}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-600">לא נמצאו לקוחות רשומים.</p>
      )}
    </div>
  );
};

export default RegisteredCustomers;