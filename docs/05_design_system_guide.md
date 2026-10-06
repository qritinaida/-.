# คู่มือการปรับแต่ง Design System (Design System Customization Guide)
**ระบบการจัดการหอพัก (Dormitory Management System - DMS)**

---

## 1. ภาพรวมสถาปัตยกรรม Design System

Design System ของระบบ DormitoryOS ถูกออกแบบโดยใช้หลักการ **Atomic Design** และ **Design Tokens** ร่วมกับ **Tailwind CSS 3 + React + TypeScript** เพื่อให้สามารถปรับแต่งได้ง่าย รวดเร็ว และเป็นระเบียบ แบ่งออกเป็น 2 รูปแบบหลัก:

1. **ปรับแต่งผ่านหน้าเว็บ (In-App Theme Studio):** ปรับสี, ฟอนต์, ความโค้งมนแบบ Real-time โดยไม่ต้องแก้โค้ด บันทึกลงในเบราว์เซอร์อัตโนมัติ
2. **ปรับแต่งในซอร์สโค้ด (Source Code Level):** แก้ไขไฟล์คอนฟิกเพื่อเปลี่ยนธีมและดีไซน์ถาวรของทั้งโปรเจกต์

---

## 2. โครงสร้างไฟล์ที่เกี่ยวข้องกับ Design System

| ลำดับ | ไฟล์เป้าหมาย | หน้าที่ความรับผิดชอบ | จุดที่แก้ไขได้ |
| :---: | :--- | :--- | :--- |
| **1** | [`tailwind.config.js`](file:///c:/xampp/htdocs/cloudflare/tailwind.config.js) | กำหนด Design Tokens (สี, ฟอนต์, Breakpoints, Shadows, Radii) | `theme.extend.colors`, `fontFamily`, `borderRadius` |
| **2** | [`index.html`](file:///c:/xampp/htdocs/cloudflare/index.html) | นำเข้าเว็บฟอนต์จาก Google Fonts และไอคอนเว็บไซต์ | `<link href="...fonts.googleapis.com...">`, `<title>` |
| **3** | [`src/index.css`](file:///c:/xampp/htdocs/cloudflare/src/index.css) | Global Base CSS, CSS Variables (`--dms-*`), Scrollbar Customization | `:root`, `@layer base`, `.custom-scrollbar` |
| **4** | [`src/utils/themeService.ts`](file:///c:/xampp/htdocs/cloudflare/src/utils/themeService.ts) | Service ควบคุมการสลับธีม บันทึก Storage และคำนวณ CSS Variables | `THEME_PRESETS`, `applyTheme()` |
| **5** | [`src/components/DesignSystemModal.tsx`](file:///c:/xampp/htdocs/cloudflare/src/components/DesignSystemModal.tsx) | หน้าต่าง UI ให้ผู้ใช้กดปรับแต่งธีมสด และแสดงตัวอย่าง Components | ตัวเลือก Preset, Typography, Radius Slider |
| **6** | [`src/mockData.ts`](file:///c:/xampp/htdocs/cloudflare/src/mockData.ts) | กำหนดชื่อหอพัก, ที่อยู่, เบอร์โทร, ค่าสาธารณูปโภคเริ่มต้น | `initialSettings`, `initialRooms` |

---

## 3. วิธีการแก้ไขในซอร์สโค้ด (Source Code Modification)

### 3.1 การเปลี่ยนชุดสีหลัก (Theme Colors)
เปิดไฟล์ [`tailwind.config.js`](file:///c:/xampp/htdocs/cloudflare/tailwind.config.js):

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // แก้ไขหรือเพิ่ม Palette สีของหอพักของคุณ
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6', // สีหลัก Primary
          600: '#2563eb', // สี Hover / Active
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // สี Accent เฉพาะ เช่น Cloudflare Orange
        cf: {
          orange: '#f38020',
          dark: '#1e1e1e'
        }
      }
    },
  },
  plugins: [],
}
```

---

### 3.2 การเปลี่ยนหรือเพิ่มฟอนต์ (Typography)
ระบบรองรับฟอนต์ยอดนิยม 4 แบบผ่าน Google Fonts: **Prompt, Sarabun, Kanit, Inter**

หากต้องการเพิ่มฟอนต์ใหม่ (เช่น `Mitr` หรือ `Chakra Petch`):
1. เปิด [`index.html`](file:///c:/xampp/htdocs/cloudflare/index.html) แล้วเพิ่มชื่อฟอนต์ในแท็ก `<link>`:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Mitr:wght@300;400;600&family=Prompt:wght@300;400;600;700&display=swap" rel="stylesheet">
   ```
2. กำหนด `fontFamily` ใน [`tailwind.config.js`](file:///c:/xampp/htdocs/cloudflare/tailwind.config.js):
   ```javascript
   theme: {
     extend: {
       fontFamily: {
         sans: ['Prompt', 'Mitr', 'sans-serif'],
         display: ['Mitr', 'sans-serif'],
       }
     }
   }
   ```

---

### 3.3 การปรับแต่งรูปทรง ความโค้งมน (Border Radius)
ระบบมีค่าความโค้งมนหลัก 3 ระดับ:
- `rounded-lg` (8px) — เหลี่ยมมนเล็กน้อย สไตล์ทางการ
- `rounded-xl` (12-16px) — มาตรฐานโมเดิร์น (ค่าเริ่มต้นของระบบ)
- `rounded-2xl` หรือ `rounded-3xl` (20-24px) — มนพิเศษ นุ่มนวล สไตล์แอปพลิเคชันยุคใหม่

สามารถค้นหาและปรับคลาส Tailwind เช่น `rounded-xl` เป็น `rounded-2xl` หรือกำหนดผ่านตัวแปร CSS ใน [`src/utils/themeService.ts`](file:///c:/xampp/htdocs/cloudflare/src/utils/themeService.ts)

---

### 3.4 การเปลี่ยนชื่อหอพักและข้อมูลแบรนด์ (Branding)
เปิดไฟล์ [`src/mockData.ts`](file:///c:/xampp/htdocs/cloudflare/src/mockData.ts):
```typescript
export const initialSettings: DormitorySettings = {
  name: 'หอพักสุขสบาย เพลส (Suksabai Residence)', // เปลี่ยนชื่อหอพักที่นี่
  address: '123/45 ซอยพหลโยธิน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900',
  promptpayNumber: '0812345678', // เบอร์ PromptPay
  promptpayName: 'นายสมเกียรติ สิทธิชัย',
  defaultWaterRate: 18,
  defaultElectricRate: 8,
  defaultCommonFee: 300,
  dueDayOfMonth: 5,
  gracePeriodDays: 2,
  lateFeePerDay: 100
};
```

---

## 4. วิธีการปรับแต่งผ่านหน้าเว็บโดยตรง (Live Theme Studio)

1. เปิดเว็บไซต์ [https://dorm-management.674295045.workers.dev](https://dorm-management.674295045.workers.dev)
2. สังเกตที่เมนูด้านบนขวา (Navbar) จะมีปุ่ม **"🎨 ธีม & UI"**
3. คลิกเพื่อเปิดหน้าต่าง **"คู่มือ & ปรับแต่ง Design System"**
4. คุณสามารถ:
   - **เลือก Preset สี:** Modern Indigo, Emerald Nature, Sunset Amber, Royal Violet, Rose Crimson, Minimal Slate
   - **เปลี่ยนฟอนต์:** เลือกระหว่าง Prompt, Sarabun, Kanit, Inter (ระบบจะเปลี่ยนฟอนต์ทั้งหน้าจอทันที)
   - **ปรับความโค้งมน:** 8px, 16px, 24px
   - **ดูตัวอย่างสด (Live Component Preview):** ดูหน้าตา Room Card, Buttons, Badges, Alert Box
   - **คัดลอกโค้ด:** มีแท็บ "วิธีแก้ไขในโค้ด" พร้อมปุ่มคัดลอกโค้ด `tailwind.config.js` ไปวางในโปรเจกต์ได้ทันที

---

## 5. มาตรฐานและ Guideline การออกแบบคอมโพเนนต์ (Component Design Guidelines)

```
┌────────────────────────────────────────────────────────┐
│                   DormitoryOS UI Tokens                │
├─────────────┬──────────────────────────────────────────┤
│ Primary     │ Gradient: Blue-600 -> Indigo-600         │
│ Success     │ Emerald-500 / Emerald-50 (ห้องว่าง/จ่ายแล้ว)│
│ Warning     │ Amber-500 / Amber-50 (ไฟรั่ว/รอตรวจสลิป)  │
│ Danger      │ Rose-500 / Rose-50 (ค้างชำระ/เกินกำหนด)   │
│ Card Style  │ bg-white, border border-slate-200, shadow│
│ Typography  │ Title: Bold 16-24px | Body: 12-14px       │
└─────────────┴──────────────────────────────────────────┘
```
