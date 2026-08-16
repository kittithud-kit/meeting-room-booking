import { useMemo, useState } from "react";
import LoginScreen from "./components/LoginScreen.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { ROOMS, DEMO_USER, buildInitialBookings } from "./data/mockData.js";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [bookings, setBookings] = useState(() => buildInitialBookings());

  const rooms = useMemo(() => ROOMS, []);

  function handleLogin() {
    // A real app would exchange an OAuth code / LINE token / credentials
    // for a session here. For this demo every login method resolves to
    // the same mock user so the rest of the app has something to show.
    setCurrentUser(DEMO_USER);
  }

  function handleLogout() {
    setCurrentUser(null);
  }

  function addBooking(booking) {
    setBookings((prev) => [...prev, booking]);
  }

  function cancelBooking(bookingId) {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

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
