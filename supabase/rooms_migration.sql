-- ย้ายห้องประชุมจาก mock data (ค่าคงที่ในโค้ด) มาเป็นตารางจริงใน Supabase
-- ให้แอดมินเพิ่ม/แก้ไข/ลบห้องได้เองผ่านแอป (ไม่ต้องแก้โค้ด)
-- รันไฟล์นี้ใน Supabase Dashboard > SQL Editor > New query > Run

create table if not exists rooms (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  location text not null,
  capacity integer not null,
  requires_approval boolean not null default false,
  icon text not null default 'single',
  created_at timestamptz not null default now()
);

alter table rooms enable row level security;

-- ทดลอง: เปิดให้อ่าน/เพิ่ม/แก้ไข/ลบได้อย่างอิสระ (เหมือน bookings/UserData ก่อนหน้านี้)
create policy "trial_read_rooms" on rooms for select using (true);
create policy "trial_insert_rooms" on rooms for insert with check (true);
create policy "trial_update_rooms" on rooms for update using (true) with check (true);
create policy "trial_delete_rooms" on rooms for delete using (true);

-- ย้ายห้องเดิม 4 ห้องเข้าตาราง (ใช้ id เดิมเพื่อให้ตรงกับ room_id ที่ผูกอยู่ใน bookings เดิม)
insert into rooms (id, name, location, capacity, requires_approval, icon) values
  ('room-1', 'ห้องประชุมใหญ่', 'ตึกอำนวยการ', 50, true, 'group'),
  ('room-2', 'ห้องประชุมกลาง 2', 'ตึกวิชาการ ชั้น 2', 20, false, 'pair'),
  ('room-3', 'ห้องประชุมเล็ก 1', 'ตึกวิชาการ ชั้น 1', 8, false, 'single'),
  ('room-4', 'ห้องโสตทัศนศึกษา', 'ตึกกิจกรรม', 100, true, 'tv')
on conflict (id) do nothing;
