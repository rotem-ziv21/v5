import { DataService, Tenant } from './DataService';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'business_owner' | 'customer';
  tenantId?: string;
}

export const AuthService = {
  login: async (username: string, password: string): Promise<User | null> => {
    // Check for admin login
    if (username === 'admin' && password === 'admin') {
      const user: User = { id: 'admin', username: 'admin', role: 'admin' };
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }

    // Check for business owner login
    const tenants = await DataService.getAllTenants();
    const tenant = tenants.find(t => t.username === username && t.password === password);
    if (tenant) {
      const user: User = { id: tenant.id, username: tenant.username, role: 'business_owner', tenantId: tenant.id };
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }

    // Here you can add logic for customer login if needed

    return null;
  },

  logout: () => {
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!AuthService.getCurrentUser();
  },

  isAdmin: (): boolean => {
    const user = AuthService.getCurrentUser();
    return user?.role === 'admin';
  },

  isBusinessOwner: (): boolean => {
    const user = AuthService.getCurrentUser();
    return user?.role === 'business_owner';
  },

  getUserTenantId: (): string | null => {
    const user = AuthService.getCurrentUser();
    return user?.tenantId || null;
  }
};