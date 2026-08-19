// Rooms are still a client-side constant; bookings live in Supabase
// (see supabase/bookings_migration.sql and src/lib/bookingsApi.js).

export const ROOMS = [
  {
    id: "room-1",
    name: "ห้องประชุมใหญ่",
    location: "ตึกอำนวยการ",
    capacity: 50,
    requiresApproval: true,
    icon: "group",
  },
  {
    id: "room-2",
    name: "ห้องประชุมกลาง 2",
    location: "ตึกวิชาการ ชั้น 2",
    capacity: 20,
    requiresApproval: false,
    icon: "pair",
  },
  {
    id: "room-3",
    name: "ห้องประชุมเล็ก 1",
    location: "ตึกวิชาการ ชั้น 1",
    capacity: 8,
    requiresApproval: false,
    icon: "single",
  },
  {
    id: "room-4",
    name: "ห้องโสตทัศนศึกษา",
    location: "ตึกกิจกรรม",
    capacity: 100,
    requiresApproval: true,
    icon: "tv",
  },
];

export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 18; // exclusive
