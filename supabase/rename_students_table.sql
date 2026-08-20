-- แก้ฟังก์ชัน register_student / login_student ให้ชี้ไปที่ตารางที่เปลี่ยนชื่อเป็น "UserData"
-- (ต้องรันไฟล์นี้ "หลังจาก" เปลี่ยนชื่อตาราง students -> UserData ใน Table Editor แล้วเท่านั้น)
-- รันใน SQL Editor > New query > Run

drop function if exists register_student(text, text);
drop function if exists login_student(text, text);

create or replace function register_student(p_student_id text, p_password text)
returns table (id uuid, student_id text, first_name text, last_name text, is_admin boolean)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_student "UserData"%rowtype;
begin
  select * into v_student from "UserData" where "UserData".student_id = p_student_id;

  if v_student.id is null then
    raise exception 'STUDENT_NOT_FOUND';
  end if;

  if v_student.registered then
    raise exception 'ALREADY_REGISTERED';
  end if;

  update "UserData"
  set password_hash = crypt(p_password, gen_salt('bf')),
      registered = true
  where "UserData".student_id = p_student_id;

  return query
    select "UserData".id, "UserData".student_id, "UserData".first_name, "UserData".last_name, "UserData".is_admin
    from "UserData" where "UserData".student_id = p_student_id;
end;
$$;

create or replace function login_student(p_student_id text, p_password text)
returns table (id uuid, student_id text, first_name text, last_name text, is_admin boolean)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_student "UserData"%rowtype;
begin
  select * into v_student from "UserData" where "UserData".student_id = p_student_id;

  if v_student.id is null or v_student.password_hash is null then
    raise exception 'INVALID_CREDENTIALS';
  end if;

  if v_student.password_hash <> crypt(p_password, v_student.password_hash) then
    raise exception 'INVALID_CREDENTIALS';
  end if;

  return query
    select "UserData".id, "UserData".student_id, "UserData".first_name, "UserData".last_name, "UserData".is_admin
    from "UserData" where "UserData".student_id = p_student_id;
end;
$$;

grant execute on function register_student(text, text) to anon, authenticated;
grant execute on function login_student(text, text) to anon, authenticated;
