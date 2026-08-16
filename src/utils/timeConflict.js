// Pure time-math helpers. No React, no state — easy to unit test on its own.

export function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return timeToMinutes(aStart) < timeToMinutes(bEnd) && timeToMinutes(bStart) < timeToMinutes(aEnd);
}

// Returns the first booking that conflicts with the given room/date/time
// range, or null if the slot is free. Bookings with status "cancelled"
// (not modeled yet, but reserved for later) are ignored; pending and
// approved bookings both block the slot since a pending request still
// holds a place in the queue.
export function findConflict({ bookings, roomId, date, start, end, excludeBookingId }) {
  if (!roomId || !date || !start || !end) return null;
  return (
    bookings.find(
      (b) =>
        b.id !== excludeBookingId &&
        b.roomId === roomId &&
        b.date === date &&
        rangesOverlap(start, end, b.start, b.end)
    ) || null
  );
}
