import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", form);
      login(res.data.token, res.data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Create account — StudyMind</title></Head>
      <div className="min-h-screen flex items-center justify-center px-4 section-grid" style={{ background: "var(--bg)" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div className="text-center mb-10">
            <Link href="/">
              <span className="inline-flex items-center gap-2 cursor-pointer">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
                  style={{ background: "var(--acid)", color: "#0A0A0F", fontFamily: "Syne, sans-serif", fontSize: 16 }}>S</div>
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--acid)", fontSize: 20 }}>StudyMind</span>
              </span>
            </Link>
            <h1 className="mt-6 text-2xl font-700" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>Create your account</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Free forever. No credit card needed.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}>
                {error}
              </div>
            )}
            <div>
              <label className="label">Full name</label>
              <input type="text" className="input" placeholder="Your name"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="At least 8 characters"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}>
              {loading ? "Creating account…" : "Create account →"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/auth/login">
              <span className="cursor-pointer" style={{ color: "var(--acid)" }}>Sign in</span>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
