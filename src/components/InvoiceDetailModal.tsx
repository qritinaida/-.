import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Printer, QrCode, AlertCircle, Calendar, Hash, FileText } from 'lucide-react';
import { Invoice, Room, Tenant, DormitorySettings } from '../types';
import { generatePromptPayPayload } from '../utils/promptpay';

interface InvoiceDetailModalProps {
  invoice: Invoice;
  room?: Room;
  tenant?: Tenant;
  settings: DormitorySettings;
  onClose: () => void;
  onPayWithSlip?: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  room,
  tenant,
  settings,
  onClose,
  onPayWithSlip
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const payload = generatePromptPayPayload(settings.promptpayNumber, invoice.totalAmount);
    QRCode.toDataURL(payload, {
      width: 240,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR Gen error:', err));
  }, [invoice, settings]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = () => {
    switch (invoice.status) {
      case 'paid':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs px-2.5 py-1 rounded-full font-bold">ชำระแล้ว (Paid)</span>;
      case 'pending_verification':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs px-2.5 py-1 rounded-full font-bold">รอตรวจสอบสลิป</span>;
      case 'overdue':
        return <span className="bg-rose-100 text-rose-800 border border-rose-300 text-xs px-2.5 py-1 rounded-full font-bold">เกินกำหนดชำระ (Overdue)</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 text-xs px-2.5 py-1 rounded-full font-bold">รอชำระ (Unpaid)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-800 text-sm">ใบแจ้งหนี้ / ใบเรียกเก็บเงินค่าเช่า</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg border border-slate-200 transition"
              title="พิมพ์ใบแจ้งหนี้"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-6 text-slate-800 space-y-6">
          
          {/* Top Brand & Status */}
          <div className="flex justify-between items-start pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{settings.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{settings.address}</p>
            </div>
            <div className="text-right">
              {getStatusBadge()}
              <p className="text-xs text-slate-400 mt-1">งวด: {invoice.month}</p>
            </div>
          </div>

          {/* Meta Details */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 block">เลขที่ใบแจ้งหนี้:</span>
              <span className="font-bold text-slate-900 text-sm">{invoice.invoiceNumber}</span>
              <span className="text-slate-400 block mt-2">ห้องพัก:</span>
              <span className="font-bold text-blue-600 text-sm">ห้อง {room?.number || invoice.roomId}</span>
            </div>
            <div>
              <span className="text-slate-400 block">กำหนดชำระ (Due Date):</span>
              <span className="font-bold text-rose-600 text-sm">{invoice.dueDate}</span>
              <span className="text-slate-400 block mt-2">ผู้เช่า:</span>
              <span className="font-semibold text-slate-800">{tenant?.name || 'ผู้พักอาศัย'}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">รายการค่าใช้จ่าย</th>
                  <th className="py-2.5 px-3 text-right">จำนวนเงิน (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">{item.description}</div>
                      {item.units && item.unitPrice && (
                        <div className="text-[11px] text-slate-400">
                          {item.units} หน่วย × {item.unitPrice} บ.
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                      ฿{item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                <tr>
                  <td className="py-3 px-3 text-slate-900 text-sm">ยอดเงินที่ต้องชำระสุทธิ:</td>
                  <td className="py-3 px-3 text-right text-lg text-blue-600">
                    ฿{invoice.totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* PromptPay QR Code Payment Section */}
          {invoice.status !== 'paid' && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 text-center">
              <div className="flex items-center justify-center space-x-1.5 text-blue-900 font-bold text-xs mb-2">
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>สแกนชำระผ่าน PromptPay (ยอดเงิน ฿{invoice.totalAmount.toLocaleString()})</span>
              </div>
              
              {qrDataUrl ? (
                <div className="inline-block bg-white p-2.5 rounded-xl shadow-md border border-blue-100">
                  <img src={qrDataUrl} alt="PromptPay QR Code" className="w-40 h-40 mx-auto" />
                  <p className="text-[10px] text-slate-500 font-medium mt-1">พร้อมเพย์: {settings.promptpayNumber}</p>
                  <p className="text-[10px] text-slate-400">ชื่อบัญชี: {settings.promptpayName}</p>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-xs text-slate-400">
                  กำลังสร้าง QR Code...
                </div>
              )}

              {onPayWithSlip && (
                <div className="mt-3">
                  <button
                    onClick={onPayWithSlip}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-blue-500/20 text-xs transition active:scale-98"
                  >
                    ชำระเงินและแนบสลิปโอนเงิน (Upload Transfer Slip)
                  </button>
                </div>
              )}
            </div>
          )}

          {invoice.status === 'paid' && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-800 text-xs font-medium">
              ✓ ใบแจ้งหนี้นี้ได้รับการชำระเงินเรียบร้อยแล้วเมื่อ {invoice.paidAt || 'วันที่ผ่านมา'}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
