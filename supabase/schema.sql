-- ตาราง students: ข้อมูลนักเรียน (ชื่อ, นามสกุล, รหัสประจำตัวนักเรียน)
-- รันไฟล์นี้ใน Supabase Dashboard > SQL Editor > New query > Run

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  student_id text not null unique,
  first_name text not null,
  last_name text not null,
  created_at timestamptz not null default now()
);

-- เปิด Row Level Security ไว้ก่อน (ต้องเขียน policy เพิ่มเองภายหลังตามระดับสิทธิ์ที่ต้องการ)
alter table students enable row level security;

-- Policy ชั่วคราวสำหรับทดลอง: อนุญาตให้อ่านข้อมูลได้ (ทั้ง anon และ authenticated)
-- ข้อควรระวัง: นี่คือ policy แบบเปิดกว้างเพื่อทดลองเท่านั้น ก่อนใช้งานจริงควรจำกัดสิทธิ์
-- ให้อ่าน/แก้ไขได้เฉพาะผู้ใช้ที่ login แล้ว (ดูคอมเมนต์ policy ตัวอย่างด้านล่าง)
create policy "trial_read_students"
  on students for select
  using (true);

-- ตัวอย่าง policy แบบจำกัดสิทธิ์ไว้ใช้ตอนขึ้นระบบจริง (ยังไม่ได้เปิดใช้งาน):
-- create policy "authenticated_read_students"
--   on students for select
--   to authenticated
--   using (true);

-- ข้อมูลทดลอง (ตัวอย่างนักเรียน 5 คน)
insert into students (student_id, first_name, last_name) values
  ('66001', 'สมชาย', 'ใจดี'),
  ('66002', 'สุดา', 'มีสุข'),
  ('66003', 'วิชัย', 'แสงทอง'),
  ('66004', 'พิมพ์ใจ', 'รักเรียน'),
  ('66005', 'ธนกร', 'ศรีสวัสดิ์')
on conflict (student_id) do nothing;
