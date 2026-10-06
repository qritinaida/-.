import React, { useState } from 'react';
import { 
  Building, 
  Plus, 
  UserCheck, 
  LogOut, 
  Wrench, 
  Search, 
  Filter, 
  Check, 
  X,
  CreditCard,
  User,
  Phone,
  Calendar,
  Zap,
  Droplets
} from 'lucide-react';
import { Room, Tenant, Contract, RoomStatus, RoomType } from '../types';

interface RoomManagementProps {
  rooms: Room[];
  tenants: Tenant[];
  contracts: Contract[];
  onUpdateRooms: (rooms: Room[]) => void;
  onUpdateTenants: (tenants: Tenant[]) => void;
  onUpdateContracts: (contracts: Contract[]) => void;
}

export const RoomManagement: React.FC<RoomManagementProps> = ({
  rooms,
  tenants,
  contracts,
  onUpdateRooms,
  onUpdateTenants,
  onUpdateContracts
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals state
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [checkInRoom, setCheckInRoom] = useState<Room | null>(null);
  const [checkOutRoom, setCheckOutRoom] = useState<Room | null>(null);

  // New Room Form State
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomBuilding, setNewRoomBuilding] = useState('อาคาร A');
  const [newRoomFloor, setNewRoomFloor] = useState(1);
  const [newRoomType, setNewRoomType] = useState<RoomType>('air');
  const [newRoomPrice, setNewRoomPrice] = useState(4200);

  // Check-in Form State
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantIdCard, setTenantIdCard] = useState('');
  const [depositAmount, setDepositAmount] = useState(8400);
  const [initialWater, setInitialWater] = useState(0);
  const [initialElectric, setInitialElectric] = useState(0);

  // Check-out Form State
  const [damageCost, setDamageCost] = useState(0);
  const [cleaningCost, setCleaningCost] = useState(500);
  const [finalUtilityCost, setFinalUtilityCost] = useState(0);

  const filteredRooms = rooms.filter(room => {
    const matchStatus = selectedStatus === 'all' || room.status === selectedStatus;
    const matchSearch = room.number.includes(searchQuery) || room.building.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber) return;

    const newRoom: Room = {
      id: `r-${newRoomNumber}`,
      number: newRoomNumber,
      building: newRoomBuilding,
      floor: Number(newRoomFloor),
      type: newRoomType,
      basePrice: Number(newRoomPrice),
      status: 'vacant',
      amenities: newRoomType === 'air' 
        ? ['เครื่องปรับอากาศ', 'เครื่องทำน้ำอุ่น', 'เตียง 5 ฟุต', 'ตู้เสื้อผ้า'] 
        : ['พัดลมเพดาน', 'เตียง 5 ฟุต', 'ตู้เสื้อผ้า']
    };

    onUpdateRooms([...rooms, newRoom]);
    setIsAddRoomOpen(false);
    setNewRoomNumber('');
  };

  const handleConfirmCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInRoom || !tenantName || !tenantPhone) return;

    const newTenantId = `t-${Date.now()}`;
    const newTenant: Tenant = {
      id: newTenantId,
      name: tenantName,
      phone: tenantPhone,
      idCard: tenantIdCard || '1-0000-00000-00-0',
      emergencyContact: { name: 'ผู้ติดต่อสำรอง', relation: 'ญาติ', phone: '080-000-0000' }
    };

    const newContract: Contract = {
      id: `c-${Date.now()}`,
      roomId: checkInRoom.id,
      tenantId: newTenantId,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2027-12-31',
      depositAmount: Number(depositAmount),
      monthlyRent: checkInRoom.basePrice,
      waterRate: 18,
      electricRate: 8,
      commonFee: 300,
      status: 'active'
    };

    const updatedRooms = rooms.map(r => 
      r.id === checkInRoom.id 
        ? { ...r, status: 'occupied' as RoomStatus, currentTenantId: newTenantId }
        : r
    );

    onUpdateTenants([...tenants, newTenant]);
    onUpdateContracts([...contracts, newContract]);
    onUpdateRooms(updatedRooms);
    setCheckInRoom(null);
    setTenantName('');
    setTenantPhone('');
    setTenantIdCard('');
  };

  const handleConfirmCheckOut = () => {
    if (!checkOutRoom) return;

    // Update Room status to vacant and clear tenant
    const updatedRooms = rooms.map(r => 
      r.id === checkOutRoom.id 
        ? { ...r, status: 'vacant' as RoomStatus, currentTenantId: undefined }
        : r
    );

    // Terminate Contract
    const updatedContracts = contracts.map(c => 
      c.roomId === checkOutRoom.id && c.status === 'active'
        ? { ...c, status: 'terminated' as const }
        : c
    );

    onUpdateRooms(updatedRooms);
    onUpdateContracts(updatedContracts);
    setCheckOutRoom(null);
    setDamageCost(0);
    setCleaningCost(500);
    setFinalUtilityCost(0);
  };

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'vacant':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">ว่าง (Vacant)</span>;
      case 'occupied':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-300">มีผู้เช่า (Occupied)</span>;
      case 'reserved':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-purple-300">จองแล้ว (Reserved)</span>;
      case 'maintenance':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-300">ปรับปรุง (Maintenance)</span>;
    }
  };

  const getTypeLabel = (type: RoomType) => {
    switch (type) {
      case 'air': return 'ห้องแอร์ (AC)';
      case 'fan': return 'ห้องพัดลม (Fan)';
      case 'suite': return 'ห้องสวีท (Suite)';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search/Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">จัดการข้อมูลห้องพักและสัญญาเช่า</h2>
          <p className="text-xs text-slate-500 mt-0.5">รวมทั้งหมด {rooms.length} ห้องพัก (ผังอาคารและสถานะ)</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาเลขห้อง..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-36 sm:w-48"
            />
          </div>

          <button
            onClick={() => setIsAddRoomOpen(true)}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มห้องพักใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 custom-scrollbar text-xs">
        {[
          { id: 'all', label: 'ทั้งหมด', count: rooms.length },
          { id: 'vacant', label: 'ว่าง (Vacant)', count: rooms.filter(r => r.status === 'vacant').length },
          { id: 'occupied', label: 'มีผู้เช่า (Occupied)', count: rooms.filter(r => r.status === 'occupied').length },
          { id: 'reserved', label: 'จองแล้ว (Reserved)', count: rooms.filter(r => r.status === 'reserved').length },
          { id: 'maintenance', label: 'ซ่อมบำรุง', count: rooms.filter(r => r.status === 'maintenance').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center space-x-1.5 shrink-0 ${
              selectedStatus === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedStatus === tab.id ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredRooms.map(room => {
          const tenant = tenants.find(t => t.id === room.currentTenantId);
          const contract = contracts.find(c => c.roomId === room.id && c.status === 'active');

          return (
            <div
              key={room.id}
              className={`bg-white rounded-2xl border p-5 transition flex flex-col justify-between hover:shadow-md ${
                room.status === 'vacant'
                  ? 'border-emerald-200/80 shadow-emerald-500/5'
                  : room.status === 'maintenance'
                  ? 'border-amber-200/80 shadow-amber-500/5'
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              <div>
                {/* Header: Room Number & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                      ห้อง {room.number}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">ชั้น {room.floor} ({room.building})</span>
                  </div>
                  {getStatusBadge(room.status)}
                </div>

                {/* Room Type & Base Price */}
                <div className="mt-3 flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">{getTypeLabel(room.type)}</span>
                  <span className="text-blue-600 font-bold text-sm">
                    ฿{room.basePrice.toLocaleString()}<span className="text-[10px] text-slate-400 font-normal">/ด.</span>
                  </span>
                </div>

                {/* Tenant Info if Occupied */}
                {room.status === 'occupied' && tenant ? (
                  <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center text-slate-700 font-semibold">
                      <User className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                      <span>{tenant.name}</span>
                    </div>
                    <div className="flex items-center text-slate-500 text-[11px]">
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      <span>{tenant.phone}</span>
                    </div>
                    {contract && (
                      <div className="text-[10px] text-slate-400 pt-1">
                        เงินประกัน: ฿{contract.depositAmount.toLocaleString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-slate-400 italic py-3 text-center bg-slate-50/60 rounded-xl">
                    {room.status === 'vacant' ? 'ห้องว่าง พร้อมให้เข้าพัก' : 'ไม่มีผู้เช่าในห้องนี้'}
                  </div>
                )}

                {/* Amenities Badges */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {room.amenities.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      {item}
                    </span>
                  ))}
                  {room.amenities.length > 3 && (
                    <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-md">
                      +{room.amenities.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons based on Status */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {room.status === 'vacant' && (
                  <button
                    onClick={() => {
                      setCheckInRoom(room);
                      setDepositAmount(room.basePrice * 2);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>เช็คอินผู้เช่า (Check-in)</span>
                  </button>
                )}

                {room.status === 'occupied' && (
                  <button
                    onClick={() => setCheckOutRoom(room)}
                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold py-2 px-3 rounded-xl border border-rose-200 transition flex items-center justify-center space-x-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>แจ้งย้ายออก (Check-out)</span>
                  </button>
                )}

                {room.status === 'maintenance' && (
                  <button
                    onClick={() => {
                      const updated = rooms.map(r => r.id === room.id ? { ...r, status: 'vacant' as RoomStatus } : r);
                      onUpdateRooms(updated);
                    }}
                    className="w-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold py-2 px-3 rounded-xl border border-amber-200 transition flex items-center justify-center space-x-1.5"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>ตรวจรับเสร็จ (เปิดให้เช่า)</span>
                  </button>
                )}

                {room.status === 'reserved' && (
                  <button
                    onClick={() => {
                      const updated = rooms.map(r => r.id === room.id ? { ...r, status: 'vacant' as RoomStatus } : r);
                      onUpdateRooms(updated);
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-3 rounded-xl transition"
                  >
                    ยกเลิกการจอง
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* MODAL 1: Add Room Modal */}
      {isAddRoomOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">เพิ่มห้องพักใหม่</h3>
              <button onClick={() => setIsAddRoomOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoom} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">เลขห้องพัก (เช่น 301)</label>
                <input
                  type="text"
                  required
                  placeholder="301"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">อาคาร</label>
                  <select
                    value={newRoomBuilding}
                    onChange={(e) => setNewRoomBuilding(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="อาคาร A">อาคาร A</option>
                    <option value="อาคาร B">อาคาร B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">ชั้น</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newRoomFloor}
                    onChange={(e) => setNewRoomFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">ประเภทห้อง</label>
                  <select
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value as RoomType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="air">ห้องแอร์ (AC)</option>
                    <option value="fan">ห้องพัดลม (Fan)</option>
                    <option value="suite">ห้องสวีท (Suite)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">ราคาค่าเช่า (บาท/ด.)</label>
                  <input
                    type="number"
                    step={100}
                    value={newRoomPrice}
                    onChange={(e) => setNewRoomPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddRoomOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-sm"
                >
                  บันทึกห้องใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Check-in Tenant Modal */}
      {checkInRoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">ทำสัญญาเช่าและเช็คอิน (Check-in)</h3>
                <p className="text-xs text-blue-600 font-semibold">ห้องพัก {checkInRoom.number} ({checkInRoom.building})</p>
              </div>
              <button onClick={() => setCheckInRoom(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCheckIn} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">ชื่อ-นามสกุล ผู้เช่า *</label>
                  <input
                    type="text"
                    required
                    placeholder="นายอนุชา รักษ์ดี"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">เบอร์โทรศัพท์ *</label>
                  <input
                    type="tel"
                    required
                    placeholder="081-234-5678"
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">เลขประจำตัวประชาชน (13 หลัก)</label>
                <input
                  type="text"
                  placeholder="1-2345-67890-12-3"
                  value={tenantIdCard}
                  onChange={(e) => setTenantIdCard(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">ค่าเช่ารายเดือน (บาท)</label>
                  <input
                    type="number"
                    disabled
                    value={checkInRoom.basePrice}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">เงินประกันสัญญาเช่า (มัดจำ)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-blue-600"
                  />
                </div>
              </div>

              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 space-y-2">
                <span className="font-bold text-blue-900 block text-xs">บันทึกเลขมิเตอร์ตั้งต้นในวันเข้าพัก:</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-600">มิเตอร์น้ำเริ่มต้น:</span>
                    <input
                      type="number"
                      value={initialWater}
                      onChange={(e) => setInitialWater(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-600">มิเตอร์ไฟเริ่มต้น:</span>
                    <input
                      type="number"
                      value={initialElectric}
                      onChange={(e) => setInitialElectric(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCheckInRoom(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-sm"
                >
                  ยืนยันเช็คอินและเปิดสัญญา
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Check-out Tenant Modal */}
      {checkOutRoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">ทำรายการย้ายออก (Check-out)</h3>
                <p className="text-xs text-rose-600 font-semibold">ห้อง {checkOutRoom.number}</p>
              </div>
              <button onClick={() => setCheckOutRoom(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const contract = contracts.find(c => c.roomId === checkOutRoom.id && c.status === 'active');
              const deposit = contract ? contract.depositAmount : 0;
              const totalDeductions = Number(damageCost) + Number(cleaningCost) + Number(finalUtilityCost);
              const netRefund = Math.max(0, deposit - totalDeductions);

              return (
                <div className="space-y-4 mt-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center text-slate-700 font-semibold">
                      <span>ยอดเงินประกันที่วางไว้เดิม:</span>
                      <span className="text-sm font-bold text-slate-900">฿{deposit.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="font-bold text-slate-700 block">รายการหักค่าใช้จ่าย ณ วันย้ายออก:</span>

                    <div>
                      <label className="block text-slate-500 mb-1">ค่าน้ำ-ไฟงวดสุดท้าย (บาท):</label>
                      <input
                        type="number"
                        value={finalUtilityCost}
                        onChange={(e) => setFinalUtilityCost(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-1">ค่าทำความสะอาดห้องพัก (บาท):</label>
                      <input
                        type="number"
                        value={cleaningCost}
                        onChange={(e) => setCleaningCost(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 mb-1">ค่าซ่อมแซมความเสียหาย (ถ้ามี):</label>
                      <input
                        type="number"
                        value={damageCost}
                        onChange={(e) => setDamageCost(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-emerald-900">ยอดเงินประกันสุทธิที่ต้องคืน:</span>
                      <span className="text-xl font-extrabold text-emerald-600">฿{netRefund.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-1">
                      (เงินประกัน ฿{deposit.toLocaleString()} - หักรวม ฿{totalDeductions.toLocaleString()})
                    </p>
                  </div>

                  <div className="pt-3 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setCheckOutRoom(null)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCheckOut}
                      className="px-5 py-2 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 shadow-sm"
                    >
                      ยืนยันคืนห้องและปิดสัญญา
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
};
