"use client";

import Link from "next/link";
import { useState } from "react";

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

interface PageState {
  meditationTotal: number;
  streak: number;
  goalsCompleted: number;
  goalsTotal: number;
  gardenLevel: number;
}

function loadStats(): PageState {
  const todayKey = getTodayKey();
  const meditationTotal = parseInt(localStorage.getItem("clobile_meditation_total") ?? "0", 10);
  const streak = parseInt(localStorage.getItem("clobile_meditation_streak") ?? "0", 10);
  const gardenLevel = parseInt(localStorage.getItem("clobile_garden_level") ?? "1", 10);
  const goalsRaw = localStorage.getItem(`clobile_goals_${todayKey}`);
  const goals: { done: boolean }[] = goalsRaw ? JSON.parse(goalsRaw) : [];
  return {
    meditationTotal,
    streak,
    goalsCompleted: goals.filter((g) => g.done).length,
    goalsTotal: goals.length,
    gardenLevel,
  };
}

const DEFAULT_STATS: PageState = {
  meditationTotal: 0,
  streak: 0,
  goalsCompleted: 0,
  goalsTotal: 0,
  gardenLevel: 1,
};

export default function Dashboard() {
  const [stats] = useState<PageState>(() =>
    typeof window !== "undefined" ? loadStats() : DEFAULT_STATS
  );

  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const quickActions = [
    { href: "/morning", icon: "🌅", label: "Morning Routine", desc: "Set intentions & affirmations", color: "var(--morning)" },
    { href: "/journal", icon: "📔", label: "Evening Journal", desc: "Reflect on your day", color: "var(--accent)" },
    { href: "/planner", icon: "📋", label: "Kanban Board", desc: "Organise your tasks", color: "var(--earth)" },
    { href: "/meditate", icon: "🧘", label: "Meditate", desc: "Find your calm & grow your garden", color: "var(--primary)" },
  ];

  return (
    <div className="px-6 py-8 md:px-10 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm text-[var(--muted)] mb-1" suppressHydrationWarning>{dateStr}</p>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]" suppressHydrationWarning>
          {greeting} ✦
        </h2>
        <p className="text-[var(--muted)] mt-2 text-sm leading-relaxed">
          Here&apos;s your space to breathe, plan, and grow.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <StatCard icon="🧘" value={`${stats.meditationTotal}m`} label="Meditated" />
        <StatCard icon="🔥" value={`${stats.streak}d`} label="Streak" />
        <StatCard
          icon="✅"
          value={stats.goalsTotal ? `${stats.goalsCompleted}/${stats.goalsTotal}` : "—"}
          label="Goals today"
        />
        <StatCard icon="🌿" value={`Lv. ${stats.gardenLevel}`} label="Garden" />
      </div>

      {/* Quick actions */}
      <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-4">
        Quick access
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center gap-4 p-4 bg-[var(--surface)] rounded-2xl border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-sm transition-all duration-200"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: `color-mix(in srgb, ${action.color} 15%, transparent)` }}
            >
              {action.icon}
            </div>
            <div>
              <p className="font-medium text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                {action.label}
              </p>
              <p className="text-xs text-[var(--muted)] mt-0.5">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Garden teaser */}
      <div className="mt-10 p-5 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">Your Zen Garden</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">Meditate to help it grow</p>
          </div>
          <Link
            href="/meditate"
            className="text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
          >
            Open →
          </Link>
        </div>
        <MiniGarden level={stats.gardenLevel} />
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-4">
      <div className="text-xl mb-2">{icon}</div>
      <div className="text-xl font-semibold text-[var(--foreground)]">{value}</div>
      <div className="text-[10px] text-[var(--muted)] mt-0.5 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function MiniGarden({ level }: { level: number }) {
  const cells = Array.from({ length: 20 }, (_, i) => {
    const threshold = Math.floor((i / 20) * 10);
    if (level > threshold + 4) return "🌳";
    if (level > threshold + 2) return "🌸";
    if (level > threshold) return "🌱";
    return "·";
  });

  return (
    <div className="flex flex-wrap gap-1.5">
      {cells.map((cell, i) => (
        <span key={i} className="text-sm leading-none">
          {cell}
        </span>
      ))}
    </div>
  );
}
