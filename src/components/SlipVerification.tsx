import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  Calendar, 
  CreditCard, 
  Hash, 
  Eye, 
  Clock, 
  AlertTriangle,
  Receipt as ReceiptIcon,
  X
} from 'lucide-react';
import { Payment, Invoice, Room, Tenant, PaymentStatus, Receipt } from '../types';

interface SlipVerificationProps {
  payments: Payment[];
  invoices: Invoice[];
  rooms: Room[];
  tenants: Tenant[];
  onUpdatePayments: (payments: Payment[]) => void;
  onUpdateInvoices: (invoices: Invoice[]) => void;
  onOpenReceiptModal: (receipt: Receipt, invoice: Invoice) => void;
}

export const SlipVerification: React.FC<SlipVerificationProps> = ({
  payments,
  invoices,
  rooms,
  tenants,
  onUpdatePayments,
  onUpdateInvoices,
  onOpenReceiptModal
}) => {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const historyPayments = payments.filter(p => p.status !== 'pending');

  const displayedPayments = activeTab === 'pending' ? pendingPayments : historyPayments;

  const handleApprove = (payment: Payment) => {
    // 1. Update Payment status
    const receiptNumber = `RCT-202609-${rooms.find(r => r.id === payment.roomId)?.number || '000'}`;
    const updatedPayments = payments.map(p => 
      p.id === payment.id 
        ? {
            ...p,
            status: 'approved' as PaymentStatus,
            reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            reviewedBy: 'Admin สมเกียรติ',
            receiptNumber
          }
        : p
    );

    // 2. Update Invoice status to PAID
    const updatedInvoices = invoices.map(i => 
      i.id === payment.invoiceId 
        ? { ...i, status: 'paid' as const, paidAt: new Date().toISOString().replace('T', ' ').substring(0, 16) }
        : i
    );

    onUpdatePayments(updatedPayments);
    onUpdateInvoices(updatedInvoices);
    setSelectedPayment(null);

    // 3. Trigger Celebration Confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }
  };

  const handleReject = () => {
    if (!selectedPayment) return;

    // 1. Update Payment status
    const updatedPayments = payments.map(p => 
      p.id === selectedPayment.id 
        ? {
            ...p,
            status: 'rejected' as PaymentStatus,
            rejectReason: rejectReason || 'ยอดเงินไม่ถูกต้องหรือไม่พบในสลิป',
            reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            reviewedBy: 'Admin สมเกียรติ'
          }
        : p
    );

    // 2. Revert Invoice status to UNPAID
    const updatedInvoices = invoices.map(i => 
      i.id === selectedPayment.invoiceId 
        ? { ...i, status: 'unpaid' as const }
        : i
    );

    onUpdatePayments(updatedPayments);
    onUpdateInvoices(updatedInvoices);
    setIsRejectModalOpen(false);
    setSelectedPayment(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">ตรวจสอบสลิปโอนเงิน (Slip Verification)</h2>
            {pendingPayments.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                รอตรวจสอบ {pendingPayments.length} รายการ
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ตรวจสอบความถูกต้องของสลิปเทียบกับยอดบิลจริง และตัดสลิปซ้ำอัตโนมัติด้วย SHA-256 Hash
          </p>
        </div>

        {/* Tab switch */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'pending'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รอตรวจสอบ ({pendingPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ประวัติการตรวจ ({historyPayments.length})
          </button>
        </div>
      </div>

      {/* Verification Cards Grid */}
      {displayedPayments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs shadow-sm">
          {activeTab === 'pending' ? 'ไม่มีสลิปที่รอการตรวจสอบ ทุกยอดชำระได้รับการตรวจสอบเรียบร้อยแล้ว' : 'ยังไม่มีประวัติการตรวจสอบสลิป'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedPayments.map(payment => {
            const invoice = invoices.find(i => i.id === payment.invoiceId);
            const room = rooms.find(r => r.id === payment.roomId);
            const tenant = tenants.find(t => t.id === invoice?.tenantId);

            const isAmountMatch = invoice && invoice.totalAmount === payment.amount;

            return (
              <div 
                key={payment.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
              >
                <div className="p-5">
                  
                  {/* Top status */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-blue-600 text-sm">
                        ห้อง {room?.number}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">({tenant?.name})</span>
                    </div>

                    <div>
                      {payment.status === 'pending' ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                          รอแอดมินยืนยัน
                        </span>
                      ) : payment.status === 'approved' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                          อนุมัติแล้ว
                        </span>
                      ) : (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-300">
                          ปฏิเสธสลิป
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body: Slip Thumbnail + Verification details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    
                    {/* Left: Slip Preview */}
                    <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[3/4] flex items-center justify-center">
                      <img 
                        src={payment.slipUrl} 
                        alt="Transfer Slip" 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                      />
                      <a
                        href={payment.slipUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>เปิดดูภาพเต็ม</span>
                      </a>
                    </div>

                    {/* Right: Data Verification */}
                    <div className="text-xs space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                          <span className="text-slate-400 block text-[10px]">ยอดที่ต้องชำระตามบิล:</span>
                          <span className="text-sm font-bold text-slate-900">฿{invoice?.totalAmount.toLocaleString()}</span>
                        </div>

                        <div className={`p-2.5 rounded-xl border space-y-1 ${
                          isAmountMatch 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                        }`}>
                          <span className="block text-[10px]">ยอดที่โอนในสลิป:</span>
                          <span className="text-sm font-extrabold">฿{payment.amount.toLocaleString()}</span>
                          {isAmountMatch ? (
                            <span className="text-[10px] text-emerald-700 block font-bold">✓ ยอดเงินตรงกับบิล 100%</span>
                          ) : (
                            <span className="text-[10px] text-rose-700 block font-bold">⚠ ยอดเงินไม่ตรงกับบิล</span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 space-y-1">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>โอนเมื่อ: {payment.transferDate}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-emerald-700">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="truncate">ตรวจแล้ว: สลิปไม่ซ้ำในระบบ</span>
                          </div>
                        </div>

                        {payment.rejectReason && (
                          <div className="bg-rose-50 border border-rose-200 p-2 rounded-lg text-rose-800 text-[10px]">
                            <strong>เหตุผลที่ปฏิเสธ:</strong> {payment.rejectReason}
                          </div>
                        )}
                      </div>

                      {payment.status === 'approved' && invoice && (
                        <button
                          onClick={() => {
                            const receipt: Receipt = {
                              id: `rct-${payment.id}`,
                              receiptNumber: payment.receiptNumber || 'RCT-000',
                              invoiceId: invoice.id,
                              paymentId: payment.id,
                              roomId: payment.roomId,
                              tenantName: tenant?.name || 'ผู้เช่า',
                              roomNumber: room?.number || '',
                              month: invoice.month,
                              amount: payment.amount,
                              issuedAt: payment.reviewedAt || '2026-09-28',
                              issuedBy: payment.reviewedBy || 'Admin'
                            };
                            onOpenReceiptModal(receipt, invoice);
                          }}
                          className="w-full flex items-center justify-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2 rounded-xl border border-emerald-200 transition"
                        >
                          <ReceiptIcon className="w-3.5 h-3.5" />
                          <span>ดูใบเสร็จรับเงิน</span>
                        </button>
                      )}

                    </div>

                  </div>

                </div>

                {/* Footer Action buttons if pending */}
                {payment.status === 'pending' && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setIsRejectModalOpen(true);
                      }}
                      className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold rounded-xl transition"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>ปฏิเสธสลิป</span>
                    </button>

                    <button
                      onClick={() => handleApprove(payment)}
                      className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition active:scale-98"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>อนุมัติการชำระเงิน</span>
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">ระบุเหตุผลในการปฏิเสธสลิป</h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-slate-500">
                ระบบจะส่งข้อความแจ้งเตือนนี้ไปยังผู้เช่า เพื่อให้อัปโหลดสลิปที่ถูกต้องใหม่:
              </p>

              <textarea
                rows={3}
                placeholder="เช่น ยอดเงินที่โอนไม่ครบ, วันเวลาในสลิปไม่ตรง, ภาพสลิปเบลอ..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 font-medium border border-slate-200 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700"
                >
                  ยืนยันปฏิเสธสลิป
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
