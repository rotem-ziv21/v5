import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface Tenant {
  id: string;
  name: string;
  locationId: string;
  calendarId: string;
  apiToken: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface TenantContextType {
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    const storedTenant = localStorage.getItem('currentTenant');
    if (storedTenant) {
      setCurrentTenant(JSON.parse(storedTenant));
    }
  }, []);

  const updateCurrentTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    localStorage.setItem('currentTenant', JSON.stringify(tenant));
  };

  return (
    <TenantContext.Provider value={{ currentTenant, setCurrentTenant: updateCurrentTenant }}>
      {children}
    </TenantContext.Provider>
  );
};