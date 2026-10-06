import { Room, Tenant, Contract, MeterReading, Invoice, Payment, MaintenanceTicket, DormitorySettings, AuditLog, GoogleUser } from '../types';
import { initialRooms, initialTenants, initialContracts, initialMeterReadings, initialInvoices, initialPayments, initialMaintenanceTickets, initialSettings } from '../mockData';

const KEYS = {
  ROOMS: 'dms_rooms_v1',
  TENANTS: 'dms_tenants_v1',
  CONTRACTS: 'dms_contracts_v1',
  METER_READINGS: 'dms_meters_v1',
  INVOICES: 'dms_invoices_v1',
  PAYMENTS: 'dms_payments_v1',
  TICKETS: 'dms_tickets_v1',
  SETTINGS: 'dms_settings_v1',
};

function load<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

export const StorageService = {
  getRooms: (): Room[] => load(KEYS.ROOMS, initialRooms),
  saveRooms: (data: Room[]): void => save(KEYS.ROOMS, data),

  getTenants: (): Tenant[] => load(KEYS.TENANTS, initialTenants),
  saveTenants: (data: Tenant[]): void => save(KEYS.TENANTS, data),

  getContracts: (): Contract[] => load(KEYS.CONTRACTS, initialContracts),
  saveContracts: (data: Contract[]): void => save(KEYS.CONTRACTS, data),

  getMeterReadings: (): MeterReading[] => load(KEYS.METER_READINGS, initialMeterReadings),
  saveMeterReadings: (data: MeterReading[]): void => save(KEYS.METER_READINGS, data),

  getInvoices: (): Invoice[] => load(KEYS.INVOICES, initialInvoices),
  saveInvoices: (data: Invoice[]): void => save(KEYS.INVOICES, data),

  getPayments: (): Payment[] => load(KEYS.PAYMENTS, initialPayments),
  savePayments: (data: Payment[]): void => save(KEYS.PAYMENTS, data),

  getMaintenanceTickets: (): MaintenanceTicket[] => load(KEYS.TICKETS, initialMaintenanceTickets),
  saveMaintenanceTickets: (data: MaintenanceTicket[]): void => save(KEYS.TICKETS, data),

  getSettings: (): DormitorySettings => load(KEYS.SETTINGS, initialSettings),
  saveSettings: (data: DormitorySettings): void => save(KEYS.SETTINGS, data),

  getAuditLogs: (): AuditLog[] => load('dms_audit_logs_v1', [
    {
      id: 'aud-1',
      entityType: 'contracts',
      entityId: 'c-1',
      action: 'CHECK_IN',
      performedBy: 'Admin สมเกียรติ',
      details: 'ทำสัญญาเช่าและเช็คอินผู้เช่า ห้อง 101 เงินประกัน ฿8,400',
      timestamp: '2026-09-01 09:30'
    },
    {
      id: 'aud-2',
      entityType: 'invoices',
      entityId: 'inv-201-202609',
      action: 'APPROVE',
      performedBy: 'Admin สมเกียรติ',
      details: 'อนุมัติการชำระเงินบิล INV-202609-201 ยอด ฿6,260 ออกใบเสร็จ RCT-202609-201',
      timestamp: '2026-09-28 14:20'
    }
  ]),
  saveAuditLogs: (data: AuditLog[]): void => save('dms_audit_logs_v1', data),

  logAction: (action: AuditLog['action'], entityType: AuditLog['entityType'], entityId: string, details: string, performedBy = 'Admin สมเกียรติ'): void => {
    const logs = StorageService.getAuditLogs();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      entityType,
      entityId,
      action,
      performedBy,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    StorageService.saveAuditLogs([newLog, ...logs]);
  },

  getUser: (): GoogleUser | null => load('dms_google_user_v1', {
    id: 'g-admin-01',
    name: 'สมเกียรติ สิทธิชัย',
    email: 'somkiat.admin@gmail.com',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    role: 'admin'
  }),
  saveUser: (user: GoogleUser | null): void => save('dms_google_user_v1', user),

  resetToDefault: (): void => {
    save(KEYS.ROOMS, initialRooms);
    save(KEYS.TENANTS, initialTenants);
    save(KEYS.CONTRACTS, initialContracts);
    save(KEYS.METER_READINGS, initialMeterReadings);
    save(KEYS.INVOICES, initialInvoices);
    save(KEYS.PAYMENTS, initialPayments);
    save(KEYS.TICKETS, initialMaintenanceTickets);
    save(KEYS.SETTINGS, initialSettings);
    save('dms_audit_logs_v1', []);
  }
};
