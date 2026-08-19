import { useEffect, useMemo, useState } from "react";
import LoginScreen from "./components/LoginScreen.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { ROOMS } from "./data/mockData.js";
import { supabase } from "./lib/supabaseClient.js";
import { fetchBookings, insertBooking, deleteBooking } from "./lib/bookingsApi.js";

const SESSION_KEY = "mrb_current_user";

function studentToUser(row) {
  return {
    id: row.id,
    name: `${row.first_name} ${row.last_name}`,
    studentId: row.student_id,
  };
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const rooms = useMemo(() => ROOMS, []);

  useEffect(() => {
    if (currentUser) localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    else localStorage.removeItem(SESSION_KEY);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    setBookingsLoading(true);
    fetchBookings()
      .then(setBookings)
      .finally(() => setBookingsLoading(false));
  }, [currentUser]);

  async function handleStudentRegister(studentId, password) {
    const { data, error } = await supabase.rpc("register_student", {
      p_student_id: studentId,
      p_password: password,
    });

    if (error) {
      if (error.message.includes("STUDENT_NOT_FOUND")) return "ไม่พบรหัสประจำตัวนักเรียนนี้ในระบบ";
      if (error.message.includes("ALREADY_REGISTERED")) return "รหัสนักเรียนนี้ตั้งรหัสผ่านไปแล้ว กรุณาเข้าสู่ระบบแทน";
      return "ตั้งรหัสผ่านไม่สำเร็จ ลองใหม่อีกครั้ง";
    }

    const row = data?.[0];
    if (!row) return "ตั้งรหัสผ่านไม่สำเร็จ ลองใหม่อีกครั้ง";

    setCurrentUser(studentToUser(row));
    return null;
  }

  async function handleStudentLogin(studentId, password) {
    const { data, error } = await supabase.rpc("login_student", {
      p_student_id: studentId,
      p_password: password,
    });

    if (error || !data?.[0]) return "รหัสประจำตัวนักเรียนหรือรหัสผ่านไม่ถูกต้อง";

    setCurrentUser(studentToUser(data[0]));
    return null;
  }

  function handleLogout() {
    setCurrentUser(null);
  }

  async function addBooking(booking) {
    const saved = await insertBooking(booking);
    setBookings((prev) => [...prev, saved]);
  }

  async function cancelBooking(bookingId) {
    await deleteBooking(bookingId);
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  }

  if (!currentUser) {
    return (
      <LoginScreen onStudentLogin={handleStudentLogin} onStudentRegister={handleStudentRegister} />
    );
  }

  if (bookingsLoading) return null;

  return (
    <Dashboard
      user={currentUser}
      rooms={rooms}
      bookings={bookings}
      onLogout={handleLogout}
      onAddBooking={addBooking}
      onCancelBooking={cancelBooking}
    />
  );
}
