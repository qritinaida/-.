import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Zap, 
  CreditCard, 
  FileCheck, 
  Wrench, 
  LayoutDashboard,
  Shield,
  UserCircle,
  Cloud,
  Database,
  BarChart3,
  ShieldCheck,
  Bot,
  Sparkles
} from 'lucide-react';
import { StorageService } from './utils/storage';
import { 
  Room, 
  Tenant, 
  Contract, 
  MeterReading, 
  Invoice, 
  Payment, 
  MaintenanceTicket, 
  DormitorySettings, 
  Receipt,
  AuditLog,
  GoogleUser
} from './types';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { RoomManagement } from './components/RoomManagement';
import { MeterManagement } from './components/MeterManagement';
import { BillingManagement } from './components/BillingManagement';
import { SlipVerification } from './components/SlipVerification';
import { MaintenanceDesk } from './components/MaintenanceDesk';
import { TenantPortal } from './components/TenantPortal';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { ReceiptModal } from './components/ReceiptModal';
import { CloudflareDeployModal } from './components/CloudflareDeployModal';
import { DatabaseManager } from './components/DatabaseManager';
import { FinancialReports } from './components/FinancialReports';
import { AuditLogs } from './components/AuditLogs';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { AiChatAssistant } from './components/AiChatAssistant';
import { AiCommandCenter } from './components/AiCommandCenter';
import { DormContext } from './services/aiAssistantService';
import { ThemeService } from './utils/themeService';

export const App: React.FC = () => {
  // Authentication & Role
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(() => StorageService.getUser());
  const [role, setRole] = useState<'admin' | 'tenant'>(() => {
    const user = StorageService.getUser();
    return user ? user.role : 'admin';
  });
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [activeTenantRoomId, setActiveTenantRoomId] = useState<string>(() => {
    const user = StorageService.getUser();
    return (user && user.roomId) ? user.roomId : 'r-101';
  });

  // Core Data
  const [rooms, setRooms] = useState<Room[]>(() => StorageService.getRooms());
  const [tenants, setTenants] = useState<Tenant[]>(() => StorageService.getTenants());
  const [contracts, setContracts] = useState<Contract[]>(() => StorageService.getContracts());
  const [meterReadings, setMeterReadings] = useState<MeterReading[]>(() => StorageService.getMeterReadings());
  const [invoices, setInvoices] = useState<Invoice[]>(() => StorageService.getInvoices());
  const [payments, setPayments] = useState<Payment[]>(() => StorageService.getPayments());
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => StorageService.getMaintenanceTickets());
  const [settings, setSettings] = useState<DormitorySettings>(() => StorageService.getSettings());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());

  // Modal states
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<{ receipt: Receipt; invoice?: Invoice } | null>(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isGoogleAuthOpen, setIsGoogleAuthOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => ThemeService.getTheme() === 'dark');

  const handleToggleTheme = () => {
    const nextMode = ThemeService.toggleTheme();
    setIsDarkMode(nextMode === 'dark');
  };

  // Sync to Storage on changes
  const updateRooms = (newRooms: Room[]) => {
    setRooms(newRooms);
    StorageService.saveRooms(newRooms);
  };

  const updateTenants = (newTenants: Tenant[]) => {
    setTenants(newTenants);
    StorageService.saveTenants(newTenants);
  };

  const updateContracts = (newContracts: Contract[]) => {
    setContracts(newContracts);
    StorageService.saveContracts(newContracts);
  };

  const updateMeterReadings = (newReadings: MeterReading[]) => {
    setMeterReadings(newReadings);
    StorageService.saveMeterReadings(newReadings);
    StorageService.logAction('UPDATE', 'meter_readings', 'batch', 'บันทึกเลขมิเตอร์น้ำ-ไฟประจำเดือน');
    setAuditLogs(StorageService.getAuditLogs());
  };

  const updateInvoices = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
    StorageService.saveInvoices(newInvoices);
  };

  const updatePayments = (newPayments: Payment[]) => {
    setPayments(newPayments);
    StorageService.savePayments(newPayments);
    setAuditLogs(StorageService.getAuditLogs());
  };

  const updateTickets = (newTickets: MaintenanceTicket[]) => {
    setTickets(newTickets);
    StorageService.saveMaintenanceTickets(newTickets);
  };

  const handleResetData = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลเป็นตัวอย่างเริ่มต้น (Demo Seed Data) หรือไม่?')) {
      StorageService.resetToDefault();
      setRooms(StorageService.getRooms());
      setTenants(StorageService.getTenants());
      setContracts(StorageService.getContracts());
      setMeterReadings(StorageService.getMeterReadings());
      setInvoices(StorageService.getInvoices());
      setPayments(StorageService.getPayments());
      setTickets(StorageService.getMaintenanceTickets());
      setSettings(StorageService.getSettings());
      setAuditLogs(StorageService.getAuditLogs());
    }
  };

  // Google Login Handlers
  const handleGoogleLogin = (user: GoogleUser) => {
    setCurrentUser(user);
    StorageService.saveUser(user);
    setRole(user.role);
    if (user.role === 'tenant' && user.roomId) {
      setActiveTenantRoomId(user.roomId);
    }
    StorageService.logAction('CREATE', 'tenants', user.id, `ผู้ใช้ ${user.name} (${user.email}) ลงชื่อเข้าใช้ผ่าน Google OAuth`, user.name);
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleGoogleLogout = () => {
    setCurrentUser(null);
    StorageService.saveUser(null);
    setRole('admin');
  };

  // Tenant uploads slip
  const handleTenantUploadSlip = (
    invoiceId: string, 
    amount: number, 
    slipUrl: string, 
    transferDate: string
  ) => {
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      invoiceId,
      roomId: activeTenantRoomId,
      amount,
      slipUrl,
      slipHash: `hash-${Date.now()}`,
      transferDate,
      status: 'pending',
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updatedInvoices = invoices.map(inv => 
      inv.id === invoiceId 
        ? { ...inv, status: 'pending_verification' as const }
        : inv
    );

    updatePayments([newPayment, ...payments]);
    updateInvoices(updatedInvoices);
    StorageService.logAction('CREATE', 'payments', newPayment.id, `ผู้เช่าห้อง ${activeRoom.number} ส่งสลิปโอนเงินยอด ฿${amount.toLocaleString()}`);
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Tenant creates repair ticket
  const handleTenantCreateTicket = (ticketData: Partial<MaintenanceTicket>) => {
    const newTicket: MaintenanceTicket = {
      id: `tck-${Date.now()}`,
      ticketNumber: `TCK-202609-${String(tickets.length + 1).padStart(3, '0')}`,
      roomId: activeTenantRoomId,
      tenantId: ticketData.tenantId || '',
      category: ticketData.category || 'air',
      title: ticketData.title || '',
      description: ticketData.description || '',
      imageUrls: ticketData.imageUrls || [],
      status: 'pending',
      priority: 'medium',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    updateTickets([newTicket, ...tickets]);
    StorageService.logAction('CREATE', 'tickets', newTicket.id, `ผู้เช่าห้อง ${activeRoom.number} แจ้งซ่อม: ${newTicket.title}`);
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Resolve active room & tenant for tenant portal
  const activeRoom = rooms.find(r => r.id === activeTenantRoomId) || rooms[0];
  const activeTenant = tenants.find(t => t.id === activeRoom.currentTenantId);
  const activeContract = contracts.find(c => c.roomId === activeRoom.id && c.status === 'active');
  const activeInvoice = invoices.find(i => i.roomId === activeRoom.id && i.month === '2026-09');

  const pendingPaymentsCount = payments.filter(p => p.status === 'pending').length;

  const dormContext: DormContext = {
    role,
    currentUser,
    activeRoomNumber: activeRoom?.number,
    rooms,
    tenants,
    contracts,
    meterReadings,
    invoices,
    payments,
    tickets,
    settings
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar
        role={role}
        setRole={setRole}
        activeRoomId={activeTenantRoomId}
        setActiveRoomId={setActiveTenantRoomId}
        rooms={rooms}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        onOpenGoogleAuth={() => setIsGoogleAuthOpen(true)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ADMIN MODE */}
        {role === 'admin' && (
          <div className="space-y-6">
            
            {/* Admin Subnav */}
            <div className="flex items-center space-x-1 sm:space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto custom-scrollbar text-xs font-semibold">
              {[
                { id: 'dashboard', label: 'ภาพรวมระบบ (Dashboard)', icon: LayoutDashboard },
                { id: 'rooms', label: 'จัดการผังห้องพัก (Rooms)', icon: Building2 },
                { id: 'meters', label: 'จดมิเตอร์น้ำ-ไฟ (Meters)', icon: Zap },
                { id: 'billing', label: 'ใบแจ้งหนี้ & บิล (Billing)', icon: CreditCard },
                { 
                  id: 'slips', 
                  label: 'ตรวจสลิปโอนเงิน (Slips)', 
                  icon: FileCheck,
                  badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined
                },
                { id: 'maintenance', label: 'แจ้งซ่อมบำรุง (Maintenance)', icon: Wrench },
                { id: 'reports', label: 'รายงานบัญชี (Reports)', icon: BarChart3 },
                { id: 'database', label: 'ฐานข้อมูล D1/SQL (Database)', icon: Database },
                { id: 'audit', label: 'ประวัติความปลอดภัย (Audit)', icon: ShieldCheck },
                { id: 'ai', label: 'AI ผู้ช่วยหอพัก (DormAI)', icon: Bot, badge: 'AI' },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = adminTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id)}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-1 animate-pulse">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Admin Tab Content */}
            {adminTab === 'dashboard' && (
              <AdminDashboard
                rooms={rooms}
                invoices={invoices}
                payments={payments}
                tickets={tickets}
                onNavigateTab={(tab) => setAdminTab(tab)}
                onOpenInvoiceModal={(inv) => setViewingInvoice(inv)}
                onOpenPaymentModal={(p) => setAdminTab('slips')}
              />
            )}

            {adminTab === 'rooms' && (
              <RoomManagement
                rooms={rooms}
                tenants={tenants}
                contracts={contracts}
                onUpdateRooms={updateRooms}
                onUpdateTenants={updateTenants}
                onUpdateContracts={updateContracts}
              />
            )}

            {adminTab === 'meters' && (
              <MeterManagement
                rooms={rooms}
                tenants={tenants}
                meterReadings={meterReadings}
                onUpdateMeterReadings={updateMeterReadings}
                onNavigateToBilling={() => setAdminTab('billing')}
              />
            )}

            {adminTab === 'billing' && (
              <BillingManagement
                rooms={rooms}
                tenants={tenants}
                contracts={contracts}
                meterReadings={meterReadings}
                invoices={invoices}
                settings={settings}
                onUpdateInvoices={updateInvoices}
                onOpenInvoiceModal={(inv) => setViewingInvoice(inv)}
                onOpenReceiptModal={(rcpt, inv) => setViewingReceipt({ receipt: rcpt, invoice: inv })}
              />
            )}

            {adminTab === 'slips' && (
              <SlipVerification
                payments={payments}
                invoices={invoices}
                rooms={rooms}
                tenants={tenants}
                onUpdatePayments={updatePayments}
                onUpdateInvoices={updateInvoices}
                onOpenReceiptModal={(rcpt, inv) => setViewingReceipt({ receipt: rcpt, invoice: inv })}
              />
            )}

            {adminTab === 'maintenance' && (
              <MaintenanceDesk
                tickets={tickets}
                rooms={rooms}
                tenants={tenants}
                onUpdateTickets={updateTickets}
              />
            )}

            {adminTab === 'reports' && (
              <FinancialReports
                rooms={rooms}
                invoices={invoices}
                payments={payments}
                meterReadings={meterReadings}
              />
            )}

            {adminTab === 'database' && (
              <DatabaseManager
                rooms={rooms}
                tenants={tenants}
                contracts={contracts}
                meterReadings={meterReadings}
                invoices={invoices}
                payments={payments}
                tickets={tickets}
                auditLogs={auditLogs}
              />
            )}

            {adminTab === 'audit' && (
              <AuditLogs
                logs={auditLogs}
              />
            )}

            {adminTab === 'ai' && (
              <AiCommandCenter
                context={dormContext}
              />
            )}

          </div>
        )}

        {/* TENANT MODE */}
        {role === 'tenant' && (
          <TenantPortal
            room={activeRoom}
            tenant={activeTenant}
            contract={activeContract}
            invoice={activeInvoice}
            payments={payments}
            tickets={tickets}
            settings={settings}
            onUploadSlip={handleTenantUploadSlip}
            onCreateTicket={handleTenantCreateTicket}
            onOpenReceiptModal={(rcpt, inv) => setViewingReceipt({ receipt: rcpt, invoice: inv })}
          />
        )}

      </main>

      {/* Global Modals */}
      {viewingInvoice && (
        <InvoiceDetailModal
          invoice={viewingInvoice}
          room={rooms.find(r => r.id === viewingInvoice.roomId)}
          tenant={tenants.find(t => t.id === viewingInvoice.tenantId)}
          settings={settings}
          onClose={() => setViewingInvoice(null)}
          onPayWithSlip={role === 'tenant' ? () => {
            setViewingInvoice(null);
          } : undefined}
        />
      )}

      {viewingReceipt && (
        <ReceiptModal
          receipt={viewingReceipt.receipt}
          invoice={viewingReceipt.invoice}
          settings={settings}
          onClose={() => setViewingReceipt(null)}
        />
      )}

      {isDeployModalOpen && (
        <CloudflareDeployModal
          onClose={() => setIsDeployModalOpen(false)}
        />
      )}

      {isGoogleAuthOpen && (
        <GoogleAuthModal
          currentUser={currentUser}
          onLogin={handleGoogleLogin}
          onLogout={handleGoogleLogout}
          onClose={() => setIsGoogleAuthOpen(false)}
        />
      )}

      {/* Floating AI Chat Assistant (Omnipresent for both Admin & Tenants) */}
      <AiChatAssistant context={dormContext} />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-400 dark:text-slate-500 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Dormitory Management System (DMS) • เฟสที่ 2 (Database, Google Auth & AI)</span>
          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
            <span className="flex items-center space-x-1">
              <Cloud className="w-3.5 h-3.5 text-orange-500" />
              <span>Cloudflare Workers / D1 Engine</span>
            </span>
            <span>•</span>
            <span>Clean Architecture Pattern</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
