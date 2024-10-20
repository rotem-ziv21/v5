import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataService, Tenant } from '../services/DataService';
import { AuthService } from '../services/AuthService';
import { AlertCircle, RefreshCw, Plus, Edit, Trash, Settings, Users, Eye, Key, LogOut } from 'lucide-react';
import LoginCredentialsModal from './LoginCredentialsModal';

const AdminDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allTenants = await DataService.getAllTenants();
      setTenants(allTenants);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'אירעה שגיאה לא ידועה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTenant = async () => {
    if (!newTenantName.trim()) return;
    setIsCreating(true);
    try {
      const newTenant = await DataService.createTenant({
        name: newTenantName,
        ownerId: 'temp-owner-id',
        username: '',
        password: ''
      });
      setTenants([...tenants, newTenant]);
      setNewTenantName('');
      setSelectedTenant(newTenant);
      setIsCredentialsModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'אירעה שגיאה ביצירת העסק');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק עסק זה?')) return;
    try {
      await DataService.deleteTenant(tenantId);
      setTenants(tenants.filter(tenant => tenant.id !== tenantId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'אירעה שגיאה במחיקת העסק');
    }
  };

  const handleEditTenant = (tenantId: string) => {
    navigate(`/business-settings/${tenantId}`);
  };

  const handleManageTeam = (tenantId: string) => {
    navigate(`/team-management/${tenantId}`);
  };

  const handleViewTenantApp = (tenantId: string) => {
    navigate(`/tenant-view/${tenantId}`);
  };

  const handleUpdateCredentials = async (username: string, password: string) => {
    if (selectedTenant) {
      try {
        await DataService.updateTenant(selectedTenant.id, { username, password });
        setIsCredentialsModalOpen(false);
        setSelectedTenant(null);
        loadTenants(); // Refresh the list to show updated data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'אירעה שגיאה בעדכון פרטי ההתחברות');
      }
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-center">ניהול עסקים</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 flex items-center"
        >
          <LogOut size={20} className="mr-2" />
          התנתקות
        </button>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={18} />
            <span>{error}</span>
          </div>
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">הוסף עסק חדש</h3>
        <div className="flex">
          <input
            type="text"
            value={newTenantName}
            onChange={(e) => setNewTenantName(e.target.value)}
            placeholder="שם העסק החדש"
            className="flex-grow p-2 border rounded-l"
          />
          <button
            onClick={handleCreateTenant}
            disabled={isCreating}
            className="bg-green-500 text-white p-2 rounded-r hover:bg-green-600 transition duration-300"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="text-center py-4">טוען...</div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {tenants.map(tenant => (
              <li key={tenant.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium text-gray-900">{tenant.name}</p>
                    <p className="text-sm text-gray-500">מזהה: {tenant.id}</p>
                    <p className="text-sm text-gray-500">שם משתמש: {tenant.username || 'לא הוגדר'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewTenantApp(tenant.id)}
                      className="p-2 bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition duration-300"
                      title="צפה באפליקציית העסק"
                    >
                      <Eye size={20} />
                    </button>
                    <button 
                      onClick={() => handleEditTenant(tenant.id)}
                      className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition duration-300"
                      title="הגדרות עסק"
                    >
                      <Settings size={20} />
                    </button>
                    <button 
                      onClick={() => handleManageTeam(tenant.id)}
                      className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 transition duration-300"
                      title="ניהול צוות"
                    >
                      <Users size={20} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTenant(tenant);
                        setIsCredentialsModalOpen(true);
                      }}
                      className="p-2 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200 transition duration-300"
                      title="עדכן פרטי התחברות"
                    >
                      <Key size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteTenant(tenant.id)}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition duration-300"
                      title="מחק עסק"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {tenants.length === 0 && !error && (
            <p className="text-center text-gray-500 py-4">לא נמצאו עסקים.</p>
          )}
        </>
      )}
      <div className="mt-6 text-center">
        <button
          onClick={loadTenants}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isLoading}
        >
          <RefreshCw className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
          רענן רשימה
        </button>
      </div>
      {isCredentialsModalOpen && selectedTenant && (
        <LoginCredentialsModal
          tenant={selectedTenant}
          onClose={() => {
            setIsCredentialsModalOpen(false);
            setSelectedTenant(null);
          }}
          onUpdate={handleUpdateCredentials}
        />
      )}
    </div>
  );
};

export default AdminDashboard;