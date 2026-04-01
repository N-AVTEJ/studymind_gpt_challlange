import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    total_notes: 0, total_flashcards: 0, total_quizzes: 0, 
    avg_quiz_score: 0, streak: 0, quiz_history: [], notes_by_subject: [] 
  });
  const [recentNotes, setRecentNotes] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRefLine = useRef(null);
  const chartRefDonut = useRef(null);
  const chartInstanceLine = useRef(null);
  const chartInstanceDonut = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, statsRes, quizRes] = await Promise.all([
          api.get("/api/notes/"),
          api.get("/api/stats"),
          api.get("/api/quiz/results")
        ]);
        
        setRecentNotes(notesRes.data.slice(0, 4));
        setQuizResults(quizRes.data.slice(0, 3));
        if (statsRes.data.success) {
          console.log("Stats fetched successfully:", statsRes.data.data);
          setStats(statsRes.data.data);
          renderCharts(statsRes.data.data);
        } else {
          console.error("Stats API error:", statsRes.data.error);
        }
      } catch (e) {
        console.error("Dashboard data fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderCharts = async (data) => {
    console.log("Rendering charts with data:", data);
    let Chart = window.Chart;
    if (!Chart) {
      // If CDN hasn't loaded yet, retry after a short delay
      setTimeout(() => renderCharts(data), 500);
      return;
    }

    if (chartInstanceLine.current) chartInstanceLine.current.destroy();
    if (chartInstanceDonut.current) chartInstanceDonut.current.destroy();

    if (chartRefLine.current && data.quiz_history.length > 0) {
      chartInstanceLine.current = new Chart(chartRefLine.current, {
        type: 'line',
        data: {
          labels: data.quiz_history.map(q => q.date),
          datasets: [{
            label: 'Score %',
            data: data.quiz_history.map(q => q.score),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#6366f1'
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { min: 0, max: 100, grid: { color: '#27272a' }, ticks: { color: '#a1a1aa', font: { size: 10 } } },
            x: { grid: { display: false }, ticks: { color: '#a1a1aa', font: { size: 10 } } }
          }
        }
      });
    }

    if (chartRefDonut.current && data.notes_by_subject.length > 0) {
      chartInstanceDonut.current = new Chart(chartRefDonut.current, {
        type: 'doughnut',
        data: {
          labels: data.notes_by_subject.map(n => n.subject),
          datasets: [{
            data: data.notes_by_subject.map(n => n.count),
            backgroundColor: ['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#ddd6fe'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { 
            legend: { position: 'bottom', labels: { color: '#a1a1aa', padding: 20, font: { size: 11 } } } 
          },
          cutout: '70%'
        }
      });
    }
  };


  const QUICK_ACTIONS = [
    { label: "New note", href: "/notes/new", icon: "+" },
    { label: "Review flashcards", href: "/flashcards", icon: "⬡" },
    { label: "Take a quiz", href: "/quiz", icon: "◉" },
    { label: "Study planner", href: "/planner", icon: "⬗" },
  ];

  return (
    <Layout title="Dashboard">
      {/* Greeting */}
      <div className="mb-8">
        <h2 className="text-2xl font-700 mb-1" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user?.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Here's where you stand today.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Notes", value: stats.total_notes, icon: "◈", color: "#6366f1" },
          { label: "Total Flashcards", value: stats.total_flashcards, icon: "⬡", color: "#8b5cf6" },
          { label: "Quizzes Taken", value: stats.total_quizzes, icon: "◉", color: "#a78bfa" },
          { label: "Avg Quiz Score", value: `${stats.avg_quiz_score}%`, icon: "✦", color: "#c4b5fd" },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg" style={{ color: s.color }}>{s.icon}</span>
              <p className="text-[10px] font-700 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            </div>
            <p className="text-2xl font-800" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>
              {loading ? <span className="inline-block w-8 h-6 animate-pulse bg-[#1a1a1a] rounded" /> : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6 min-h-[300px] flex flex-col">
          <h3 className="font-700 text-sm mb-6 uppercase tracking-wider" style={{ fontFamily: "Syne, sans-serif", color: "var(--text-muted)" }}>Quiz Performance (Last 7)</h3>
          <div className="flex-1 relative">
            {loading ? (
              <div className="absolute inset-0 animate-pulse bg-[#1a1a1a] rounded-xl" />
            ) : stats.quiz_history.length > 0 ? (
              <canvas ref={chartRefLine} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Take your first quiz to see progress</p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 min-h-[300px] flex flex-col">
          <h3 className="font-700 text-sm mb-6 uppercase tracking-wider" style={{ fontFamily: "Syne, sans-serif", color: "var(--text-muted)" }}>Notes by Subject</h3>
          <div className="flex-1 relative">
            {loading ? (
              <div className="absolute inset-0 animate-pulse bg-[#1a1a1a] rounded-xl" />
            ) : stats.notes_by_subject.length > 0 ? (
              <canvas ref={chartRefDonut} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Add notes with subjects to see breakdown</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Streak Banner */}
      <div className={`card p-6 mb-8 flex items-center gap-6 transition-all ${stats.streak >= 7 ? 'border-[#6366f1] ring-1 ring-[#6366f1]/20' : ''}`}>
        <div className="text-4xl text-[#6366f1]">🔥</div>
        <div>
          <p className="text-xs font-700 uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Study Streak</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-800" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>
              {loading ? "—" : stats.streak}
            </span>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>days</span>
          </div>
        </div>
        {stats.streak === 0 && !loading && (
          <p className="ml-auto text-sm" style={{ color: "var(--text-muted)" }}>Start studying today to build your streak!</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent notes */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-700 text-base" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>Recent notes</h3>
            <Link href="/notes">
              <span className="text-xs cursor-pointer" style={{ color: "var(--acid)" }}>View all →</span>
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              [1,2,3,4].map(i => (
                <div key={i} className="card p-4 animate-pulse" style={{ height: 68 }} />
              ))
            ) : recentNotes.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>No notes yet. Start writing!</p>
                <Link href="/notes/new">
                  <span className="btn-primary cursor-pointer text-sm">Create first note</span>
                </Link>
              </div>
            ) : recentNotes.map((n) => (
              <Link key={n.id} href={`/notes/${n.id}`}>
                <div className="card p-4 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-500 text-sm truncate" style={{ color: "var(--text)", fontFamily: "DM Sans, sans-serif" }}>{n.title}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{n.content.slice(0, 80)}…</p>
                    </div>
                    <span className="tag text-xs ml-3 shrink-0">{n.subject}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick actions + quiz history */}
        <div className="space-y-6">
          <div>
            <h3 className="font-700 text-base mb-4" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>Quick actions</h3>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((a) => (
                <Link key={a.href} href={a.href}>
                  <div className="card px-4 py-3 flex items-center gap-3 cursor-pointer">
                    <span className="text-sm" style={{ color: "var(--acid)" }}>{a.icon}</span>
                    <span className="text-sm" style={{ color: "var(--text)", fontFamily: "DM Sans, sans-serif" }}>{a.label}</span>
                    <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {quizResults.length > 0 && (
            <div>
              <h3 className="font-700 text-base mb-4" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>Recent quizzes</h3>
              <div className="space-y-2">
                {quizResults.map((r) => (
                  <div key={r.id} className="card p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-500" style={{ color: "var(--text)", fontFamily: "Syne, sans-serif" }}>{r.subject || "General"}</span>
                      <span className="text-xs font-700" style={{ color: r.score / r.total >= 0.7 ? "var(--acid)" : "#F87171", fontFamily: "Syne, sans-serif" }}>
                        {r.score}/{r.total}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface2)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${(r.score / r.total) * 100}%`, background: r.score / r.total >= 0.7 ? "var(--acid)" : "#F87171" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
