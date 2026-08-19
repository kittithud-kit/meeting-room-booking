-- ย้ายการจองห้องจาก mock data (ในหน่วยความจำ) มาเป็นตารางจริงใน Supabase
-- รันไฟล์นี้ใน Supabase Dashboard > SQL Editor > New query > Run

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  date date not null,
  start_time text not null,
  end_time text not null,
  people integer,
  purpose text,
  owner_id uuid not null references students(id),
  owner_name text not null,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz not null default now()
);

alter table bookings enable row level security;

-- ทดลอง: เปิดให้อ่าน/เพิ่ม/ลบได้อย่างอิสระ (ห้องประชุมยังเป็นข้อมูลจำลองฝั่ง client อยู่ ไม่มี login แบบ Supabase Auth
-- ให้ตรวจสิทธิ์เจ้าของจริง ๆ ตอนนี้) ก่อนใช้งานจริงควรจำกัดสิทธิ์ตามเจ้าของการจอง
create policy "trial_read_bookings" on bookings for select using (true);
create policy "trial_insert_bookings" on bookings for insert with check (true);
create policy "trial_delete_bookings" on bookings for delete using (true);

-- ข้อมูลทดลอง 2 รายการ ผูกกับนักเรียนที่มีอยู่จริง (66001) ให้เห็นตัวอย่างตอนเปิดแอปครั้งแรก
insert into bookings (room_id, date, start_time, end_time, people, purpose, owner_id, owner_name, status)
select 'room-2', current_date, '10:00', '11:00', 15, 'ประชุมฝ่ายวิชาการประจำเดือน', s.id, s.first_name || ' ' || s.last_name, 'approved'
from students s where s.student_id = '66001'
union all
select 'room-4', current_date, '14:00', '17:00', 60, 'อบรมครูใหม่ประจำภาคเรียน', s.id, s.first_name || ' ' || s.last_name, 'pending'
from students s where s.student_id = '66001';
