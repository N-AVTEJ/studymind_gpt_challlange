import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../../components/layout/Layout";
import api from "../../utils/api";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/api/notes/"), api.get("/api/notes/subjects")])
      .then(([n, s]) => { setNotes(n.data); setSubjects(["All", ...s.data]); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "All" ? notes : notes.filter((n) => n.subject === filter);

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!confirm("Delete this note?")) return;
    await api.delete(`/api/notes/${id}`);
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <Layout title="Notes">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          {subjects.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-500 transition-all ${filter === s ? "tag-acid tag" : "btn-ghost"}`}
              style={{ fontFamily: "Syne, sans-serif" }}>
              {s}
            </button>
          ))}
        </div>
        <Link href="/notes/new">
          <span className="btn-primary cursor-pointer text-sm">+ New note</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="card p-5 animate-pulse" style={{ height: 140 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">◈</p>
          <p className="font-700 mb-2" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>No notes here</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Create your first note and let AI do the rest.</p>
          <Link href="/notes/new"><span className="btn-primary cursor-pointer">Create note</span></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((n) => (
            <Link key={n.id} href={`/notes/${n.id}`}>
              <div className="card p-5 cursor-pointer h-full flex flex-col" style={{ minHeight: 150 }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-700 text-sm leading-snug" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>{n.title}</h3>
                  <button onClick={(e) => handleDelete(n.id, e)}
                    className="shrink-0 text-xs px-1.5 py-0.5 rounded transition-colors"
                    style={{ color: "var(--text-muted)", background: "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#F87171"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
                    ✕
                  </button>
                </div>
                <p className="text-xs leading-relaxed flex-1 mb-3 overflow-hidden" style={{ color: "var(--text-muted)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                  {n.summary || n.content}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="tag text-xs">{n.subject}</span>
                  {n.summary && <span className="tag-acid tag text-xs">Summarized</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
