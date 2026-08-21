import { useState } from "react";
import Header from "./Header.jsx";
import RoomCard from "./RoomCard.jsx";
import Timeline from "./Timeline.jsx";
import MyBookings from "./MyBookings.jsx";
import AdminPanel from "./AdminPanel.jsx";
import BookingModal from "./BookingModal.jsx";

export default function Dashboard({
  user,
  rooms,
  bookings,
  resetRequests,
  onLogout,
  onAddBooking,
  onCancelBooking,
  onApproveBooking,
  onRejectBooking,
  onApproveReset,
  onRejectReset,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
}) {
  const [modalRoomId, setModalRoomId] = useState(null); // null when closed, "" or roomId when open
  const isModalOpen = modalRoomId !== null;

  function openModal(roomId = "") {
    setModalRoomId(roomId);
  }

  function closeModal() {
    setModalRoomId(null);
  }

  async function handleSubmitBooking(booking) {
    await onAddBooking(booking);
    closeModal();
  }

  return (
    <div className="app-shell">
      <Header user={user} onLogout={onLogout} />

      <div className="actions-row">
        <button type="button" className="btn primary" onClick={() => openModal("")}>
          + จองห้องใหม่
        </button>
      </div>

      <div className="room-grid">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} bookings={bookings} onBook={openModal} />
        ))}
      </div>

      <Timeline rooms={rooms} bookings={bookings} />

      <MyBookings bookings={bookings} rooms={rooms} userId={user.id} onCancel={onCancelBooking} />

      {user.isAdmin && (
        <AdminPanel
          bookings={bookings}
          rooms={rooms}
          onApprove={onApproveBooking}
          onReject={onRejectBooking}
          resetRequests={resetRequests}
          onApproveReset={onApproveReset}
          onRejectReset={onRejectReset}
          onAddRoom={onAddRoom}
          onUpdateRoom={onUpdateRoom}
          onDeleteRoom={onDeleteRoom}
        />
      )}

      {isModalOpen && (
        <BookingModal
          rooms={rooms}
          bookings={bookings}
          user={user}
          initialRoomId={modalRoomId}
          onClose={closeModal}
          onSubmit={handleSubmitBooking}
        />
      )}
    </div>
  );
}
