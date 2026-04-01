import { useState, useEffect } from "react";
import Head from "next/head";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { href: "/dashboard", icon: "⬡", label: "Dashboard" },
  { href: "/notes", icon: "◈", label: "Notes" },
  { href: "/flashcards", icon: "⬡", label: "Flashcards" },
  { href: "/quiz", icon: "◉", label: "Quiz" },
  { href: "/search", icon: "◎", label: "Search" },
  { href: "/planner", icon: "⬗", label: "Study Planner" },
];

export default function Layout({ children, title }) {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      <Head>
        <title>{title ? `${title} | StudyMind` : "StudyMind"}</title>
      </Head>
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="beforeInteractive" />
      <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col shrink-0 transition-all duration-300"
        style={{
          width: collapsed ? 64 : 220,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          position: "fixed",
          top: 0, left: 0, bottom: 0,
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: "var(--acid)", color: "#0A0A0F" }}>S</div>
          {!collapsed && (
            <span className="font-display font-700 text-base" style={{ color: "var(--acid)", fontFamily: "Syne, sans-serif" }}>
              StudyMind
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-xs transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = router.pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={`nav-link cursor-pointer ${active ? "active" : ""}`}
                  style={{ justifyContent: collapsed ? "center" : "flex-start" }}
                  title={collapsed ? item.label : ""}
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-2 py-3" style={{ borderTop: "1px solid var(--border)" }}>
          {!collapsed && user && (
            <div className="px-3 py-2 mb-1">
              <p className="text-xs font-500 truncate" style={{ color: "var(--text)", fontFamily: "Syne, sans-serif" }}>{user.name}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="nav-link w-full cursor-pointer"
            style={{ justifyContent: collapsed ? "center" : "flex-start" }}
          >
            <span className="text-base shrink-0">⊗</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main
        className="flex-1 flex flex-col"
        style={{ marginLeft: collapsed ? 64 : 220, transition: "margin 300ms", minHeight: "100vh" }}
      >
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-8 py-4"
          style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)" }}
        >
          <h1 className="page-title text-xl mb-0" style={{ fontFamily: "Syne, sans-serif" }}>{title}</h1>
          <div className="flex items-center gap-2">
            <span className="tag-acid tag text-xs">{user?.name?.[0]?.toUpperCase() || "U"}</span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-8">{children}</div>
      </main>
      </div>
    </>
  );
}
