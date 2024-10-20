import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataService, Tenant } from '../services/DataService';
import { Save, AlertCircle, ArrowLeft } from 'lucide-react';
import PriceManagement from './PriceManagement';
import BusinessHours from './BusinessHours';
import GalleryManagement from './GalleryManagement';
import TokenManagement from './TokenManagement';
import IconSelection from './IconSelection';
import ColorCustomization from './ColorCustomization';
import FontSelection from './FontSelection';
import BookingMessage from './BookingMessage';
import StoreManagement from './StoreManagement';

const BusinessSettings: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState('prices');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const tabs = [
    { id: 'prices', label: 'מחירון' },
    { id: 'hours', label: 'שעות פעילות' },
    { id: 'gallery', label: 'גלריה' },
    { id: 'token', label: 'טוקן API' },
    { id: 'icon', label: 'אייקון' },
    { id: 'colors', label: 'צבעים' },
    { id: 'font', label: 'פונט' },
    { id: 'booking', label: 'הודעת הזמנה' },
    { id: 'store', label: 'ניהול חנות' },
  ];

  useEffect(() => {
    const loadTenantData = async () => {
      if (!tenantId) {
        setError('מזהה עסק חסר');
        return;
      }

      try {
        const tenantData = await DataService.getTenantById(tenantId);
        if (!tenantData) {
          setError('לא נמצאו נתוני עסק');
          return;
        }
        setTenant(tenantData);
      } catch (err) {
        console.error('Error loading tenant data:', err);
        setError('נכשלה טעינת נתוני העסק. אנא נסה שוב מאוחר יותר.');
      }
    };
    loadTenantData();
  }, [tenantId]);

  const handleSave = async () => {
    if (!tenantId || !tenant) return;
    try {
      await DataService.updateTenant(tenantId, tenant);
      setSuccessMessage('ההגדרות נשמרו בהצלחה!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('שמירת ההגדרות נכשלה. אנא נסה שוב.');
    }
  };

  if (!tenant) {
    return <div className="text-center mt-10">טוען נתוני עסק...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(`/tenant-view/${tenantId}`)}
            className="text-blue-500 hover:text-blue-700 flex items-center"
          >
            <ArrowLeft className="mr-2" size={20} />
            חזרה לדף הראשי
          </button>
          <h2 className="text-3xl font-bold text-center text-gray-800">הגדרות עסק: {tenant.name}</h2>
          <div className="w-24"></div>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Right-side menu */}
            <div className="w-full md:w-64 bg-gray-50 p-6">
              <nav>
                <ul className="space-y-2">
                  {tabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-right py-3 px-4 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Main content area */}
            <div className="flex-1 p-8">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                  <div className="flex items-center">
                    <AlertCircle className="mr-2" size={18} />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="bg-white p-6 rounded-lg shadow-md">
                {activeTab === 'prices' && <PriceManagement tenantId={tenantId || ''} />}
                {activeTab === 'hours' && <BusinessHours tenantId={tenantId || ''} />}
                {activeTab === 'gallery' && <GalleryManagement tenantId={tenantId || ''} />}
                {activeTab === 'token' && <TokenManagement tenantId={tenantId || ''} />}
                {activeTab === 'icon' && (
                  <IconSelection
                    currentIcon={tenant.icon || ''}
                    onIconChange={(icon) => setTenant({ ...tenant, icon })}
                  />
                )}
                {activeTab === 'colors' && (
                  <ColorCustomization
                    currentColors={tenant.colors || {}}
                    onColorChange={(colors) => setTenant({ ...tenant, colors })}
                  />
                )}
                {activeTab === 'font' && (
                  <FontSelection
                    currentFont={tenant.font || ''}
                    onFontChange={(font) => setTenant({ ...tenant, font })}
                  />
                )}
                {activeTab === 'booking' && <BookingMessage tenantId={tenantId || ''} />}
                {activeTab === 'store' && <StoreManagement tenantId={tenantId || ''} />}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
                >
                  <Save className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
                  שמור כל ההגדרות
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettings;