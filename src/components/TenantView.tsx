import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataService, Tenant } from '../services/DataService';
import { AuthService } from '../services/AuthService';
import { AlertCircle, Calendar, Clock, User, Scissors, Star, Gift, Camera, Settings, BarChart, Home, Grid, UserCircle, ShoppingBag, LogOut } from 'lucide-react';
import BookAppointment from './BookAppointment';
import PastAppointments from './PastAppointments';
import PriceList from './PriceList';
import Statistics from './Statistics';
import Store from './Store';
import { GalleryProvider } from '../contexts/GalleryContext';
import ProfileSection from './ProfileSection';
import BusinessSettingsModal from './BusinessSettingsModal';

const TenantView: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('');
  const [contactId, setContactId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    const loadTenantData = async () => {
      if (!tenantId) {
        setError('מזהה עסק חסר');
        setIsLoading(false);
        return;
      }
      try {
        const tenantData = await DataService.getTenantById(tenantId);
        if (!tenantData) {
          throw new Error('לא נמצאו נתוני עסק');
        }
        setTenant(tenantData);
        // Load additional tenant-specific data here
      } catch (err) {
        setError('נכשלה טעינת נתוני העסק. אנא נסה שוב מאוחר יותר.');
      } finally {
        setIsLoading(false);
      }
    };
    loadTenantData();
  }, [tenantId]);

  const handleSettingsClick = () => {
    setIsSettingsModalOpen(true);
  };

  const handleSettingsAuthentication = (username: string, password: string) => {
    if (tenant && tenant.username === username && tenant.password === password) {
      setIsSettingsModalOpen(false);
      navigate(`/business-settings/${tenantId}`);
    } else {
      alert('שם משתמש או סיסמה שגויים.');
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  if (isLoading) {
    return <div className="text-center mt-10">טוען נתוני עסק...</div>;
  }

  if (error || !tenant) {
    return <div className="text-center mt-10 text-red-600">{error || 'לא נמצאו נתוני עסק'}</div>;
  }

  const menuItems = [
    { id: 'book', title: 'קביעת תור', icon: Calendar, color: 'bg-blue-500' },
    { id: 'past', title: 'תורים קודמים', icon: Clock, color: 'bg-green-500' },
    { id: 'prices', title: 'מחירון', icon: Scissors, color: 'bg-yellow-500' },
    { id: 'statistics', title: 'סטטיסטיקות', icon: BarChart, color: 'bg-purple-500' },
    { id: 'store', title: 'חנות', icon: ShoppingBag, color: 'bg-pink-500' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'book':
        return <BookAppointment contactId={contactId} tenantId={tenantId || ''} />;
      case 'past':
        return <PastAppointments tenantId={tenantId || ''} />;
      case 'prices':
        return <PriceList tenantId={tenantId || ''} />;
      case 'statistics':
        return <Statistics tenantId={tenantId || ''} />;
      case 'store':
        return <Store tenantId={tenantId || ''} />;
      case 'profile':
        return (
          <ProfileSection
            setContactId={setContactId}
            onClose={() => setActiveSection('')}
            updateUserName={setUserName}
            tenantId={tenantId || ''}
          />
        );
      default:
        return null;
    }
  };

  return (
    <GalleryProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col" style={{ fontFamily: tenant.font || 'Rubik, sans-serif' }}>
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <button onClick={() => navigate('/admin')} className="mr-4">
                <LogOut size={24} />
              </button>
              {tenant.icon && React.createElement(Icons[tenant.icon as keyof typeof Icons], { className: "text-blue-500 mr-2 animate-pulse", size: 28 })}
              <h1 className="text-2xl font-bold text-gray-800">{tenant.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-800 transition-colors duration-300">
                <Gift size={24} />
              </button>
              <button 
                onClick={() => setActiveSection('profile')}
                className="text-gray-600 hover:text-gray-800 transition-colors duration-300"
              >
                <User size={24} />
              </button>
              <button 
                onClick={handleSettingsClick}
                className="text-gray-600 hover:text-gray-800 transition-colors duration-300"
                title="הגדרות עסק"
              >
                <Settings size={24} />
              </button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 flex-grow">
          {activeSection ? (
            <div className="animate-fadeIn">
              <button
                onClick={() => setActiveSection('')}
                className="mb-4 text-gray-600 hover:text-gray-800 flex items-center transition-colors duration-300"
              >
                <span className="ml-1">חזרה</span>
                &rarr;
              </button>
              {renderSection()}
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="חיפוש שירות או מיקום"
                  className="w-full p-3 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-6 mb-8">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`${item.color} rounded-lg shadow-md p-8 flex flex-col items-center justify-center transition duration-300 hover:shadow-lg animate-fadeIn hover:scale-105`}
                  >
                    <item.icon className="text-white mb-4" size={48} />
                    <span className="text-white font-semibold text-lg">{item.title}</span>
                  </button>
                ))}
              </div>
              <div className="mt-12 animate-slideIn">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">העבודות שלנו</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Add gallery images here */}
                </div>
              </div>
            </div>
          )}
        </main>
        <footer className="bg-white shadow-md mt-auto">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-around">
              <button 
                onClick={() => setActiveSection('')}
                className="text-gray-600 hover:text-blue-500 flex flex-col items-center transition-colors duration-300"
              >
                <Home size={24} />
                <span className="text-xs mt-1">בית</span>
              </button>
              <button 
                onClick={() => setActiveSection('prices')}
                className="text-gray-600 hover:text-blue-500 flex flex-col items-center transition-colors duration-300"
              >
                <Grid size={24} />
                <span className="text-xs mt-1">שירותים</span>
              </button>
              <button 
                onClick={() => setActiveSection('book')}
                className="text-gray-600 hover:text-blue-500 flex flex-col items-center transition-colors duration-300"
              >
                <Calendar size={24} />
                <span className="text-xs mt-1">תורים</span>
              </button>
              <button 
                onClick={() => setActiveSection('profile')}
                className="text-gray-600 hover:text-blue-500 flex flex-col items-center transition-colors duration-300"
              >
                <UserCircle size={24} />
                <span className="text-xs mt-1">פרופיל</span>
              </button>
            </div>
          </div>
        </footer>
      </div>
      {isSettingsModalOpen && (
        <BusinessSettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          onAuthenticate={handleSettingsAuthentication}
        />
      )}
    </GalleryProvider>
  );
};

export default TenantView;