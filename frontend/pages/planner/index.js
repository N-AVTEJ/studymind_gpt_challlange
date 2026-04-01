import { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import api from "../../utils/api";

const SUBJECTS = ["Mathematics","Physics","Chemistry","Biology","History","English","Computer Science","Economics","General"];

export default function Planner() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ subject: "Mathematics", exam_date: "" });
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get("/api/planner/").then((r) => setPlans(r.data)).finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.exam_date) return;
    setGenerating(true);
    try {
      const r = await api.post("/api/planner/generate", form);
      setPlans([r.data, ...plans]);
      setExpanded(r.data.id);
      alert("Study plan generated successfully!");
    } catch (e) { 
      console.error(e); 
      alert("Failed to generate plan: " + (e.response?.data?.error || e.message));
    } finally { 
      setGenerating(false); 
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/planner/${id}`);
    setPlans(plans.filter((p) => p.id !== id));
  };

  const daysLeft = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <Layout title="Study Planner">
      <div className="max-w-3xl mx-auto">
        {/* Generate form */}
        <div className="card p-6 mb-8">
          <h3 className="font-700 mb-4" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>Generate a study plan</h3>
          <form onSubmit={handleGenerate} className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="label">Subject</label>
              <select className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Exam date</label>
              <input type="date" className="input" value={form.exam_date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm({ ...form, exam_date: e.target.value })} required />
            </div>
            <button type="submit" disabled={generating} className="btn-primary justify-center py-3">
              {generating ? "Generating…" : "Generate plan ✦"}
            </button>
          </form>
        </div>

        {/* Plans list */}
        {loading ? (
          <div className="space-y-4">{[1,2].map(i => <div key={i} className="card p-5 animate-pulse" style={{ height: 90 }} />)}</div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">⬗</p>
            <p className="font-700 mb-2" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>No study plans yet</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Fill in the form above to generate your first AI study plan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => {
              const days = daysLeft(plan.exam_date);
              const isOpen = expanded === plan.id;
              return (
                <div key={plan.id} className="card overflow-hidden">
                  <div className="p-5 flex items-center justify-between cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : plan.id)}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-700"
                        style={{ background: "rgba(200,255,0,0.08)", color: "var(--acid)", fontFamily: "Syne, sans-serif" }}>
                        {days}
                        <span className="text-xs ml-0.5">d</span>
                      </div>
                      <div>
                        <p className="font-700 text-sm" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>{plan.subject}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          Exam: {new Date(plan.exam_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {plan.plan?.days?.length || 0} days planned
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(plan.id); }}
                        className="text-xs px-2 py-1 rounded transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#F87171"}
                        onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>✕</button>
                      <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {isOpen && plan.plan && (
                    <div style={{ borderTop: "1px solid var(--border)" }}>
                      {/* Tips */}
                      {plan.plan.tips?.length > 0 && (
                        <div className="px-5 pt-4 pb-2">
                          <p className="label mb-2">Study tips</p>
                          <div className="flex flex-wrap gap-2">
                            {plan.plan.tips.map((tip, i) => (
                              <span key={i} className="tag text-xs">{tip}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Days */}
                      <div className="px-5 py-4 space-y-3 max-h-80 overflow-y-auto">
                        <p className="label mb-2">Daily schedule</p>
                        {plan.plan.days?.map((day, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="shrink-0 w-20 text-xs font-600 pt-0.5" style={{ color: "var(--acid)", fontFamily: "Syne, sans-serif" }}>
                              {new Date(day.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-600 mb-1" style={{ color: "var(--text)", fontFamily: "DM Sans, sans-serif" }}>{day.focus}</p>
                              <ul className="space-y-0.5">
                                {day.tasks?.map((task, j) => (
                                  <li key={j} className="text-xs flex items-start gap-1.5" style={{ color: "var(--text-muted)" }}>
                                    <span style={{ color: "var(--acid)", marginTop: 2 }}>›</span>{task}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
