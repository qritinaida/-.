import React, { useState } from 'react';
import { 
  CreditCard, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Eye, 
  Search, 
  Calendar,
  AlertCircle,
  Receipt as ReceiptIcon,
  Banknote
} from 'lucide-react';
import { Room, Tenant, Contract, MeterReading, Invoice, InvoiceStatus, DormitorySettings, Receipt } from '../types';

interface BillingManagementProps {
  rooms: Room[];
  tenants: Tenant[];
  contracts: Contract[];
  meterReadings: MeterReading[];
  invoices: Invoice[];
  settings: DormitorySettings;
  onUpdateInvoices: (invoices: Invoice[]) => void;
  onOpenInvoiceModal: (invoice: Invoice) => void;
  onOpenReceiptModal: (receipt: Receipt, invoice: Invoice) => void;
}

export const BillingManagement: React.FC<BillingManagementProps> = ({
  rooms,
  tenants,
  contracts,
  meterReadings,
  invoices,
  settings,
  onUpdateInvoices,
  onOpenInvoiceModal,
  onOpenReceiptModal
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [generateToast, setGenerateToast] = useState<string | null>(null);

  const filteredInvoices = invoices.filter(inv => {
    const room = rooms.find(r => r.id === inv.roomId);
    const tenant = tenants.find(t => t.id === inv.tenantId);

    const matchMonth = inv.month === selectedMonth;
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room && room.number.includes(searchQuery)) ||
      (tenant && tenant.name.includes(searchQuery));

    return matchMonth && matchStatus && matchSearch;
  });

  const handleGenerateBatchInvoices = () => {
    const occupiedRooms = rooms.filter(r => r.status === 'occupied');
    const newInvoices: Invoice[] = [];

    occupiedRooms.forEach(room => {
      const contract = contracts.find(c => c.roomId === room.id && c.status === 'active');
      const tenant = tenants.find(t => t.id === room.currentTenantId);
      const meter = meterReadings.find(m => m.roomId === room.id && m.month === selectedMonth);

      const waterUnits = meter ? meter.waterUnits : 5;
      const electricUnits = meter ? meter.electricUnits : 100;
      const waterRate = contract ? contract.waterRate : settings.defaultWaterRate;
      const electricRate = contract ? contract.electricRate : settings.defaultElectricRate;
      const commonFee = contract ? contract.commonFee : settings.defaultCommonFee;
      const rentAmount = contract ? contract.monthlyRent : room.basePrice;

      const waterTotal = waterUnits * waterRate;
      const electricTotal = electricUnits * electricRate;
      const totalAmount = rentAmount + waterTotal + electricTotal + commonFee;

      const invoiceId = `inv-${room.number}-${selectedMonth.replace('-', '')}`;
      const invoiceNumber = `INV-${selectedMonth.replace('-', '')}-${room.number}`;

      // Check if invoice already exists
      const existing = invoices.find(i => i.id === invoiceId);

      const inv: Invoice = {
        id: invoiceId,
        invoiceNumber,
        roomId: room.id,
        tenantId: tenant ? tenant.id : '',
        month: selectedMonth,
        totalAmount,
        status: existing ? existing.status : 'unpaid',
        dueDate: `${selectedMonth.split('-')[0]}-${String(Number(selectedMonth.split('-')[1]) + 1).padStart(2, '0')}-05`,
        promptpayNumber: settings.promptpayNumber,
        paidAt: existing?.paidAt,
        items: [
          { id: '1', description: `ค่าเช่าห้องพัก (ห้อง ${room.number})`, amount: rentAmount },
          { id: '2', description: `ค่าน้ำประปา (${waterUnits} หน่วย @ ${waterRate} บ.)`, amount: waterTotal, units: waterUnits, unitPrice: waterRate },
          { id: '3', description: `ค่าไฟฟ้า (${electricUnits} หน่วย @ ${electricRate} บ.)`, amount: electricTotal, units: electricUnits, unitPrice: electricRate },
          { id: '4', description: 'ค่าบริการส่วนกลางและอินเทอร์เน็ต', amount: commonFee }
        ]
      };

      newInvoices.push(inv);
    });

    // Merge with invoices from other months
    const otherInvoices = invoices.filter(i => i.month !== selectedMonth);
    onUpdateInvoices([...otherInvoices, ...newInvoices]);

    setGenerateToast(`สร้างใบแจ้งหนี้รอบ ${selectedMonth} สำเร็จ ${newInvoices.length} รายการ!`);
    setTimeout(() => setGenerateToast(null), 4000);
  };

  const handleMarkAsCashPaid = (invoice: Invoice) => {
    const updated = invoices.map(i => 
      i.id === invoice.id 
        ? { ...i, status: 'paid' as InvoiceStatus, paidAt: new Date().toISOString().replace('T', ' ').substring(0, 16) }
        : i
    );
    onUpdateInvoices(updated);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">ชำระแล้ว (Paid)</span>;
      case 'pending_verification':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">รอตรวจสอบสลิป</span>;
      case 'overdue':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-300">เกินกำหนด</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-300">รอชำระ (Unpaid)</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">ออกใบแจ้งหนี้และเรียกเก็บค่าเช่า</h2>
          <p className="text-xs text-slate-500 mt-0.5">รวมค่าเช่า + ค่าน้ำ + ค่าไฟ + ค่าส่วนกลาง พร้อมสร้าง PromptPay QR</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="2026-09">กันยายน 2026</option>
              <option value="2026-10">ตุลาคม 2026</option>
            </select>
          </div>

          <button
            onClick={handleGenerateBatchInvoices}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm shadow-blue-500/20 transition active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>สร้างบิลประจำเดือนอัตโนมัติ</span>
          </button>
        </div>
      </div>

      {generateToast && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-2xl text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{generateToast}</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 custom-scrollbar">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'unpaid', label: 'รอชำระ' },
            { id: 'pending_verification', label: 'รอตรวจสลิป' },
            { id: 'paid', label: 'ชำระแล้ว' },
            { id: 'overdue', label: 'เกินกำหนด' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                statusFilter === f.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาเลขบิล, ห้อง, หรือชื่อผู้เช่า..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-60"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">เลขที่ใบแจ้งหนี้</th>
                <th className="py-3 px-4">ห้องพัก</th>
                <th className="py-3 px-4">ผู้เช่า</th>
                <th className="py-3 px-3 text-right">ค่าเช่า</th>
                <th className="py-3 px-3 text-right">ค่าน้ำ</th>
                <th className="py-3 px-3 text-right">ค่าไฟ</th>
                <th className="py-3 px-3 text-right">ส่วนกลาง</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900">ยอดสุทธิ</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
                <th className="py-3 px-4 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                    ไม่พบข้อมูลใบแจ้งหนี้ในเงื่อนไขนี้ (คลิก "สร้างบิลประจำเดือนอัตโนมัติ" เพื่อเริ่มต้น)
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const room = rooms.find(r => r.id === inv.roomId);
                  const tenant = tenants.find(t => t.id === inv.tenantId);

                  const rentItem = inv.items.find(i => i.description.includes('ค่าเช่า'))?.amount || 0;
                  const waterItem = inv.items.find(i => i.description.includes('น้ำ'))?.amount || 0;
                  const electricItem = inv.items.find(i => i.description.includes('ไฟ'))?.amount || 0;
                  const commonItem = inv.items.find(i => i.description.includes('ส่วนกลาง'))?.amount || 0;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-600 text-sm">
                        ห้อง {room?.number || inv.roomId}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {tenant?.name || '-'}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        ฿{rentItem.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        ฿{waterItem.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        ฿{electricItem.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        ฿{commonItem.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-blue-600 text-sm">
                        ฿{inv.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onOpenInvoiceModal(inv)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="ดูใบแจ้งหนี้ / พิมพ์ QR"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {inv.status === 'paid' && (
                            <button
                              onClick={() => {
                                const receipt: Receipt = {
                                  id: `rct-${inv.id}`,
                                  receiptNumber: `RCT-${inv.invoiceNumber.replace('INV-', '')}`,
                                  invoiceId: inv.id,
                                  paymentId: 'pay-cash',
                                  roomId: inv.roomId,
                                  tenantName: tenant?.name || 'ผู้เช่า',
                                  roomNumber: room?.number || '',
                                  month: inv.month,
                                  amount: inv.totalAmount,
                                  issuedAt: inv.paidAt || '2026-09-28',
                                  issuedBy: 'Admin สมเกียรติ'
                                };
                                onOpenReceiptModal(receipt, inv);
                              }}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              title="ดูใบเสร็จรับเงิน"
                            >
                              <ReceiptIcon className="w-4 h-4" />
                            </button>
                          )}

                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => handleMarkAsCashPaid(inv)}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition text-[10px] font-bold"
                              title="รับชำระด้วยเงินสด"
                            >
                              <Banknote className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
