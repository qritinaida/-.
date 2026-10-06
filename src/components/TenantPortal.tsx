import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  Building, 
  CreditCard, 
  QrCode, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  FileText, 
  Receipt as ReceiptIcon,
  Clock, 
  Phone, 
  Wifi, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { Room, Tenant, Contract, Invoice, Payment, MaintenanceTicket, DormitorySettings, Receipt } from '../types';
import { generatePromptPayPayload } from '../utils/promptpay';

interface TenantPortalProps {
  room: Room;
  tenant?: Tenant;
  contract?: Contract;
  invoice?: Invoice;
  payments: Payment[];
  tickets: MaintenanceTicket[];
  settings: DormitorySettings;
  onUploadSlip: (invoiceId: string, amount: number, slipUrl: string, transferDate: string) => void;
  onCreateTicket: (ticket: Partial<MaintenanceTicket>) => void;
  onOpenReceiptModal: (receipt: Receipt, invoice: Invoice) => void;
}

export const TenantPortal: React.FC<TenantPortalProps> = ({
  room,
  tenant,
  contract,
  invoice,
  payments,
  tickets,
  settings,
  onUploadSlip,
  onCreateTicket,
  onOpenReceiptModal
}) => {
  const [activeTab, setActiveTab] = useState<'bill' | 'maintenance' | 'rules'>('bill');
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Slip Upload State
  const [slipFilePreview, setSlipFilePreview] = useState<string>('');
  const [transferDate, setTransferDate] = useState<string>(
    new Date().toISOString().replace('T', ' ').substring(0, 16)
  );
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // New Maintenance Ticket State
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [ticketCategory, setTicketCategory] = useState<'air' | 'plumbing' | 'electrical' | 'furniture' | 'other'>('air');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketImage, setTicketImage] = useState('');

  // Generate PromptPay QR if invoice exists
  useEffect(() => {
    if (invoice && invoice.status !== 'paid') {
      const payload = generatePromptPayPayload(settings.promptpayNumber, invoice.totalAmount);
      QRCode.toDataURL(payload, {
        width: 220,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' }
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error(err));
    }
  }, [invoice, settings]);

  const handleSimulateSlipSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSlipFilePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Default sample slip image for demonstration
      setSlipFilePreview('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
    }
  };

  const handleSubmitSlip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    const sampleSlip = slipFilePreview || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80';
    onUploadSlip(invoice.id, invoice.totalAmount, sampleSlip, transferDate);

    setUploadSuccess(true);
    setSlipFilePreview('');
    setTimeout(() => setUploadSuccess(false), 5000);
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !ticketDescription) return;

    onCreateTicket({
      roomId: room.id,
      tenantId: tenant?.id || '',
      category: ticketCategory,
      title: ticketTitle,
      description: ticketDescription,
      imageUrls: ticketImage ? [ticketImage] : [],
      priority: 'medium'
    });

    setIsNewTicketOpen(false);
    setTicketTitle('');
    setTicketDescription('');
    setTicketImage('');
  };

  const tenantTickets = tickets.filter(t => t.roomId === room.id);

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-12">
      
      {/* Resident Welcome Card */}
      <div className="bg-gradient-to-tr from-emerald-600 via-teal-700 to-emerald-800 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/10">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold bg-white/20 text-white px-2.5 py-0.5 rounded-full">
              พอร์ทัลผู้พักอาศัย
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold mt-1 tracking-tight">
              ห้อง {room.number}
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
              ผู้เช่า: {tenant?.name || 'นายสมชาย ใจดี'} ({room.building})
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-200 block">ค่าเช่ารายเดือน</span>
            <span className="text-lg font-bold text-white">฿{room.basePrice.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-emerald-500/40 flex items-center justify-between text-[11px] text-emerald-100">
          <span>สัญญาเช่า: ถึง 31 ธ.ค. 2026</span>
          <span>เงินประกัน: ฿{contract ? contract.depositAmount.toLocaleString() : '8,400'}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center text-xs font-semibold">
        <button
          onClick={() => setActiveTab('bill')}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'bill'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>ใบแจ้งหนี้ & ชำระเงิน</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'maintenance'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>แจ้งซ่อม ({tenantTickets.filter(t => t.status !== 'completed').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 ${
            activeTab === 'rules'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wifi className="w-3.5 h-3.5" />
          <span>ข้อมูลหอพัก</span>
        </button>
      </div>

      {/* TAB 1: INVOICE & PAYMENT */}
      {activeTab === 'bill' && (
        <div className="space-y-4">
          
          {uploadSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs flex items-center space-x-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">ส่งหลักฐานการชำระเงินเรียบร้อยแล้ว!</p>
                <p className="text-[11px] text-emerald-700">เจ้าหน้าที่กำลังตรวจสอบยอดเงิน และระบบจะออกใบเสร็จรับเงินให้ทันทีที่อนุมัติ</p>
              </div>
            </div>
          )}

          {invoice ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
              
              {/* Header Status */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs text-slate-400 font-medium">รอบบิลประจำเดือน</span>
                  <h3 className="text-base font-bold text-slate-900">{invoice.month}</h3>
                </div>

                <div>
                  {invoice.status === 'paid' ? (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>ชำระเงินเรียบร้อย</span>
                    </span>
                  ) : invoice.status === 'pending_verification' ? (
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-300 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>รอเจ้าหน้าที่ตรวจสลิป</span>
                    </span>
                  ) : (
                    <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full border border-rose-300">
                      รอการชำระเงิน
                    </span>
                  )}
                </div>
              </div>

              {/* Total Amount Callout */}
              <div className="text-center py-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium">ยอดเงินที่ต้องชำระสุทธิ</span>
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight block mt-1">
                  ฿{invoice.totalAmount.toLocaleString()}
                </span>
                <span className="text-xs text-rose-600 font-semibold block mt-1">
                  ครบกำหนดชำระ: {invoice.dueDate}
                </span>
              </div>

              {/* Items Breakdown Dropdown */}
              <div>
                <button
                  onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 p-2.5 rounded-xl hover:bg-slate-50 transition border border-slate-200"
                >
                  <span>รายละเอียดค่าใช้จ่ายประจำเดือน (คลิกเพื่อดูแจกแจง)</span>
                  {isBreakdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isBreakdownOpen && (
                  <div className="mt-2 divide-y divide-slate-100 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80 animate-in fade-in duration-150">
                    {invoice.items.map((item, idx) => (
                      <div key={idx} className="py-2 flex justify-between items-center">
                        <span className="text-slate-600">{item.description}</span>
                        <span className="font-bold text-slate-900">฿{item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* If PAID: Show Receipt Download Button */}
              {invoice.status === 'paid' && (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <div className="text-xs text-emerald-800 font-medium">
                    ขอบคุณที่ชำระค่าเช่าตรงเวลา ใบเสร็จรับเงินพร้อมให้ดาวน์โหลด
                  </div>
                  <button
                    onClick={() => {
                      const receipt: Receipt = {
                        id: `rct-${invoice.id}`,
                        receiptNumber: `RCT-${invoice.invoiceNumber.replace('INV-', '')}`,
                        invoiceId: invoice.id,
                        paymentId: 'pay-done',
                        roomId: room.id,
                        tenantName: tenant?.name || 'ผู้เช่า',
                        roomNumber: room.number,
                        month: invoice.month,
                        amount: invoice.totalAmount,
                        issuedAt: invoice.paidAt || '2026-09-28',
                        issuedBy: 'Admin สมเกียรติ'
                      };
                      onOpenReceiptModal(receipt, invoice);
                    }}
                    className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-sm transition active:scale-95"
                  >
                    <ReceiptIcon className="w-4 h-4" />
                    <span>เปิดดูใบเสร็จรับเงิน (Official Receipt)</span>
                  </button>
                </div>
              )}

              {/* If UNPAID or REJECTED: Show PromptPay QR & Slip Upload */}
              {invoice.status !== 'paid' && invoice.status !== 'pending_verification' && (
                <div className="space-y-6 pt-2">
                  
                  {/* PromptPay QR Box */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200 text-center">
                    <div className="flex items-center justify-center space-x-1.5 text-blue-900 font-bold text-xs mb-2">
                      <QrCode className="w-4 h-4 text-blue-600" />
                      <span>สแกนชำระผ่าน PromptPay (พร้อมเพย์แท้)</span>
                    </div>

                    {qrDataUrl && (
                      <div className="inline-block bg-white p-3 rounded-2xl shadow-md border border-blue-100 my-2">
                        <img src={qrDataUrl} alt="PromptPay QR" className="w-44 h-44 mx-auto" />
                        <div className="mt-2 text-xs font-bold text-slate-800">
                          ยอดชำระ: ฿{invoice.totalAmount.toLocaleString()}
                        </div>
                        <p className="text-[10px] text-slate-400">เลขพร้อมเพย์: {settings.promptpayNumber}</p>
                      </div>
                    )}
                    <p className="text-[11px] text-blue-700">บันทึกรูป QR Code เพื่อนำไปสแกนในแอปธนาคารทุกแห่งได้ทันที</p>
                  </div>

                  {/* Slip Upload Form */}
                  <form onSubmit={handleSubmitSlip} className="space-y-4 text-xs">
                    <div className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>แนบสลิปโอนเงิน (แจ้งชำระ)</span>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-5 text-center bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSimulateSlipSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      
                      {slipFilePreview ? (
                        <div className="space-y-2">
                          <img 
                            src={slipFilePreview} 
                            alt="Slip Preview" 
                            className="w-32 h-44 object-cover mx-auto rounded-xl border border-slate-200 shadow-sm"
                          />
                          <span className="text-xs text-blue-600 font-semibold block">คลิกเพื่อเปลี่ยนรูปภาพสลิป</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-slate-700 block">คลิกเพื่ออัปโหลดรูปภาพสลิป</span>
                          <span className="text-slate-400 text-[11px] block">รองรับไฟล์ JPG, PNG (หรือคลิกเพื่อใช้สลิปตัวอย่าง)</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">วันและเวลาที่โอนเงินในสลิป</label>
                      <input
                        type="text"
                        value={transferDate}
                        onChange={(e) => setTransferDate(e.target.value)}
                        placeholder="2026-09-28 16:30"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl shadow-md shadow-emerald-600/20 text-xs sm:text-sm transition active:scale-98"
                    >
                      ส่งหลักฐานการชำระเงิน
                    </button>
                  </form>

                </div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              ยังไม่มีใบแจ้งหนี้รอบใหม่ในขณะนี้
            </div>
          )}

        </div>
      )}

      {/* TAB 2: MAINTENANCE REQUESTS */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">การแจ้งซ่อมอุปกรณ์ในห้องพัก</h3>
              <p className="text-xs text-slate-400">ช่างพร้อมให้บริการทุกวันจันทร์ - เสาร์</p>
            </div>
            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-sm transition active:scale-95"
            >
              + เปิดใบแจ้งซ่อมใหม่
            </button>
          </div>

          {/* New Ticket Form Modal */}
          {isNewTicketOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 border border-slate-200 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-base">แจ้งซ่อมอุปกรณ์ชำรุด</h3>
                  <button onClick={() => setIsNewTicketOpen(false)} className="text-slate-400">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateTicketSubmit} className="space-y-3.5 mt-4">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">หมวดหมู่อุปกรณ์</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="air">เครื่องปรับอากาศ (แอร์)</option>
                      <option value="plumbing">ระบบประปา / ห้องน้ำ</option>
                      <option value="electrical">ระบบไฟฟ้า / หลอดไฟ</option>
                      <option value="furniture">เฟอร์นิเจอร์ / ประตูหน้าต่าง</option>
                      <option value="other">อื่นๆ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">หัวข้อปัญหาที่พบ</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น แอร์มีน้ำหยด, ฝักบัวรั่วซึม..."
                      value={ticketTitle}
                      onChange={(e) => setTicketTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">รายละเอียดเพิ่มเติม</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="อธิบายอาการ เช่น เปิดแอร์แล้วมีเสียงดัง หรือน้ำหยดทางมุมขวา..."
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">ลิงก์รูปภาพประกอบ (ถ้ามี)</label>
                    <input
                      type="text"
                      placeholder="https://... หรือแนบรูปภาพ"
                      value={ticketImage}
                      onChange={(e) => setTicketImage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsNewTicketOpen(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm"
                    >
                      ส่งใบแจ้งซ่อม
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Past tickets list */}
          <div className="space-y-3">
            {tenantTickets.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                ไม่มีประวัติการแจ้งซ่อมในห้องพักนี้
              </div>
            ) : (
              tenantTickets.map(ticket => (
                <div key={ticket.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-400">{ticket.ticketNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      ticket.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ticket.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ticket.status === 'completed' ? 'ซ่อมเสร็จสิ้น' : ticket.status === 'in_progress' ? 'กำลังซ่อมแซม' : 'รอดำเนินการ'}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{ticket.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{ticket.description}</p>

                  {ticket.notes && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-700 text-[11px]">
                      <strong>ความคืบหน้าจากช่าง:</strong> {ticket.notes}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 pt-1 flex justify-between">
                    <span>แจ้งเมื่อ: {ticket.createdAt}</span>
                    <span>ช่าง: {ticket.assignedTechnician || 'รอจัดสรร'}</span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* TAB 3: DORMITORY RULES & INFO */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900">ข้อมูลและระเบียบการพักอาศัย</h3>
            <p className="text-slate-500 text-xs">{settings.name}</p>
          </div>

          <div className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-2 text-blue-900">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <Wifi className="w-4 h-4 text-blue-600" />
                <span>อินเทอร์เน็ต WiFi ประจำหอพัก</span>
              </div>
              <p>ชื่อเครือข่าย: <strong>GreenVille_WiFi_5G</strong></p>
              <p>รหัสผ่าน: <strong className="font-mono bg-white px-2 py-0.5 rounded text-blue-800">greenville2026</strong></p>
            </div>

            <div className="border border-slate-200 p-4 rounded-2xl space-y-2">
              <span className="font-bold text-slate-800 text-sm block">เวลาทิ้งขยะและจุดพักขยะ</span>
              <p className="text-slate-600">นำขยะใส่ถุงมัดปากให้มิดชิด ทิ้งได้ที่ห้องขยะชั้น 1 ทุกวัน เวลา 06:00 - 09:00 น. และ 18:00 - 21:00 น.</p>
            </div>

            <div className="border border-slate-200 p-4 rounded-2xl space-y-2">
              <span className="font-bold text-slate-800 text-sm block">เวลาเงียบสงบ (Quiet Hours)</span>
              <p className="text-slate-600">งดใช้เสียงดัง รบกวนห้องข้างเคียง หลังเวลา 22:00 น. เป็นต้นไป</p>
            </div>

            <div className="border border-slate-200 p-4 rounded-2xl space-y-2">
              <span className="font-bold text-slate-800 text-sm block">ช่องทางติดต่อเจ้าหน้าที่นิติบุคคล</span>
              <p className="text-slate-600">โทรศัพท์: <strong>{settings.promptpayNumber}</strong></p>
              <p className="text-slate-600">LINE Official: <strong>@greenville_condo</strong></p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
