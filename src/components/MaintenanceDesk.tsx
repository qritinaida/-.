import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle2, 
  User, 
  Image as ImageIcon, 
  Tag, 
  X,
  AlertCircle,
  Eye,
  Hammer
} from 'lucide-react';
import { MaintenanceTicket, Room, Tenant, TicketStatus, TicketCategory } from '../types';

interface MaintenanceDeskProps {
  tickets: MaintenanceTicket[];
  rooms: Room[];
  tenants: Tenant[];
  onUpdateTickets: (tickets: MaintenanceTicket[]) => void;
}

export const MaintenanceDesk: React.FC<MaintenanceDeskProps> = ({
  tickets,
  rooms,
  tenants,
  onUpdateTickets
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingTicket, setEditingTicket] = useState<MaintenanceTicket | null>(null);

  // Edit ticket state
  const [technicianName, setTechnicianName] = useState('');
  const [updateStatus, setUpdateStatus] = useState<TicketStatus>('in_progress');
  const [ticketCost, setTicketCost] = useState(0);
  const [costPaidBy, setCostPaidBy] = useState<'dorm' | 'tenant'>('dorm');
  const [ticketNotes, setTicketNotes] = useState('');

  const filteredTickets = tickets.filter(t => {
    return selectedStatus === 'all' || t.status === selectedStatus;
  });

  const handleOpenEdit = (ticket: MaintenanceTicket) => {
    setEditingTicket(ticket);
    setTechnicianName(ticket.assignedTechnician || 'ช่างวิทย์ (แผนกช่างประจำ)');
    setUpdateStatus(ticket.status);
    setTicketCost(ticket.cost || 0);
    setCostPaidBy(ticket.costPaidBy || 'dorm');
    setTicketNotes(ticket.notes || '');
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;

    const updated = tickets.map(t => 
      t.id === editingTicket.id 
        ? {
            ...t,
            status: updateStatus,
            assignedTechnician: technicianName,
            cost: Number(ticketCost),
            costPaidBy,
            notes: ticketNotes,
            completedAt: updateStatus === 'completed' 
              ? new Date().toISOString().replace('T', ' ').substring(0, 16) 
              : t.completedAt
          }
        : t
    );

    onUpdateTickets(updated);
    setEditingTicket(null);
  };

  const getCategoryIcon = (category: TicketCategory) => {
    switch (category) {
      case 'air': return '❄️ เครื่องปรับอากาศ';
      case 'plumbing': return '🚰 ระบบประปา';
      case 'electrical': return '⚡ ระบบไฟฟ้า';
      case 'furniture': return '🪑 เฟอร์นิเจอร์';
      default: return '🛠️ อื่นๆ';
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'pending':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-300">รอดำเนินการ</span>;
      case 'acknowledged':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-300">รับเรื่องแล้ว</span>;
      case 'in_progress':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">กำลังซ่อมแซม</span>;
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">ซ่อมเสร็จสิ้น</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">ยกเลิก</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">จัดการงานแจ้งซ่อมบำรุงห้องพัก</h2>
          <p className="text-xs text-slate-500 mt-0.5">รับแจ้งเรื่อง มอบหมายงานช่าง บันทึกค่าใช้จ่าย และติดตามสถานะ</p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'pending', label: 'รอดำเนินการ' },
            { id: 'in_progress', label: 'กำลังซ่อม' },
            { id: 'completed', label: 'เสร็จสิ้น' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                selectedStatus === f.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTickets.map(ticket => {
          const room = rooms.find(r => r.id === ticket.roomId);
          const tenant = tenants.find(t => t.id === ticket.tenantId);

          return (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                {/* Header: Room & Status */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-extrabold text-blue-600 text-sm">
                      ห้อง {room?.number || 'ส่วนกลาง'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">({ticket.ticketNumber})</span>
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>

                {/* Category & Title */}
                <div className="mt-3">
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                    {getCategoryIcon(ticket.category)}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm mt-1.5 leading-snug">
                    {ticket.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                    {ticket.description}
                  </p>
                </div>

                {/* Photos Thumbnail if any */}
                {ticket.imageUrls && ticket.imageUrls.length > 0 && (
                  <div className="mt-3 flex space-x-2 overflow-x-auto pb-1">
                    {ticket.imageUrls.map((img, idx) => (
                      <a key={idx} href={img} target="_blank" rel="noreferrer" className="shrink-0">
                        <img 
                          src={img} 
                          alt="repair attachment" 
                          className="w-16 h-16 object-cover rounded-xl border border-slate-200 hover:opacity-90 transition"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {/* Technician & Meta Details */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">ช่างผู้รับผิดชอบ:</span>
                    <span className="font-semibold text-slate-800">
                      {ticket.assignedTechnician || 'ยังไม่มอบหมาย'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">แจ้งเมื่อ:</span>
                    <span>{ticket.createdAt}</span>
                  </div>
                  {ticket.notes && (
                    <div className="bg-amber-50 text-amber-900 p-2 rounded-lg text-[10px] mt-2 border border-amber-200">
                      <strong>บันทึก:</strong> {ticket.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(ticket)}
                  className="w-full flex items-center justify-center space-x-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold py-2 rounded-xl border border-slate-200 transition text-xs"
                >
                  <Hammer className="w-3.5 h-3.5" />
                  <span>มอบหมายช่าง / อัปเดตงาน</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Edit Ticket Modal */}
      {editingTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">มอบหมายงานและอัปเดตสถานะงานซ่อม</h3>
                <p className="text-xs text-blue-600 font-semibold">{editingTicket.ticketNumber} • {editingTicket.title}</p>
              </div>
              <button onClick={() => setEditingTicket(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-4 mt-4">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">สถานะงานซ่อม</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as TicketStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="pending">รอดำเนินการ (Pending)</option>
                  <option value="acknowledged">รับเรื่องแล้ว (Acknowledged)</option>
                  <option value="in_progress">กำลังดำเนินการซ่อม (In Progress)</option>
                  <option value="completed">ซ่อมแซมเสร็จสิ้น (Completed)</option>
                  <option value="cancelled">ยกเลิกคำขอ (Cancelled)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">ช่างผู้รับผิดชอบ</label>
                <input
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  placeholder="เช่น ช่างวิทย์ (แผนกแอร์), ช่างเอก (ประปา)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">ค่าใช้จ่าย/ค่าอะไหล่ (บ.)</label>
                  <input
                    type="number"
                    value={ticketCost}
                    onChange={(e) => setTicketCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">ผู้รับผิดชอบค่าใช้จ่าย</label>
                  <select
                    value={costPaidBy}
                    onChange={(e) => setCostPaidBy(e.target.value as 'dorm' | 'tenant')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="dorm">หอพักรับผิดชอบ (เสื่อมตามสภาพ)</option>
                    <option value="tenant">ผู้เช่ารับผิดชอบ (เรียกเก็บในบิล)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">บันทึกความคืบหน้า / วันเวลานัดหมาย</label>
                <textarea
                  rows={3}
                  value={ticketNotes}
                  onChange={(e) => setTicketNotes(e.target.value)}
                  placeholder="เช่น ซ่อมเปลี่ยนท่อน้ำทิ้งแอร์เรียบร้อย ตรวจสอบความเย็นปกติ..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm"
                >
                  บันทึกการอัปเดต
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
