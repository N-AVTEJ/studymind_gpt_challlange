import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import api from "../../utils/api";

export default function Flashcards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState("browse"); // browse | study

  useEffect(() => {
    api.get("/api/flashcards/").then((r) => setCards(r.data)).finally(() => setLoading(false));
  }, []);

  const next = () => { setIndex((i) => (i + 1) % cards.length); setFlipped(false); };
  const prev = () => { setIndex((i) => (i - 1 + cards.length) % cards.length); setFlipped(false); };

  const handleDelete = async (id) => {
    await api.delete(`/api/flashcards/${id}`);
    setCards(cards.filter((c) => c.id !== id));
    if (index >= cards.length - 1) setIndex(0);
  };

  return (
    <Layout title="Flashcards">
      {loading ? (
        <div className="card p-8 animate-pulse" />
      ) : cards.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-4">⬡</p>
          <p className="font-700 mb-2" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>No flashcards yet</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Go to any note and click "Flashcards" to generate them with AI.</p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{cards.length} cards total</p>
            <div className="flex gap-2">
              <button onClick={() => setMode("browse")} className={`btn-ghost text-sm ${mode === "browse" ? "tag-acid tag" : ""}`}>Browse</button>
              <button onClick={() => { setMode("study"); setIndex(0); setFlipped(false); }} className={`btn-ghost text-sm ${mode === "study" ? "tag-acid tag" : ""}`}>Study mode</button>
            </div>
          </div>

          {mode === "study" ? (
            <div>
              {/* Progress bar */}
              <div className="h-1 rounded-full mb-6 overflow-hidden" style={{ background: "var(--surface2)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${((index + 1) / cards.length) * 100}%`, background: "var(--acid)" }} />
              </div>

              <div onClick={() => setFlipped(!flipped)} className="cursor-pointer select-none" style={{ perspective: "1000px" }}>
                <div className="card p-10 text-center transition-all duration-300 hover:border-acid"
                  style={{ minHeight: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    borderColor: flipped ? "rgba(200,255,0,0.3)" : undefined }}>
                  <div className="w-8 h-8 rounded-lg mb-4 flex items-center justify-center text-sm"
                    style={{ background: flipped ? "rgba(200,255,0,0.1)" : "rgba(124,58,237,0.1)", color: flipped ? "var(--acid)" : "#A78BFA" }}>
                    {flipped ? "A" : "Q"}
                  </div>
                  <p className="text-base leading-relaxed font-500" style={{ color: "var(--text)", fontFamily: "DM Sans, sans-serif" }}>
                    {flipped ? cards[index].answer : cards[index].question}
                  </p>
                  <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>Click to {flipped ? "see question" : "reveal answer"}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <button onClick={prev} className="btn-ghost text-sm">← Previous</button>
                <span className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "Syne, sans-serif" }}>
                  {index + 1} / {cards.length}
                </span>
                <button onClick={next} className="btn-primary text-sm">Next →</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {cards.map((c, i) => (
                <div key={c.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs mb-1 font-600" style={{ color: "var(--acid)", fontFamily: "Syne, sans-serif", letterSpacing: "0.06em" }}>Q</p>
                      <p className="text-sm mb-3" style={{ color: "var(--text)" }}>{c.question}</p>
                      <p className="text-xs mb-1 font-600" style={{ color: "#A78BFA", fontFamily: "Syne, sans-serif", letterSpacing: "0.06em" }}>A</p>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{c.answer}</p>
                    </div>
                    <button onClick={() => handleDelete(c.id)} className="text-xs shrink-0 transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#F87171"}
                      onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
