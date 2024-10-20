import React, { useState, useEffect } from 'react';
import { Plus, Trash, Save } from 'lucide-react';
import { DataService, Service } from '../services/DataService';

interface PriceManagementProps {
  tenantId: string;
}

const PriceManagement: React.FC<PriceManagementProps> = ({ tenantId }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState({ name: '', price: 0 });
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadServices();
  }, [tenantId]);

  const loadServices = async () => {
    try {
      const loadedServices = await DataService.getTenantServices(tenantId);
      setServices(loadedServices);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const handlePriceChange = (id: number, newPrice: number) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, price: newPrice } : service
    ));
  };

  const handleNameChange = (id: number, newName: string) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, name: newName } : service
    ));
  };

  const handleAddService = () => {
    if (newService.name && newService.price > 0) {
      const newId = Math.max(0, ...services.map(s => s.id)) + 1;
      setServices([...services, { ...newService, id: newId }]);
      setNewService({ name: '', price: 0 });
    }
  };

  const handleRemoveService = (id: number) => {
    setServices(services.filter(service => service.id !== id));
  };

  const handleSave = async () => {
    try {
      await DataService.updateTenantServices(tenantId, services);
      setSaveMessage('השינויים נשמרו בהצלחה!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving services:', error);
      setSaveMessage('שגיאה בשמירת השינויים');
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">ניהול מחירון</h3>
      {services.map(({ id, name, price }) => (
        <div key={id} className="flex items-center justify-between mb-2">
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(id, e.target.value)}
            className="border rounded px-2 py-1 w-1/3"
          />
          <input
            type="number"
            value={price}
            onChange={(e) => handlePriceChange(id, Number(e.target.value))}
            className="border rounded px-2 py-1 w-24 text-left"
          />
          <span className="mr-2">₪</span>
          <button
            onClick={() => handleRemoveService(id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash size={18} />
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between mt-4">
        <input
          type="text"
          value={newService.name}
          onChange={(e) => setNewService({ ...newService, name: e.target.value })}
          placeholder="שם השירות החדש"
          className="border rounded px-2 py-1 w-1/3"
        />
        <input
          type="number"
          value={newService.price || ''}
          onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
          placeholder="מחיר"
          className="border rounded px-2 py-1 w-24 text-left"
        />
        <span className="mr-2">₪</span>
        <button
          onClick={handleAddService}
          className="bg-green-400 text-white px-2 py-1 rounded hover:bg-green-500 transition duration-300"
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 flex items-center"
        >
          <Save size={18} className="mr-2" />
          שמור שינויים
        </button>
        {saveMessage && (
          <span className="text-green-500 animate-fade-in-out">{saveMessage}</span>
        )}
      </div>
    </div>
  );
};

export default PriceManagement;