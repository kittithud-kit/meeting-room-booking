import { toThaiDateLabel } from "../utils/thaiDate.js";

export default function MyBookings({ bookings, rooms, userId, onCancel }) {
  const mine = bookings
    .filter((b) => b.ownerId === userId)
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));

  const roomNameById = Object.fromEntries(rooms.map((r) => [r.id, r.name]));

  return (
    <section>
      <h2 className="section-title">การจองของฉัน</h2>
      {mine.length === 0 ? (
        <p className="empty-state">ยังไม่มีรายการจอง กด "จองห้องใหม่" เพื่อเริ่มจองห้องแรกของคุณ</p>
      ) : (
        <div className="my-bookings-list">
          {mine.map((b) => (
            <div className="my-booking-row" key={b.id}>
              <div>
                <p className="my-booking-room">{roomNameById[b.roomId] ?? b.roomId}</p>
                <p className="my-booking-time">
                  {toThaiDateLabel(b.date)} · {b.start}-{b.end}
                </p>
              </div>
              <div className="my-booking-actions">
                <span className={`badge ${b.status === "pending" ? "badge-amber" : "badge-green"}`}>
                  {b.status === "pending" ? "รออนุมัติ" : "ยืนยันแล้ว"}
                </span>
                <button type="button" className="btn my-booking-cancel" onClick={() => onCancel(b.id)}>
                  ยกเลิก
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
