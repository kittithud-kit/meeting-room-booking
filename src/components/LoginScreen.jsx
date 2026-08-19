import { useState } from "react";

const SCHOOL_LINE_ID = "@school.booking";

export default function LoginScreen({ onStudentLogin, onStudentRegister }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    if (!studentId.trim() || !password) {
      setError("กรอกรหัสประจำตัวนักเรียนและรหัสผ่านให้ครบ");
      return;
    }
    setError("");
    setSubmitting(true);
    const loginError = await onStudentLogin(studentId.trim(), password);
    setSubmitting(false);
    if (loginError) setError(loginError);
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    if (!studentId.trim() || !password || !confirmPassword) {
      setError("กรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (password !== confirmPassword) {
      setError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }
    setError("");
    setSubmitting(true);
    const registerError = await onStudentRegister(studentId.trim(), password);
    setSubmitting(false);
    if (registerError) setError(registerError);
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

        <div className="auth-mode-tabs">
          <button
            type="button"
            className={`auth-mode-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => switchMode("login")}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            className={`auth-mode-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => switchMode("register")}
          >
            ตั้งรหัสผ่านครั้งแรก
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} noValidate>
            <label htmlFor="studentId">รหัสประจำตัวนักเรียน</label>
            <input
              id="studentId"
              type="text"
              placeholder="เช่น 66001"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
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

            <button type="submit" className="btn primary login-submit" disabled={submitting}>
              {submitting ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} noValidate>
            <label htmlFor="regStudentId">รหัสประจำตัวนักเรียน</label>
            <input
              id="regStudentId"
              type="text"
              placeholder="เช่น 66001"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />

            <label htmlFor="regPassword">ตั้งรหัสผ่าน</label>
            <input
              id="regPassword"
              type="password"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label htmlFor="regConfirmPassword">ยืนยันรหัสผ่าน</label>
            <input
              id="regConfirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <p className="field-error">{error}</p>}

            <button type="submit" className="btn primary login-submit" disabled={submitting}>
              {submitting ? "กำลังตั้งค่า..." : "ตั้งรหัสผ่านและเข้าสู่ระบบ"}
            </button>
          </form>
        )}

        {mode === "login" && (
          <button type="button" className="forgot-password-link" onClick={() => setShowForgotModal(true)}>
            ลืมรหัสผ่าน?
          </button>
        )}

        <p className="login-footnote">บัญชีสร้างโดยแอดมินโรงเรียนเท่านั้น</p>
      </div>

      {showForgotModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="forgot-modal-title">
          <div className="card modal forgot-modal">
            <div className="modal-head">
              <h2 id="forgot-modal-title">ลืมรหัสผ่าน</h2>
              <button
                type="button"
                className="modal-close"
                aria-label="ปิด"
                onClick={() => setShowForgotModal(false)}
              >
                ✕
              </button>
            </div>
            <p className="modal-sub">
              ติดต่อแอดมินโรงเรียนผ่าน LINE เพื่อขอรีเซ็ตรหัสผ่าน
            </p>
            <div className="forgot-line-id">
              <span className="dot-icon dot-line" aria-hidden="true" />
              {SCHOOL_LINE_ID}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn primary" onClick={() => setShowForgotModal(false)}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
