import RoomIcon from "./RoomIcon.jsx";
import { getCurrentRoomStatus, STATUS_LABEL } from "../utils/roomStatus.js";

const BADGE_CLASS = {
  available: "badge badge-green",
  booked: "badge badge-coral",
  pending: "badge badge-amber",
};

export default function RoomCard({ room, bookings, onBook }) {
  const status = getCurrentRoomStatus(room.id, bookings);

  return (
    <div className="card room-card">
      <div className="room-card-top">
        <div className="room-icon">
          <RoomIcon type={room.icon} />
        </div>
        <span className={BADGE_CLASS[status]}>{STATUS_LABEL[status]}</span>
      </div>
      <div>
        <p className="room-name">{room.name}</p>
        <p className="room-location">{room.location}</p>
      </div>
      <p className="room-capacity">จุได้ {room.capacity} คน</p>
      <button type="button" className="btn room-book-btn" onClick={() => onBook(room.id)}>
        จองห้องนี้
      </button>
    </div>
  );
}
