-- เพิ่มรองรับระบบ login แบบ รหัสนักเรียน + รหัสผ่าน
-- รันไฟล์นี้ใน Supabase Dashboard > SQL Editor > New query > Run
-- (รันต่อจาก schema.sql เดิม)

alter table students add column if not exists registered boolean not null default false;

-- อนุญาตให้ mark ตัวเองว่า "ตั้งรหัสผ่านแล้ว" ได้ครั้งเดียว (เปลี่ยนจาก false -> true เท่านั้น)
-- ข้อควรระวัง: เป็น policy แบบทดลอง ยังไม่ได้จำกัดคอลัมน์อื่นที่แก้ไขพร้อมกันได้
create policy "self_register_students"
  on students for update
  using (registered = false)
  with check (registered = true);
