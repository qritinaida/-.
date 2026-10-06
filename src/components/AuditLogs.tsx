import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, Clock, User, FileText, CheckCircle2, AlertOctagon } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogsProps {
  logs: AuditLog[];
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter(log => {
    const matchAction = filterAction === 'all' || log.action === filterAction;
    const matchSearch = log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchAction && matchSearch;
  });

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'APPROVE':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">อนุมัติ (APPROVE)</span>;
      case 'CHECK_IN':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-300">เช็คอิน (CHECK-IN)</span>;
      case 'CHECK_OUT':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-300">ย้ายออก (CHECK-OUT)</span>;
      case 'REJECT':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-300">ปฏิเสธ (REJECT)</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-300">{action}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">บันทึกประวัติความปลอดภัยและการกระทำ (Audit Logs)</h2>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
              NFR-08 Compliance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            บันทึกการเงิน สัญญา การอนุมัติสลิป และการคืนเงินประกันอย่างโปร่งใส ไม่สามารถแก้ไขหรือลบได้ (Immutable Append-only)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาประวัติ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />
          </div>
        </div>
      </div>

      {/* Action Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        {['all', 'APPROVE', 'CHECK_IN', 'CHECK_OUT', 'REJECT'].map(act => (
          <button
            key={act}
            onClick={() => setFilterAction(act)}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterAction === act
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {act === 'all' ? 'ทั้งหมด' : act}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-40">วันเวลาที่กระทำ</th>
                <th className="py-3 px-3 text-center w-36">การกระทำ (Action)</th>
                <th className="py-3 px-4 w-32">ตาราง (Entity)</th>
                <th className="py-3 px-4">รายละเอียดบันทึก</th>
                <th className="py-3 px-4 w-40">ผู้กระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    ไม่พบบันทึกประวัติในเงื่อนไขนี้
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {log.entityType}
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium leading-relaxed">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-slate-600 flex items-center space-x-1.5 mt-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.performedBy}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
