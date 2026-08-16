import { useState } from "react";

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handlePasswordLogin(e) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("กรอกชื่อผู้ใช้และรหัสผ่านให้ครบก่อนเข้าสู่ระบบ");
      return;
    }
    setError("");
    onLogin();
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="logo-circle" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" />
            <path d="M5 21V9l7-5 7 5v12" />
            <path d="M9 21v-6h6v6" />
            <path d="M9 12h.01M15 12h.01" />
          </svg>
        </div>
        <h1>เข้าสู่ระบบ</h1>
        <p className="login-sub">ระบบจองห้องประชุม โรงเรียน...</p>

        <button type="button" className="btn oauth-btn" onClick={onLogin}>
          <span className="dot-icon dot-google" aria-hidden="true" />
          เข้าสู่ระบบด้วยอีเมลโรงเรียน (Google)
        </button>
        <button type="button" className="btn oauth-btn" onClick={onLogin}>
          <span className="dot-icon dot-line" aria-hidden="true" />
          เข้าสู่ระบบด้วย LINE
        </button>

        <div className="divider">
          <hr />
          <span>หรือ</span>
          <hr />
        </div>

        <form onSubmit={handlePasswordLogin} noValidate>
          <label htmlFor="username">ชื่อผู้ใช้</label>
          <input
            id="username"
            type="text"
            placeholder="somchai.jaidee"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label htmlFor="password">รหัสผ่าน</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="field-error">{error}</p>}

          <button type="submit" className="btn primary login-submit">
            เข้าสู่ระบบ
          </button>
        </form>

        <p className="login-footnote">บัญชีสร้างโดยแอดมินโรงเรียนเท่านั้น</p>
      </div>
    </div>
  );
}
