# ระบบจองห้องประชุม (Meeting Room Booking)

เว็บแอปจองห้องประชุมสำหรับโรงเรียน เขียนด้วย React + Vite

สถานะปัจจุบัน: **frontend เท่านั้น** ข้อมูลทั้งหมด (ห้อง, การจอง, ผู้ใช้) เป็น mock data
เก็บไว้ใน memory ของเบราว์เซอร์ รีเฟรชหน้าแล้วข้อมูลจะรีเซ็ตกลับเป็นค่าเริ่มต้น
เหมาะสำหรับดูตัวอย่าง flow การใช้งานและนำไปต่อยอดเชื่อมกับฐานข้อมูลจริง

## เริ่มใช้งาน

ต้องมี [Node.js](https://nodejs.org) เวอร์ชัน 18 ขึ้นไป

```bash
npm install
npm run dev
```

จากนั้นเปิดเบราว์เซอร์ไปที่ `http://localhost:5173`

## โครงสร้างโปรเจกต์

```
src/
  data/mockData.js       ข้อมูลห้อง (ROOMS) และการจองตัวอย่าง (buildInitialBookings)
  utils/timeConflict.js  ฟังก์ชันเช็คเวลาซ้อนกัน (pure function, เทสต์แยกได้)
  utils/roomStatus.js    คำนวณสถานะห้อง ณ เวลาปัจจุบัน
  utils/thaiDate.js      แปลงวันที่เป็นรูปแบบไทย (พ.ศ.)
  components/
    LoginScreen.jsx       หน้าเข้าสู่ระบบ (Google / LINE / username-password)
    Dashboard.jsx          หน้าหลักหลัง login รวม Header + ห้อง + ตารางเวลา + การจองของฉัน
    Header.jsx             แถบบนสุด แสดงชื่อผู้ใช้และปุ่มออกจากระบบ
    RoomCard.jsx            การ์ดแต่ละห้อง พร้อมสถานะและปุ่มจอง
    RoomIcon.jsx            ไอคอน SVG ตามประเภทห้อง
    Timeline.jsx             ตารางเวลารายชั่วโมงของทุกห้องในวันนี้
    MyBookings.jsx           รายการจองของผู้ใช้ที่ login อยู่ พร้อมยกเลิก
    BookingModal.jsx         ฟอร์มจองห้อง พร้อมตรวจสอบเวลาซ้อนและความจุแบบ real-time
  App.jsx                 เก็บ state หลัก (currentUser, bookings) และสลับหน้า login/dashboard
```

## ฟีเจอร์ที่ทำไว้แล้ว

- เข้าสู่ระบบ (จำลอง 3 ช่องทาง — ทุกช่องทาง login เป็น mock user เดียวกันในตอนนี้)
- แดชบอร์ดแสดงสถานะห้องแบบเรียลไทม์ (ว่าง / ไม่ว่าง / รออนุมัติ) คำนวณจากเวลาปัจจุบันจริง
- ตารางเวลารายชั่วโมงของทุกห้องในวันนี้
- ฟอร์มจองห้องที่ตรวจสอบเวลาซ้อนกับการจองเดิมโดยอัตโนมัติ (`utils/timeConflict.js`)
- ตรวจสอบจำนวนผู้เข้าร่วมไม่ให้เกินความจุห้อง
- ห้องที่ทำเครื่องหมาย `requiresApproval: true` (เช่นห้องใหญ่/ห้องโสตฯ) จะเข้าสถานะ "รออนุมัติ" แทนที่จะยืนยันทันที
- หน้า "การจองของฉัน" พร้อมยกเลิกการจอง

## ขั้นตอนถัดไปสำหรับต่อยอดเป็นระบบจริง

1. **เชื่อมฐานข้อมูลจริง** — แนะนำ Supabase หรือ Firebase เพราะมี Auth ในตัว ทำได้เร็ว
   ตาราง 3 ตารางหลัก: `users`, `rooms`, `bookings` (โครงสร้างใกล้เคียงกับ `mockData.js`)
2. **ต่อระบบ login จริง** — แทนที่ `handleLogin` ใน `App.jsx` ด้วย OAuth (Google) / LINE Login SDK
   / เรียก API ตรวจสอบ username-password จริง
3. **ย้าย state ไปเป็น API calls** — เปลี่ยน `addBooking` / `cancelBooking` ใน `App.jsx`
   จากการแก้ array ใน memory เป็นการเรียก API (POST /bookings, DELETE /bookings/:id)
   แล้ว sync กลับมาที่ state (หรือใช้ library อย่าง React Query)
4. **หน้าแอดมินอนุมัติการจอง** — สำหรับห้องที่ `requiresApproval: true`
5. **แจ้งเตือน** — ต่อ LINE Notify หรืออีเมลก่อนถึงเวลาใช้ห้อง

## Build สำหรับ production

```bash
npm run build
```

ไฟล์ output จะอยู่ในโฟลเดอร์ `dist/`
