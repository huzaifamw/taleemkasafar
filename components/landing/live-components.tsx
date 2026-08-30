"use client";

import { useEffect, useState } from "react";

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
