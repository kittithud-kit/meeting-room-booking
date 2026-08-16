const PATHS = {
  group: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="3.5" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M17 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  pair: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="3.5" />
    </>
  ),
  single: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M6 21v-1.5A4.5 4.5 0 0 1 10.5 15h3a4.5 4.5 0 0 1 4.5 4.5V21" />
    </>
  ),
  tv: (
    <>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M9 21h6M12 17v4" />
    </>
  ),
};

export default function RoomIcon({ type }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[type] || PATHS.single}
    </svg>
  );
}
