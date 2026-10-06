import { Room, Tenant, Contract, MeterReading, Invoice, Payment, MaintenanceTicket, DormitorySettings, GoogleUser } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  thoughtProcess?: string[]; // Chain of Thought steps
  quickReplies?: string[];
  actionLink?: {
    type: 'tab' | 'action';
    target: string;
    label: string;
  };
}

export interface DormContext {
  role: 'admin' | 'tenant';
  currentUser: GoogleUser | null;
  activeRoomNumber?: string;
  rooms: Room[];
  tenants: Tenant[];
  contracts: Contract[];
  meterReadings: MeterReading[];
  invoices: Invoice[];
  payments: Payment[];
  tickets: MaintenanceTicket[];
  settings: DormitorySettings;
}

export class AiAssistantService {
  private static GEMINI_KEY_STORAGE = 'dorm_gemini_api_key';

  static getStoredApiKey(): string {
    return localStorage.getItem(this.GEMINI_KEY_STORAGE) || '';
  }

  static saveApiKey(key: string): void {
    if (key.trim()) {
      localStorage.setItem(this.GEMINI_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(this.GEMINI_KEY_STORAGE);
    }
  }

  /**
   * Main query processor: either calls Gemini API if configured or runs local Intelligent Dorm Engine
   */
  static async askAi(prompt: string, context: DormContext): Promise<ChatMessage> {
    const apiKey = this.getStoredApiKey();

    if (apiKey) {
      try {
        return await this.callGeminiApi(prompt, context, apiKey);
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to local reasoning engine:', err);
        // Fallback to local
      }
    }

    // Intelligent Local Engine with Chain-of-Thought
    return this.generateLocalReasoning(prompt, context);
  }

  /**
   * Cloud Gemini 1.5 Flash Call
   */
  private static async callGeminiApi(prompt: string, context: DormContext, apiKey: string): Promise<ChatMessage> {
    const systemPrompt = `คุณคือ "DormAI" ผู้ช่วยอัจฉริยะประจำระบบจัดการหอพัก (Dormitory Management System)
คุณมีหน้าที่ตอบคำถาม ช่วยคิด วิเคราะห์ และช่วยผู้ใช้ทั้งผู้จัดการหอพัก (Admin) และผู้เช่า (Tenant)
บริบทปัจจุบันของหอพัก:
- ชื่อหอพัก: ${context.settings.name}
- บทบาทผู้ใช้งานปัจจุบัน: ${context.role === 'admin' ? 'ผู้ดูแลหอพัก (Admin)' : `ผู้เช่า (ห้อง ${context.activeRoomNumber || 'ไม่ระบุ'})`}
- จำนวนห้องทั้งหมด: ${context.rooms.length} ห้อง (ว่าง: ${context.rooms.filter(r => r.status === 'vacant').length}, มีผู้เช่า: ${context.rooms.filter(r => r.status === 'occupied').length}, ปรับปรุง: ${context.rooms.filter(r => r.status === 'maintenance').length})
- อัตราค่าน้ำ: ฿${context.settings.defaultWaterRate}/หน่วย, ค่าไฟ: ฿${context.settings.defaultElectricRate}/หน่วย, ค่าส่วนกลาง: ฿${context.settings.defaultCommonFee}/เดือน
- กำหนดชำระทุกวันที่: ${context.settings.dueDayOfMonth} ของเดือน (ผ่อนผัน ${context.settings.gracePeriodDays} วัน, ค่าปรับ ฿${context.settings.lateFeePerDay}/วัน)
- เลขบิลค้างชำระ: ${context.invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').length} รายการ
- งานแจ้งซ่อมค้างอยู่: ${context.tickets.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length} รายการ

คำแนะนำในการตอบ:
1. ตอบด้วยภาษาไทยที่สุภาพ กระชับ ชัดเจน มีโครงสร้าง (bullet points, ตัวหนา, ตัวเลข)
2. หากเป็นการขอความช่วยเหลือในการ "คิด" (เช่น ร่างประกาศ, วิเคราะห์ค้างชำระ, คำนวณเงินประกัน) ให้แสดงตรรกะการคิดที่ชัดเจน
3. หากผู้ใช้ขอร่างข้อความ ให้ร่างข้อความพร้อมใช้ที่สามารถคัดลอกได้ทันที`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nคำถามหรือคำขอของผู้ใช้: "${prompt}"` }] }
        ]
      })
    });

    if (!res.ok) {
      throw new Error(`Gemini HTTP ${res.status}`);
    }

    const data = await res.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'ขออภัย ไม่สามารถประมวลผลคำตอบได้ในขณะนี้';

    return {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      text: replyText,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      thoughtProcess: [
        'เชื่อมต่อ Google Gemini 1.5 Flash Cloud Model',
        'ส่ง Context สภาพแวดล้อมหอพักแบบ Real-time เข้าสู่ระบบวิเคราะห์',
        'ประมวลผลคำตอบเสร็จสมบูรณ์'
      ]
    };
  }

  /**
   * Built-in Expert Reasoning Engine for Dormitory Operations
   */
  private static generateLocalReasoning(query: string, context: DormContext): ChatMessage {
    const q = query.toLowerCase().trim();
    const thoughtProcess: string[] = [];

    // Context metrics
    const totalRooms = context.rooms.length;
    const occupiedRooms = context.rooms.filter(r => r.status === 'occupied').length;
    const vacantRooms = context.rooms.filter(r => r.status === 'vacant').length;
    const maintenanceRooms = context.rooms.filter(r => r.status === 'maintenance').length;
    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : '0';

    const unpaidInvoices = context.invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue');
    const totalUnpaidAmount = unpaidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

    const pendingTickets = context.tickets.filter(t => t.status === 'pending' || t.status === 'acknowledged');
    const pendingSlips = context.payments.filter(p => p.status === 'pending');

    thoughtProcess.push(`ตรวจจับบทบาทผู้ใช้: ${context.role === 'admin' ? 'แอดมิน / เจ้าของหอ' : 'ผู้เช่าพักอาศัย'}`);
    thoughtProcess.push(`สแกนบริบทฐานข้อมูลหอพัก: ห้องพัก ${totalRooms} ห้อง, บิลค้างชำระ ${unpaidInvoices.length} บิล, แจ้งซ่อมค้าง ${pendingTickets.length} เคส`);

    // 1. Intent: สรุปภาพรวมหอพัก / Dashboard / สถานะวันนี้
    if (q.includes('สรุป') || q.includes('ภาพรวม') || q.includes('สถานะ') || q.includes('กี่ห้อง') || q.includes('ว่างกี่ห้อง')) {
      thoughtProcess.push('ประมวลผลข้อมูลอัตราการเข้าพัก (Occupancy Rate) และสถานะทางการเงิน');
      
      const text = `📊 **สรุปภาพรวมหอพักประจำวันนี้ (${new Date().toLocaleDateString('th-TH', { dateStyle: 'long' })})**

🏢 **สถานะห้องพัก:**
• ห้องพักทั้งหมด: **${totalRooms} ห้อง**
• มีผู้เช่าพักอยู่: **${occupiedRooms} ห้อง** (${occupancyRate}%)
• ห้องว่างพร้อมปล่อยเช่า: **${vacantRooms} ห้อง**
• ห้องระหว่างปิดปรับปรุง: **${maintenanceRooms} ห้อง**

💰 **สถานะการเงิน & ใบแจ้งหนี้:**
• บิลค้างชำระ: **${unpaidInvoices.length} ใบ** (ยอดรวมค้างชำระ: **฿${totalUnpaidAmount.toLocaleString()}**)
• สลิปโอนเงินรอตรวจ: **${pendingSlips.length} รายการ**

🔧 **งานซ่อมบำรุง:**
• รายการแจ้งซ่อมที่ยังรอดำเนินการ: **${pendingTickets.length} เรื่อง**

💡 *คำแนะนำจาก AI:* ${vacantRooms > 0 ? `ขณะนี้มีห้องว่าง ${vacantRooms} ห้อง แนะนำเปิดโปรโมชันหรือประกาศปล่อยเช่าผ่านช่องทางออนไลน์ครับ` : 'หอพักเต็ม 100%! ยอดเยี่ยมมากครับ ควรเน้นตรวจสอบความพึงพอใจและงานซ่อมบำรุงเชิงป้องกัน'}`;

      return {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text,
        timestamp: this.getTimestamp(),
        thoughtProcess,
        quickReplies: ['มีห้องไหนค้างชำระบ้าง?', 'วิเคราะห์การใช้ไฟเดือนนี้', 'ร่างประกาศแจ้งเตือน']
      };
    }

    // 2. Intent: มีห้องไหนค้างชำระบ้าง / ทวงค่าเช่า
    if (q.includes('ค้างชำระ') || q.includes('ทวง') || q.includes('ยังไม่จ่าย') || q.includes('เกินกำหนด')) {
      thoughtProcess.push('ตรวจสอบตาราง Invoices ค้นหาสถานะ unpaid และ overdue');
      thoughtProcess.push(`พบ ${unpaidInvoices.length} รายการที่ยังไม่ได้รับการชำระเงิน`);

      if (unpaidInvoices.length === 0) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: `🎉 **ยอดเยี่ยมมากครับ!** ขณะนี้ไม่มีห้องใดค้างชำระค่าเช่าเลย ผู้เช่าทุกคนชำระเงินครบถ้วนสมบูรณ์แล้วครับ`,
          timestamp: this.getTimestamp(),
          thoughtProcess
        };
      }

      const listDetails = unpaidInvoices.map((inv, idx) => {
        const room = context.rooms.find(r => r.id === inv.roomId);
        const tenant = context.tenants.find(t => t.id === inv.tenantId);
        return `${idx + 1}. **ห้อง ${room?.number || inv.roomId}** (${tenant?.name || 'ไม่ระบุชื่อ'}) — ยอด **฿${inv.totalAmount.toLocaleString()}** (ครบกำหนด: ${inv.dueDate})`;
      }).join('\n');

      const text = `⚠️ **รายการห้องที่ยังค้างชำระค่าเช่า (${unpaidInvoices.length} ห้อง):**\n\n${listDetails}\n\n**ยอดค้างชำระรวมทั้งหมด:** **฿${totalUnpaidAmount.toLocaleString()}**\n\n💡 **AI แนะนำการดำเนินการ:**\n1. ส่งข้อความแจ้งเตือนอัตโนมัติหรือทัก LINE แจ้งเตือนยอดค้างชำระ\n2. อ้างอิงเงื่อนไขสัญญา: หากเกินกำหนดวันที่ ${context.settings.dueDayOfMonth + context.settings.gracePeriodDays} จะมีค่าปรับวันละ ฿${context.settings.lateFeePerDay}`;

      return {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text,
        timestamp: this.getTimestamp(),
        thoughtProcess,
        quickReplies: ['ร่างข้อความทวงค่าเช่าอย่างสุภาพ', 'ร่างหนังสือเตือนชำระเงินงวดสุดท้าย', 'สรุปภาพรวมหอพัก']
      };
    }

    // 3. Intent: ช่วยร่างข้อความทวงค่าเช่า
    if (q.includes('ร่าง') && (q.includes('ทวง') || q.includes('เตือนค่าเช่า') || q.includes('ค้าง'))) {
      thoughtProcess.push('วิเคราะห์น้ำเสียง (Tone of voice): สุภาพ เป็นมืออาชีพ ถูกต้องตามกฎหมายคุ้มครองผู้บริโภค');
      thoughtProcess.push('ดึงข้อมูลการชำระเงิน PromptPay และอัตราค่าปรับประกอบร่างข้อความ');

      const text = `📝 **ร่างข้อความแจ้งเตือนชำระค่าเช่า (สามารถคัดลอกไปใช้ได้ทันที):**

---
**[แบบที่ 1: สุภาพเป็นกันเอง (ส่งทาง LINE / แชทส่วนตัว)]**
> "สวัสดีครับ/ค่ะ ผู้เช่าห้อง [เลขห้อง] ทางหอพัก ${context.settings.name} ขออนุญาตแจ้งยอดค่าเช่าและค่าน้ำ-ไฟ ประจำงวดนี้ ยอดรวม **[ยอดเงิน] บาท** ครับ/ค่ะ
>
> 💳 สามารถสแกนชำระเงินผ่าน PromptPay: **${context.settings.promptpayNumber}** (${context.settings.promptpayName})
> เมื่อโอนแล้วรบกวนแนบสลิปผ่านระบบหอพักหรือแจ้งแอดมินได้เลยนะครับ ขอบคุณมากครับ 🙏"

---
**[แบบที่ 2: เป็นทางการ (สำหรับเกินกำหนดชำระ)]**
> "เรียน ผู้เช่าห้อง [เลขห้อง]
> เรื่อง: แจ้งเตือนการชำระค่าเช่าห้องพักเกินกำหนด
>
> ตามที่ใบแจ้งหนี้รอบประจำเดือนกำหนดชำระภายในวันที่ ${context.settings.dueDayOfMonth} ขณะนี้ทางระบบยังไม่ได้รับยอดชำระ **[ยอดเงิน] บาท** เพื่อความต่อเนื่องในการใช้บริการ ขอความกรุณาท่านชำระยอดดังกล่าวภายใน 48 ชั่วโมง
> 
> *หมายเหตุ: หากเกินระยะเวลาผ่อนผัน จะมีค่าปรับล่าช้าวันละ ${context.settings.lateFeePerDay} บาท ตามเงื่อนไขในสัญญาเช่า*
> ติดต่อสอบถามเพิ่มเติมได้ที่เบอร์ผู้จัดการหอพัก ขอบคุณครับ"`;

      return {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text,
        timestamp: this.getTimestamp(),
        thoughtProcess,
        quickReplies: ['ร่างประกาศงดส่งเสียงดัง', 'มีห้องไหนค้างชำระบ้าง?', 'สรุปภาพรวมหอพัก']
      };
    }

    // 4. Intent: ร่างประกาศต่างๆ (กฎระเบียบ, ล้างถังน้ำ, ซ่อมแซม, เสียงดัง, ที่จอดรถ)
    if (q.includes('ร่างประกาศ') || q.includes('ประกาศ') || (q.includes('ร่าง') && q.includes('ข้อความ'))) {
      thoughtProcess.push('วิเคราะห์ประเภทประกาศและจัดทำข้อความที่เป็นระเบียบ ชัดเจน เข้าใจง่าย');

      if (q.includes('น้ำ') || q.includes('ล้างถัง')) {
        const text = `📢 **ร่างประกาศ: แจ้งล้างถังพักน้ำและงดจ่ายน้ำประปาชั่วคราว**

> **ประกาศหอพัก ${context.settings.name}**
> **เรื่อง: แจ้งทำความสะอาดถังพักน้ำและหยุดจ่ายน้ำประปาชั่วคราว**
> 
> เรียน ผู้พักอาศัยทุกท่าน
> เพื่อสุขอนามัยที่ดีและความสะอาดของระบบน้ำประปา ทางหอพักจะดำเนินการล้างถังพักน้ำประจำปี ในวัน [ระบุวัน เช่น เสาร์ที่ 15 ตุลาคม] เวลา [09:00 - 15:00 น.]
> 
> ในช่วงเวลาดังกล่าว ระบบจะ**งดจ่ายน้ำประปาชั่วคราว** ขอความกรุณาผู้พักอาศัยทุกห้องสำรองน้ำไว้ใช้ล่วงหน้า
> ทางหอพักขออภัยในความไม่สะดวกมา ณ ที่นี้
> 
> สอบถามเพิ่มเติมติดต่อสำนักงานหอพัก`;
        return { id: `msg-${Date.now()}`, sender: 'ai', text, timestamp: this.getTimestamp(), thoughtProcess };
      }

      if (q.includes('เสียง') || q.includes('สูบ') || q.includes('กฎ')) {
        const text = `📢 **ร่างประกาศ: ขอความร่วมมืองดส่งเสียงดังและห้ามสูบบุหรี่**

> **ประกาศหอพัก ${context.settings.name}**
> **เรื่อง: ขอความร่วมมือรักษาความสงบเรียบร้อยและสุขอนามัยส่วนรวม**
> 
> เรียน ผู้พักอาศัยทุกท่าน
> เนื่องจากทางหอพักได้รับการร้องเรียนเรื่องเสียงรบกวนในช่วงเวลากลางคืน จึงขอความร่วมมือดังนี้:
> 
> 1. 🔇 **งดส่งเสียงดังและเปิดเพลงเสียงดังหลังเวลา 22:00 น.** เพื่อไม่ให้รบกวนการพักผ่อนของห้องข้างเคียง
> 2. 🚭 **ห้ามสูบบุหรี่/บุหรี่ไฟฟ้าภายในห้องพัก ทางเดิน และระเบียง** (มีจุดสูบบุหรี่เฉพาะด้านนอกอาคาร)
> 3. 🚪 **ปิด-เปิดประตูห้องพักอย่างระมัดระวัง** เพื่อไม่ให้เกิดเสียงกระแทก
> 
> ขอขอบคุณทุกท่านที่ร่วมสร้างสังคมหอพักที่น่าอยู่ร่วมกันครับ`;
        return { id: `msg-${Date.now()}`, sender: 'ai', text, timestamp: this.getTimestamp(), thoughtProcess };
      }

      const defaultNotice = `📢 **ร่างประกาศทั่วไปสำหรับหอพัก:**

> **ประกาศจากฝ่ายจัดการหอพัก ${context.settings.name}**
> **เรื่อง: [ระบุหัวข้อ เช่น การปรับปรุงระบบอินเทอร์เน็ต / การตรวจเช็กถังดับเพลิง]**
> 
> เรียน ผู้พักอาศัยทุกท่าน
> ทางหอพักขอเรียนแจ้งให้ทราบว่า ในวันที่ [ระบุวัน/เวลา] จะมีเจ้าหน้าที่เข้ามาดำเนินการ [ระบุรายละเอียด]
> 
> ขอความร่วมมือผู้พักอาศัย [ระบุข้อปฏิบัติ เช่น เก็บของมีค่า / ปิดล็อกห้องให้เรียบร้อย]
> ขออภัยในความไม่สะดวกมา ณ ที่นี้
> 
> ติดต่อสอบถาม: นิติบุคคลหอพัก`;
      return { id: `msg-${Date.now()}`, sender: 'ai', text: defaultNotice, timestamp: this.getTimestamp(), thoughtProcess };
    }

    // 5. Intent: วิเคราะห์การใช้ไฟ / ค่าน้ำค่าไฟ / มิเตอร์ผิดปกติ
    if (q.includes('ไฟ') || q.includes('น้ำ') || q.includes('มิเตอร์') || q.includes('หน่วย')) {
      thoughtProcess.push('ตรวจสอบฐานข้อมูล MeterReadings และประเมินห้องที่มีการใช้พลังงานสูงผิดปกติ (Spike Warning)');
      
      const spikedReadings = context.meterReadings.filter(m => m.isSpikeWarning || m.electricUnits > 250 || m.waterUnits > 25);
      
      let spikeText = '';
      if (spikedReadings.length > 0) {
        spikeText = `\n\n🔍 **ตรวจพบห้องที่มีปริมาณการใช้สูงผิดปกติ:**\n` + 
          spikedReadings.map(s => {
            const r = context.rooms.find(room => room.id === s.roomId);
            return `• **ห้อง ${r?.number || s.roomId}**: ไฟ ${s.electricUnits} หน่วย | น้ำ ${s.waterUnits} หน่วย (${s.warningMessage || 'หน่วยสูงกว่าค่าเฉลี่ย'})`;
          }).join('\n');
      }

      const text = `⚡ **อัตราค่าสาธารณูปโภคและระบบมิเตอร์:**
• 💧 **ค่าน้ำประปา:** ฿${context.settings.defaultWaterRate} ต่อหน่วย
• ⚡ **ค่าไฟฟ้า:** ฿${context.settings.defaultElectricRate} ต่อหน่วย
• 🏢 **ค่าส่วนกลาง:** ฿${context.settings.defaultCommonFee} ต่อเดือน${spikeText}

💡 **คำแนะนำในการประหยัดและตรวจสอบ:**
1. หากห้องมีค่าน้ำพุ่งสูงเกิน 20 หน่วย/เดือน มักเกิดจาก **ชักโครกหรือสายฉีดชำระรั่วซึม** ให้ช่างรีบเข้าตรวจสอบ
2. แนะนำตั้งอุณหภูมิเครื่องปรับอากาศที่ 25-26°C ร่วมกับเปิดพัดลม จะช่วยประหยัดไฟได้ 10-15%
3. ระบบมิเตอร์ของหอพักมี AI เฝ้าระวัง หากหน่วยกระโดดเกิน 50% ของเดือนก่อนจะขึ้นสถานะเตือนสีส้มทันที`;

      return {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text,
        timestamp: this.getTimestamp(),
        thoughtProcess,
        quickReplies: ['ห้องที่ใช้ไฟสูงสุดเดือนนี้', 'วิธีคำนวณเงินคืนประกันตอนย้ายออก', 'สรุปภาพรวมหอพัก']
      };
    }

    // 6. Intent: คำนวณเงินคืนประกัน / ย้ายออก (Check-out & Deposit calculation)
    if (q.includes('ย้ายออก') || q.includes('คืนประกัน') || q.includes('เงินมัดจำ') || q.includes('มัดจำ')) {
      thoughtProcess.push('อ้างอิงขั้นตอนมาตรฐานสัญญาเช่า (Deposit Settlement Rule)');
      thoughtProcess.push('คำนวณหักค่าใช้จ่ายค้างชำระ: ค่าทำความสะอาด, ค่าทาสี, ค่าน้ำไฟงวดสุดท้าย');

      const text = `🚪 **ขั้นตอนการแจ้งย้ายออกและการคำนวณคืนเงินประกัน:**

📋 **ขั้นตอนการแจ้งย้ายออก:**
1. ผู้เช่าต้องแจ้งความประสงค์ล่วงหน้าอย่างน้อย **30 วัน**
2. นัดหมายเจ้าหน้าที่ตรวจเช็กสภาพห้องพักและทรัพย์สินในวันส่งมอบกุญแจ
3. จดเลขมิเตอร์น้ำ-ไฟงวดสุดท้ายเพื่อคำนวณหักลบยอดจริง

🧮 **สูตรการคำนวณเงินประกันสุทธิที่ได้รับคืน:**
\`\`\`text
เงินประกันสุทธิ = เงินประกันตั้งต้น (มักเป็น 1-2 เดือน)
               - ค่าน้ำและค่าไฟงวดสุดท้าย
               - ค่าทำความสะอาดห้องพัก (ปกติ ฿500 - ฿800)
               - ค่าความเสียหายของอุปกรณ์ (ถ้ามี เช่น ผนังชำรุด มุ้งลวดขาด)
               - ค่าเช่าหรือค่าปรับค้างชำระ (ถ้ามี)
\`\`\`

⏱️ **ระยะเวลาคืนเงิน:** ทางหอพักจะโอนเงินประกันส่วนที่เหลือคืนเข้าบัญชีผู้เช่าภายใน **7 - 15 วันทำการ** หลังจากส่งมอบห้องเรียบร้อยครับ`;

      return {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text,
        timestamp: this.getTimestamp(),
        thoughtProcess,
        quickReplies: ['ร่างข้อความทวงค่าเช่าอย่างสุภาพ', 'สรุปภาพรวมหอพัก', 'อัตราค่าน้ำค่าไฟ']
      };
    }

    // 7. Intent: แจ้งซ่อม / ปัญหาห้องพัก
    if (q.includes('ซ่อม') || q.includes('แอร์') || q.includes('พัง') || q.includes('ตัน') || q.includes('ไฟดับ')) {
      thoughtProcess.push('ตรวจสอบตาราง MaintenanceTickets และแนวทางการแก้ปัญหา');

      const text = `🔧 **ระบบแจ้งซ่อมบำรุง (Maintenance Assistance):**

ขณะนี้มีงานแจ้งซ่อมในระบบที่รอดำเนินการ **${pendingTickets.length} รายการ**

📌 **ขั้นตอนการแจ้งซ่อมสำหรับผู้เช่า:**
1. ไปที่เมนู **"แจ้งซ่อมบำรุง (Maintenance)"**
2. เลือกหมวดหมู่อุปกรณ์ (เครื่องปรับอากาศ, ประปา/สุขภัณฑ์, ไฟฟ้า, เฟอร์นิเจอร์)
3. ถ่ายภาพความเสียหายประกอบ และระบุรายละเอียด
4. เจ้าหน้าที่จะติดต่อกลับและนัดหมายเวลาเข้าซ่อมภายใน **24-48 ชั่วโมง**

⚠️ *หมายเหตุเรื่องค่าใช้จ่าย:*
• **หอพักรับผิดชอบ:** การเสื่อมสภาพตามอายุการใช้งาน เช่น แอร์ตันตามรอบปี, ปั๊มน้ำ, หลอดไฟส่วนกลาง
• **ผู้เช่ารับผิดชอบ:** ความเสียหายที่เกิดจากการใช้งานผิดวิธี หรือเกิดจากอุบัติเหตุของผู้เช่า`;

      return {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text,
        timestamp: this.getTimestamp(),
        thoughtProcess,
        quickReplies: ['สรุปภาพรวมหอพัก', 'มีห้องไหนค้างชำระบ้าง?', 'ร่างประกาศงดส่งเสียงดัง']
      };
    }

    // 8. Intent: กฎระเบียบหอพัก / สัตว์เลี้ยง / พาเพื่อนมาพัก
    if (q.includes('กฎ') || q.includes('ระเบียบ') || q.includes('สัตว์') || q.includes('เพื่อน') || q.includes('แขก')) {
      thoughtProcess.push('ตรวจสอบกฎระเบียบมาตรฐานของหอพัก');

      const text = `📜 **กฎระเบียบสำคัญของหอพัก ${context.settings.name}:**

1. 🐾 **สัตว์เลี้ยง:** ไม่อนุญาตให้เลี้ยงสัตว์ทุกชนิด (สุนัข, แมว, สัตว์เลื้อยคลาน) เพื่อความสะอาดและป้องกันเสียงรบกวน
2. 👥 **ผู้มาติดต่อ/เพื่อน:** สามารถมาเยี่ยมได้ แต่ห้ามพักค้างคืนเกิน 3 วันติดต่อกันโดยไม่แจ้งนิติบุคคล
3. 🚭 **การสูบบุหรี่:** ห้ามสูบบุหรี่ในห้องพักและทางเดินส่วนกลางโดยเด็ดขาด ฝ่าฝืนปรับ 2,000 บาท
4. 🔇 **ความเงียบสงบ:** งดส่งเสียงดัง ปาร์ตี้ หรือทำกิจกรรมที่รบกวนผู้อื่นหลังเวลา **22:00 น.**
5. 🚗 **ที่จอดรถ:** จอดได้ห้องละ 1 คัน (มอเตอร์ไซค์/รถยนต์) ตามช่องที่กำหนด
6. 🔒 **ความปลอดภัย:** ปิดประตูด้านล่างอาคารทุกครั้ง ห้ามนำบุคคลภายนอกที่ไม่รู้จักเข้ามาในอาคาร`;

      return {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text,
        timestamp: this.getTimestamp(),
        thoughtProcess,
        quickReplies: ['ขั้นตอนการแจ้งย้ายออกและคืนเงินประกัน', 'อัตราค่าน้ำค่าไฟ', 'สรุปภาพรวมหอพัก']
      };
    }

    // Default Fallback with Smart Guidance
    thoughtProcess.push('ประมวลผลคำถามด้วย AI Semantic Engine');
    thoughtProcess.push('ให้คำตอบแบบสังเคราะห์พร้อมตัวเลือกที่เกี่ยวข้อง');

    const defaultReply = `สวัสดีครับ! ผมคือ **DormAI** ผู้ช่วยอัจฉริยะประจำระบบหอพัก ${context.settings.name} 🏢✨

ผมสามารถช่วยคุณได้หลากหลายด้าน เช่น:
• 📊 **วิเคราะห์และช่วยคิด:** คำนวณอัตราเข้าพัก, วิเคราะห์ยอดค้างชำระ, แนะนำการตั้งราคา
• 📝 **ร่างเอกสาร:** ร่างประกาศหอพัก, ร่างข้อความทวงค่าเช่า, ร่างหนังสือแจ้งเตือน
• ⚡ **ตรวจสอบค่าน้ำ-ไฟ:** วิเคราะห์หน่วยไฟที่ผิดปกติ, อัตราหน่วยละ ฿${context.settings.defaultElectricRate}
• 🚪 **สัญญาและการย้ายออก:** คำนวณเงินคืนมัดจำ, เงื่อนไขการแจ้งย้ายล่วงหน้า
• 🔧 **งานซ่อมบำรุง:** ตรวจสอบและติดตามสถานะช่าง

คุณสามารถเลือกหัวข้อที่ต้องการทราบ หรือพิมพ์คำถามที่สงสัยได้เลยครับ!`;

    return {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      text: defaultReply,
      timestamp: this.getTimestamp(),
      thoughtProcess,
      quickReplies: [
        'สรุปภาพรวมหอพักวันนี้',
        'มีห้องไหนค้างชำระบ้าง?',
        'ร่างประกาศงดส่งเสียงดัง',
        'วิธีคำนวณเงินคืนประกันตอนย้ายออก'
      ]
    };
  }

  private static getTimestamp(): string {
    return new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  }
}
