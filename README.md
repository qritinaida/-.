# ระบบการจัดการหอพัก (Dormitory Management System) — เฟสที่ 2 (Database & Google Auth)

แอปพลิเคชันบริหารจัดการหอพักและอพาร์ตเมนต์ครบวงจร สร้างด้วย **React + TypeScript + Tailwind CSS** ออกแบบตามมาตรฐาน **Clean Architecture** และ **Skill 04-database-design** พร้อมรองรับการ Deploy สู่ **Cloudflare Pages / Workers** อัตโนมัติ

---

## 🌟 ฟังก์ชันหลักในเฟสที่ 2 (Phase 2 Features)

1. **ระบบเข้าสู่ระบบด้วย Google (Google Sign-In / OAuth):**
   - ปุ่มล็อกอินด้วย Google พร้อมโลโก้แบรนด์มาตรฐาน
   - สลับบัญชีทดสอบได้ทันที:
     - 👤 **ผู้จัดการหอพัก (Admin):** `somkiat.admin@gmail.com`
     - 👤 **ผู้เช่าห้อง 101:** `somchai.tenant@gmail.com`
     - 👤 **ผู้เช่าห้อง 102:** `wipawan.tenant@gmail.com`
     - 👤 **ผู้เช่าห้อง 201:** `kittikun.tenant@gmail.com`
   - รองรับการกรอกข้อมูลบัญชี Google อิสระ และรองรับการใส่ **Google OAuth 2.0 Client ID** สำหรับ Production
   - แสดงโปรไฟล์ผู้ใช้ใน Navbar พร้อมระบบบันทึก Session ใน LocalStorage

2. **การออกแบบฐานข้อมูลตามมาตรฐาน Skill 04-database-design:**
   - **ERD & Schema:** 11 ตารางหลักสัมพันธ์กันสมบูรณ์แบบ
   - **Data Dictionary:** รายละเอียดคอลัมน์, Data Types, Constraints (PK, FK, UK, CHECK)
   - **Index Strategy:** Composite Indexes เร่งความเร็วการค้นหาบิลและตัดสลิปซ้ำ
   - **Transaction Rules (ACID):** กฎการออกบิลแบบกลุ่มและการอนุมัติสลิป/ออกใบเสร็จ
   - **Migration Files:** 
     - [`migrations/0001_initial_schema.sql`](file:///migrations/0001_initial_schema.sql)
     - [`migrations/0002_seed_data.sql`](file:///migrations/0002_seed_data.sql)

3. **เมนูจัดการฐานข้อมูลในตัวเว็บ ([`DatabaseManager.tsx`](file:///src/components/DatabaseManager.tsx)):**
   - ตัวตรวจเช็คโครงสร้างตาราง (Data Dictionary Inspector) ทั้ง 11 ตาราง
   - ตัวนับจำนวนข้อมูลจริงแบบ Real-time
   - เครื่องมือรันคำสั่ง **SQL Query Simulator**
   - ปุ่ม **Export SQL Dump** สำหรับสำรองข้อมูล

4. **บันทึกประวัติความปลอดภัย ([`AuditLogs.tsx`](file:///src/components/AuditLogs.tsx)):**
   - บันทึกการกระทำสำคัญตามมาตรฐาน NFR-08 (Check-in, Check-out, บันทึกมิเตอร์, อนุมัติสลิป, ล็อกอิน Google)

5. **รายงานสรุปทางการเงิน ([`FinancialReports.tsx`](file:///src/components/FinancialReports.tsx)):**
   - สรุปยอดเรียกเก็บ, ยอดรับชำระแล้ว, อัตราการจัดเก็บ (Collection Rate %)
   - ปริมาณการใช้น้ำ-ไฟรวม และปุ่ม **Export CSV** สำหรับฝ่ายบัญชี

---

## 🚀 Live Production URL บน Cloudflare

👉 **[https://dorm-management.674295045.workers.dev](https://dorm-management.674295045.workers.dev)**

---

## 💻 วิธีการรันในเครื่องและ Deploy

```bash
# รัน Local Development
npm.cmd run dev

# Deploy สู่ Cloudflare อัตโนมัติ
npm.cmd run deploy
```
*(หรือดับเบิลคลิกไฟล์ `deploy-cloudflare.bat`)*
