import { supabase } from "./supabaseClient.js";

function toRoom(row) {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    capacity: row.capacity,
    requiresApproval: row.requires_approval,
    icon: row.icon,
  };
}

function toRow(room) {
  return {
    name: room.name,
    location: room.location,
    capacity: room.capacity,
    requires_approval: room.requiresApproval,
    icon: room.icon,
  };
}

export async function fetchRooms() {
  const { data, error } = await supabase.from("rooms").select("*").order("name");
  if (error) throw error;
  return data.map(toRoom);
}

export async function insertRoom(room) {
  const { data, error } = await supabase.from("rooms").insert(toRow(room)).select().single();
  if (error) throw error;
  return toRoom(data);
}

export async function updateRoom(roomId, room) {
  const { data, error } = await supabase.from("rooms").update(toRow(room)).eq("id", roomId).select().single();
  if (error) throw error;
  return toRoom(data);
}

export async function deleteRoom(roomId) {
  const { error } = await supabase.from("rooms").delete().eq("id", roomId);
  if (error) throw error;
}
