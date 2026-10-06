import React, { useState } from 'react';
import { 
  Database, 
  Table, 
  Key, 
  Layers, 
  Terminal, 
  Download, 
  CheckCircle, 
  RefreshCw,
  Search,
  ExternalLink,
  Code2,
  FileCode
} from 'lucide-react';
import { Room, Tenant, Contract, MeterReading, Invoice, Payment, MaintenanceTicket, AuditLog } from '../types';

interface DatabaseManagerProps {
  rooms: Room[];
  tenants: Tenant[];
  contracts: Contract[];
  meterReadings: MeterReading[];
  invoices: Invoice[];
  payments: Payment[];
  tickets: MaintenanceTicket[];
  auditLogs: AuditLog[];
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({
  rooms,
  tenants,
  contracts,
  meterReadings,
  invoices,
  payments,
  tickets,
  auditLogs
}) => {
  const [selectedTable, setSelectedTable] = useState<string>('rooms');
  const [sqlQuery, setSqlQuery] = useState<string>("SELECT room_number, room_type, base_price, status FROM rooms WHERE status = 'vacant';");
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'schema' | 'console' | 'migrations'>('schema');

  const tableStats = [
    { name: 'buildings', records: 2, desc: 'ข้อมูลอาคารและจำนวนชั้น' },
    { name: 'rooms', records: rooms.length, desc: 'ห้องพัก ผังห้อง และประเภทห้อง' },
    { name: 'tenants', records: tenants.length, desc: 'ประวัติผู้เช่าและเบอร์ติดต่อ' },
    { name: 'contracts', records: contracts.length, desc: 'สัญญาเช่าและเงินประกัน' },
    { name: 'meter_readings', records: meterReadings.length, desc: 'ประวัติจดมิเตอร์น้ำและไฟ' },
    { name: 'invoices', records: invoices.length, desc: 'ใบแจ้งหนี้ค่าเช่าประจำเดือน' },
    { name: 'invoice_items', records: invoices.reduce((sum, inv) => sum + inv.items.length, 0), desc: 'รายการแจกแจงค่าเช่าในบิล' },
    { name: 'payments', records: payments.length, desc: 'ประวัติการรับชำระและแฮชสลิป' },
    { name: 'receipts', records: payments.filter(p => p.status === 'approved').length, desc: 'ใบเสร็จรับเงินทางการ' },
    { name: 'maintenance_tickets', records: tickets.length, desc: 'งานแจ้งซ่อมบำรุง' },
    { name: 'audit_logs', records: auditLogs.length, desc: 'บันทึกประวัติความปลอดภัย NFR-08' },
  ];

  const tableDefinitions: { [key: string]: { column: string; type: string; key: string; nullable: string; desc: string }[] } = {
    rooms: [
      { column: 'id', type: 'VARCHAR(36)', key: 'PK', nullable: 'NO', desc: 'รหัสเฉพาะของห้อง (UUID)' },
      { column: 'building_id', type: 'VARCHAR(36)', key: 'FK', nullable: 'NO', desc: 'อ้างอิง buildings.id' },
      { column: 'room_number', type: 'VARCHAR(20)', key: 'UK', nullable: 'NO', desc: 'หมายเลขห้อง เช่น 101' },
      { column: 'floor', type: 'INT', key: '-', nullable: 'NO', desc: 'ชั้นที่ตั้งห้อง' },
      { column: 'room_type', type: 'VARCHAR(20)', key: 'CHECK', nullable: 'NO', desc: "fan, air, suite" },
      { column: 'base_price', type: 'DECIMAL(10,2)', key: 'CHECK', nullable: 'NO', desc: 'ค่าเช่าพื้นฐาน (>= 0)' },
      { column: 'status', type: 'VARCHAR(20)', key: 'INDEX', nullable: 'NO', desc: 'vacant, occupied, reserved, maintenance' },
      { column: 'amenities_json', type: 'TEXT', key: '-', nullable: 'YES', desc: 'รายการสิ่งอำนวยความสะดวก (JSON)' },
      { column: 'created_at', type: 'TIMESTAMP', key: '-', nullable: 'NO', desc: 'วันเวลาที่สร้าง' },
      { column: 'updated_at', type: 'TIMESTAMP', key: '-', nullable: 'NO', desc: 'วันเวลาที่แก้ไข' },
    ],
    invoices: [
      { column: 'id', type: 'VARCHAR(36)', key: 'PK', nullable: 'NO', desc: 'รหัสเฉพาะของบิล (UUID)' },
      { column: 'invoice_number', type: 'VARCHAR(50)', key: 'UK', nullable: 'NO', desc: 'เลขที่บิล เช่น INV-202609-101' },
      { column: 'room_id', type: 'VARCHAR(36)', key: 'FK / INDEX', nullable: 'NO', desc: 'อ้างอิง rooms.id' },
      { column: 'tenant_id', type: 'VARCHAR(36)', key: 'FK', nullable: 'NO', desc: 'อ้างอิง tenants.id' },
      { column: 'billing_month', type: 'VARCHAR(7)', key: 'INDEX', nullable: 'NO', desc: 'งวดเดือน เช่น 2026-09' },
      { column: 'total_amount', type: 'DECIMAL(10,2)', key: 'CHECK', nullable: 'NO', desc: 'ยอดสุทธิ (>= 0)' },
      { column: 'status', type: 'VARCHAR(25)', key: 'INDEX', nullable: 'NO', desc: 'unpaid, pending_verification, paid, overdue' },
      { column: 'due_date', type: 'DATE', key: 'INDEX', nullable: 'NO', desc: 'วันครบกำหนดชำระ' },
      { column: 'paid_at', type: 'TIMESTAMP', key: '-', nullable: 'YES', desc: 'วันเวลาที่ชำระเงิน' },
    ],
    payments: [
      { column: 'id', type: 'VARCHAR(36)', key: 'PK', nullable: 'NO', desc: 'รหัสรายการชำระ (UUID)' },
      { column: 'invoice_id', type: 'VARCHAR(36)', key: 'FK', nullable: 'NO', desc: 'อ้างอิง invoices.id' },
      { column: 'room_id', type: 'VARCHAR(36)', key: 'FK', nullable: 'NO', desc: 'อ้างอิง rooms.id' },
      { column: 'amount', type: 'DECIMAL(10,2)', key: 'CHECK', nullable: 'NO', desc: 'ยอดเงินที่โอน (> 0)' },
      { column: 'slip_url', type: 'TEXT', key: '-', nullable: 'NO', desc: 'URL ไฟล์สลิปใน Protected Storage' },
      { column: 'slip_hash', type: 'VARCHAR(64)', key: 'UK / INDEX', nullable: 'NO', desc: 'SHA-256 Checksum ป้องกันสลิปซ้ำ' },
      { column: 'status', type: 'VARCHAR(20)', key: 'INDEX', nullable: 'NO', desc: 'pending, approved, rejected' },
      { column: 'transfer_date', type: 'TIMESTAMP', key: '-', nullable: 'NO', desc: 'เวลาโอนในสลิป' },
    ],
    meter_readings: [
      { column: 'id', type: 'VARCHAR(36)', key: 'PK', nullable: 'NO', desc: 'รหัสมิเตอร์ (UUID)' },
      { column: 'room_id', type: 'VARCHAR(36)', key: 'FK', nullable: 'NO', desc: 'อ้างอิง rooms.id' },
      { column: 'billing_month', type: 'VARCHAR(7)', key: 'UK (Composite)', nullable: 'NO', desc: 'งวดเดือน' },
      { column: 'prev_water', type: 'INT', key: '-', nullable: 'NO', desc: 'เลขมิเตอร์น้ำเดิม' },
      { column: 'curr_water', type: 'INT', key: 'CHECK', nullable: 'NO', desc: 'เลขมิเตอร์น้ำปัจจุบัน' },
      { column: 'water_units', type: 'INT', key: 'CHECK', nullable: 'NO', desc: 'หน่วยน้ำที่ใช้ (>= 0)' },
      { column: 'prev_electric', type: 'INT', key: '-', nullable: 'NO', desc: 'เลขมิเตอร์ไฟเดิม' },
      { column: 'curr_electric', type: 'INT', key: 'CHECK', nullable: 'NO', desc: 'เลขมิเตอร์ไฟปัจจุบัน' },
      { column: 'electric_units', type: 'INT', key: 'CHECK', nullable: 'NO', desc: 'หน่วยไฟที่ใช้ (>= 0)' },
    ]
  };

  const currentColumns = tableDefinitions[selectedTable] || tableDefinitions['rooms'];

  const handleRunQuery = () => {
    // Basic simulator based on mock data
    if (sqlQuery.toLowerCase().includes('vacant')) {
      const result = rooms
        .filter(r => r.status === 'vacant')
        .map(r => ({ room_number: r.number, room_type: r.type, base_price: r.basePrice, status: r.status }));
      setQueryResult(result);
    } else if (sqlQuery.toLowerCase().includes('invoices')) {
      const result = invoices.map(i => ({ invoice_number: i.invoiceNumber, month: i.month, total: i.totalAmount, status: i.status }));
      setQueryResult(result);
    } else {
      const result = rooms.map(r => ({ room_number: r.number, status: r.status, price: r.basePrice }));
      setQueryResult(result);
    }
  };

  const handleExportSQLDump = () => {
    const dump = `-- DormitoryOS Database Dump (Phase 2)
-- Generated at: ${new Date().toISOString()}

-- Active Rooms
${JSON.stringify(rooms, null, 2)}

-- Active Invoices
${JSON.stringify(invoices, null, 2)}
`;
    const blob = new Blob([dump], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dormitory_db_dump_${new Date().toISOString().split('T')[0]}.sql`;
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">การจัดการฐานข้อมูล (Database Engine & Schema)</h2>
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Cloudflare D1 / MySQL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            สถาปัตยกรรมฐานข้อมูลเชิงสัมพันธ์ตามหลัก Skill 04-database-design ครอบคลุม 11 ตารางหลัก
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportSQLDump}
            className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export SQL Dump</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center space-x-2 text-xs font-semibold border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('schema')}
          className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 ${
            activeSubTab === 'schema'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>โครงสร้างตาราง (Data Dictionary)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('console')}
          className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 ${
            activeSubTab === 'console'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>SQL Query Console</span>
        </button>

        <button
          onClick={() => setActiveSubTab('migrations')}
          className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 ${
            activeSubTab === 'migrations'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>ประวัติ Migration ({2} ไฟล์)</span>
        </button>
      </div>

      {/* SUBTAB 1: SCHEMA INSPECTOR */}
      {activeSubTab === 'schema' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Table List Column */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">ตารางทั้งหมด (11 Tables)</h3>
            <div className="space-y-1">
              {tableStats.map(tbl => (
                <button
                  key={tbl.name}
                  onClick={() => setSelectedTable(tbl.name)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition text-left ${
                    selectedTable === tbl.name
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Table className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{tbl.name}</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
                    {tbl.records} แถว
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table Structure View */}
          <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-mono">TABLE: {selectedTable}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tableStats.find(t => t.name === selectedTable)?.desc}
                </p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-mono">
                Engine: InnoDB / SQLite
              </span>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Column Name</th>
                    <th className="py-2.5 px-4">Data Type</th>
                    <th className="py-2.5 px-3 text-center">Key</th>
                    <th className="py-2.5 px-3 text-center">Null</th>
                    <th className="py-2.5 px-4">คำอธิบาย</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {currentColumns.map(col => (
                    <tr key={col.column} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-800">{col.column}</td>
                      <td className="py-2.5 px-4 text-indigo-600">{col.type}</td>
                      <td className="py-2.5 px-3 text-center">
                        {col.key.includes('PK') && <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">PK</span>}
                        {col.key.includes('FK') && <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-bold ml-1">FK</span>}
                        {col.key.includes('UK') && <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold ml-1">UK</span>}
                        {!col.key.includes('PK') && !col.key.includes('FK') && !col.key.includes('UK') && <span className="text-slate-400">-</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500">{col.nullable}</td>
                      <td className="py-2.5 px-4 font-sans text-slate-600">{col.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>Primary Key: <strong>id (UUIDv4)</strong></span>
              <span>Foreign Key Constraints: <strong>ON DELETE RESTRICT / CASCADE</strong></span>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 2: SQL CONSOLE */}
      {activeSubTab === 'console' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">SQL Query Simulator (ทดสอบคำสั่ง Query จริง)</h3>
            <p className="text-slate-500 text-[11px]">รันคำสั่ง SELECT เพื่อตรวจสอบข้อมูลในตาราง</p>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-xl focus:outline-none border border-slate-800"
            />
            <button
              onClick={handleRunQuery}
              className="absolute right-3 bottom-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg shadow transition active:scale-95 flex items-center space-x-1"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Execute SQL</span>
            </button>
          </div>

          {queryResult && (
            <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 flex justify-between">
                <span>ผลลัพธ์การค้นหา ({queryResult.length} แถว):</span>
                <span className="text-[10px] text-emerald-600 font-mono">Status: 200 OK</span>
              </div>
              <div className="overflow-x-auto max-h-60 custom-scrollbar">
                <pre className="p-3 text-[11px] font-mono bg-slate-50 text-slate-800">
                  {JSON.stringify(queryResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: MIGRATIONS */}
      {activeSubTab === 'migrations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">ประวัติการรัน Database Migration (Versioned SQL)</h3>
            <p className="text-slate-500 text-[11px]">จัดการการอัปเดตโครงสร้างฐานข้อมูลแบบอัตโนมัติ</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-mono font-bold text-slate-900 text-xs">0001_initial_schema.sql</div>
                  <div className="text-[11px] text-slate-500">สร้าง 11 ตารางหลัก, Foreign Keys, Unique Indexes, Check Constraints</div>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                Applied
              </span>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-mono font-bold text-slate-900 text-xs">0002_seed_data.sql</div>
                  <div className="text-[11px] text-slate-500">ใส่ข้อมูลตั้งต้น Master Data: อาคาร, ห้องพัก 101-204, ผู้เช่าตัวอย่าง, มิเตอร์</div>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                Applied
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
