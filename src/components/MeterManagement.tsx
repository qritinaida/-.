import React, { useState } from 'react';
import { 
  Zap, 
  Droplets, 
  Save, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Room, Tenant, MeterReading } from '../types';

interface MeterManagementProps {
  rooms: Room[];
  tenants: Tenant[];
  meterReadings: MeterReading[];
  onUpdateMeterReadings: (readings: MeterReading[]) => void;
  onNavigateToBilling: () => void;
}

interface TempMeterRow {
  roomId: string;
  prevWater: number;
  currWater: number;
  prevElectric: number;
  currElectric: number;
  isResetMeter?: boolean;
}

export const MeterManagement: React.FC<MeterManagementProps> = ({
  rooms,
  tenants,
  meterReadings,
  onUpdateMeterReadings,
  onNavigateToBilling
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const occupiedRooms = rooms.filter(r => r.status === 'occupied');

  // Initialize rows from existing readings or default
  const [meterRows, setMeterRows] = useState<{ [roomId: string]: TempMeterRow }>(() => {
    const initial: { [roomId: string]: TempMeterRow } = {};
    occupiedRooms.forEach(room => {
      const existing = meterReadings.find(m => m.roomId === room.id && m.month === '2026-09');
      if (existing) {
        initial[room.id] = {
          roomId: room.id,
          prevWater: existing.prevWater,
          currWater: existing.currWater,
          prevElectric: existing.prevElectric,
          currElectric: existing.currElectric,
        };
      } else {
        // Fallback default
        initial[room.id] = {
          roomId: room.id,
          prevWater: 300,
          currWater: 308,
          prevElectric: 1200,
          currElectric: 1310,
        };
      }
    });
    return initial;
  });

  const handleInputChange = (roomId: string, field: keyof TempMeterRow, value: number) => {
    setMeterRows(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [field]: value
      }
    }));
  };

  const handleSaveAllMeters = () => {
    const newReadings: MeterReading[] = occupiedRooms.map(room => {
      const row = meterRows[room.id] || {
        roomId: room.id,
        prevWater: 0,
        currWater: 0,
        prevElectric: 0,
        currElectric: 0
      };

      const waterUnits = Math.max(0, row.currWater - row.prevWater);
      const electricUnits = Math.max(0, row.currElectric - row.prevElectric);
      const isSpikeWarning = electricUnits > 200 || waterUnits > 20;

      return {
        id: `m-${room.id}-${selectedMonth}`,
        roomId: room.id,
        month: selectedMonth,
        prevWater: Number(row.prevWater),
        currWater: Number(row.currWater),
        waterUnits,
        prevElectric: Number(row.prevElectric),
        currElectric: Number(row.currElectric),
        electricUnits,
        isSpikeWarning,
        warningMessage: isSpikeWarning ? 'หน่วยการใช้งานสูงกว่าค่าเฉลี่ยปกติ กรุณาตรวจซ้ำ' : undefined,
        recordedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        recordedBy: 'Admin สมเกียรติ'
      };
    });

    // Replace or merge with other months
    const otherMonthReadings = meterReadings.filter(m => m.month !== selectedMonth);
    onUpdateMeterReadings([...otherMonthReadings, ...newReadings]);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">บันทึกมิเตอร์น้ำ-ไฟ ประจำเดือน</h2>
            <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              ระบบคำนวณหน่วยอัตโนมัติ
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            เดินจดมิเตอร์หรือกรอกตัวเลขผ่านมือถือ/แท็บเล็ต ระบบจะคำนวณผลต่างทันที
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">รอบเดือน:</span>
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
            onClick={handleSaveAllMeters}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกตัวเลขทั้งหมด</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>บันทึกเลขมิเตอร์สำเร็จ!</strong> ข้อมูลถูกอัปเดตเรียบร้อย พร้อมสำหรับการออกใบแจ้งหนี้</span>
          </div>
          <button
            onClick={onNavigateToBilling}
            className="flex items-center space-x-1 font-bold text-emerald-700 hover:underline text-xs"
          >
            <span>ไปออกบิลรอบนี้ทันที</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      )}

      {/* Meter Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-28">ห้องพัก</th>
                <th className="py-3 px-4 w-40">ผู้เช่า</th>
                
                {/* Water Header */}
                <th className="py-3 px-4 bg-sky-50/60 text-sky-900 border-x border-slate-200/60 text-center" colSpan={3}>
                  <div className="flex items-center justify-center space-x-1">
                    <Droplets className="w-3.5 h-3.5 text-sky-600" />
                    <span>มิเตอร์น้ำประปา (ลบ.ม.)</span>
                  </div>
                </th>

                {/* Electric Header */}
                <th className="py-3 px-4 bg-amber-50/60 text-amber-900 text-center" colSpan={3}>
                  <div className="flex items-center justify-center space-x-1">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>มิเตอร์ไฟฟ้า (หน่วย/kWh)</span>
                  </div>
                </th>

                <th className="py-3 px-4 text-center">สถานะความถูกต้อง</th>
              </tr>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 font-normal">
                <th className="py-1 px-4"></th>
                <th className="py-1 px-4"></th>
                <th className="py-1 px-2 text-center bg-sky-50/40">เลขเดิม</th>
                <th className="py-1 px-2 text-center bg-sky-50/40">เลขปัจจุบัน</th>
                <th className="py-1 px-2 text-center bg-sky-50/40 font-bold text-sky-800">หน่วยใช้</th>
                <th className="py-1 px-2 text-center bg-amber-50/40">เลขเดิม</th>
                <th className="py-1 px-2 text-center bg-amber-50/40">เลขปัจจุบัน</th>
                <th className="py-1 px-2 text-center bg-amber-50/40 font-bold text-amber-800">หน่วยใช้</th>
                <th className="py-1 px-4 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {occupiedRooms.map(room => {
                const tenant = tenants.find(t => t.id === room.currentTenantId);
                const row = meterRows[room.id] || {
                  roomId: room.id,
                  prevWater: 0,
                  currWater: 0,
                  prevElectric: 0,
                  currElectric: 0
                };

                const waterDiff = row.currWater - row.prevWater;
                const electricDiff = row.currElectric - row.prevElectric;

                const hasWaterError = row.currWater < row.prevWater;
                const hasElectricError = row.currElectric < row.prevElectric;
                const isSpike = electricDiff > 200 || waterDiff > 20;

                return (
                  <tr key={room.id} className="hover:bg-slate-50/80 transition">
                    
                    {/* Room */}
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      ห้อง {room.number}
                    </td>

                    {/* Tenant */}
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {tenant?.name || 'ผู้เช่า'}
                    </td>

                    {/* Water: Prev */}
                    <td className="py-3 px-2 text-center bg-sky-50/20 text-slate-500">
                      {row.prevWater}
                    </td>

                    {/* Water: Curr Input */}
                    <td className="py-2 px-2 text-center bg-sky-50/20">
                      <input
                        type="number"
                        value={row.currWater}
                        onChange={(e) => handleInputChange(room.id, 'currWater', Number(e.target.value))}
                        className={`w-20 px-2 py-1 text-center font-bold rounded-lg border text-xs focus:outline-none ${
                          hasWaterError 
                            ? 'border-rose-400 bg-rose-50 text-rose-700 ring-1 ring-rose-400' 
                            : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500'
                        }`}
                      />
                    </td>

                    {/* Water: Calculated Units */}
                    <td className="py-3 px-2 text-center bg-sky-50/20 font-bold text-sky-800">
                      {waterDiff < 0 ? (
                        <span className="text-rose-600 font-bold text-[10px]">ผิดพลาด</span>
                      ) : (
                        `${waterDiff} น.`
                      )}
                    </td>

                    {/* Electric: Prev */}
                    <td className="py-3 px-2 text-center bg-amber-50/20 text-slate-500">
                      {row.prevElectric}
                    </td>

                    {/* Electric: Curr Input */}
                    <td className="py-2 px-2 text-center bg-amber-50/20">
                      <input
                        type="number"
                        value={row.currElectric}
                        onChange={(e) => handleInputChange(room.id, 'currElectric', Number(e.target.value))}
                        className={`w-24 px-2 py-1 text-center font-bold rounded-lg border text-xs focus:outline-none ${
                          hasElectricError 
                            ? 'border-rose-400 bg-rose-50 text-rose-700 ring-1 ring-rose-400' 
                            : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500'
                        }`}
                      />
                    </td>

                    {/* Electric: Calculated Units */}
                    <td className="py-3 px-2 text-center bg-amber-50/20 font-bold text-amber-800">
                      {electricDiff < 0 ? (
                        <span className="text-rose-600 font-bold text-[10px]">ผิดพลาด</span>
                      ) : (
                        `${electricDiff} น.`
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {hasWaterError || hasElectricError ? (
                        <span className="inline-flex items-center text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold border border-rose-300">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          ค่าน้อยกว่าเดิม
                        </span>
                      ) : isSpike ? (
                        <span className="inline-flex items-center text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold border border-amber-300">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          หน่วยสูงผิดปกติ
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          ปกติ
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
