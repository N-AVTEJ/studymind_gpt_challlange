import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: "◈", label: "AI Summaries", desc: "Paste notes, get a crisp summary and bullet-point key concepts in seconds." },
  { icon: "⬡", label: "Auto Flashcards", desc: "Gemini generates question-answer pairs from any note. Active recall, automated." },
  { icon: "◉", label: "Smart Quizzes", desc: "MCQ quizzes built from your notes. Scores feed into your adaptive study plan." },
  { icon: "◎", label: "Semantic Search", desc: "Ask anything in plain English and find answers across all your notes at once." },
  { icon: "⬗", label: "Study Planner", desc: "AI schedules your revision based on your exam dates and weak topics." },
  { icon: "⊕", label: "Subject Folders", desc: "Organise notes by subject. Filter, search, and access exactly what you need." },
];

const STEPS = [
  { num: "01", title: "Write your notes", desc: "Use the rich editor or paste directly from anywhere." },
  { num: "02", title: "Let AI process them", desc: "One click — summary, flashcards, and quiz questions generated." },
  { num: "03", title: "Study and track", desc: "Take quizzes, review flashcards, follow your personalized plan." },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const heroRef = useRef(null);

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user]);

  // Parallax subtle effect
  useEffect(() => {
    const handler = (e) => {
      if (!heroRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      heroRef.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <>
      <Head>
        <title>StudyMind — AI-Powered Smart Notes</title>
        <meta name="description" content="Take notes. Get AI summaries, flashcards, quizzes and study plans." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ background: "var(--bg)", minHeight: "100vh", overflowX: "hidden" }}>
        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
          style={{ background: "rgba(10,10,15,0.7)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: "var(--acid)", color: "#0A0A0F", fontFamily: "Syne, sans-serif" }}>S</div>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--acid)", fontSize: 18 }}>StudyMind</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <span className="btn-ghost cursor-pointer text-sm">Sign in</span>
            </Link>
            <Link href="/auth/register">
              <span className="btn-primary cursor-pointer text-sm">Get started free</span>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="section-grid relative flex flex-col items-center justify-center text-center px-6 pt-40 pb-28"
          style={{ minHeight: "100vh" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--hero-glow)" }} />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(200,255,0,0.06) 0%, transparent 70%)", filter: "blur(60px)" }} 
          />

          <motion.div 
            ref={heroRef}
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="relative z-10 max-w-3xl mx-auto"
          >
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
              style={{ background: "rgba(200,255,0,0.08)", border: "1px solid rgba(200,255,0,0.2)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--acid)" }} />
              <span className="text-xs font-500" style={{ color: "var(--acid)", fontFamily: "Syne, sans-serif" }}>
                Powered by Gemini AI
              </span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem,6vw,4.5rem)", lineHeight: 1.05, letterSpacing: "-0.03em", color: "var(--text)" }}
            >
              Notes that actually<br />
              <span style={{ color: "var(--acid)" }}>teach you back</span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="mt-6 text-lg leading-relaxed"
              style={{ color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif", maxWidth: 520, margin: "1.5rem auto 0" }}
            >
              Write your notes once. StudyMind turns them into summaries, flashcards, quizzes, and a personalized study plan — automatically.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="flex items-center justify-center gap-4 mt-10"
            >
              <Link href="/auth/register">
                <span className="btn-primary cursor-pointer px-7 py-3 text-base">Start for free →</span>
              </Link>
              <Link href="/auth/login">
                <span className="btn-ghost cursor-pointer px-7 py-3 text-base">Sign in</span>
              </Link>
            </motion.div>

            <motion.p variants={fadeInUp} className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
              No credit card needed · Gemini AI included
            </motion.p>
          </motion.div>

          {/* Hero mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative z-10 mt-20 w-full max-w-4xl mx-auto"
          >
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="card card-glow rounded-2xl overflow-hidden" 
              style={{ border: "1px solid rgba(200,255,0,0.12)" }}
            >
              <div className="flex items-center gap-2 px-5 py-3.5" style={{ background: "var(--surface2)", borderBottom: "1px solid var(--border)" }}>
                <span className="w-3 h-3 rounded-full" style={{ background: "#FF5F56" }} />
                <span className="w-3 h-3 rounded-full" style={{ background: "#FFBD2E" }} />
                <span className="w-3 h-3 rounded-full" style={{ background: "#27C93F" }} />
                <span className="ml-3 text-xs font-mono" style={{ color: "var(--text-muted)", fontFamily: "JetBrains Mono, monospace" }}>studymind.app/notes</span>
              </div>
              <div className="p-6 grid grid-cols-3 gap-4 text-left">
                <div className="col-span-1 space-y-2">
                  {["Physics Ch.3", "Organic Chem", "Linear Algebra", "World History"].map((n, i) => (
                    <div key={i} className="px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all"
                      style={{ background: i === 0 ? "rgba(200,255,0,0.08)" : "var(--surface2)", color: i === 0 ? "var(--acid)" : "var(--text-muted)", border: `1px solid ${i === 0 ? "rgba(200,255,0,0.2)" : "transparent"}`, fontFamily: "DM Sans, sans-serif" }}>
                      {n}
                    </div>
                  ))}
                </div>
                <div className="col-span-2 rounded-lg p-4" style={{ background: "var(--surface2)" }}>
                  <p className="text-xs mb-3" style={{ color: "var(--text-muted)", fontFamily: "Syne, sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>AI Summary</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text)", fontFamily: "DM Sans, sans-serif" }}>
                    Newton's three laws describe the relationship between a body and the forces acting upon it. The first law establishes inertia, the second defines force as mass×acceleration...
                  </p>
                  <div className="flex gap-2 mt-4">
                    {["6 Flashcards", "5 Quiz Qs", "Study Plan"].map((t) => (
                      <span key={t} className="tag text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="px-8 py-24 max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-xs font-500 mb-3" style={{ color: "var(--acid)", fontFamily: "Syne, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>Everything you need</p>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "var(--text)" }}>
              Built for how students actually study
            </h2>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {FEATURES.map((f, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                className="card p-6 group cursor-default hover:card-glow"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-4 transition-all duration-200"
                  style={{ background: "rgba(200,255,0,0.08)", color: "var(--acid)" }}>
                  {f.icon}
                </div>
                <h3 className="font-700 mb-2 text-base" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>{f.label}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* How it works */}
        <section className="section-grid px-8 py-24 border-y border-[var(--border)]">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-xs font-500 mb-3" style={{ color: "var(--violet)", fontFamily: "Syne, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>How it works</p>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "var(--text)" }}>
                Three steps to better grades
              </h2>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {STEPS.map((s, i) => (
                <motion.div key={i} variants={fadeInUp} className="text-center group">
                  <motion.div 
                    whileHover={{ scale: 1.1, color: "var(--acid)" }}
                    className="text-5xl font-800 mb-4 transition-colors" 
                    style={{ fontFamily: "Syne, sans-serif", color: "rgba(200,255,0,0.15)" }}
                  >
                    {s.num}
                  </motion.div>
                  <h3 className="font-700 mb-2" style={{ fontFamily: "Syne, sans-serif", color: "var(--text)" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{s.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-8 py-32 text-center relative overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto relative z-10"
          >
            <h2 className="mb-4" style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem,5vw,3.5rem)", color: "var(--text)", lineHeight: 1.1 }}>
              Stop storing notes.<br /><span style={{ color: "var(--acid)" }}>Start learning from them.</span>
            </h2>
            <p className="mb-10 text-lg" style={{ color: "var(--text-muted)" }}>Join students turning passive notes into active knowledge.</p>
            <Link href="/auth/register">
              <motion.span 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary cursor-pointer px-10 py-4 text-base shadow-[0_0_20px_rgba(200,255,0,0.2)]"
              >
                Create your free account →
              </motion.span>
            </Link>
          </motion.div>
          
          {/* Background decorative element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--acid)] opacity-[0.03] blur-[120px] rounded-full" />
        </section>

        {/* Footer */}
        <footer className="px-8 py-8 text-center" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "DM Sans, sans-serif" }}>
            © 2025 StudyMind · Built with Next.js, Flask & Gemini AI
          </p>
        </footer>
      </div>
    </>
  );
}
