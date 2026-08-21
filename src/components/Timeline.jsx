import { useState } from "react";
import { DAY_START_HOUR, DAY_END_HOUR } from "../data/mockData.js";
import { rangesOverlap } from "../utils/timeConflict.js";
import { todayISO, toThaiDateLabel, addDays } from "../utils/thaiDate.js";

const HOURS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i);

function hourLabel(h) {
  return `${String(h).padStart(2, "0")}:00`;
}

function blockStateForHour(room, hour, todaysBookings) {
  const hStart = `${String(hour).padStart(2, "0")}:00`;
  const hEnd = `${String(hour + 1).padStart(2, "0")}:00`;
  const roomBookings = todaysBookings.filter((b) => b.roomId === room.id);

  const busy = roomBookings.find((b) => b.status === "approved" && rangesOverlap(hStart, hEnd, b.start, b.end));
  if (busy) return "busy";

  const pending = roomBookings.find((b) => b.status === "pending" && rangesOverlap(hStart, hEnd, b.start, b.end));
  if (pending) return "pending";

  return "free";
}

export default function Timeline({ rooms, bookings }) {
  const today = todayISO();
  const [selectedDate, setSelectedDate] = useState(today);
  const isToday = selectedDate === today;
  const dayBookings = bookings.filter((b) => b.date === selectedDate);

  return (
    <section>
      <div className="timeline-head">
        <h2 className="section-title">
          {isToday ? "ตารางเวลาวันนี้" : "ตารางเวลา"} · {toThaiDateLabel(selectedDate)}
        </h2>
        <div className="timeline-nav">
          <button
            type="button"
            className="btn tl-nav-btn"
            aria-label="วันก่อนหน้า"
            onClick={() => setSelectedDate((d) => addDays(d, -1))}
          >
            ‹
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            aria-label="เลือกวันที่"
          />
          <button
            type="button"
            className="btn tl-nav-btn"
            aria-label="วันถัดไป"
            onClick={() => setSelectedDate((d) => addDays(d, 1))}
          >
            ›
          </button>
          {!isToday && (
            <button type="button" className="btn" onClick={() => setSelectedDate(today)}>
              วันนี้
            </button>
          )}
        </div>
      </div>
      <div className="card timeline-card">
        <div className="tl-scroll">
          {rooms.map((room) => (
            <div className="tl-row" key={room.id}>
              <span className="tl-label">{room.name}</span>
              <div className="tl-bars">
                {HOURS.map((hour) => {
                  const state = blockStateForHour(room, hour, dayBookings);
                  return (
                    <div
                      key={hour}
                      className={`tl-slot tl-slot-${state}`}
                      title={`${room.name} · ${hourLabel(hour)}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          <div className="tl-hours">
            <span />
            {HOURS.map((hour) => (
              <span className="tl-hour" key={hour}>
                {hourLabel(hour)}
              </span>
            ))}
          </div>
        </div>

        <div className="legend">
          <span className="legend-item">
            <span className="legend-dot legend-dot-free" /> ว่าง
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot-busy" /> ถูกจอง
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot-pending" /> รออนุมัติ
          </span>
        </div>
      </div>
    </section>
  );
}
