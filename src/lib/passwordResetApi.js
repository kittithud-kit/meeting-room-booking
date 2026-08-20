import { supabase } from "./supabaseClient.js";

function toRequest(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    name: `${row.first_name} ${row.last_name}`,
  };
}

// Returns null on success (including "already requested"), or an error message to show the user.
export async function requestPasswordReset(studentId) {
  const { data: student, error: lookupError } = await supabase
    .from("UserData")
    .select("first_name, last_name")
    .eq("student_id", studentId)
    .maybeSingle();

  if (lookupError) return "เชื่อมต่อฐานข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง";
  if (!student) return "ไม่พบรหัสประจำตัวนักเรียนนี้ในระบบ";

  const { error } = await supabase.from("password_reset_requests").insert({
    student_id: studentId,
    first_name: student.first_name,
    last_name: student.last_name,
  });

  if (error && error.code !== "23505") return "ส่งคำขอไม่สำเร็จ ลองใหม่อีกครั้ง";
  return null;
}

export async function fetchPasswordResetRequests() {
  const { data, error } = await supabase.from("password_reset_requests").select("*").order("created_at");
  if (error) throw error;
  return data.map(toRequest);
}

export async function approvePasswordReset(requestId) {
  const { error } = await supabase.rpc("approve_password_reset", { p_request_id: requestId });
  if (error) throw error;
}

export async function rejectPasswordReset(requestId) {
  const { error } = await supabase.from("password_reset_requests").delete().eq("id", requestId);
  if (error) throw error;
}
