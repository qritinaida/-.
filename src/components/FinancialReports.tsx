import React, { useState } from 'react';
import { 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Download, 
  Calendar, 
  Building2, 
  Droplets, 
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Room, Invoice, Payment, MeterReading } from '../types';

interface FinancialReportsProps {
  rooms: Room[];
  invoices: Invoice[];
  payments: Payment[];
  meterReadings: MeterReading[];
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({
  rooms,
  invoices,
  payments,
  meterReadings
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-09');

  const monthInvoices = invoices.filter(i => i.month === selectedMonth);
  const paidInvoices = monthInvoices.filter(i => i.status === 'paid');
  const unpaidInvoices = monthInvoices.filter(i => i.status !== 'paid');

  const totalExpectedRevenue = monthInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalCollectedRevenue = paidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPendingRevenue = unpaidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

  const collectionRate = totalExpectedRevenue > 0 
    ? Math.round((totalCollectedRevenue / totalExpectedRevenue) * 100) 
    : 0;

  // Utility totals
  const totalWaterUnits = meterReadings
    .filter(m => m.month === selectedMonth)
    .reduce((sum, m) => sum + m.waterUnits, 0);

  const totalElectricUnits = meterReadings
    .filter(m => m.month === selectedMonth)
    .reduce((sum, m) => sum + m.electricUnits, 0);

  const handleExportCSV = () => {
    let csv = "Invoice Number,Room Number,Month,Rent,Water,Electric,Common,Total,Status\n";
    monthInvoices.forEach(inv => {
      const room = rooms.find(r => r.id === inv.roomId);
      const rent = inv.items.find(i => i.description.includes('ค่าเช่า'))?.amount || 0;
      const water = inv.items.find(i => i.description.includes('น้ำ'))?.amount || 0;
      const electric = inv.items.find(i => i.description.includes('ไฟ'))?.amount || 0;
      const common = inv.items.find(i => i.description.includes('ส่วนกลาง'))?.amount || 0;
      csv += `"${inv.invoiceNumber}","${room?.number || ''}","${inv.month}",${rent},${water},${electric},${common},${inv.totalAmount},"${inv.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial_report_${selectedMonth}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">รายงานสรุปทางการเงินและสถิติ (Financial Analytics)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            สรุปรายรับ ยอดเรียกเก็บ อัตราการจัดเก็บเงิน และปริมาณการใช้น้ำ-ไฟ ประจำงวด
          </p>
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
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">ยอดเรียกเก็บรวม (Total Billed)</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            ฿{totalExpectedRevenue.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            จากทั้งหมด {monthInvoices.length} ใบแจ้งหนี้
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">รับชำระแล้ว (Collected)</span>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            ฿{totalCollectedRevenue.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium">
            อัตราการจัดเก็บ: {collectionRate}%
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">ค้างชำระ / รอตรวจ (Pending)</span>
          <div className="mt-2 text-2xl font-bold text-rose-600">
            ฿{totalPendingRevenue.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-rose-700 font-medium">
            คงเหลือ {unpaidInvoices.length} บิล
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">การใช้สาธารณูปโภครวม</span>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="flex items-center space-x-1 text-sky-600 font-bold text-sm">
              <Droplets className="w-4 h-4" />
              <span>{totalWaterUnits} หน่วย</span>
            </div>
            <div className="flex items-center space-x-1 text-amber-600 font-bold text-sm">
              <Zap className="w-4 h-4" />
              <span>{totalElectricUnits} หน่วย</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            ค่าน้ำ-ไฟคิดตามอัตราสัญญา
          </div>
        </div>

      </div>

      {/* Breakdown by Room Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">รายงานรายรับแยกตามห้องพัก (รอบบิล: {selectedMonth})</h3>
          <span className="text-xs text-slate-400 font-mono">หน่วยสกุลเงิน: บาท (THB)</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">ห้องพัก</th>
                <th className="py-3 px-4">เลขที่ใบแจ้งหนี้</th>
                <th className="py-3 px-3 text-right">ค่าเช่าห้อง</th>
                <th className="py-3 px-3 text-right">ค่าน้ำ</th>
                <th className="py-3 px-3 text-right">ค่าไฟ</th>
                <th className="py-3 px-3 text-right">ส่วนกลาง</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900">ยอดรวม</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthInvoices.map(inv => {
                const room = rooms.find(r => r.id === inv.roomId);
                const rent = inv.items.find(i => i.description.includes('ค่าเช่า'))?.amount || 0;
                const water = inv.items.find(i => i.description.includes('น้ำ'))?.amount || 0;
                const electric = inv.items.find(i => i.description.includes('ไฟ'))?.amount || 0;
                const common = inv.items.find(i => i.description.includes('ส่วนกลาง'))?.amount || 0;

                return (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-blue-600">ห้อง {room?.number}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 text-right text-slate-700">฿{rent.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-700">฿{water.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-700">฿{electric.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-700">฿{common.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">฿{inv.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      {inv.status === 'paid' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                          ชำระแล้ว
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                          รอชำระ
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
