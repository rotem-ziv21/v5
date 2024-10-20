import React, { useEffect, useState } from 'react';
import { DollarSign, Scissors, AlertCircle } from 'lucide-react';
import { DataService, Service } from '../services/DataService';

interface PriceListProps {
  tenantId: string;
}

const PriceList: React.FC<PriceListProps> = ({ tenantId }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, [tenantId]);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const tenantServices = await DataService.getTenantServices(tenantId);
      setServices(tenantServices);
      setError(null);
    } catch (error) {
      console.error('Error loading services:', error);
      setError('לא ניתן לטעון את רשימת השירותים כרגע. אנא נסה שוב מאוחר יותר.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">טוען שירותים...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <div className="flex items-center">
          <AlertCircle className="mr-2" size={18} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">מחירון</h2>
      {services.length === 0 ? (
        <p className="text-center text-gray-500">אין שירותים זמינים כרגע.</p>
      ) : (
        <ul className="space-y-4">
          {services.map(({ id, name, price }) => (
            <li key={id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4 space-x-reverse">
                <Scissors className="text-purple-400" size={24} />
                <span className="font-semibold">{name}</span>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse">
                <span className="font-bold text-lg">{price} ₪</span>
                <DollarSign className="text-green-400" size={18} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PriceList;