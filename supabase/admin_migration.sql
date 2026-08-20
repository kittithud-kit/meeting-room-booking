-- เพิ่มสิทธิ์แอดมิน สำหรับอนุมัติ/ปฏิเสธการจองห้องที่ต้องขออนุมัติ
-- รันไฟล์นี้ใน Supabase Dashboard > SQL Editor > New query > Run

alter table students add column if not exists is_admin boolean not null default false;

-- อนุญาตให้อัปเดตสถานะการจองได้ (ใช้ตอนกด "อนุมัติ")
create policy "trial_update_bookings" on bookings for update using (true) with check (true);

-- ต้องเปลี่ยน return type ของฟังก์ชันเดิม (เพิ่ม is_admin) จึงต้อง drop ก่อนสร้างใหม่
drop function if exists register_student(text, text);
drop function if exists login_student(text, text);

create or replace function register_student(p_student_id text, p_password text)
returns table (id uuid, student_id text, first_name text, last_name text, is_admin boolean)
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
    select students.id, students.student_id, students.first_name, students.last_name, students.is_admin
    from students where students.student_id = p_student_id;
end;
$$;

create or replace function login_student(p_student_id text, p_password text)
returns table (id uuid, student_id text, first_name text, last_name text, is_admin boolean)
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
    select students.id, students.student_id, students.first_name, students.last_name, students.is_admin
    from students where students.student_id = p_student_id;
end;
$$;

grant execute on function register_student(text, text) to anon, authenticated;
grant execute on function login_student(text, text) to anon, authenticated;
