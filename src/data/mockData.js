// Mock data layer.
// In a real deployment, `rooms` would come from a `rooms` table and
// `bookings` would come from a `bookings` table (see README for a suggested
// schema). Everything here is in-memory only and resets on page reload.

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

// Demo user we "log in" as regardless of which login method is clicked.
// Swap this for whatever your real auth provider returns.
export const DEMO_USER = {
  id: "u-001",
  name: "ครูสมชาย ใจดี",
};

function isoDateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Seed a handful of bookings anchored to "today" so the demo always looks
// alive no matter when you run it.
export function buildInitialBookings() {
  const today = isoDateOffset(0);
  return [
    {
      id: "bk-1",
      roomId: "room-2",
      date: today,
      start: "10:00",
      end: "11:00",
      people: 15,
      purpose: "ประชุมฝ่ายวิชาการประจำเดือน",
      ownerId: "u-002",
      ownerName: "ครูวิภา สุขใจ",
      status: "approved",
    },
    {
      id: "bk-2",
      roomId: "room-4",
      date: today,
      start: "14:00",
      end: "17:00",
      people: 60,
      purpose: "อบรมครูใหม่ประจำภาคเรียน",
      ownerId: "u-003",
      ownerName: "ครูประสิทธิ์ มั่นคง",
      status: "pending",
    },
    {
      id: "bk-3",
      roomId: "room-3",
      date: isoDateOffset(3),
      start: "09:00",
      end: "10:30",
      people: 5,
      purpose: "พบผู้ปกครองนักเรียน",
      ownerId: DEMO_USER.id,
      ownerName: DEMO_USER.name,
      status: "approved",
    },
    {
      id: "bk-4",
      roomId: "room-1",
      date: isoDateOffset(5),
      start: "13:00",
      end: "15:00",
      people: 40,
      purpose: "ประชุมผู้ปกครองประจำภาคเรียน",
      ownerId: DEMO_USER.id,
      ownerName: DEMO_USER.name,
      status: "pending",
    },
  ];
}

export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 18; // exclusive
