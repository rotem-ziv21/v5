import { compress, decompress } from 'lz-string';

const TENANTS_STORAGE_KEY = 'tenants';

export interface Tenant {
  id: string;
  name: string;
  ownerId: string;
  locationId?: string;
  calendarId?: string;
  apiToken?: string;
  username: string;
  password: string;
  icon?: string;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  font?: string;
  bookingMessage?: string;
  isStoreEnabled?: boolean;
  services?: Service[];
  products?: Product[];
  availabilitySlots?: AvailabilitySlot[];
}

export interface Service {
  id: number;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

export interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
}

export const DataService = {
  async getAllTenants(): Promise<Tenant[]> {
    const compressedTenants = localStorage.getItem(TENANTS_STORAGE_KEY);
    if (compressedTenants) {
      const decompressedTenants = decompress(compressedTenants);
      return JSON.parse(decompressedTenants || '[]');
    }
    return [];
  },

  async getTenantById(id: string): Promise<Tenant | null> {
    const tenants = await this.getAllTenants();
    return tenants.find(tenant => tenant.id === id) || null;
  },

  async createTenant(tenantData: Omit<Tenant, 'id'>): Promise<Tenant> {
    const tenants = await this.getAllTenants();
    const newTenant: Tenant = {
      ...tenantData,
      id: Date.now().toString(),
      services: [],
      products: [],
      availabilitySlots: [],
    };
    tenants.push(newTenant);
    await this.saveTenants(tenants);
    return newTenant;
  },

  async updateTenant(id: string, updateData: Partial<Tenant>): Promise<Tenant | null> {
    const tenants = await this.getAllTenants();
    const index = tenants.findIndex(tenant => tenant.id === id);
    if (index === -1) return null;
    
    tenants[index] = { ...tenants[index], ...updateData };
    await this.saveTenants(tenants);
    return tenants[index];
  },

  async deleteTenant(id: string): Promise<boolean> {
    const tenants = await this.getAllTenants();
    const updatedTenants = tenants.filter(tenant => tenant.id !== id);
    await this.saveTenants(updatedTenants);
    return updatedTenants.length < tenants.length;
  },

  async getTenantServices(tenantId: string): Promise<Service[]> {
    const tenant = await this.getTenantById(tenantId);
    return tenant?.services || [];
  },

  async updateTenantServices(tenantId: string, services: Service[]): Promise<void> {
    await this.updateTenant(tenantId, { services });
  },

  async getTenantProducts(tenantId: string): Promise<Product[]> {
    const tenant = await this.getTenantById(tenantId);
    return tenant?.products || [];
  },

  async addProduct(tenantId: string, product: Omit<Product, 'id'>): Promise<Product> {
    const tenant = await this.getTenantById(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    const newProduct: Product = { ...product, id: Date.now().toString() };
    const updatedProducts = [...(tenant.products || []), newProduct];
    await this.updateTenant(tenantId, { products: updatedProducts });
    return newProduct;
  },

  async updateProduct(tenantId: string, productId: string, updateData: Partial<Product>): Promise<Product> {
    const tenant = await this.getTenantById(tenantId);
    if (!tenant || !tenant.products) throw new Error('Tenant or products not found');

    const updatedProducts = tenant.products.map(p => 
      p.id === productId ? { ...p, ...updateData } : p
    );
    await this.updateTenant(tenantId, { products: updatedProducts });
    const updatedProduct = updatedProducts.find(p => p.id === productId);
    if (!updatedProduct) throw new Error('Product not found after update');
    return updatedProduct;
  },

  async deleteProduct(tenantId: string, productId: string): Promise<void> {
    const tenant = await this.getTenantById(tenantId);
    if (!tenant || !tenant.products) throw new Error('Tenant or products not found');

    const updatedProducts = tenant.products.filter(p => p.id !== productId);
    await this.updateTenant(tenantId, { products: updatedProducts });
  },

  async getTenantAvailabilitySlots(tenantId: string): Promise<AvailabilitySlot[]> {
    const tenant = await this.getTenantById(tenantId);
    return tenant?.availabilitySlots || [];
  },

  async updateTenantAvailabilitySlots(tenantId: string, slots: AvailabilitySlot[]): Promise<void> {
    await this.updateTenant(tenantId, { availabilitySlots: slots });
  },

  async saveTenants(tenants: Tenant[]): Promise<void> {
    const compressedTenants = compress(JSON.stringify(tenants));
    localStorage.setItem(TENANTS_STORAGE_KEY, compressedTenants);
  },

  async addTenantAppointment(tenantId: string, appointment: any): Promise<void> {
    const tenant = await this.getTenantById(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    const appointments = tenant.appointments || [];
    appointments.push(appointment);
    await this.updateTenant(tenantId, { appointments });
  },

  async getTenantAppointments(tenantId: string): Promise<any[]> {
    const tenant = await this.getTenantById(tenantId);
    return tenant?.appointments || [];
  },
};