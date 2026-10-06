export type RoomStatus = 'vacant' | 'occupied' | 'reserved' | 'maintenance';
export type RoomType = 'fan' | 'air' | 'suite';

export interface Room {
  id: string;
  number: string;
  building: string;
  floor: number;
  type: RoomType;
  basePrice: number;
  status: RoomStatus;
  amenities: string[];
  currentTenantId?: string;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  idCard: string;
  email?: string;
  lineId?: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
}

export interface Contract {
  id: string;
  roomId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  depositAmount: number;
  monthlyRent: number;
  waterRate: number; // per unit (e.g. 18 THB)
  electricRate: number; // per unit (e.g. 8 THB)
  commonFee: number; // per month (e.g. 300 THB)
  status: 'active' | 'terminated';
}

export interface MeterReading {
  id: string;
  roomId: string;
  month: string; // YYYY-MM e.g. 2026-09
  prevWater: number;
  currWater: number;
  waterUnits: number;
  prevElectric: number;
  currElectric: number;
  electricUnits: number;
  isSpikeWarning?: boolean;
  warningMessage?: string;
  recordedAt: string;
  recordedBy: string;
}

export type InvoiceStatus = 'unpaid' | 'pending_verification' | 'paid' | 'overdue';

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  unitPrice?: number;
  units?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-202609-101
  roomId: string;
  tenantId: string;
  month: string; // YYYY-MM
  items: InvoiceItem[];
  totalAmount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  promptpayQrData?: string;
  promptpayNumber?: string;
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface Payment {
  id: string;
  invoiceId: string;
  roomId: string;
  amount: number;
  slipUrl: string;
  slipHash: string;
  transferDate: string;
  status: PaymentStatus;
  rejectReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  receiptNumber?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string; // e.g. RCT-202609-101
  invoiceId: string;
  paymentId: string;
  roomId: string;
  tenantName: string;
  roomNumber: string;
  month: string;
  amount: number;
  issuedAt: string;
  issuedBy: string;
}

export type TicketCategory = 'air' | 'plumbing' | 'electrical' | 'furniture' | 'other';
export type TicketStatus = 'pending' | 'acknowledged' | 'in_progress' | 'completed' | 'cancelled';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string; // e.g. TCK-202609-001
  roomId: string;
  tenantId: string;
  category: TicketCategory;
  title: string;
  description: string;
  imageUrls: string[];
  status: TicketStatus;
  priority: TicketPriority;
  assignedTechnician?: string;
  cost?: number;
  costPaidBy?: 'dorm' | 'tenant';
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface DormitorySettings {
  name: string;
  address: string;
  promptpayNumber: string; // Phone or Tax ID for PromptPay
  promptpayName: string;
  defaultWaterRate: number;
  defaultElectricRate: number;
  defaultCommonFee: number;
  dueDayOfMonth: number; // e.g. 5
  gracePeriodDays: number; // e.g. 2
  lateFeePerDay: number; // e.g. 100
}

export interface AuditLog {
  id: string;
  entityType: 'rooms' | 'tenants' | 'contracts' | 'meter_readings' | 'invoices' | 'payments' | 'tickets';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'APPROVE' | 'REJECT' | 'CHECK_IN' | 'CHECK_OUT';
  performedBy: string;
  details: string;
  timestamp: string;
}

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
  role: 'admin' | 'tenant';
  roomId?: string;
  roomNumber?: string;
}
