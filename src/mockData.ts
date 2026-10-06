import { Room, Tenant, Contract, MeterReading, Invoice, Payment, MaintenanceTicket, DormitorySettings } from './types';

export const initialSettings: DormitorySettings = {
  name: 'หอพักกรีนวิลล์ คอนโดมิเนียม & อพาร์ตเมนต์',
  address: '128/9 หมู่ 4 ถ.สุขุมวิท ต.เสม็ด อ.เมือง จ.ชลบุรี 20000',
  promptpayNumber: '0812345678',
  promptpayName: 'บจก. กรีนวิลล์ พร็อพเพอร์ตี้',
  defaultWaterRate: 18, // 18 THB per unit
  defaultElectricRate: 8, // 8 THB per unit
  defaultCommonFee: 300, // 300 THB/month
  dueDayOfMonth: 5,
  gracePeriodDays: 2,
  lateFeePerDay: 100,
};

export const initialTenants: Tenant[] = [
  {
    id: 't-1',
    name: 'นายสมชาย ใจดี',
    phone: '089-111-2233',
    idCard: '1-1002-00345-67-8',
    email: 'somchai@example.com',
    lineId: 'somchai_jd',
    emergencyContact: { name: 'นางสมศรี ใจดี', relation: 'มารดา', phone: '081-999-8877' }
  },
  {
    id: 't-2',
    name: 'น.ส.วิภาวรรณ สุขสมบัติ',
    phone: '086-555-4321',
    idCard: '3-1005-00123-45-1',
    email: 'wipawan.s@example.com',
    lineId: 'wipa_w',
    emergencyContact: { name: 'นายไพโรจน์ สุขสมบัติ', relation: 'บิดา', phone: '089-888-7766' }
  },
  {
    id: 't-3',
    name: 'นายกิตติคุณ ศรีสวัสดิ์',
    phone: '082-333-7890',
    idCard: '1-1020-00890-12-3',
    email: 'kittikun@example.com',
    lineId: 'kitti_s',
    emergencyContact: { name: 'น.ส.กานดา ศรีสวัสดิ์', relation: 'พี่สาว', phone: '084-222-3344' }
  },
  {
    id: 't-4',
    name: 'น.ส.แพรวา อมรเดช',
    phone: '087-444-9012',
    idCard: '5-1033-00441-22-9',
    email: 'praewa@example.com',
    lineId: 'praewa_a',
    emergencyContact: { name: 'นางอำไพ อมรเดช', relation: 'มารดา', phone: '081-333-1122' }
  }
];

export const initialRooms: Room[] = [
  {
    id: 'r-101',
    number: '101',
    building: 'อาคาร A',
    floor: 1,
    type: 'air',
    basePrice: 4200,
    status: 'occupied',
    amenities: ['เครื่องปรับอากาศ', 'เครื่องทำน้ำอุ่น', 'เตียง 5 ฟุต', 'ตู้เสื้อผ้า', 'WiFi'],
    currentTenantId: 't-1'
  },
  {
    id: 'r-102',
    number: '102',
    building: 'อาคาร A',
    floor: 1,
    type: 'air',
    basePrice: 4200,
    status: 'occupied',
    amenities: ['เครื่องปรับอากาศ', 'เครื่องทำน้ำอุ่น', 'เตียง 5 ฟุต', 'ตู้เสื้อผ้า', 'WiFi'],
    currentTenantId: 't-2'
  },
  {
    id: 'r-103',
    number: '103',
    building: 'อาคาร A',
    floor: 1,
    type: 'fan',
    basePrice: 3200,
    status: 'vacant',
    amenities: ['พัดลมเพดาน', 'เตียง 5 ฟุต', 'ตู้เสื้อผ้า', 'ระเบียง']
  },
  {
    id: 'r-104',
    number: '104',
    building: 'อาคาร A',
    floor: 1,
    type: 'air',
    basePrice: 4200,
    status: 'maintenance',
    amenities: ['เครื่องปรับอากาศ', 'เครื่องทำน้ำอุ่น', 'เตียง 5 ฟุต', 'ตู้เสื้อผ้า']
  },
  {
    id: 'r-201',
    number: '201',
    building: 'อาคาร A',
    floor: 2,
    type: 'air',
    basePrice: 4500,
    status: 'occupied',
    amenities: ['เครื่องปรับอากาศ', 'เครื่องทำน้ำอุ่น', 'เตียง 6 ฟุต', 'ตู้เย็น', 'WiFi'],
    currentTenantId: 't-3'
  },
  {
    id: 'r-202',
    number: '202',
    building: 'อาคาร A',
    floor: 2,
    type: 'air',
    basePrice: 4500,
    status: 'occupied',
    amenities: ['เครื่องปรับอากาศ', 'เครื่องทำน้ำอุ่น', 'เตียง 6 ฟุต', 'ตู้เย็น', 'ระเบียงชมวิว'],
    currentTenantId: 't-4'
  },
  {
    id: 'r-203',
    number: '203',
    building: 'อาคาร A',
    floor: 2,
    type: 'suite',
    basePrice: 5800,
    status: 'vacant',
    amenities: ['ห้องสวีท 1 ห้องนอน 1 ห้องนั่งเล่น', 'แอร์ 2 เครื่อง', 'ไมโครเวฟ', 'สมาร์ตทีวี 43 นิ้ว', 'โซฟา']
  },
  {
    id: 'r-204',
    number: '204',
    building: 'อาคาร A',
    floor: 2,
    type: 'fan',
    basePrice: 3500,
    status: 'reserved',
    amenities: ['พัดลมเพดาน', 'เตียง 5 ฟุต', 'ตู้เสื้อผ้า', 'ระเบียง']
  }
];

export const initialContracts: Contract[] = [
  {
    id: 'c-1',
    roomId: 'r-101',
    tenantId: 't-1',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    depositAmount: 8400,
    monthlyRent: 4200,
    waterRate: 18,
    electricRate: 8,
    commonFee: 300,
    status: 'active'
  },
  {
    id: 'c-2',
    roomId: 'r-102',
    tenantId: 't-2',
    startDate: '2026-03-01',
    endDate: '2027-02-28',
    depositAmount: 8400,
    monthlyRent: 4200,
    waterRate: 18,
    electricRate: 8,
    commonFee: 300,
    status: 'active'
  },
  {
    id: 'c-3',
    roomId: 'r-201',
    tenantId: 't-3',
    startDate: '2026-02-15',
    endDate: '2027-02-14',
    depositAmount: 9000,
    monthlyRent: 4500,
    waterRate: 18,
    electricRate: 8,
    commonFee: 300,
    status: 'active'
  },
  {
    id: 'c-4',
    roomId: 'r-202',
    tenantId: 't-4',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    depositAmount: 9000,
    monthlyRent: 4500,
    waterRate: 18,
    electricRate: 8,
    commonFee: 300,
    status: 'active'
  }
];

export const initialMeterReadings: MeterReading[] = [
  {
    id: 'm-101-202609',
    roomId: 'r-101',
    month: '2026-09',
    prevWater: 310,
    currWater: 318,
    waterUnits: 8,
    prevElectric: 1420,
    currElectric: 1530,
    electricUnits: 110,
    recordedAt: '2026-09-25 10:30',
    recordedBy: 'Admin สมเกียรติ'
  },
  {
    id: 'm-102-202609',
    roomId: 'r-102',
    month: '2026-09',
    prevWater: 245,
    currWater: 251,
    waterUnits: 6,
    prevElectric: 980,
    currElectric: 1075,
    electricUnits: 95,
    recordedAt: '2026-09-25 10:45',
    recordedBy: 'Admin สมเกียรติ'
  },
  {
    id: 'm-201-202609',
    roomId: 'r-201',
    month: '2026-09',
    prevWater: 412,
    currWater: 422,
    waterUnits: 10,
    prevElectric: 2100,
    currElectric: 2260,
    electricUnits: 160,
    recordedAt: '2026-09-25 11:00',
    recordedBy: 'Admin สมเกียรติ'
  },
  {
    id: 'm-202-202609',
    roomId: 'r-202',
    month: '2026-09',
    prevWater: 180,
    currWater: 187,
    waterUnits: 7,
    prevElectric: 1250,
    currElectric: 1385,
    electricUnits: 135,
    recordedAt: '2026-09-25 11:15',
    recordedBy: 'Admin สมเกียรติ'
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-101-202609',
    invoiceNumber: 'INV-202609-101',
    roomId: 'r-101',
    tenantId: 't-1',
    month: '2026-09',
    totalAmount: 5524,
    status: 'unpaid',
    dueDate: '2026-10-05',
    promptpayNumber: '0812345678',
    items: [
      { id: 'item-1', description: 'ค่าเช่าห้องพัก (ห้อง 101)', amount: 4200 },
      { id: 'item-2', description: 'ค่าน้ำประปา (8 หน่วย @ 18 บ.)', amount: 144, units: 8, unitPrice: 18 },
      { id: 'item-3', description: 'ค่าไฟฟ้า (110 หน่วย @ 8 บ.)', amount: 880, units: 110, unitPrice: 8 },
      { id: 'item-4', description: 'ค่าบริการส่วนกลางและอินเทอร์เน็ต', amount: 300 }
    ]
  },
  {
    id: 'inv-102-202609',
    invoiceNumber: 'INV-202609-102',
    roomId: 'r-102',
    tenantId: 't-2',
    month: '2026-09',
    totalAmount: 5368,
    status: 'pending_verification',
    dueDate: '2026-10-05',
    promptpayNumber: '0812345678',
    items: [
      { id: 'item-1', description: 'ค่าเช่าห้องพัก (ห้อง 102)', amount: 4200 },
      { id: 'item-2', description: 'ค่าน้ำประปา (6 หน่วย @ 18 บ.)', amount: 108, units: 6, unitPrice: 18 },
      { id: 'item-3', description: 'ค่าไฟฟ้า (95 หน่วย @ 8 บ.)', amount: 760, units: 95, unitPrice: 8 },
      { id: 'item-4', description: 'ค่าบริการส่วนกลางและอินเทอร์เน็ต', amount: 300 }
    ]
  },
  {
    id: 'inv-201-202609',
    invoiceNumber: 'INV-202609-201',
    roomId: 'r-201',
    tenantId: 't-3',
    month: '2026-09',
    totalAmount: 6260,
    status: 'paid',
    dueDate: '2026-10-05',
    paidAt: '2026-09-28 14:20',
    promptpayNumber: '0812345678',
    items: [
      { id: 'item-1', description: 'ค่าเช่าห้องพัก (ห้อง 201)', amount: 4500 },
      { id: 'item-2', description: 'ค่าน้ำประปา (10 หน่วย @ 18 บ.)', amount: 180, units: 10, unitPrice: 18 },
      { id: 'item-3', description: 'ค่าไฟฟ้า (160 หน่วย @ 8 บ.)', amount: 1280, units: 160, unitPrice: 8 },
      { id: 'item-4', description: 'ค่าบริการส่วนกลางและอินเทอร์เน็ต', amount: 300 }
    ]
  },
  {
    id: 'inv-202-202609',
    invoiceNumber: 'INV-202609-202',
    roomId: 'r-202',
    tenantId: 't-4',
    month: '2026-09',
    totalAmount: 6006,
    status: 'unpaid',
    dueDate: '2026-10-05',
    promptpayNumber: '0812345678',
    items: [
      { id: 'item-1', description: 'ค่าเช่าห้องพัก (ห้อง 202)', amount: 4500 },
      { id: 'item-2', description: 'ค่าน้ำประปา (7 หน่วย @ 18 บ.)', amount: 126, units: 7, unitPrice: 18 },
      { id: 'item-3', description: 'ค่าไฟฟ้า (135 หน่วย @ 8 บ.)', amount: 1080, units: 135, unitPrice: 8 },
      { id: 'item-4', description: 'ค่าบริการส่วนกลางและอินเทอร์เน็ต', amount: 300 }
    ]
  }
];

export const initialPayments: Payment[] = [
  {
    id: 'pay-001',
    invoiceId: 'inv-102-202609',
    roomId: 'r-102',
    amount: 5368,
    slipUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    slipHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    transferDate: '2026-09-28 16:30',
    status: 'pending',
    submittedAt: '2026-09-28 16:35'
  },
  {
    id: 'pay-002',
    invoiceId: 'inv-201-202609',
    roomId: 'r-201',
    amount: 6260,
    slipUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    slipHash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
    transferDate: '2026-09-28 14:15',
    status: 'approved',
    submittedAt: '2026-09-28 14:18',
    reviewedAt: '2026-09-28 14:20',
    reviewedBy: 'Admin สมเกียรติ',
    receiptNumber: 'RCT-202609-201'
  }
];

export const initialMaintenanceTickets: MaintenanceTicket[] = [
  {
    id: 'tck-001',
    ticketNumber: 'TCK-202609-001',
    roomId: 'r-101',
    tenantId: 't-1',
    category: 'air',
    title: 'เครื่องปรับอากาศมีน้ำหยดด้านข้างและเสียงดัง',
    description: 'เปิดแอร์ประมาณ 2 ชั่วโมงแล้วมีน้ำไหลซึมลงมาตามฝาผนัง และพัดลมแอร์มีเสียงกึกๆ รบกวนเวลาพักผ่อน',
    imageUrls: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80'],
    status: 'in_progress',
    priority: 'medium',
    assignedTechnician: 'ช่างวิทย์ (แผนกปรับอากาศ)',
    createdAt: '2026-09-26 09:15',
    notes: 'ช่างนัดเข้าตรวจเช็คท่อน้ำทิ้งและล้างแอร์วันที่ 30 ก.ย. เวลา 13:00 น.'
  },
  {
    id: 'tck-002',
    ticketNumber: 'TCK-202609-002',
    roomId: 'r-104',
    tenantId: '',
    category: 'plumbing',
    title: 'เปลี่ยนวาล์วเปิด-ปิดน้ำฝักบัวและสายชำระ',
    description: 'วาล์วน้ำฝักบัวรั่วซึมตลอดเวลา ปิดห้องปรับปรุงก่อนรับผู้เช่าใหม่',
    imageUrls: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80'],
    status: 'acknowledged',
    priority: 'high',
    assignedTechnician: 'ช่างเอก (งานประปา)',
    createdAt: '2026-09-27 11:30'
  },
  {
    id: 'tck-003',
    ticketNumber: 'TCK-202609-003',
    roomId: 'r-202',
    tenantId: 't-4',
    category: 'electrical',
    title: 'หลอดไฟระเบียงห้องไม่ติด',
    description: 'สวิตช์ไฟระเบียงกดแล้วไฟไม่ติด คาดว่าหลอดไฟขาด',
    imageUrls: [],
    status: 'pending',
    priority: 'low',
    createdAt: '2026-09-28 18:20'
  }
];
