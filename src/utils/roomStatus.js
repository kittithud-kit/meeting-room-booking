import { timeToMinutes } from "./timeConflict.js";
import { todayISO } from "./thaiDate.js";

// "available" | "booked" | "pending" — reflects the room's status *right now*,
// not for the whole day. A room can be free now even if it has bookings
// later this afternoon.
export function getCurrentRoomStatus(roomId, bookings) {
  const today = todayISO();
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const todaysBookings = bookings.filter((b) => b.roomId === roomId && b.date === today);

  const activeApproved = todaysBookings.find(
    (b) => b.status === "approved" && nowMinutes >= timeToMinutes(b.start) && nowMinutes < timeToMinutes(b.end)
  );
  if (activeApproved) return "booked";

  const activePending = todaysBookings.find(
    (b) => b.status === "pending" && nowMinutes >= timeToMinutes(b.start) && nowMinutes < timeToMinutes(b.end)
  );
  if (activePending) return "pending";

  return "available";
}

export const STATUS_LABEL = {
  available: "ว่าง",
  booked: "ไม่ว่าง",
  pending: "รออนุมัติ",
};
