function initialsOf(name) {
  const parts = name.replace("ครู", "").trim().split(" ");
  if (parts.length > 1) return parts[0].charAt(0) + parts[1].charAt(0);
  return name.slice(0, 2);
}

export default function Header({ user, onLogout }) {
  return (
    <div className="topbar">
      <div>
        <p className="eyebrow">ระบบจองห้องประชุม</p>
        <h1>โรงเรียน...</h1>
      </div>
      <div className="user-chip">
        <div className="avatar">{initialsOf(user.name)}</div>
        <span className="user-name">{user.name}</span>
        <button type="button" className="logout-btn" aria-label="ออกจากระบบ" onClick={onLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </button>
      </div>
    </div>
  );
}
