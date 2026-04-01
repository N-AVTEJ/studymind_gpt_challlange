import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../../components/layout/Layout";
import api from "../../utils/api";

const SUBJECTS = ["General","Mathematics","Physics","Chemistry","Biology","History","English","Computer Science","Economics","Other"];
const TAB = { SUMMARY: "summary", FLASHCARDS: "flashcards", QUIZ: "quiz" };

export default function NoteDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [note, setNote] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [tab, setTab] = useState(null);
  const [aiData, setAiData] = useState({ summary: null, flashcards: [], quiz: [] });
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) setSpeechSupported(true);
    }
  }, []);

  const toggleListening = () => {
    if (!speechSupported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    const LANG_MAP = {
      "English": "en-US", "Hindi": "hi-IN", "Telugu": "te-IN",
      "Tamil": "ta-IN", "Kannada": "kn-IN", "Malayalam": "ml-IN"
    };
    recognition.lang = LANG_MAP[selectedLanguage] || "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript) {
        setForm((prev) => ({ 
          ...prev, 
          content: prev.content + (prev.content ? " " : "") + finalTranscript 
        }));
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech Recognition Error", e);
      alert("Microphone access denied or not supported");
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [quizDone, setQuizDone] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [answers, setAnswers] = useState([]);

  // Flashcard flip
  const [fcIndex, setFcIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/api/notes/${id}`).then((r) => {
      setNote(r.data);
      setForm({ title: r.data.title, content: r.data.content, subject: r.data.subject });
      if (r.data.summary) setAiData((p) => ({ ...p, summary: { summary: r.data.summary, key_points: r.data.key_points } }));
    });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const r = await api.put(`/api/notes/${id}`, form);
    setNote(r.data); setEditing(false); setSaving(false);
  };

  const runAI = async (action) => {
    console.log("Starting AI action:", action, "on note:", id);
    setTab(action); setAiLoading(true);
    try {
      const body = { language: selectedLanguage };
      if (action === TAB.SUMMARY) {
        const r = await api.post(`/api/ai/summarize/${id}`, body);
        setAiData((p) => ({ ...p, summary: r.data }));
        setNote((prev) => ({ ...prev, summary: r.data.summary, key_points: r.data.key_points }));
      } else if (action === TAB.FLASHCARDS) {
        const r = await api.post(`/api/ai/flashcards/${id}`, body);
        setAiData((p) => ({ ...p, flashcards: r.data }));
        setFcIndex(0); setFlipped(false);
      } else if (action === TAB.QUIZ) {
        const r = await api.post(`/api/ai/quiz/${id}`, body);
        setAiData((p) => ({ ...p, quiz: r.data }));
        setQuizIndex(0); setSelected(null); setQuizDone(false); setQuizScore(0); setAnswers([]);
      }
      console.log("AI Action Success:", action);
    } catch (e) { 
      console.error("AI Action Error:", action, e);
      alert("AI Action Failed: " + (e.response?.data?.error || e.message));
    } finally { 
      setAiLoading(false); 
    }
  };

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = aiData.quiz[quizIndex].correct === idx;
    const newAnswers = [...answers, { selected: idx, correct }];
    setAnswers(newAnswers);
    if (correct) setQuizScore((s) => s + 1);
    setTimeout(() => {
      if (quizIndex + 1 >= aiData.quiz.length) {
        setQuizDone(true);
        const weak = aiData.quiz.filter((q, i) => !newAnswers[i]?.correct).map((q) => q.question.slice(0, 40));
        api.post("/api/quiz/results", { subject: note.subject, score: correct ? quizScore + 1 : quizScore, total: aiData.quiz.length, weak_topics: weak });
      } else {
        setQuizIndex((i) => i + 1);
        setSelected(null);
      }
    }, 1200);
  };

  if (!note) return <Layout title="Note"><div className="animate-pulse card p-8" /></Layout>;

  return (
    <Layout title={note.title}>
      <div className="max-w-4xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/notes"><span className="btn-ghost text-sm cursor-pointer">← Notes</span></Link>
          <span className="tag text-xs">{note.subject}</span>
          {note.summary && <span className="tag-acid tag text-xs">AI ready</span>}
          <div className="ml-auto flex gap-2">
            {editing ? (
              <>
                <button onClick={() => { setEditing(false); setForm({ title: note.title, content: note.content, subject: note.subject }); }} className="btn-ghost text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? "Saving…" : "Save"}</button>
              </>
            ) : (
              <div className="flex gap-2">
                {speechSupported && (
                  <button onClick={() => { setEditing(true); setTimeout(toggleListening, 300); }} 
                    className="btn-ghost text-sm flex items-center gap-2" style={{ borderColor: "var(--acid)", color: "var(--acid)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                    Voice Note
                  </button>
                )}
                <button onClick={() => setEditing(true)} className="btn-ghost text-sm">Edit</button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Note content */}
          <div className="col-span-3">
            <div className="card p-6">
              {editing ? (
                <div className="space-y-4">
                  <input className="input text-base font-700" value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ fontFamily: "Syne, sans-serif" }} />
                  <select className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="relative">
                    <textarea className="input pr-12" rows={15} value={form.content} style={{ resize: "vertical", lineHeight: 1.7 }}
                      onChange={(e) => setForm({ ...form, content: e.target.value })} />
                    {speechSupported && (
                      <button
                        onClick={toggleListening}
                        type="button"
                        className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition-all duration-300 ${isListening ? 'bg-red-500 animate-pulse ring-4 ring-red-500/20' : 'bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] hover:scale-110'}`}
                        title={isListening ? "Click to stop" : "Click to speak"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                      </button>
                    )}
                  </div>
                  {isListening && <p className="text-xs text-[#6366f1] animate-pulse mt-2">🎤 Listening...</p>}
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-700 mb-4" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>{note.title}</h2>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
                    {note.content}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Panel */}
          <div className="col-span-2">
            <div className="mb-4">
              <p className="label">Response Language</p>
              <select className="input" value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}>
                {["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam"].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            {/* AI action buttons */}
            <div className="space-y-2 mb-4">
              {[
                { key: TAB.SUMMARY, label: "✦ Summarize", desc: "Get key points" },
                { key: TAB.FLASHCARDS, label: "⬡ Flashcards", desc: "Generate cards" },
                { key: TAB.QUIZ, label: "◉ Quiz me", desc: "Test yourself" },
              ].map((a) => (
                <button key={a.key} onClick={() => runAI(a.key)}
                  className={`w-full card px-4 py-3 flex items-center gap-3 text-left transition-all cursor-pointer ${tab === a.key ? "border-acid" : ""}`}
                  style={{ borderColor: tab === a.key ? "rgba(200,255,0,0.4)" : undefined, background: tab === a.key ? "rgba(200,255,0,0.04)" : undefined }}>
                  <span className="text-sm font-600" style={{ color: tab === a.key ? "var(--acid)" : "var(--text)", fontFamily: "Syne, sans-serif" }}>{a.label}</span>
                  <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>{a.desc}</span>
                </button>
              ))}
            </div>

            {/* AI output */}
            {aiLoading && (
              <div className="card p-6 text-center">
                <div className="w-6 h-6 border-2 rounded-full animate-spin mx-auto mb-2"
                  style={{ borderColor: "var(--acid)", borderTopColor: "transparent" }} />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>AI is thinking…</p>
              </div>
            )}

            {!aiLoading && tab === TAB.SUMMARY && aiData.summary && (
              <div className="card p-5 space-y-4">
                <div>
                  <p className="label mb-2">Summary</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text)", fontFamily: "DM Sans, sans-serif" }}>{aiData.summary.summary}</p>
                </div>
                {aiData.summary.key_points?.length > 0 && (
                  <div>
                    <p className="label mb-2">Key points</p>
                    <ul className="space-y-1.5">
                      {aiData.summary.key_points.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                          <span style={{ color: "var(--acid)", flexShrink: 0, marginTop: 2 }}>›</span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!aiLoading && tab === TAB.FLASHCARDS && aiData.flashcards.length > 0 && (
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="label">{fcIndex + 1} / {aiData.flashcards.length}</p>
                  <div className="flex gap-2">
                    <button onClick={() => { setFcIndex(Math.max(0, fcIndex - 1)); setFlipped(false); }} className="btn-ghost text-xs px-2 py-1">‹</button>
                    <button onClick={() => { setFcIndex(Math.min(aiData.flashcards.length - 1, fcIndex + 1)); setFlipped(false); }} className="btn-ghost text-xs px-2 py-1">›</button>
                  </div>
                </div>
                <div onClick={() => setFlipped(!flipped)} className="cursor-pointer rounded-xl p-5 text-center transition-all"
                  style={{ background: "var(--surface2)", border: "1px solid var(--border)", minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div>
                    <p className="text-xs mb-2" style={{ color: "var(--acid)", fontFamily: "Syne, sans-serif", letterSpacing: "0.06em" }}>
                      {flipped ? "ANSWER" : "QUESTION"}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                      {flipped ? aiData.flashcards[fcIndex].answer : aiData.flashcards[fcIndex].question}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-center mt-2" style={{ color: "var(--text-muted)" }}>Click card to flip</p>
              </div>
            )}

            {!aiLoading && tab === TAB.QUIZ && aiData.quiz.length > 0 && (
              <div className="card p-5">
                {quizDone ? (
                  <div className="text-center py-4">
                    <p className="text-3xl font-800 mb-1" style={{ fontFamily: "Syne, sans-serif", color: quizScore / aiData.quiz.length >= 0.7 ? "var(--acid)" : "#F87171" }}>
                      {quizScore}/{aiData.quiz.length}
                    </p>
                    <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                      {quizScore / aiData.quiz.length >= 0.7 ? "Great job! 🎉" : "Keep practicing!"}
                    </p>
                    <button onClick={() => { setQuizDone(false); setQuizIndex(0); setSelected(null); setQuizScore(0); setAnswers([]); }}
                      className="btn-primary text-xs">Retry quiz</button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="label">Question {quizIndex + 1}/{aiData.quiz.length}</p>
                      <p className="text-xs font-700" style={{ color: "var(--acid)", fontFamily: "Syne, sans-serif" }}>{quizScore} pts</p>
                    </div>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text)" }}>
                      {aiData.quiz[quizIndex].question}
                    </p>
                    <div className="space-y-2">
                      {aiData.quiz[quizIndex].options.map((opt, i) => {
                        const isCorrect = aiData.quiz[quizIndex].correct === i;
                        const isSelected = selected === i;
                        let bg = "var(--surface2)", border = "var(--border)", color = "var(--text)";
                        if (selected !== null) {
                          if (isCorrect) { bg = "rgba(200,255,0,0.08)"; border = "rgba(200,255,0,0.4)"; color = "var(--acid)"; }
                          else if (isSelected) { bg = "rgba(239,68,68,0.08)"; border = "rgba(239,68,68,0.4)"; color = "#F87171"; }
                        }
                        return (
                          <button key={i} onClick={() => handleAnswer(i)}
                            className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all"
                            style={{ background: bg, border: `1px solid ${border}`, color, fontFamily: "DM Sans, sans-serif" }}>
                            <span className="text-xs mr-2 font-600" style={{ fontFamily: "Syne, sans-serif" }}>{["A","B","C","D"][i]}.</span>{opt}
                          </button>
                        );
                      })}
                    </div>
                    {selected !== null && aiData.quiz[quizIndex].explanation && (
                      <p className="text-xs mt-3 p-2 rounded" style={{ color: "var(--text-muted)", background: "var(--surface2)" }}>
                        {aiData.quiz[quizIndex].explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {!tab && (
              <div className="card p-6 text-center">
                <p className="text-2xl mb-2">✦</p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Choose an AI action to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
