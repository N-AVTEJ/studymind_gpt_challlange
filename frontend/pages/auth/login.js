import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", form);
      login(res.data.token, res.data.user);
      router.push("/dashboard");
    } catch (err) {
      console.error("Login detail:", err);
      if (!err.response) {
        setError("Cannot connect to backend. Is the Flask server running on port 5000?");
      } else if (err.response.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError(err.response?.data?.error || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Sign in — StudyMind</title></Head>
      <div className="min-h-screen flex items-center justify-center px-4 section-grid"
        style={{ background: "var(--bg)" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Logo */}
          <div className="text-center mb-10">
            <Link href="/">
              <span className="inline-flex items-center gap-2 cursor-pointer">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
                  style={{ background: "var(--acid)", color: "#0A0A0F", fontFamily: "Syne, sans-serif", fontSize: 16 }}>S</div>
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--acid)", fontSize: 20 }}>StudyMind</span>
              </span>
            </Link>
            <h1 className="mt-6 text-2xl font-700" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>Welcome back</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Sign in to continue studying</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}>
                {error}
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}>
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-8 pt-8 border-t border-[rgba(200,255,0,0.06)]">
            <p className="text-center text-[10px] uppercase tracking-widest font-700 opacity-40 mb-4" style={{ fontFamily: "Syne, sans-serif" }}>Demo Credentials</p>
            <div 
              onClick={() => setForm({ email: "demo@studymind.app", password: "demo123" })}
              className="card p-3 flex items-center justify-between cursor-pointer hover:border-[var(--acid)] transition-all group"
              style={{ background: "rgba(200,255,0,0.03)" }}
            >
              <div>
                <p className="text-xs font-bold" style={{ color: "var(--acid)" }}>demo@studymind.app</p>
                <p className="text-[10px] opacity-60">Password: demo123</p>
              </div>
              <span className="text-[10px] font-bold py-1 px-2 rounded bg-[rgba(200,255,0,0.1)] text-[var(--acid)] group-hover:bg-[var(--acid)] group-hover:text-black transition-colors">Fill Info</span>
            </div>
          </div>

          <p className="text-center mt-6 text-sm" style={{ color: "var(--text-muted)" }}>
            No account?{" "}
            <Link href="/auth/register">
              <span className="cursor-pointer" style={{ color: "var(--acid)" }}>Create one free</span>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
