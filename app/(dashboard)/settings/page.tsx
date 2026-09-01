import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { getEntryTestsCached } from "@/lib/queries/catalog";
import { getActiveEntryTest } from "@/lib/queries/entry-test";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/auth/login");
  const [{ data: profile }, activeTest, tests] = await Promise.all([supabase.from("profiles").select("display_name, avatar_url, created_at").eq("id", user.id).maybeSingle(), getActiveEntryTest(), getEntryTestsCached()]);
  if (!activeTest) redirect("/dashboard");
  const displayName = profile?.display_name?.trim() || user.user_metadata?.full_name || user.email?.split("@")[0] || "Student";
  const joined = new Intl.DateTimeFormat("en-PK", { month: "long", year: "numeric" }).format(new Date(profile?.created_at ?? user.created_at));
  return <><DashboardHeader title="Settings" badge="Your account" displayName={displayName} tests={tests} activeTestId={activeTest.id} /><main className="px-6 pb-24 pt-28 md:px-8"><div className="mx-auto max-w-5xl space-y-8"><div><p className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-brand">Account preferences</p><h1 className="mt-2 font-headline text-4xl font-bold uppercase tracking-tight md:text-5xl">Keep your profile current.</h1><p className="mt-3 max-w-2xl text-on-surface-variant">A small set of settings for the details that matter across your learning workspace.</p></div><SettingsForm displayName={displayName} email={user.email ?? "No email available"} /><section className="grid gap-5 md:grid-cols-3"><InfoCard icon="school" label="Active entry test" value={activeTest.name} note="Change it from the selector in the page header." /><InfoCard icon="calendar_month" label="Member since" value={joined} note="Your learning history stays connected to this account." /><InfoCard icon="verified_user" label="Account status" value={user.email_confirmed_at ? "Verified" : "Pending verification"} note="Verification helps protect your account." /></section><section className="border-2 border-black bg-surface-high p-6"><div className="flex items-start gap-4"><span className="material-symbols-outlined text-3xl text-brand">info</span><div><h2 className="font-headline text-lg font-bold uppercase">Need another account change?</h2><p className="mt-2 text-sm leading-relaxed text-on-surface-variant">For email changes, account deletion, or anything not available here, visit the Help Center and send a private support message.</p><a href="/help" className="mt-4 inline-flex items-center gap-2 font-headline text-xs font-bold uppercase text-brand">Open Help Center <span className="material-symbols-outlined text-lg">arrow_forward</span></a></div></div></section></div></main></>;
}

function InfoCard({ icon, label, value, note }: { icon: string; label: string; value: string; note: string }) { return <article className="border-2 border-black bg-white p-5 shadow-hard-sm"><span className="material-symbols-outlined text-3xl text-brand">{icon}</span><p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</p><h2 className="mt-1 font-headline text-xl font-bold">{value}</h2><p className="mt-3 text-xs leading-relaxed text-on-surface-variant">{note}</p></article>; }
