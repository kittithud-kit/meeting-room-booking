const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// "2026-08-15" -> "15 สิงหาคม 2569" (พ.ศ. = ค.ศ. + 543)
export function toThaiDateLabel(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const buddhistYear = y + 543;
  return `${d} ${THAI_MONTHS[m - 1]} ${buddhistYear}`;
}

// "2026-08-15" + 1 -> "2026-08-16"
export function addDays(isoDate, days) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
