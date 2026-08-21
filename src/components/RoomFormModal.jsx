import { useState } from "react";

const ICON_OPTIONS = [
  { value: "group", label: "กลุ่มใหญ่" },
  { value: "pair", label: "กลุ่มกลาง" },
  { value: "single", label: "คนเดียว / กลุ่มเล็ก" },
  { value: "tv", label: "โสตทัศนศึกษา" },
];

export default function RoomFormModal({ room, onClose, onSubmit }) {
  const isEdit = Boolean(room);
  const [name, setName] = useState(room?.name ?? "");
  const [location, setLocation] = useState(room?.location ?? "");
  const [capacity, setCapacity] = useState(room?.capacity ?? "");
  const [requiresApproval, setRequiresApproval] = useState(room?.requiresApproval ?? false);
  const [icon, setIcon] = useState(room?.icon ?? "single");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !capacity) {
      setError("กรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        location: location.trim(),
        capacity: Number(capacity),
        requiresApproval,
        icon,
      });
    } catch {
      setSubmitting(false);
      setError("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="room-modal-title">
      <div className="card modal">
        <div className="modal-head">
          <h2 id="room-modal-title">{isEdit ? "แก้ไขห้องประชุม" : "เพิ่มห้องประชุมใหม่"}</h2>
          <button type="button" className="modal-close" aria-label="ปิด" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="roomName">ชื่อห้อง</label>
          <input id="roomName" type="text" value={name} onChange={(e) => setName(e.target.value)} />

          <label htmlFor="roomLocation">สถานที่</label>
          <input id="roomLocation" type="text" value={location} onChange={(e) => setLocation(e.target.value)} />

          <div className="form-row-2">
            <div>
              <label htmlFor="roomCapacity">ความจุ (คน)</label>
              <input
                id="roomCapacity"
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="roomIcon">ไอคอน</label>
              <select id="roomIcon" value={icon} onChange={(e) => setIcon(e.target.value)}>
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={requiresApproval}
              onChange={(e) => setRequiresApproval(e.target.checked)}
            />
            ห้องนี้ต้องขออนุมัติก่อนใช้งาน
          </label>

          {error && <p className="field-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "เพิ่มห้อง"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
