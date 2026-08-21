# ระบบจองห้องประชุม (Meeting Room Booking)

เว็บแอปจองห้องประชุมสำหรับโรงเรียน — React + Vite ฝั่ง frontend, [Supabase](https://supabase.com) (Postgres)
เป็นฐานข้อมูล/backend ทั้งหมด ไม่มีเซิร์ฟเวอร์ของตัวเอง (serverless ทั้งระบบ)

เอกสารนี้เขียนละเอียดกว่า README ทั่วไป เพราะตั้งใจให้ใช้เป็น **กรณีศึกษา**
ของการต่อยอดแอป React ล้วน ๆ ให้กลายเป็นระบบที่มีฐานข้อมูลจริง ระบบล็อกอินเอง
(ไม่ใช้ผู้ให้บริการ auth ภายนอก) และระบบสิทธิ์แอดมิน โดยไม่มี backend server ของตัวเองเลย

## ทดลองใช้งาน

เว็บไซต์ทดลอง: https://meeting-room-booking-omega-three.vercel.app

บัญชีทดสอบ:

| บทบาท | รหัสประจำตัวนักเรียน | รหัสผ่าน |
|---|---|---|
| ผู้ใช้ทั่วไป (นักเรียน) | `66001` | `123456` |
| แอดมิน | `00000` | `12345` |

## ภาพรวมเทคนิค

| ส่วน | ใช้อะไร |
|---|---|
| Frontend | React 18 + Vite 5 (JSX, ไม่มี TypeScript) |
| State | React `useState`/`useEffect` ล้วน ๆ ไม่มี Redux/Zustand/React Query |
| Styling | CSS ธรรมดา (`src/index.css`) ไม่มี Tailwind/CSS-in-JS |
| ฐานข้อมูล | Supabase (Postgres) เข้าถึงผ่าน `@supabase/supabase-js` (REST/PostgREST) |
| Auth | **เขียนเอง** ไม่ได้ใช้ Supabase Auth — ดูเหตุผลในหัวข้อ "สถาปัตยกรรม" |
| การ hash รหัสผ่าน | `pgcrypto` (bcrypt) ทำงานฝั่ง Postgres ผ่านฟังก์ชัน `SECURITY DEFINER` |
| Hosting | [Vercel](https://vercel.com) (static build จาก `vite build`) |
| Sessions | เก็บ `currentUser` ไว้ใน `localStorage` เอง (ไม่มี JWT/cookie) |



## เริ่มใช้งาน (Local Development)

ต้องมี [Node.js](https://nodejs.org) เวอร์ชัน 18 ขึ้นไป และโปรเจกต์ Supabase (ดูหัวข้อถัดไป)

```bash
npm install
```

สร้างไฟล์ `.env` (ดูตัวอย่างใน `.env.example`) — ห้าม commit ไฟล์นี้ขึ้น git (มีอยู่ใน `.gitignore` แล้ว):

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:5173`

## ตั้งค่า Supabase แบบละเอียด

1. สร้างโปรเจกต์ใหม่ที่ [supabase.com](https://supabase.com) → **Project Settings → API Keys**
   คัดลอก **Project URL** และ **Publishable key** (`sb_publishable_...`) ใส่ใน `.env`
   (⚠️ อย่าใช้ **Secret key** ฝั่ง frontend เด็ดขาด — คีย์นั้นมีสิทธิ์เต็ม ไม่มี RLS มาคุม)

2. เปิด **SQL Editor** แล้วรันไฟล์ในโฟลเดอร์ `supabase/` **ตามลำดับนี้เท่านั้น** (แต่ละไฟล์
   ต่อยอดจากไฟล์ก่อนหน้า รันข้ามลำดับจะพัง):

   | ลำดับ | ไฟล์ | ทำอะไร |
   |---|---|---|
   | 1 | `schema.sql` | สร้างตาราง `students` (รหัสนักเรียน/ชื่อ/นามสกุล) + ข้อมูลตัวอย่าง 5 คน |
   | 2 | `auth_migration.sql` | เพิ่มคอลัมน์ `registered` เตรียมไว้สำหรับระบบสมัครสมาชิก |
   | 3 | `password_auth_migration.sql` | เปิดใช้ `pgcrypto`, เพิ่มคอลัมน์ `password_hash`, สร้างฟังก์ชัน `register_student()`/`login_student()` — **นี่คือหัวใจของระบบ auth ทั้งหมด** |
   | 4 | `bookings_migration.sql` | สร้างตาราง `bookings` (การจองห้อง) + ข้อมูลตัวอย่าง |
   | 5 | `admin_migration.sql` | เพิ่มคอลัมน์ `is_admin`, เพิ่มสิทธิ์ UPDATE บน `bookings`, แก้ RPC ให้คืนค่า `is_admin` กลับมาด้วย |
   | 6 | `rename_students_table.sql` | เปลี่ยนชื่อ `students` → `UserData` (ต้องเปลี่ยนชื่อตารางผ่าน Table Editor **ก่อน** แล้วค่อยรันไฟล์นี้เพื่อแก้ฟังก์ชันให้ตรง) |
   | 7 | `password_reset_requests_migration.sql` | สร้างตาราง `password_reset_requests` + ฟังก์ชัน `approve_password_reset()` (ล้างรหัสผ่านเดิมให้อัตโนมัติ) |
   | 8 | `rooms_migration.sql` | สร้างตาราง `rooms` ย้ายห้องประชุมออกจากโค้ด ให้แอดมินจัดการเองได้ |

3. ตั้งแอดมินอย่างน้อย 1 คน: **Table Editor → UserData** → แก้คอลัมน์ `is_admin`
   ของแถวที่ต้องการเป็น `TRUE` (ต้องเป็นนักเรียนที่ "ตั้งรหัสผ่านครั้งแรก" ในแอปแล้วเท่านั้น
   ถึงจะล็อกอินเข้าไปเห็นสิทธิ์แอดมินได้)

> หมายเหตุ: ถ้าเริ่มจากศูนย์ (ไม่มี `students` มาก่อน) ไฟล์ 1-5 จะสร้างตารางชื่อ `students`
> ให้เปลี่ยนชื่อเป็น `UserData` ผ่าน Table Editor หลังรันไฟล์ 5 เสร็จ แล้วค่อยรันไฟล์ 6 ต่อ

## โครงสร้างฐานข้อมูล

### `UserData` (เดิมชื่อ `students`)

| คอลัมน์ | ชนิด | หมายเหตุ |
|---|---|---|
| `id` | `uuid` | primary key, auto-generate |
| `student_id` | `text` | รหัสประจำตัวนักเรียน ไม่ซ้ำกัน ใช้ล็อกอิน |
| `first_name`, `last_name` | `text` | ชื่อ-นามสกุล |
| `registered` | `boolean` | เคยตั้งรหัสผ่านแล้วหรือยัง |
| `password_hash` | `text` | bcrypt hash — ถูกกัน SELECT จาก anon/authenticated ผ่าน column privilege |
| `is_admin` | `boolean` | สิทธิ์เข้าหน้า AdminPanel |

### `bookings`

| คอลัมน์ | ชนิด | หมายเหตุ |
|---|---|---|
| `id` | `uuid` | primary key |
| `room_id` | `text` | อ้างอิง `rooms.id` (ไม่มี foreign key constraint จริง) |
| `date`, `start_time`, `end_time` | `date`/`text` | เวลาเก็บเป็น string รูปแบบ `HH:MM` ให้ตรงกับ `<input type="time">` |
| `people` | `integer` | จำนวนผู้เข้าร่วม (nullable) |
| `purpose` | `text` | วัตถุประสงค์การใช้ห้อง |
| `owner_id`, `owner_name` | `uuid`/`text` | ผูกกับ `UserData(id)`, ชื่อ denormalize ไว้ |
| `status` | `text` | `pending` \| `approved` (การ "ปฏิเสธ"/"ยกเลิก" คือลบแถวทิ้งไปเลย ไม่มีสถานะ `rejected`) |

### `password_reset_requests`

| คอลัมน์ | ชนิด | หมายเหตุ |
|---|---|---|
| `id` | `uuid` | primary key |
| `student_id` | `text` | `unique`, อ้างอิง `UserData(student_id)` — กันสมัครคำขอซ้ำ |
| `first_name`, `last_name` | `text` | denormalize ไว้แสดงผลในแอดมิน |

อนุมัติคำขอ = เรียก `approve_password_reset(request_id)` ซึ่งจะ `UPDATE UserData SET
password_hash = null, registered = false` แล้วลบคำขอทิ้ง (นักเรียนกลับไปตั้งรหัสผ่านใหม่ที่แท็บ
"ตั้งรหัสผ่านครั้งแรก" ได้ทันที)

### `rooms`

| คอลัมน์ | ชนิด | หมายเหตุ |
|---|---|---|
| `id` | `text` | primary key, default เป็น uuid string (ห้องเดิม 4 ห้องใช้ id แบบอ่านง่าย `room-1`..`room-4`) |
| `name`, `location` | `text` | ชื่อ/สถานที่ |
| `capacity` | `integer` | ความจุ |
| `requires_approval` | `boolean` | ต้องขออนุมัติก่อนใช้งานหรือไม่ |
| `icon` | `text` | หนึ่งใน `group` \| `pair` \| `single` \| `tv` (แมปกับ `RoomIcon.jsx`) |

## โครงสร้างโปรเจกต์

```
src/
  lib/
    supabaseClient.js         สร้าง Supabase client จาก env vars (VITE_SUPABASE_URL/ANON_KEY)
    bookingsApi.js            fetch/insert/delete/approve การจอง — แปลง snake_case ↔ camelCase
    roomsApi.js                fetch/insert/update/delete ห้องประชุม
    passwordResetApi.js        ส่ง/อนุมัติ/ปฏิเสธ คำขอรีเซ็ตรหัสผ่าน
  utils/
    timeConflict.js            ฟังก์ชันเช็คเวลาซ้อนกัน (pure function, เทสต์แยกได้)
    roomStatus.js               คำนวณสถานะห้อง ณ เวลาปัจจุบัน (ว่าง/ไม่ว่าง/รออนุมัติ)
    thaiDate.js                  แปลงวันที่เป็นรูปแบบไทย (พ.ศ.) + ช่วยคำนวณวันที่
  data/mockData.js             เหลือแค่ค่าคงที่ DAY_START_HOUR/DAY_END_HOUR (ห้อง/การจองย้ายเข้า DB หมดแล้ว)
  components/
    LoginScreen.jsx             เข้าสู่ระบบ / ตั้งรหัสผ่านครั้งแรก / ส่งคำขอลืมรหัสผ่าน (3 โหมดในหน้าเดียว)
    Dashboard.jsx                หน้าหลักหลัง login: Header + ห้อง + ตารางเวลา + การจองของฉัน (+ AdminPanel ถ้าเป็นแอดมิน)
    Header.jsx                    แถบบนสุด แสดงชื่อผู้ใช้และปุ่มออกจากระบบ
    RoomCard.jsx                   การ์ดแต่ละห้อง พร้อมสถานะปัจจุบันและปุ่มจอง
    RoomIcon.jsx                    ไอคอน SVG ตามประเภทห้อง (group/pair/single/tv)
    Timeline.jsx                    ตารางเวลารายชั่วโมงของทุกห้อง เลื่อนดูวันอื่นได้ — scroll แนวนอนในกรอบตัวเองบนจอเล็ก
    MyBookings.jsx                   รายการจองของผู้ใช้ที่ login อยู่ พร้อมยกเลิก
    BookingModal.jsx                  ฟอร์มจองห้อง ตรวจสอบเวลาซ้อน/ความจุแบบ real-time ก่อนส่ง
    AdminPanel.jsx                    (เฉพาะแอดมิน) อนุมัติการจอง + อนุมัติรีเซ็ตรหัสผ่าน + จัดการห้องประชุม
    RoomFormModal.jsx                  ฟอร์มเพิ่ม/แก้ไขห้อง ใช้ร่วมกันทั้งสองโหมด
  App.jsx                      เก็บ state หลักทั้งหมด (currentUser, bookings, rooms, resetRequests)
                                เรียก lib/*Api.js แล้ว sync กลับ state — ไม่มี global state library
supabase/                    ไฟล์ SQL schema/migration ทั้งหมด รันเรียงตามลำดับ (ดูตารางด้านบน)
```

## ฟีเจอร์และการทำงาน

### เข้าสู่ระบบ / ตั้งรหัสผ่านครั้งแรก

นักเรียนต้องมีชื่ออยู่ในตาราง `UserData` ก่อน (แอดมินเพิ่มให้ผ่าน Table Editor หรือ SQL Editor)
ครั้งแรกที่ใช้งานต้องกดแท็บ "ตั้งรหัสผ่านครั้งแรก" กรอกรหัสนักเรียน + ตั้งรหัสผ่านเอง
ระบบจะเช็คว่ารหัสนักเรียนมีอยู่จริงและยังไม่เคยตั้งรหัสผ่าน (`registered = false`) ก่อน
ถ้าผ่านจะ hash รหัสผ่านด้วย `crypt(password, gen_salt('bf'))` เก็บไว้ ครั้งต่อไปกด "เข้าสู่ระบบ" ปกติ

### ลืมรหัสผ่าน (แบบขออนุมัติ)

กด "ลืมรหัสผ่าน?" → กรอกรหัสนักเรียน → ส่งคำขอเข้าตาราง `password_reset_requests`
(กันซ้ำด้วย `unique` constraint) → แอดมินเห็นคำขอในหน้า AdminPanel → กด "อนุมัติ"
→ ระบบล้าง `password_hash`/`registered` ของนักเรียนคนนั้น → นักเรียนไปตั้งรหัสผ่านใหม่เองได้
(มี LINE ID ของแอดมินเป็นทางเลือกสำรองสำหรับติดต่อโดยตรงด้วย)

### จองห้องประชุม

เลือกห้อง วันที่ เวลาเริ่ม-สิ้นสุด จำนวนคน — ระบบเช็ค **แบบ real-time ในฟอร์ม** (ก่อนกดยืนยัน)
ว่าเวลาซ้อนกับการจองอื่นไหม (`utils/timeConflict.js`) และจำนวนคนเกินความจุห้องไหม
ถ้าห้องนั้นตั้ง `requires_approval = true` (เช่นห้องใหญ่/ห้องโสตฯ) การจองจะเข้าสถานะ `pending`
แทนที่จะ `approved` ทันที

### หน้าแอดมิน

แสดงเฉพาะบัญชีที่ `is_admin = true` (เช็คจาก state ฝั่ง client — ดูข้อจำกัดด้านล่าง) มี 3 ส่วน:
อนุมัติ/ปฏิเสธการจองที่ `pending`, อนุมัติ/ปฏิเสธคำขอรีเซ็ตรหัสผ่าน, และเพิ่ม/แก้ไข/ลบห้องประชุม
(มี native `confirm()` popup ก่อนลบห้องเพราะเป็นการกระทำที่ย้อนกลับไม่ได้)



## Build สำหรับ production

```bash
npm run build
```

ไฟล์ output จะอยู่ในโฟลเดอร์ `dist/`

Deploy อยู่บน [Vercel](https://vercel.com) — ต้องตั้งค่า Environment Variables (`VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`) ในหน้า Project Settings ของ Vercel ด้วย เพราะไฟล์ `.env` ไม่ถูก commit ขึ้น git
