import { useState } from "react";
import Link from "next/link";
import Layout from "../../components/layout/Layout";
import api from "../../utils/api";

export default function Search() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await api.post("/api/ai/search", { query });
      setResult(r.data);
    } catch (e) { 
      console.error(e); 
      alert("Search Failed: " + (e.response?.data?.error || e.message));
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <Layout title="Search">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Ask anything about your notes in plain English</p>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input type="text" className="input flex-1" placeholder="e.g. explain what I wrote about Newton's laws…"
              value={query} onChange={(e) => setQuery(e.target.value)} />
            <button type="submit" disabled={loading} className="btn-primary shrink-0">
              {loading ? "…" : "Search →"}
            </button>
          </form>
        </div>

        {/* Example queries */}
        {!result && !loading && (
          <div className="space-y-2">
            <p className="label mb-3">Try asking</p>
            {[
              "Summarize everything I know about photosynthesis",
              "What are the key formulas I've noted?",
              "What topics should I review before my exam?",
              "Explain the main events in World War II from my notes",
            ].map((q) => (
              <button key={q} onClick={() => setQuery(q)}
                className="w-full card px-4 py-3 text-left text-sm transition-all cursor-pointer"
                style={{ color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
                <span style={{ color: "var(--acid)", marginRight: 8 }}>◎</span>{q}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="card p-8 text-center">
            <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3"
              style={{ borderColor: "var(--acid)", borderTopColor: "transparent" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Searching through your notes…</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: "var(--acid)", fontSize: 16 }}>✦</span>
                <p className="text-xs font-600" style={{ color: "var(--acid)", fontFamily: "Syne, sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>AI Answer</p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text)", fontFamily: "DM Sans, sans-serif" }}>{result.answer}</p>
            </div>

            {result.relevant_notes?.length > 0 && (
              <div>
                <p className="label mb-2">Sources from your notes</p>
                <div className="space-y-2">
                  {result.relevant_notes.map((noteId) => (
                    <Link key={noteId} href={`/notes/${noteId}`}>
                      <div className="card px-4 py-3 cursor-pointer flex items-center gap-2">
                        <span style={{ color: "var(--acid)", fontSize: 12 }}>◈</span>
                        <span className="text-sm" style={{ color: "var(--text)" }}>Note #{noteId}</span>
                        <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => { setResult(null); setQuery(""); }} className="btn-ghost text-sm w-full justify-center">
              New search
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
