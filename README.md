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

## สถาปัตยกรรมและแนวคิดออกแบบ

### ทำไมไม่ใช้ Supabase Auth

ตอนแรกออกแบบให้ล็อกอินด้วย "รหัสประจำตัวนักเรียน + รหัสผ่าน" โดยใช้ Supabase Auth
(แปลงรหัสนักเรียนเป็นอีเมลสังเคราะห์ เช่น `66001@students.app` แล้วใช้ `signUp`/`signInWithPassword` ปกติ)
แต่เจอปัญหาสำคัญ: Supabase Auth เปิด **"Confirm email"** ไว้เป็นค่าเริ่มต้น
ทำให้บัญชีที่สมัครใหม่ค้างสถานะ "ยังไม่ยืนยัน" และ login ไม่ได้ เพราะอีเมลสังเคราะห์ไม่มีกล่องจดหมายจริงที่จะรับลิงก์ยืนยัน
และในแดชบอร์ด Supabase เวอร์ชันที่ใช้ตอนพัฒนา ตัวเลือกปิด "Confirm email" ก็หาไม่เจอ/ใช้งานไม่ได้ตามที่คาด

**ทางแก้ที่เลือกใช้:** เลิกพึ่ง Supabase Auth ทั้งหมด แล้วเก็บรหัสผ่าน (แบบ hash) ไว้ในตาราง
`UserData` เอง โดยใช้ **`pgcrypto`** (ส่วนขยายมาตรฐานของ Postgres) ทำ bcrypt hash ภายในฟังก์ชัน SQL
สองตัว: `register_student()` และ `login_student()` ที่รันด้วยสิทธิ์ `SECURITY DEFINER`
(รันข้าม RLS ได้ แต่ตรวจสอบเงื่อนไขเองข้างในฟังก์ชัน) วิธีนี้ทำให้:

- ไม่ต้องพึ่งอีเมลจริง หรือระบบยืนยันตัวตนของบุคคลที่สามใด ๆ
- รหัสผ่าน hash ด้วยอัลกอริทึมมาตรฐานเดียวกับที่ระบบ auth ทั่วไปใช้ (bcrypt)
- Client (เบราว์เซอร์) ไม่เคยเห็นค่า hash เลย — เรียกผ่าน `supabase.rpc(...)` ส่งแค่รหัสผ่านล้วน ๆ ไปให้ฟังก์ชันเช็คในฐานข้อมูล

ข้อแลกเปลี่ยน (tradeoff): เราไม่มี session/JWT จริงแบบ Supabase Auth ให้ RLS อ้างอิง
(`auth.uid()` ใช้งานไม่ได้) จึงไม่มีกลไกที่ฐานข้อมูลรู้จริง ๆ ว่า "ใครคือผู้ใช้ที่ล็อกอินอยู่"
ระบบเลยต้องพึ่ง RLS แบบเปิดกว้าง (`using (true)`) เกือบทุกตาราง — ดูรายละเอียดในหัวข้อ "ข้อจำกัดด้านความปลอดภัย"

### ทำไมตารางนักเรียนชื่อ `UserData` (ไม่ใช่ `students`)

ตอนสร้างตารางครั้งแรกตั้งชื่อว่า `students` แต่ภายหลังเปลี่ยนชื่อเป็น `UserData` ผ่าน Table Editor
ของ Supabase (คำสั่ง `ALTER TABLE ... RENAME`) ซึ่ง Postgres จะอัปเดต foreign key, RLS policy,
index ให้อัตโนมัติ **แต่ไม่อัปเดตชื่อตารางที่เขียนไว้ในโค้ด SQL ของฟังก์ชัน** (`register_student`,
`login_student`) เพราะฟังก์ชันเก็บ SQL เป็นข้อความล้วน ๆ ข้างใน ต้อง `DROP FUNCTION` แล้วสร้างใหม่
ให้ชี้ไปที่ `"UserData"` (ต้องใส่ quote เพราะเป็นชื่อ mixed-case) — ดู `supabase/rename_students_table.sql`

### รูปแบบ "denormalize" ข้อมูลเจ้าของ

ตาราง `bookings` และ `password_reset_requests` เก็บ `owner_name`/`first_name`+`last_name`
ซ้ำไว้ตรง ๆ (ไม่ได้ query join จาก `UserData` ทุกครั้ง) เพื่อให้แสดงผลในหน้า AdminPanel/MyBookings
ได้ทันทีโดยไม่ต้องทำ join หรือ query เพิ่ม — เป็นการแลก "ความง่าย" กับ "การ normalize ข้อมูลตามตำรา"
ซึ่งเหมาะกับสเกลเล็ก ๆ ของแอปนี้

### ทำไมฟังก์ชัน pgcrypto หาไม่เจอตอนแรก (`gen_salt` does not exist)

Supabase ติดตั้ง extension อย่าง `pgcrypto` ไว้ใน schema ชื่อ `extensions` ไม่ใช่ `public`
ฟังก์ชัน `register_student`/`login_student` ที่ตั้ง `search_path = public` เฉย ๆ
เลยหาฟังก์ชัน `crypt()`/`gen_salt()` ไม่เจอ ต้องแก้เป็น `set search_path = public, extensions`
ให้ Postgres มองเห็นทั้งสอง schema

### ป้องกัน password_hash หลุดผ่าน anon key

ตาราง `UserData` เปิด `SELECT` แบบกว้าง (`using (true)`) เพื่อให้หน้า login/สมัครอ่านชื่อ-นามสกุลได้
แต่ใช้ `REVOKE SELECT (password_hash) ON "UserData" FROM anon, authenticated;` — เป็น
**column-level privilege** ของ Postgres (คนละกลไกกับ RLS ซึ่งเป็น row-level) เพื่อกัน
ไม่ให้ query ทั่วไป (`select *`) ดึงค่า hash ออกไปได้ แม้จะมี anon key ก็ตาม

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

## ข้อจำกัดด้านความปลอดภัย (สำคัญ อ่านก่อนใช้งานจริง)

โปรเจกต์นี้ตั้งใจให้เป็น **"ตัวทดลอง"** ไม่ใช่ระบบพร้อมใช้งานจริงกับข้อมูลนักเรียนจริงทันที
ข้อจำกัดหลักคือ **RLS (Row Level Security) เปิดกว้างเกือบทุกตาราง**
(`using (true)` / `with check (true)`) เพราะแอปไม่มีระบบ session ที่ฐานข้อมูลตรวจสอบได้จริง
(ไม่ได้ใช้ Supabase Auth ตามที่อธิบายไว้ข้างบน) การเช็คสิทธิ์ทั้งหมดตอนนี้ทำแค่ฝั่ง React
(`user.isAdmin`) ซึ่งเป็นแค่ตัวกรองหน้าตา ไม่ใช่การป้องกันจริง

ตัวอย่างช่องโหว่ที่มีอยู่ตอนนี้ (ใครก็ตามที่มี publishable key — ซึ่งฝังอยู่ในโค้ดฝั่งเบราว์เซอร์
ใครก็ดูได้ — เรียก Supabase API ตรง ๆ ได้เลยโดยไม่ผ่าน UI ของแอป):

- อัปเดตสถานะการจองเป็น `approved` เองได้ โดยไม่ต้องเป็นแอดมิน
- ลบ/แก้ไขการจองของคนอื่นได้
- **ร้ายแรงสุด:** ส่งคำขอ `password_reset_requests` แทนรหัสนักเรียนคนไหนก็ได้ (รวมถึงแอดมิน)
  แล้วเรียก `approve_password_reset()` เองโดยไม่ต้องเป็นแอดมินจริง เพื่อล้างรหัสผ่านคนอื่นแล้วยึดบัญชี
- เพิ่ม/ลบห้องประชุมได้โดยไม่ต้อง login

**ก่อนใช้งานจริงกับข้อมูลนักเรียนของโรงเรียน ต้องแก้อย่างน้อยข้อใดข้อหนึ่ง:**
1. ย้ายกลับไปใช้ Supabase Auth จริง (แก้ปัญหา Confirm email ให้เรียบร้อย) เพื่อให้ RLS
   policy อ้างอิง `auth.uid()` ได้จริง เขียน policy แบบ "ลบได้เฉพาะเจ้าของ", "อนุมัติได้เฉพาะแอดมิน" ได้
2. หรือออกแบบกลไกยืนยันตัวตนแบบ custom ที่ตรวจสอบได้ในฝั่งฐานข้อมูล (ซับซ้อนกว่า)

## สิ่งที่ยังไม่ได้ทำ

1. **ทบทวนสิทธิ์ RLS ให้รัดกุมขึ้น** (ดูหัวข้อด้านบน) — สำคัญที่สุดก่อนใช้งานจริง
2. **ระบบแจ้งเตือน** — LINE Notify หรืออีเมลก่อนถึงเวลาใช้ห้อง (ต้องมี job รันตามเวลา เช่น Supabase Edge Function + cron)

## บทเรียนจากการพัฒนา (สรุปสำหรับกรณีศึกษา)

- **Supabase Auth ไม่เหมาะกับทุกเคส** — ถ้า identity ของผู้ใช้ไม่ใช่อีเมลจริง (เช่น รหัสนักเรียน)
  การฝืนใช้ Supabase Auth ด้วยอีเมลสังเคราะห์อาจเจอกำแพงเรื่อง email confirmation ที่แก้ยากกว่าที่คิด
  บางครั้งเขียนระบบ auth เองด้วย `pgcrypto` ง่ายกว่าและควบคุมได้มากกว่า
- **RLS กับ column-level privilege เป็นคนละเรื่องกัน** — RLS ควบคุมว่า "แถวไหน" เข้าถึงได้
  ส่วน `GRANT`/`REVOKE` ควบคุมว่า "คอลัมน์ไหน" เข้าถึงได้ ใช้ร่วมกันเพื่อซ่อนข้อมูลอ่อนไหว
  (เช่น `password_hash`) โดยไม่ต้องปิดการอ่านทั้งแถว
- **Extension ของ Postgres บน Supabase อยู่ใน schema `extensions`** ไม่ใช่ `public` — ถ้าฟังก์ชัน
  ใช้ `pgcrypto`/`postgis`/ฯลฯ ต้องตั้ง `search_path` ให้ครอบคลุม ไม่งั้นจะเจอ error
  "function ... does not exist" ทั้งที่ enable extension แล้ว
- **เปลี่ยนชื่อตารางไม่ propagate เข้าไปในฟังก์ชัน SQL อัตโนมัติ** — ต้องไล่แก้ฟังก์ชันที่อ้างชื่อ
  ตารางเป็น string เอง แม้ FK/RLS/index จะตามชื่อใหม่ให้อัตโนมัติก็ตาม
  วางแผนตั้งชื่อให้นิ่งตั้งแต่แรกจะดีกว่า
- **CSS Grid กับ text content ไม่ยอมหดถ้าไม่บอกชัดเจน** — grid track ที่เป็น `1fr` ยังคง
  บังคับความกว้างขั้นต่ำตามเนื้อหาข้างใน (`min-width: auto` โดย default) ทำให้หน้าเว็บ
  ดันจอ scroll แนวนอนได้ทั้งที่ตั้งใจให้ responsive แล้ว ทางแก้ที่ทนทานกว่าการพยายามบีบทุกอย่างให้พอดี
  คือทำ container นั้นให้ scroll แนวนอน**ในกรอบตัวเอง**แทน
- **Export CSV จาก Supabase เป็น UTF-8 แต่ Excel (Windows) เดา encoding ผิด** — ต้องเปิดผ่าน
  Data → From Text/CSV แล้วเลือก encoding เป็น UTF-8 เอง ไม่ใช่ double-click เปิดตรง ๆ
- **Git commit message ที่มีข้อความหน้าตาเหมือนรหัสผ่าน อาจถูก classifier บล็อก** แม้จะเป็น
  ข้อมูลทดสอบที่ตั้งใจเปิดเผยก็ตาม — ในเคสนั้นให้ผู้ใช้ commit เองจาก terminal ของตัวเอง

## Build สำหรับ production

```bash
npm run build
```

ไฟล์ output จะอยู่ในโฟลเดอร์ `dist/`

Deploy อยู่บน [Vercel](https://vercel.com) — ต้องตั้งค่า Environment Variables (`VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`) ในหน้า Project Settings ของ Vercel ด้วย เพราะไฟล์ `.env` ไม่ถูก commit ขึ้น git
