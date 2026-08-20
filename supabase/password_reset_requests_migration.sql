-- ระบบคำขอรีเซ็ตรหัสผ่าน: นักเรียนกด "ลืมรหัสผ่าน" ส่งคำขอเข้าคิว
-- แอดมินกดอนุมัติในหน้า AdminPanel แล้วระบบจะล้างรหัสผ่านเดิม
-- ให้นักเรียนไปตั้งรหัสผ่านใหม่ผ่านหน้า "ตั้งรหัสผ่านครั้งแรก" ได้เอง
-- รันไฟล์นี้ใน Supabase Dashboard > SQL Editor > New query > Run

create table if not exists password_reset_requests (
  id uuid primary key default gen_random_uuid(),
  student_id text not null unique references "UserData"(student_id) on delete cascade,
  first_name text not null,
  last_name text not null,
  created_at timestamptz not null default now()
);

alter table password_reset_requests enable row level security;

create policy "trial_read_reset_requests" on password_reset_requests for select using (true);
create policy "trial_insert_reset_requests" on password_reset_requests for insert with check (true);
create policy "trial_delete_reset_requests" on password_reset_requests for delete using (true);

-- ล้างรหัสผ่านเดิมของนักเรียนคนนั้น (เหมือนที่เคยทำมือผ่าน Table Editor) แล้วลบคำขอทิ้ง
create or replace function approve_password_reset(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_student_id text;
begin
  select student_id into v_student_id from password_reset_requests where id = p_request_id;

  if v_student_id is null then
    raise exception 'REQUEST_NOT_FOUND';
  end if;

  update "UserData"
  set password_hash = null, registered = false
  where student_id = v_student_id;

  delete from password_reset_requests where id = p_request_id;
end;
$$;

grant execute on function approve_password_reset(uuid) to anon, authenticated;
