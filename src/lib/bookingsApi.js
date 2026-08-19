import { supabase } from "./supabaseClient.js";

function toBooking(row) {
  return {
    id: row.id,
    roomId: row.room_id,
    date: row.date,
    start: row.start_time,
    end: row.end_time,
    people: row.people,
    purpose: row.purpose,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    status: row.status,
  };
}

export async function fetchBookings() {
  const { data, error } = await supabase.from("bookings").select("*").order("date").order("start_time");
  if (error) throw error;
  return data.map(toBooking);
}

export async function insertBooking(booking) {
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      room_id: booking.roomId,
      date: booking.date,
      start_time: booking.start,
      end_time: booking.end,
      people: booking.people,
      purpose: booking.purpose,
      owner_id: booking.ownerId,
      owner_name: booking.ownerName,
      status: booking.status,
    })
    .select()
    .single();
  if (error) throw error;
  return toBooking(data);
}

export async function deleteBooking(bookingId) {
  const { error } = await supabase.from("bookings").delete().eq("id", bookingId);
  if (error) throw error;
}
