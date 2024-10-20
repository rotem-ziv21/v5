import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { DataService } from '../services/DataService';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';

const ConfigurationManager: React.FC = () => {
  const { currentTenant } = useTenant();
  const [config, setConfig] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentTenant) {
      loadConfig();
    }
  }, [currentTenant]);

  const loadConfig = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const tenantConfig = await DataService.getTenantConfig(currentTenant!.id);
      setConfig(tenantConfig);
    } catch (err) {
      console.error('Error loading config:', err);
      setError('אירעה שגיאה בטעינת התצורה. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await DataService.updateTenantConfig(currentTenant!.id, config);
      setSuccessMessage('התצורה עודכנה בהצלחה!');
    } catch (err) {
      console.error('Error updating config:', err);
      setError('אירעה שגיאה בעדכון התצורה. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prevConfig => ({ ...prevConfig, [name]: value }));
  };

  if (!currentTenant) {
    return <div>אנא הגדר את העסק תחילה.</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-6">ניהול תצורה</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={18} />
            <span>{error}</span>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span>{successMessage}</span>
        </div>
      )}
      <form onSubmit={updateConfig} className="space-y-4">
        {Object.entries(config).map(([key, value]) => (
          <div key={key}>
            <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
            <input
              id={key}
              name={key}
              type="text"
              value={value as string}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ))}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={loadConfig}
            className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center"
            disabled={isLoading}
          >
            <RefreshCw className="mr-2" size={18} />
            רענן
          </button>
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
            disabled={isLoading}
          >
            <Save className="mr-2" size={18} />
            שמור שינויים
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigurationManager;