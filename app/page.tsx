"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "forgot";

export default function Home() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId.trim() || !password.trim()) {
      setMessage("Please enter ID and password.");
      return;
    }

    setMessage("");
    router.push("/calendar");
  };

  const handleForgot = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("Reset link sent successfully. (demo)");
  };

  return (
    <div style={styles.container}>
      <div style={styles.appShell}>
        <div style={styles.leftPanel}>
          <div style={styles.brandBlock}>
            <img src="/logo.jpg" alt="EsyRIS logo" style={styles.heroLogo} />
            <div style={styles.brand}>EsyRIS</div>
            <div style={styles.brandSub}>Reports Platform</div>
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoLabel}>SECURE ACCESS</div>
            <div style={styles.infoTitle}>Radiology Workspace</div>
            <div style={styles.infoText}>
              Secure login and password recovery for clinical and administrative
              users in one streamlined authentication flow.
            </div>
          </div>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.card}>
            {mode === "login" ? (
              <>
                <div style={styles.pageHeaderWrap}>
                  <div style={styles.badge}>AUTHENTICATION</div>
                  <h2 style={styles.heading}>Login</h2>
                  <p style={styles.subtext}>
                    Enter any ID and password to open the calendar page.
                  </p>
                </div>

                <form onSubmit={handleLogin}>
                  <input
                    type="text"
                    placeholder="User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    style={styles.input}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                  />

                  <button type="submit" style={styles.primaryButton}>
                    Sign In
                  </button>
                </form>

                <p
                  style={styles.link}
                  onClick={() => {
                    setMode("forgot");
                    setMessage("");
                    setForgotEmail(userId);
                  }}
                >
                  Forgot Password?
                </p>
              </>
            ) : (
              <>
                <div style={styles.pageHeaderWrap}>
                  <div style={styles.badge}>PASSWORD RECOVERY</div>
                  <h2 style={styles.heading}>Forgot Password</h2>
                  <p style={styles.subtext}>
                    Enter your email address and we will send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleForgot}>
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={styles.input}
                  />

                  <button type="submit" style={styles.primaryButton}>
                    Send Reset Link
                  </button>
                </form>

                <p
                  style={styles.link}
                  onClick={() => {
                    setMode("login");
                    setMessage("");
                  }}
                >
                  Back to Login
                </p>
              </>
            )}

            {message ? <p style={styles.message}>{message}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "#111315",
    fontFamily: "Inter, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    boxSizing: "border-box",
  },
  appShell: {
    width: "100%",
    maxWidth: "1100px",
    minHeight: "640px",
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
    borderRadius: "12px",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "1fr 430px",
  },
  leftPanel: {
    background: "linear-gradient(180deg, #141618 0%, #111315 100%)",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    padding: "38px 34px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  brandBlock: {
    marginBottom: "28px",
  },
  heroLogo: {
    width: "96px",
    height: "96px",
    objectFit: "cover",
    borderRadius: "12px",
    marginBottom: "18px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
  },
  brand: {
    fontSize: "34px",
    fontWeight: 700,
    letterSpacing: "0.3px",
    color: "#ffffff",
  },
  brandSub: {
    marginTop: "8px",
    fontSize: "13px",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  },
  infoCard: {
    background: "#1b1e22",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "10px",
    padding: "22px",
    maxWidth: "440px",
  },
  infoLabel: {
    color: "#56a8ff",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "1px",
    marginBottom: "12px",
  },
  infoTitle: {
    fontSize: "28px",
    fontWeight: 700,
    marginBottom: "12px",
    color: "#ffffff",
  },
  infoText: {
    fontSize: "14px",
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.68)",
    maxWidth: "380px",
  },
  rightPanel: {
    background: "#111315",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "28px",
  },
  card: {
    width: "100%",
    maxWidth: "360px",
    background: "#17191d",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "30px",
    boxShadow: "0 16px 40px rgba(0,0,0,0.34)",
  },
  pageHeaderWrap: {
    marginBottom: "22px",
  },
  badge: {
    display: "inline-block",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "1px",
    textTransform: "uppercase",
    color: "#56a8ff",
    marginBottom: "12px",
  },
  heading: {
    margin: "0 0 8px 0",
    fontSize: "28px",
    fontWeight: 700,
    color: "#ffffff",
  },
  subtext: {
    margin: 0,
    fontSize: "14px",
    color: "rgba(255,255,255,0.58)",
    lineHeight: 1.6,
  },
  input: {
    width: "100%",
    padding: "13px 14px",
    margin: "0 0 14px 0",
    borderRadius: "6px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#101215",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  primaryButton: {
    width: "100%",
    height: "42px",
    background: "#2d8f52",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "4px",
    boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.18)",
  },
  link: {
    marginTop: "16px",
    color: "#56a8ff",
    cursor: "pointer",
    fontSize: "14px",
    textAlign: "center",
  },
  message: {
    marginTop: "14px",
    fontSize: "13px",
    textAlign: "center",
    color: "#53c27a",
  },
};