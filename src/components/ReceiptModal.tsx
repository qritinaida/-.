import React from 'react';
import { X, Printer, CheckCircle2, Building, Calendar, Hash } from 'lucide-react';
import { Receipt, Invoice, DormitorySettings } from '../types';

interface ReceiptModalProps {
  receipt: Receipt;
  invoice?: Invoice;
  settings: DormitorySettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  invoice,
  settings,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-2 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-slate-800 text-sm">ใบเสร็จรับเงินอย่างเป็นทางการ (Official Receipt)</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg border border-slate-200 transition"
              title="พิมพ์เอกสาร / บันทึก PDF"
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

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-8 text-slate-800 space-y-6">
          
          {/* Dorm Header */}
          <div className="text-center pb-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">{settings.name}</h2>
            <p className="text-xs text-slate-500 mt-1">{settings.address}</p>
            <p className="text-xs text-slate-500">โทร / พร้อมเพย์: {settings.promptpayNumber}</p>
            <div className="inline-block mt-3 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full">
              ใบเสร็จรับเงิน / ต้นฉบับ
            </div>
          </div>

          {/* Receipt Meta */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 block">เลขที่ใบเสร็จ:</span>
              <span className="font-bold text-slate-900">{receipt.receiptNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block">วันที่ออกเอกสาร:</span>
              <span className="font-semibold text-slate-800">{receipt.issuedAt}</span>
            </div>
            <div>
              <span className="text-slate-400 block">ห้องพัก:</span>
              <span className="font-bold text-blue-600 text-sm">ห้อง {receipt.roomNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block">ชื่อผู้เช่า:</span>
              <span className="font-semibold text-slate-800">{receipt.tenantName}</span>
            </div>
          </div>

          {/* Item Breakdown */}
          {invoice && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">รายการ</th>
                    <th className="py-2.5 px-3 text-right">จำนวนเงิน (บาท)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3">{item.description}</td>
                      <td className="py-2.5 px-3 text-right font-medium">{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                  <tr>
                    <td className="py-3 px-3 text-slate-900">ยอดรวมทั้งสิ้นที่ชำระแล้ว:</td>
                    <td className="py-3 px-3 text-right text-base text-emerald-600">
                      ฿{receipt.amount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs text-slate-600 border-t border-dashed border-slate-200">
            <div>
              <div className="h-12 border-b border-slate-300 mx-auto w-32"></div>
              <p className="mt-2 font-medium">({receipt.tenantName})</p>
              <p className="text-[10px] text-slate-400">ผู้ชำระเงิน</p>
            </div>
            <div>
              <div className="h-12 border-b border-slate-300 mx-auto w-32 flex items-center justify-center font-serif text-blue-700 italic">
                {receipt.issuedBy}
              </div>
              <p className="mt-2 font-medium">({receipt.issuedBy})</p>
              <p className="text-[10px] text-slate-400">ผู้รับเงิน / เจ้าหน้าที่การเงิน</p>
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-400">
            * เอกสารนี้สร้างขึ้นโดยระบบ DormitoryOS ถือเป็นหลักฐานการชำระเงินอย่างเป็นทางการ *
          </p>

        </div>

      </div>
    </div>
  );
};
