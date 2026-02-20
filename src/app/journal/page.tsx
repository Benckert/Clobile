"use client";

import { useState } from "react";

const REFLECTION_PROMPTS = [
  "What went well today?",
  "What challenged me, and what did I learn from it?",
  "One thing I could have done differently…",
  "How did I feel throughout the day?",
  "What am I proud of today?",
];

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

type Mood = "great" | "good" | "okay" | "low" | "tough";

const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: "great", label: "Great", emoji: "😄" },
  { value: "good", label: "Good", emoji: "🙂" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "low", label: "Low", emoji: "😔" },
  { value: "tough", label: "Tough", emoji: "😤" },
];

interface PastEntry {
  date: string;
  mood: Mood | null;
  preview: string;
}

interface JournalState {
  mood: Mood | null;
  reflections: string[];
  freeWrite: string;
  pastEntries: PastEntry[];
  weekMoods: WeekDay[];
}

const DEFAULT_STATE: JournalState = {
  mood: null,
  reflections: REFLECTION_PROMPTS.map(() => ""),
  freeWrite: "",
  pastEntries: [],
  weekMoods: [],
};

interface WeekDay {
  date: string;
  label: string;
  mood: Mood | null;
  hasEntry: boolean;
}

function loadPastEntries(): PastEntry[] {
  const entries: PastEntry[] = [];
  for (let i = 1; i <= 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const raw = localStorage.getItem(`clobile_journal_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw) as { mood?: Mood; freeWrite?: string; reflections?: string[] };
      entries.push({
        date: key,
        mood: parsed.mood ?? null,
        preview: (parsed.freeWrite ?? "").slice(0, 60) || (parsed.reflections?.[0] ?? "").slice(0, 60),
      });
      if (entries.length >= 5) break;
    }
  }
  return entries;
}

function loadWeekMoods(): WeekDay[] {
  const days: WeekDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const raw = localStorage.getItem(`clobile_journal_${key}`);
    const parsed = raw ? (JSON.parse(raw) as { mood?: Mood }) : null;
    days.push({
      date: key,
      label: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
      mood: parsed?.mood ?? null,
      hasEntry: !!raw,
    });
  }
  return days;
}

function loadJournalState(): JournalState {
  const todayKey = getTodayKey();
  const stored = localStorage.getItem(`clobile_journal_${todayKey}`);
  const parsed = stored ? (JSON.parse(stored) as Partial<JournalState>) : null;
  return {
    mood: parsed?.mood ?? null,
    reflections: parsed?.reflections ?? REFLECTION_PROMPTS.map(() => ""),
    freeWrite: parsed?.freeWrite ?? "",
    pastEntries: loadPastEntries(),
    weekMoods: loadWeekMoods(),
  };
}

export default function JournalPage() {
  const [journalState, setJournalState] = useState<JournalState>(() =>
    typeof window !== "undefined" ? loadJournalState() : DEFAULT_STATE
  );
  const [saved, setSaved] = useState(false);

  const todayKey = getTodayKey();

  function save() {
    const { mood, reflections, freeWrite } = journalState;
    localStorage.setItem(`clobile_journal_${todayKey}`, JSON.stringify({ mood, reflections, freeWrite }));
    setJournalState((prev) => ({ ...prev, weekMoods: loadWeekMoods() }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function setMood(mood: Mood) {
    setJournalState((prev) => ({ ...prev, mood }));
  }

  function updateReflection(i: number, val: string) {
    setJournalState((prev) => {
      const reflections = [...prev.reflections];
      reflections[i] = val;
      return { ...prev, reflections };
    });
  }

  function setFreeWrite(freeWrite: string) {
    setJournalState((prev) => ({ ...prev, freeWrite }));
  }

  const { mood, reflections, freeWrite, pastEntries, weekMoods } = journalState;

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="px-6 py-8 md:px-10 max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-[var(--muted)] mb-1 uppercase tracking-widest">{dateStr}</p>
        <h2 className="text-3xl font-semibold tracking-tight">📔 Evening Journal</h2>
        <p className="text-[var(--muted)] text-sm mt-2">
          Reflect, release, and close the day with intention.
        </p>
      </div>

      {/* 7-day mood history */}
      {weekMoods.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">
            This week
          </h3>
          <div className="flex gap-1.5">
            {weekMoods.map((day) => {
              const moodObj = MOODS.find((m) => m.value === day.mood);
              const isToday = day.date === todayKey;
              return (
                <div
                  key={day.date}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all ${
                    isToday
                      ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]"
                      : "border-[var(--border)] bg-[var(--surface)]"
                  }`}
                  title={day.date}
                >
                  <span className="text-base leading-none">
                    {moodObj ? moodObj.emoji : day.hasEntry ? "📝" : "·"}
                  </span>
                  <span className={`text-[9px] font-medium ${isToday ? "text-[var(--primary)]" : "text-[var(--muted)]"}`}>
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Mood tracker */}
      <section className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-4">
          How are you feeling?
        </h3>
        <div className="flex gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${
                mood === m.value
                  ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]"
              }`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="text-[10px] text-[var(--muted)]">{m.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Reflection prompts */}
      <section className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-4">
          Reflection
        </h3>
        <div className="space-y-4">
          {REFLECTION_PROMPTS.map((prompt, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                {prompt}
              </label>
              <textarea
                value={reflections[i]}
                onChange={(e) => updateReflection(i, e.target.value)}
                rows={2}
                placeholder="Write freely…"
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] resize-none leading-relaxed"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Free write */}
      <section className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-4">
          Free write
        </h3>
        <textarea
          value={freeWrite}
          onChange={(e) => setFreeWrite(e.target.value)}
          rows={6}
          placeholder="Anything else on your mind? Let it out here…"
          className="w-full text-sm px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] resize-none leading-relaxed"
        />
        <p className="text-right text-xs text-[var(--muted)] mt-1">{freeWrite.length} chars</p>
      </section>

      {/* Save */}
      <button
        onClick={save}
        className={`w-full py-3 rounded-xl font-medium text-sm transition-all mb-10 ${
          saved
            ? "bg-[var(--primary)] text-white"
            : "bg-[var(--foreground)] text-[var(--surface)] hover:opacity-90"
        }`}
      >
        {saved ? "✓ Entry saved" : "Save entry"}
      </button>

      {/* Past entries */}
      {pastEntries.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-4">
            Past entries
          </h3>
          <div className="space-y-2">
            {pastEntries.map((entry) => {
              const moodObj = MOODS.find((m) => m.value === entry.mood);
              const formattedDate = new Date(entry.date + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              return (
                <div
                  key={entry.date}
                  className="flex items-center gap-3 p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)]"
                >
                  <span className="text-lg">{moodObj?.emoji ?? "📝"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--muted)]">{formattedDate}</p>
                    {entry.preview && (
                      <p className="text-sm text-[var(--foreground)] truncate">{entry.preview}…</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
