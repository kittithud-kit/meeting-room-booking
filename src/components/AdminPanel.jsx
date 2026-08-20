import { toThaiDateLabel } from "../utils/thaiDate.js";

export default function AdminPanel({
  bookings,
  rooms,
  onApprove,
  onReject,
  resetRequests,
  onApproveReset,
  onRejectReset,
}) {
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
    </>
  );
}
