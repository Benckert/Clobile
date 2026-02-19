"use client";

import { useState } from "react";

const DEFAULT_AFFIRMATIONS = [
  "I am capable of handling whatever comes my way.",
  "I choose peace, gratitude, and growth today.",
  "I trust the process and embrace this moment.",
  "I am worthy of love, joy, and abundance.",
  "Today I show up as my best, most authentic self.",
];

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

interface Goal {
  id: string;
  text: string;
  done: boolean;
}

interface MorningData {
  affirmations: string[];
  goals: Goal[];
  gratitude: [string, string, string];
}

const DEFAULT_DATA: MorningData = {
  affirmations: DEFAULT_AFFIRMATIONS,
  goals: [],
  gratitude: ["", "", ""],
};

function loadMorningData(): MorningData {
  const todayKey = getTodayKey();
  const storedAff = localStorage.getItem("clobile_affirmations");
  const storedGoals = localStorage.getItem(`clobile_goals_${todayKey}`);
  const storedGratitude = localStorage.getItem(`clobile_gratitude_${todayKey}`);
  return {
    affirmations: storedAff ? JSON.parse(storedAff) : DEFAULT_AFFIRMATIONS,
    goals: storedGoals ? JSON.parse(storedGoals) : [],
    gratitude: storedGratitude ? JSON.parse(storedGratitude) : ["", "", ""],
  };
}

export default function MorningPage() {
  const [data, setData] = useState<MorningData>(() =>
    typeof window !== "undefined" ? loadMorningData() : DEFAULT_DATA
  );
  const [customAff, setCustomAff] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [currentAff, setCurrentAff] = useState(0);
  const [saved, setSaved] = useState(false);

  const todayKey = getTodayKey();

  function saveAll() {
    localStorage.setItem(`clobile_goals_${todayKey}`, JSON.stringify(data.goals));
    localStorage.setItem(`clobile_gratitude_${todayKey}`, JSON.stringify(data.gratitude));
    localStorage.setItem("clobile_affirmations", JSON.stringify(data.affirmations));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addCustomAffirmation() {
    if (!customAff.trim()) return;
    setData((prev) => ({ ...prev, affirmations: [...prev.affirmations, customAff.trim()] }));
    setCustomAff("");
  }

  function removeAffirmation(i: number) {
    setData((prev) => ({ ...prev, affirmations: prev.affirmations.filter((_, idx) => idx !== i) }));
  }

  function addGoal() {
    if (!newGoal.trim() || data.goals.length >= 3) return;
    const nextId = String(data.goals.reduce((max, g) => Math.max(max, parseInt(g.id) || 0), 0) + 1);
    setData((prev) => ({
      ...prev,
      goals: [...prev.goals, { id: nextId, text: newGoal.trim(), done: false }],
    }));
    setNewGoal("");
  }

  function toggleGoal(id: string) {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)),
    }));
  }

  function removeGoal(id: string) {
    setData((prev) => ({ ...prev, goals: prev.goals.filter((g) => g.id !== id) }));
  }

  function updateGratitude(i: number, val: string) {
    setData((prev) => {
      const updated: [string, string, string] = [...prev.gratitude] as [string, string, string];
      updated[i] = val;
      return { ...prev, gratitude: updated };
    });
  }

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const { affirmations, goals, gratitude } = data;

  return (
    <div className="px-6 py-8 md:px-10 max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-[var(--muted)] mb-1 uppercase tracking-widest">{dateStr}</p>
        <h2 className="text-3xl font-semibold tracking-tight">🌅 Morning Routine</h2>
        <p className="text-[var(--muted)] text-sm mt-2">
          Set your intentions and step into the day with purpose.
        </p>
      </div>

      {/* Affirmation carousel */}
      <section className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-4">
          Daily Affirmation
        </h3>
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 text-center">
          <p className="text-lg font-medium text-[var(--foreground)] leading-relaxed mb-4">
            &ldquo;{affirmations[currentAff % affirmations.length]}&rdquo;
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentAff((c) => (c - 1 + affirmations.length) % affirmations.length)}
              className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors text-sm"
            >
              ←
            </button>
            <span className="text-xs text-[var(--muted)]">
              {(currentAff % affirmations.length) + 1} / {affirmations.length}
            </span>
            <button
              onClick={() => setCurrentAff((c) => (c + 1) % affirmations.length)}
              className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors text-sm"
            >
              →
            </button>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {affirmations.map((aff, i) => (
            <div key={i} className="flex items-start gap-2 group">
              <span className="text-xs text-[var(--muted)] mt-1 shrink-0">{i + 1}.</span>
              <p className="text-sm text-[var(--foreground)] flex-1">{aff}</p>
              <button
                onClick={() => removeAffirmation(i)}
                className="text-xs text-[var(--muted)] opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={customAff}
            onChange={(e) => setCustomAff(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomAffirmation()}
            placeholder="Add your own affirmation…"
            className="flex-1 text-sm px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
          />
          <button
            onClick={addCustomAffirmation}
            className="px-3 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
          >
            Add
          </button>
        </div>
      </section>

      {/* Daily goals (max 3) */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Today&apos;s Intentions
          </h3>
          <span className="text-xs text-[var(--muted)]">{goals.length}/3</span>
        </div>

        <div className="space-y-2 mb-3">
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-center gap-3 group">
              <button
                onClick={() => toggleGoal(goal.id)}
                className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  goal.done
                    ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                    : "border-[var(--border)] hover:border-[var(--primary)]"
                }`}
              >
                {goal.done && <span className="text-[10px]">✓</span>}
              </button>
              <p className={`text-sm flex-1 ${goal.done ? "line-through text-[var(--muted)]" : "text-[var(--foreground)]"}`}>
                {goal.text}
              </p>
              <button
                onClick={() => removeGoal(goal.id)}
                className="text-xs text-[var(--muted)] opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
              >
                ✕
              </button>
            </div>
          ))}
          {goals.length === 0 && (
            <p className="text-sm text-[var(--muted)] italic">Add up to 3 intentions for today…</p>
          )}
        </div>

        {goals.length < 3 && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal()}
              placeholder="What do you intend to do today?"
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
            />
            <button
              onClick={addGoal}
              className="px-3 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
            >
              Add
            </button>
          </div>
        )}
      </section>

      {/* Gratitude */}
      <section className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-4">
          Gratitude — 3 things I&apos;m grateful for
        </h3>
        <div className="space-y-2">
          {gratitude.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[var(--primary)] font-medium text-sm shrink-0">{i + 1}.</span>
              <input
                type="text"
                value={item}
                onChange={(e) => updateGratitude(i, e.target.value)}
                placeholder={["I am grateful for…", "Something that made me smile…", "A person I appreciate…"][i]}
                className="flex-1 text-sm px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Save */}
      <button
        onClick={saveAll}
        className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${
          saved
            ? "bg-[var(--primary)] text-white"
            : "bg-[var(--foreground)] text-[var(--surface)] hover:opacity-90"
        }`}
      >
        {saved ? "✓ Saved" : "Save morning intentions"}
      </button>
    </div>
  );
}
