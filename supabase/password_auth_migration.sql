-- เปลี่ยนวิธีเก็บรหัสผ่าน: ไม่ใช้ Supabase Auth (ซึ่งผูกกับอีเมลจริงและระบบยืนยันอีเมล)
-- แต่ hash รหัสผ่านเก็บไว้ในตาราง students เอง ด้วย pgcrypto (bcrypt) ซึ่งเป็นมาตรฐาน
-- เดียวกับที่ระบบ auth ทั่วไปใช้ การเช็ครหัสผ่านทำผ่านฟังก์ชันในฐานข้อมูล (RPC)
-- รหัสผ่านจริงและ hash จะไม่ถูกส่งกลับมาที่ฝั่งเบราว์เซอร์เลย
--
-- รันไฟล์นี้ใน Supabase Dashboard > SQL Editor > New query > Run
-- (รันต่อจาก schema.sql และ auth_migration.sql เดิม)

-- เอา policy เดิมที่ให้ anon แก้ไขตาราง students ตรง ๆ ออก (ไม่ปลอดภัยแล้วเพราะจะมี password_hash)
drop policy if exists "self_register_students" on students;

create extension if not exists pgcrypto;

alter table students add column if not exists password_hash text;

-- กันไม่ให้ query ทั่วไป (SELECT * จาก anon/authenticated) ดึงค่า password_hash ออกไปได้
revoke select (password_hash) on students from anon, authenticated;

-- เคลียร์ข้อมูลทดลองที่ registered=true ค้างจากการทดสอบรอบก่อน (ตอนนั้นยังไม่มี password_hash)
update students set registered = false where password_hash is null;

-- สมัคร/ตั้งรหัสผ่านครั้งแรก
create or replace function register_student(p_student_id text, p_password text)
returns table (id uuid, student_id text, first_name text, last_name text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_student students%rowtype;
begin
  select * into v_student from students where students.student_id = p_student_id;

  if v_student.id is null then
    raise exception 'STUDENT_NOT_FOUND';
  end if;

  if v_student.registered then
    raise exception 'ALREADY_REGISTERED';
  end if;

  update students
  set password_hash = crypt(p_password, gen_salt('bf')),
      registered = true
  where students.student_id = p_student_id;

  return query
    select students.id, students.student_id, students.first_name, students.last_name
    from students where students.student_id = p_student_id;
end;
$$;

-- เข้าสู่ระบบ
create or replace function login_student(p_student_id text, p_password text)
returns table (id uuid, student_id text, first_name text, last_name text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_student students%rowtype;
begin
  select * into v_student from students where students.student_id = p_student_id;

  if v_student.id is null or v_student.password_hash is null then
    raise exception 'INVALID_CREDENTIALS';
  end if;

  if v_student.password_hash <> crypt(p_password, v_student.password_hash) then
    raise exception 'INVALID_CREDENTIALS';
  end if;

  return query
    select students.id, students.student_id, students.first_name, students.last_name
    from students where students.student_id = p_student_id;
end;
$$;

grant execute on function register_student(text, text) to anon, authenticated;
grant execute on function login_student(text, text) to anon, authenticated;
