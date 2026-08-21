import { useState } from "react";
import { toThaiDateLabel } from "../utils/thaiDate.js";
import RoomIcon from "./RoomIcon.jsx";
import RoomFormModal from "./RoomFormModal.jsx";

export default function AdminPanel({
  bookings,
  rooms,
  onApprove,
  onReject,
  resetRequests,
  onApproveReset,
  onRejectReset,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
}) {
  const [editingRoom, setEditingRoom] = useState(null); // null = closed, {} = new, room = editing

  async function handleRoomSubmit(values) {
    if (editingRoom.id) await onUpdateRoom(editingRoom.id, values);
    else await onAddRoom(values);
    setEditingRoom(null);
  }

  function handleDeleteRoom(room) {
    if (window.confirm(`ลบห้อง "${room.name}" ใช่หรือไม่? การจองที่เคยมีในห้องนี้จะไม่ถูกลบตาม`)) {
      onDeleteRoom(room.id);
    }
  }

  const pending = bookings
    .filter((b) => b.status === "pending")
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));

  const roomNameById = Object.fromEntries(rooms.map((r) => [r.id, r.name]));

  return (
    <>
      <section>
        <h2 className="section-title">รออนุมัติ (แอดมิน)</h2>
        {pending.length === 0 ? (
          <p className="empty-state">ไม่มีรายการรออนุมัติ</p>
        ) : (
          <div className="my-bookings-list">
            {pending.map((b) => (
              <div className="my-booking-row" key={b.id}>
                <div>
                  <p className="my-booking-room">{roomNameById[b.roomId] ?? b.roomId}</p>
                  <p className="my-booking-time">
                    {toThaiDateLabel(b.date)} · {b.start}-{b.end} · {b.ownerName}
                  </p>
                </div>
                <div className="my-booking-actions">
                  <button type="button" className="btn my-booking-cancel" onClick={() => onReject(b.id)}>
                    ปฏิเสธ
                  </button>
                  <button type="button" className="btn primary" onClick={() => onApprove(b.id)}>
                    อนุมัติ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title">คำขอรีเซ็ตรหัสผ่าน (แอดมิน)</h2>
        {resetRequests.length === 0 ? (
          <p className="empty-state">ไม่มีคำขอรีเซ็ตรหัสผ่าน</p>
        ) : (
          <div className="my-bookings-list">
            {resetRequests.map((r) => (
              <div className="my-booking-row" key={r.id}>
                <div>
                  <p className="my-booking-room">{r.name}</p>
                  <p className="my-booking-time">รหัสประจำตัว {r.studentId}</p>
                </div>
                <div className="my-booking-actions">
                  <button type="button" className="btn my-booking-cancel" onClick={() => onRejectReset(r.id)}>
                    ปฏิเสธ
                  </button>
                  <button type="button" className="btn primary" onClick={() => onApproveReset(r.id)}>
                    อนุมัติ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="section-head-row">
          <h2 className="section-title">จัดการห้องประชุม (แอดมิน)</h2>
          <button type="button" className="btn primary" onClick={() => setEditingRoom({})}>
            + เพิ่มห้องใหม่
          </button>
        </div>
        <div className="my-bookings-list">
          {rooms.map((room) => (
            <div className="my-booking-row" key={room.id}>
              <div className="room-manage-info">
                <span className="room-icon">
                  <RoomIcon type={room.icon} />
                </span>
                <div>
                  <p className="my-booking-room">{room.name}</p>
                  <p className="my-booking-time">
                    {room.location} · จุได้ {room.capacity} คน
                    {room.requiresApproval ? " · ต้องขออนุมัติ" : ""}
                  </p>
                </div>
              </div>
              <div className="my-booking-actions">
                <button type="button" className="btn my-booking-cancel" onClick={() => handleDeleteRoom(room)}>
                  ลบ
                </button>
                <button type="button" className="btn" onClick={() => setEditingRoom(room)}>
                  แก้ไข
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {editingRoom && (
        <RoomFormModal
          room={editingRoom.id ? editingRoom : null}
          onClose={() => setEditingRoom(null)}
          onSubmit={handleRoomSubmit}
        />
      )}
    </>
  );
}
