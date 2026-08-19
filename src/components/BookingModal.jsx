import { useState } from "react";
import { findConflict } from "../utils/timeConflict.js";
import { todayISO } from "../utils/thaiDate.js";

export default function BookingModal({ rooms, bookings, user, initialRoomId, onClose, onSubmit }) {
  const [roomId, setRoomId] = useState(initialRoomId || "");
  const [date, setDate] = useState(todayISO());
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [people, setPeople] = useState("");
  const [purpose, setPurpose] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedRoom = rooms.find((r) => r.id === roomId) || null;
  const timesFilled = Boolean(roomId && date && start && end);
  const timeOrderValid = timesFilled ? start < end : true;
  const conflict = timesFilled && timeOrderValid ? findConflict({ bookings, roomId, date, start, end }) : null;
  const capacityExceeded = selectedRoom && people && Number(people) > selectedRoom.capacity;

  let statusTone = null;
  let statusText = "";
  if (timesFilled) {
    if (!timeOrderValid) {
      statusTone = "danger";
      statusText = "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่ม";
    } else if (conflict) {
      statusTone = "danger";
      statusText = `ช่วงเวลานี้ห้องถูกจองแล้ว (${conflict.start}-${conflict.end} โดย ${conflict.ownerName}) กรุณาเลือกเวลาอื่น`;
    } else if (capacityExceeded) {
      statusTone = "danger";
      statusText = `จำนวนผู้เข้าร่วมเกินความจุห้อง (สูงสุด ${selectedRoom.capacity} คน)`;
    } else {
      statusTone = "success";
      statusText = "ช่วงเวลานี้ว่าง สามารถจองได้";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!roomId || !date || !start || !end) {
      setSubmitError("กรุณากรอกห้อง วันที่ และเวลาให้ครบถ้วน");
      return;
    }
    if (!timeOrderValid) {
      setSubmitError("เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่ม");
      return;
    }
    if (conflict) {
      setSubmitError("ไม่สามารถจองได้ เนื่องจากเวลาซ้อนกับการจองอื่น");
      return;
    }
    if (capacityExceeded) {
      setSubmitError("จำนวนผู้เข้าร่วมเกินความจุของห้องที่เลือก");
      return;
    }

    setSubmitError("");
    setSubmitting(true);
    try {
      await onSubmit({
        roomId,
        date,
        start,
        end,
        people: people ? Number(people) : null,
        purpose: purpose.trim(),
        ownerId: user.id,
        ownerName: user.name,
        status: selectedRoom.requiresApproval ? "pending" : "approved",
      });
    } catch {
      setSubmitting(false);
      setSubmitError("บันทึกการจองไม่สำเร็จ ลองใหม่อีกครั้ง");
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
      <div className="card modal">
        <div className="modal-head">
          <h2 id="booking-modal-title">จองห้องประชุม</h2>
          <button type="button" className="modal-close" aria-label="ปิด" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="modal-sub">เลือกวันและเวลา ระบบจะตรวจสอบเวลาซ้อนกับห้องนั้นให้อัตโนมัติ</p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="room">เลือกห้อง</label>
          <select id="room" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            <option value="">— เลือกห้องประชุม —</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} (จุได้ {r.capacity} คน)
              </option>
            ))}
          </select>

          <div className="form-row-2">
            <div>
              <label htmlFor="date">วันที่</label>
              <input id="date" type="date" min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label htmlFor="people">จำนวนผู้เข้าร่วม</label>
              <input
                id="people"
                type="number"
                min="1"
                placeholder="เช่น 12"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div>
              <label htmlFor="start">เวลาเริ่ม</label>
              <input id="start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <label htmlFor="end">เวลาสิ้นสุด</label>
              <input id="end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          {statusTone && <p className={`status-box status-${statusTone}`}>{statusText}</p>}

          <label htmlFor="purpose">วัตถุประสงค์การใช้ห้อง</label>
          <textarea
            id="purpose"
            rows={2}
            placeholder="เช่น ประชุมฝ่ายวิชาการประจำเดือน"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />

          {submitError && <p className="field-error">{submitError}</p>}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? "กำลังบันทึก..." : "ยืนยันการจอง"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
