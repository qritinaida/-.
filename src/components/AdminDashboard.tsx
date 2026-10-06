import React from 'react';
import { 
  Building, 
  Users, 
  CreditCard, 
  Wrench, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  FileCheck,
  Zap
} from 'lucide-react';
import { Room, Invoice, Payment, MaintenanceTicket } from '../types';

interface AdminDashboardProps {
  rooms: Room[];
  invoices: Invoice[];
  payments: Payment[];
  tickets: MaintenanceTicket[];
  onNavigateTab: (tab: string) => void;
  onOpenInvoiceModal: (invoice: Invoice) => void;
  onOpenPaymentModal: (payment: Payment) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  rooms,
  invoices,
  payments,
  tickets,
  onNavigateTab,
  onOpenInvoiceModal,
  onOpenPaymentModal
}) => {
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const vacantRooms = rooms.filter(r => r.status === 'vacant').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const currentMonthInvoices = invoices.filter(inv => inv.month === '2026-09');
  const paidInvoices = currentMonthInvoices.filter(inv => inv.status === 'paid');
  const unpaidInvoices = currentMonthInvoices.filter(inv => inv.status === 'unpaid' || inv.status === 'pending_verification' || inv.status === 'overdue');

  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const pendingRevenue = unpaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const activeTickets = tickets.filter(t => t.status !== 'completed' && t.status !== 'cancelled');

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">ภาพรวมการบริหารหอพัก (Dashboard)</h1>
            <span className="bg-white/20 text-white text-[11px] px-2.5 py-0.5 rounded-full font-medium">
              รอบบิล: ก.ย. 2026
            </span>
          </div>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            ยินดีต้อนรับ ผู้จัดการหอพัก • ระบบพร้อมรองรับการออกบิล บันทึกมิเตอร์ และตรวจสอบสลิป
          </p>
        </div>

        {pendingPayments.length > 0 && (
          <div className="flex items-center bg-amber-500/20 border border-amber-300/40 text-amber-100 px-4 py-2.5 rounded-xl text-xs backdrop-blur-md">
            <AlertCircle className="w-4 h-4 text-amber-300 mr-2 shrink-0 animate-pulse" />
            <span>มีสลิปโอนเงินรอตรวจสอบ <strong>{pendingPayments.length} รายการ</strong></span>
            <button
              onClick={() => onNavigateTab('slips')}
              className="ml-3 underline font-bold hover:text-white"
            >
              ตรวจเลย
            </button>
          </div>
        )}
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Occupancy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">อัตราการเข้าพัก</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{occupancyRate}%</span>
            <span className="text-xs text-slate-500 font-medium">
              {occupiedRooms}/{totalRooms} ห้อง
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${occupancyRate}%` }}
            ></div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span>ว่าง: {vacantRooms} ห้อง</span>
            <span>ปรับปรุง: {maintenanceRooms} ห้อง</span>
          </div>
        </div>

        {/* Card 2: Revenue Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">รายรับเดือนนี้ (ชำระแล้ว)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-600">฿{totalRevenue.toLocaleString()}</span>
            <span className="text-xs text-slate-400 block mt-0.5">
              จากทั้งหมด {paidInvoices.length} บิลที่เสร็จสิ้น
            </span>
          </div>
          <div className="mt-4 flex items-center text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg w-fit">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            <span>รับชำระผ่าน PromptPay</span>
          </div>
        </div>

        {/* Card 3: Pending Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ยอดรอเก็บ / ค้างชำระ</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-rose-600">฿{pendingRevenue.toLocaleString()}</span>
            <span className="text-xs text-slate-400 block mt-0.5">
              รอชำระ {unpaidInvoices.length} บิล
            </span>
          </div>
          <div className="mt-4 flex items-center text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded-lg w-fit">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            <span>ครบกำหนด 5 ต.ค. 2026</span>
          </div>
        </div>

        {/* Card 4: Active Maintenance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">งานซ่อมบำรุงที่ค้างอยู่</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{activeTickets.length} งาน</span>
            <span className="text-xs text-slate-400 block mt-0.5">
              กำลังซ่อม {tickets.filter(t => t.status === 'in_progress').length} งาน
            </span>
          </div>
          <div className="mt-4 flex items-center text-[11px] text-slate-500 bg-slate-100 px-2 py-1 rounded-lg w-fit">
            <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span>ช่างประจำการ 2 ท่าน</span>
          </div>
        </div>

      </div>

      {/* Quick Action Buttons */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">เมนูลัดประจำวัน (Quick Actions)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <button
            onClick={() => onNavigateTab('meters')}
            className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-xs sm:text-sm">จดมิเตอร์น้ำ-ไฟ</div>
              <div className="text-[11px] text-slate-400">กรอกเลขประจำงวด</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('billing')}
            className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-xs sm:text-sm">ออกใบแจ้งหนี้</div>
              <div className="text-[11px] text-slate-400">สร้างบิลอัตโนมัติ</div>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('slips')}
            className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition group text-left relative"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-xs sm:text-sm">ตรวจสลิปโอนเงิน</div>
              <div className="text-[11px] text-slate-400">
                {pendingPayments.length > 0 ? `รอตรวจ ${pendingPayments.length} ใบ` : 'เรียบร้อยทั้งหมด'}
              </div>
            </div>
            {pendingPayments.length > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => onNavigateTab('rooms')}
            className="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-xs sm:text-sm">จัดการผังห้อง</div>
              <div className="text-[11px] text-slate-400">ว่าง {vacantRooms} ห้อง</div>
            </div>
          </button>

        </div>
      </div>

      {/* Two Column Section: Pending Slips & Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Invoices / Slips */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">รายการชำระเงินที่รอตรวจสอบ</h3>
              </div>
              <button
                onClick={() => onNavigateTab('slips')}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center"
              >
                <span>ดูทั้งหมด</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {pendingPayments.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  ไม่มีสลิปที่รอการตรวจสอบในขณะนี้
                </div>
              ) : (
                pendingPayments.map(p => {
                  const inv = invoices.find(i => i.id === p.invoiceId);
                  const room = rooms.find(r => r.id === p.roomId);
                  return (
                    <div key={p.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={p.slipUrl} 
                          alt="slip thumb" 
                          className="w-11 h-11 object-cover rounded-lg border border-slate-200" 
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            ห้อง {room?.number} • ฿{p.amount.toLocaleString()}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            โอนเมื่อ: {p.transferDate}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onOpenPaymentModal(p)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition"
                      >
                        ตรวจสลิป
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Maintenance Tickets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-800 text-sm">การแจ้งซ่อมบำรุงล่าสุด</h3>
              </div>
              <button
                onClick={() => onNavigateTab('maintenance')}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center"
              >
                <span>ดูทั้งหมด</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {activeTickets.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  ไม่มีงานซ่อมค้างอยู่ ทุกห้องอยู่ในสภาพสมบูรณ์
                </div>
              ) : (
                activeTickets.slice(0, 3).map(ticket => {
                  const room = rooms.find(r => r.id === ticket.roomId);
                  return (
                    <div key={ticket.id} className="py-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-blue-600">ห้อง {room?.number}</span>
                          <span className="text-xs font-semibold text-slate-800 truncate max-w-[200px]">
                            {ticket.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {ticket.assignedTechnician ? `ช่าง: ${ticket.assignedTechnician}` : 'ยังไม่มอบหมายช่าง'}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ticket.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}>
                        {ticket.status === 'in_progress' ? 'กำลังซ่อม' : 'รอรับเรื่อง'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
