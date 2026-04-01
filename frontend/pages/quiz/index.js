import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../components/layout/Layout";
import api from "../../utils/api";

export default function Quiz() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/quiz/results").then((r) => setResults(r.data)).finally(() => setLoading(false));
  }, []);

  const avg = results.length > 0
    ? Math.round((results.reduce((a, r) => a + (r.score / r.total), 0) / results.length) * 100)
    : 0;

  return (
    <Layout title="Quiz Results">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Take quizzes from any note's AI panel</p>
          <Link href="/notes"><span className="btn-primary cursor-pointer text-sm">Go to notes →</span></Link>
        </div>

        {results.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Quizzes taken", value: results.length },
              { label: "Average score", value: `${avg}%` },
              { label: "Best score", value: `${Math.round(Math.max(...results.map(r => r.score / r.total)) * 100)}%` },
            ].map((s) => (
              <div key={s.label} className="card p-5">
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)", fontFamily: "Syne, sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                <p className="text-2xl font-800" style={{ fontFamily: "Syne, sans-serif", color: "var(--acid)" }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-4 animate-pulse" style={{ height: 70 }} />)}</div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">◉</p>
            <p className="font-700 mb-2" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>No quizzes taken yet</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Open a note and click "Quiz me" to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((r) => {
              const pct = Math.round((r.score / r.total) * 100);
              const pass = pct >= 70;
              return (
                <div key={r.id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-600 text-sm" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>{r.subject || "General"}</span>
                      <span className="ml-2 text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="font-800 text-sm" style={{ fontFamily: "Syne, sans-serif", color: pass ? "var(--acid)" : "#F87171" }}>
                      {r.score}/{r.total} · {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface2)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pass ? "var(--acid)" : "#F87171", transition: "width 0.5s" }} />
                  </div>
                  {r.weak_topics?.length > 0 && (
                    <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                      Weak: {r.weak_topics.slice(0, 2).join(", ")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
