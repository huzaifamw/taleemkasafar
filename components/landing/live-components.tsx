"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const landingLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "Blogs", href: "/blogs" },
  { label: "Feedback", href: "/#feedback" },
];

export function LandingNavbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-black bg-white/95 backdrop-blur">
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="relative z-10 leading-none" onClick={() => setOpen(false)}>
          <span className="block font-headline text-xl font-bold tracking-tighter">Taleem ka Safar</span>
          <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.24em] opacity-50">Learn. Practice. Progress.</span>
        </Link>

        <nav className="hidden items-center gap-7 font-headline text-sm font-bold uppercase md:flex" aria-label="Main navigation">
          {landingLinks.map((link) => (
            <Link key={link.label} href={link.href} className="group relative py-2 transition-colors hover:text-brand">
              {link.label}
              <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-brand transition-transform group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/auth/login" className="px-4 py-3 font-headline text-sm font-bold uppercase hover:text-brand">Sign in</Link>
          <Link href="/auth/sign-up" className="border-2 border-black bg-brand px-5 py-3 font-headline text-sm font-bold uppercase text-white shadow-hard-sm transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">Start free</Link>
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="landing-mobile-menu"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setOpen((current) => !current)}
          className={`relative z-10 grid h-11 w-11 place-items-center border-2 border-black shadow-hard-sm transition-colors md:hidden ${open ? "bg-black text-white" : "bg-white hover:bg-brand-fixed"}`}
        >
          <span className="material-symbols-outlined text-2xl">{open ? "close" : "menu"}</span>
        </button>

        {open && (
          <div id="landing-mobile-menu" className="animate-in slide-in-from-top-2 absolute left-0 right-0 top-[78px] border-b-2 border-black bg-white p-5 shadow-[0_10px_0_0_#000] md:hidden">
            <nav className="grid gap-2" aria-label="Mobile navigation">
              {landingLinks.map((link, index) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between border-2 border-black bg-white px-4 py-4 font-headline text-base font-bold uppercase transition-colors hover:bg-brand-fixed"
                >
                  <span><span className="mr-3 text-xs text-brand">0{index + 1}</span>{link.label}</span>
                  <span className="material-symbols-outlined text-xl">arrow_outward</span>
                </Link>
              ))}
            </nav>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t-2 border-black pt-4">
              <Link href="/auth/login" onClick={() => setOpen(false)} className="border-2 border-black bg-white px-3 py-4 text-center font-headline text-sm font-bold uppercase">Sign in</Link>
              <Link href="/auth/sign-up" onClick={() => setOpen(false)} className="border-2 border-black bg-brand px-3 py-4 text-center font-headline text-sm font-bold uppercase text-white shadow-hard-sm">Start free</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

const activity = [
  { name: "Areeba", action: "completed a Physics mock", score: "86%", color: "bg-[#d8e2ff]" },
  { name: "Hamza", action: "finished 25 Math MCQs", score: "+12%", color: "bg-[#c8f4d4]" },
  { name: "Maham", action: "reached a 10-day streak", score: "🔥 10", color: "bg-[#ffe8a3]" },
];

const tabs = [
  { id: "practice", label: "Smart practice", icon: "menu_book", title: "Work & Energy", eyebrow: "Physics · Chapter 04", value: "72%", detail: "18 of 25 questions", bar: "72%" },
  { id: "mock", label: "Mock exams", icon: "timer", title: "PU Admission Test", eyebrow: "Full-length simulation", value: "01:24", detail: "38 of 50 answered", bar: "76%" },
  { id: "insights", label: "AI insights", icon: "psychology", title: "Your weekly analysis", eyebrow: "Personal study coach", value: "+12%", detail: "Accuracy this week", bar: "84%" },
];

const studyMaps = [
  {
    id: "net",
    label: "NET",
    name: "NET Engineering",
    readiness: 78,
    change: "+9% this month",
    focus: "Rotational motion",
    subjects: [
      { name: "Mathematics", score: 84, tone: "bg-brand" },
      { name: "Physics", score: 62, tone: "bg-[#ff7a59]" },
      { name: "English", score: 79, tone: "bg-[#31a86b]" },
    ],
    plan: [
      { time: "Now", title: "Physics repair set", meta: "15 MCQs · 22 min", active: true },
      { time: "+25", title: "Formula recall", meta: "Rotational motion · 8 min" },
      { time: "+40", title: "Mixed speed round", meta: "20 MCQs · 30 min" },
    ],
    points: "4,31 28,25 52,29 76,17 100,21 124,10 148,14 176,5",
  },
  {
    id: "ecat",
    label: "ECAT",
    name: "ECAT Engineering",
    readiness: 71,
    change: "+14% this month",
    focus: "Chemical equilibrium",
    subjects: [
      { name: "Mathematics", score: 76, tone: "bg-brand" },
      { name: "Physics", score: 73, tone: "bg-[#31a86b]" },
      { name: "Chemistry", score: 58, tone: "bg-[#ff7a59]" },
      { name: "English", score: 81, tone: "bg-[#ffe066]" },
    ],
    plan: [
      { time: "Now", title: "Chemistry concept reset", meta: "12 MCQs · 18 min", active: true },
      { time: "+20", title: "Equation drill", meta: "Equilibrium · 12 min" },
      { time: "+35", title: "ECAT sprint", meta: "30 MCQs · 30 min" },
    ],
    points: "4,34 28,29 52,31 76,22 100,25 124,17 148,9 176,7",
  },
  {
    id: "pu",
    label: "PU",
    name: "PU Admission Test",
    readiness: 82,
    change: "+7% this month",
    focus: "Quantitative reasoning",
    subjects: [
      { name: "Verbal", score: 88, tone: "bg-[#31a86b]" },
      { name: "Quantitative", score: 67, tone: "bg-[#ff7a59]" },
      { name: "Computer", score: 85, tone: "bg-brand" },
      { name: "Physics", score: 78, tone: "bg-[#ffe066]" },
    ],
    plan: [
      { time: "Now", title: "Quant speed builder", meta: "20 MCQs · 20 min", active: true },
      { time: "+22", title: "Error review", meta: "Last 3 attempts · 10 min" },
      { time: "+35", title: "PU mixed mock", meta: "25 MCQs · 25 min" },
    ],
    points: "4,29 28,33 52,24 76,20 100,22 124,12 148,15 176,4",
  },
];

export function LiveActivity() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % activity.length), 3200);
    return () => window.clearInterval(timer);
  }, []);

  const item = activity[index];
  return (
    <div className="inline-flex max-w-full items-center gap-3 border-2 border-black bg-white px-3 py-2 shadow-hard-sm" aria-live="polite">
      <span className="relative flex h-3 w-3 shrink-0"><span className="absolute inline-flex h-full w-full animate-ping bg-[#17a34a] opacity-60" /><span className="relative inline-flex h-3 w-3 bg-[#17a34a]" /></span>
      <p key={index} className="animate-in fade-in slide-in-from-bottom-1 truncate text-xs font-semibold sm:text-sm"><strong>{item.name}</strong> {item.action}</p>
      <span className={`${item.color} shrink-0 border border-black px-2 py-1 font-headline text-xs font-bold`}>{item.score}</span>
    </div>
  );
}

export function ProductDemo() {
  const [active, setActive] = useState(tabs[0]);

  return (
    <div className="relative">
      <div className="absolute -inset-3 translate-x-4 translate-y-4 border-2 border-black bg-brand" />
      <div className="relative border-2 border-black bg-[#f3f3f4] p-3 shadow-[12px_12px_0_0_#000] sm:p-5">
        <div className="mb-4 flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full border border-black bg-[#ff6b6b]" /><span className="h-3 w-3 rounded-full border border-black bg-[#ffd43b]" /><span className="h-3 w-3 rounded-full border border-black bg-[#51cf66]" /></div>
          <span className="font-headline text-[10px] font-bold uppercase tracking-[0.18em] opacity-50">Student workspace · Live</span>
        </div>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActive(tab)} className={`flex flex-col items-center gap-1 border-2 border-black px-2 py-3 font-headline text-[10px] font-bold uppercase transition-all sm:flex-row sm:justify-center sm:text-xs ${active.id === tab.id ? "bg-black text-white shadow-hard-sm" : "bg-white hover:bg-brand-fixed"}`}>
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
        <div key={active.id} className="animate-in fade-in zoom-in-95 border-2 border-black bg-white p-5 duration-300 sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-widest text-brand">{active.eyebrow}</p><h3 className="mt-2 font-headline text-2xl font-bold uppercase leading-none sm:text-3xl">{active.title}</h3></div><span className="material-symbols-outlined text-4xl text-brand">{active.icon}</span></div>
          <div className="mt-8 flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider opacity-50">Current progress</p><p className="font-headline text-4xl font-bold sm:text-5xl">{active.value}</p></div><p className="text-right text-xs font-bold sm:text-sm">{active.detail}</p></div>
          <div className="mt-4 h-4 border-2 border-black bg-surface-high"><div className="h-full bg-brand transition-all duration-700" style={{ width: active.bar }} /></div>
          <div className="mt-5 grid grid-cols-3 gap-2 border-t-2 border-black pt-4 text-center"><Metric value="7" label="Day streak" /><Metric value="148" label="Questions" /><Metric value="81%" label="Accuracy" /></div>
        </div>
      </div>
    </div>
  );
}

export function AdaptiveStudyMap() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % studyMaps.length),
      6200,
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  const active = studyMaps[activeIndex];

  return (
    <section className="border-y-2 border-black bg-[#eef1ff]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-4">
          <div className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-2 shadow-hard-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping bg-brand opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 bg-brand" />
            </span>
            <span className="font-headline text-[11px] font-bold uppercase tracking-[0.16em]">Interactive preview</span>
          </div>
          <p className="mt-8 font-headline text-sm font-bold uppercase tracking-[0.2em] text-brand">Your preparation, re-routed</p>
          <h2 className="mt-4 font-headline text-4xl font-bold uppercase leading-[0.95] tracking-tight md:text-6xl">
            A study plan that moves with you.
          </h2>
          <p className="mt-6 text-lg font-medium leading-relaxed text-on-surface-variant">
            Every result updates your readiness, finds the next weak area, and rebuilds the session ahead—so no study hour starts with guesswork.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-xs font-bold uppercase">
            <div className="border-2 border-black bg-white p-4"><span className="material-symbols-outlined mb-3 text-2xl text-brand">route</span><p>Dynamic priorities</p></div>
            <div className="border-2 border-black bg-brand-fixed p-4"><span className="material-symbols-outlined mb-3 text-2xl text-brand">monitoring</span><p>Live readiness</p></div>
          </div>
        </div>

        <div
          className="relative lg:col-span-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <div className="absolute -inset-2 translate-x-3 translate-y-3 border-2 border-black bg-brand" />
          <div className="landing-grid relative overflow-hidden border-2 border-black bg-white shadow-[10px_10px_0_0_#000]">
            <div className="landing-scan pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-brand/70" />
            <div className="flex flex-col gap-4 border-b-2 border-black bg-black p-4 text-white sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center border border-white/40 bg-brand font-headline text-sm font-bold">TS</span>
                <div><p className="font-headline text-sm font-bold uppercase">Adaptive Study Map</p><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">Signal updated after every attempt</p></div>
              </div>
              <div className="flex gap-2" role="tablist" aria-label="Preview an entry-test study map">
                {studyMaps.map((map, index) => (
                  <button
                    key={map.id}
                    type="button"
                    role="tab"
                    aria-selected={activeIndex === index}
                    onClick={() => setActiveIndex(index)}
                    className={`border px-3 py-2 font-headline text-[10px] font-bold uppercase transition-colors ${activeIndex === index ? "border-white bg-white text-black" : "border-white/30 text-white/60 hover:border-white hover:text-white"}`}
                  >
                    {map.label}
                  </button>
                ))}
              </div>
            </div>

            <div key={active.id} className="animate-in fade-in duration-500">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black bg-brand-fixed/70 px-5 py-4">
                <div><p className="text-[9px] font-bold uppercase tracking-[0.18em] opacity-50">Active target</p><p className="font-headline text-lg font-bold uppercase">{active.name}</p></div>
                <div className="flex items-center gap-2 border-2 border-black bg-white px-3 py-2 text-[10px] font-bold uppercase"><span className="h-2 w-2 bg-[#31a86b]" /> Plan recalculated</div>
              </div>

              <div className="grid lg:grid-cols-[1.05fr_.95fr]">
                <div className="border-b-2 border-black p-5 sm:p-7 lg:border-b-0 lg:border-r-2">
                  <div className="flex items-center gap-6">
                    <div
                      className="grid h-28 w-28 shrink-0 place-items-center rounded-full border-2 border-black transition-all duration-700"
                      style={{ background: `conic-gradient(#3157ff ${active.readiness}%, #e4e7ef 0)` }}
                    >
                      <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-black bg-white text-center">
                        <div><p className="font-headline text-3xl font-bold leading-none">{active.readiness}</p><p className="text-[8px] font-bold uppercase tracking-wider opacity-50">Ready</p></div>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] opacity-50">Readiness signal</p>
                      <p className="mt-1 font-headline text-2xl font-bold uppercase text-[#169b45]">{active.change}</p>
                      <svg className="mt-3 h-10 w-full" viewBox="0 0 180 40" role="img" aria-label="Readiness trend moving upward">
                        <path d="M4 36H176" stroke="black" strokeOpacity=".15" strokeDasharray="3 4" />
                        <polyline className="landing-chart-line" points={active.points} fill="none" stroke="#3157ff" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-7 flex items-center justify-between border-y-2 border-black py-3">
                    <div><p className="text-[9px] font-bold uppercase tracking-wider opacity-50">Priority detected</p><p className="font-headline text-base font-bold uppercase">{active.focus}</p></div>
                    <span className="material-symbols-outlined text-3xl text-brand">target</span>
                  </div>
                  <div className="mt-5 space-y-4">
                    {active.subjects.map((subject, index) => (
                      <div key={subject.name}>
                        <div className="mb-1.5 flex justify-between text-[10px] font-bold uppercase"><span>{subject.name}</span><span>{subject.score}%</span></div>
                        <div className="h-3 border-2 border-black bg-surface-high"><div className={`h-full ${subject.tone} landing-progress`} style={{ width: `${subject.score}%`, animationDelay: `${index * 90}ms` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#f8f8fa] p-5 sm:p-7">
                  <div className="flex items-end justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand">Next best actions</p><h3 className="mt-1 font-headline text-2xl font-bold uppercase">Your next 60 min</h3></div><span className="font-headline text-xs font-bold opacity-40">AUTO / 03</span></div>
                  <div className="mt-6 space-y-3">
                    {active.plan.map((item, index) => (
                      <div key={item.title} className={`relative flex gap-4 border-2 border-black p-4 transition-transform hover:-translate-y-0.5 ${item.active ? "bg-black text-white shadow-hard-sm" : "bg-white"}`}>
                        <div className={`grid h-10 w-10 shrink-0 place-items-center border font-headline text-[10px] font-bold ${item.active ? "border-white/40 bg-brand" : "border-black bg-brand-fixed"}`}>{item.time}</div>
                        <div className="min-w-0"><p className="font-headline text-sm font-bold uppercase">{item.title}</p><p className={`mt-1 text-[10px] font-semibold uppercase tracking-wide ${item.active ? "text-white/55" : "opacity-50"}`}>{item.meta}</p></div>
                        {index === 0 && <span className="ml-auto h-2.5 w-2.5 shrink-0 animate-pulse bg-[#55e886]" />}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between border-2 border-black bg-[#c8f4d4] p-4">
                    <div><p className="text-[9px] font-bold uppercase tracking-wider opacity-50">Projected impact</p><p className="font-headline text-xl font-bold uppercase">+6 readiness</p></div>
                    <span className="material-symbols-outlined text-3xl">trending_up</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div><p className="font-headline text-lg font-bold sm:text-xl">{value}</p><p className="text-[9px] font-bold uppercase tracking-wide opacity-50">{label}</p></div>;
}

export function CountUpStats() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => setVisible(true), 250); return () => window.clearTimeout(timer); }, []);
  const stats = [{ value: "3,500+", label: "Practice questions" }, { value: "12", label: "Entry-test subjects" }, { value: "24/7", label: "Preparation access" }, { value: "100%", label: "Progress visibility" }];
  return <div className="grid grid-cols-2 border-x-2 border-t-2 border-black bg-black text-white lg:grid-cols-4">{stats.map((stat) => <div key={stat.label} className="border-b-2 border-r-2 border-white/25 p-6 last:border-r-0 md:p-8"><p className={`font-headline text-3xl font-bold transition-all duration-700 md:text-4xl ${visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>{stat.value}</p><p className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/55">{stat.label}</p></div>)}</div>;
}

const faqs = [
  ["Which entry tests can I prepare for?", "The platform is structured around Pakistan's university entry tests, with subject-wise preparation, topic practice, and configurable full mock exams."],
  ["Does it work on mobile?", "Yes. Every practice flow, mock exam, result, and insight is designed to work smoothly across mobile, tablet, and desktop."],
  ["How do the AI insights help me?", "They turn your attempt history into clear strengths, weak areas, priority topics, and practical recommendations for your next study session."],
  ["Can I start without paying?", "Yes. You can create an account and begin exploring the learning experience without entering payment information."],
];

export function FAQ() {
  const [open, setOpen] = useState(0);
  return <div className="border-t-2 border-black">{faqs.map(([question, answer], index) => <div key={question} className="border-b-2 border-black"><button type="button" onClick={() => setOpen(open === index ? -1 : index)} className="flex w-full items-center justify-between gap-5 py-6 text-left font-headline text-lg font-bold uppercase md:text-xl"><span><span className="mr-4 text-sm text-brand">0{index + 1}</span>{question}</span><span className={`material-symbols-outlined shrink-0 transition-transform ${open === index ? "rotate-45" : ""}`}>add</span></button>{open === index && <p className="animate-in slide-in-from-top-2 pb-7 pl-10 pr-12 leading-relaxed text-on-surface-variant">{answer}</p>}</div>)}</div>;
}

export function LogoMarquee() {
  const items = ["Focused practice", "Real exam timing", "Personal insights", "Chapter mastery", "Daily momentum", "Better scores"];
  return <div className="overflow-hidden border-y-2 border-black bg-brand-fixed py-4"><div className="landing-marquee flex w-max items-center">{[...items, ...items].map((item, index) => <div key={`${item}-${index}`} className="flex items-center"><span className="whitespace-nowrap px-8 font-headline text-sm font-bold uppercase tracking-wider md:text-base">{item}</span><span className="h-2 w-2 rotate-45 bg-brand" /></div>)}</div></div>;
}
