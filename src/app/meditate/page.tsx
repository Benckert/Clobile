"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PRESETS = [5, 10, 15, 20];

type BreathPhase = "inhale" | "hold" | "exhale" | "rest";

interface BreathStep {
  phase: BreathPhase;
  duration: number;
  label: string;
}

interface BreathTechnique {
  id: string;
  name: string;
  description: string;
  cycle: BreathStep[];
}

const BREATH_TECHNIQUES: BreathTechnique[] = [
  {
    id: "calm",
    name: "Calm",
    description: "4-4-6-2 · Reduce anxiety",
    cycle: [
      { phase: "inhale", duration: 4, label: "Breathe in" },
      { phase: "hold", duration: 4, label: "Hold" },
      { phase: "exhale", duration: 6, label: "Breathe out" },
      { phase: "rest", duration: 2, label: "Rest" },
    ],
  },
  {
    id: "box",
    name: "Box",
    description: "4-4-4-4 · Build focus",
    cycle: [
      { phase: "inhale", duration: 4, label: "Breathe in" },
      { phase: "hold", duration: 4, label: "Hold" },
      { phase: "exhale", duration: 4, label: "Breathe out" },
      { phase: "rest", duration: 4, label: "Hold" },
    ],
  },
  {
    id: "478",
    name: "4-7-8",
    description: "4-7-8 · Deepen sleep",
    cycle: [
      { phase: "inhale", duration: 4, label: "Breathe in" },
      { phase: "hold", duration: 7, label: "Hold" },
      { phase: "exhale", duration: 8, label: "Breathe out" },
    ],
  },
];

function getGardenLevel(totalMinutes: number): number {
  if (totalMinutes < 5) return 1;
  if (totalMinutes < 15) return 2;
  if (totalMinutes < 30) return 3;
  if (totalMinutes < 60) return 4;
  if (totalMinutes < 120) return 5;
  if (totalMinutes < 180) return 6;
  if (totalMinutes < 300) return 7;
  if (totalMinutes < 480) return 8;
  if (totalMinutes < 720) return 9;
  return 10;
}

function getGardenCells(level: number): string[] {
  const size = 40;
  return Array.from({ length: size }, (_, i) => {
    const position = i / size;
    const filled = position < (level - 1) / 9;
    if (!filled) return level > 1 && Math.random() < 0.1 ? "🌱" : "·";
    if (level >= 9) return ["🌳", "🌸", "🌿", "🎋", "🌺"][i % 5];
    if (level >= 7) return ["🌳", "🌸", "🌿", "🌱"][i % 4];
    if (level >= 5) return ["🌸", "🌿", "🌱"][i % 3];
    if (level >= 3) return ["🌱", "🌿"][i % 2];
    return "🌱";
  });
}

export default function MeditatePage() {
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [gardenLevel, setGardenLevel] = useState(1);
  const [gardenCells, setGardenCells] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);

  // Timer state
  const [selectedMinutes, setSelectedMinutes] = useState(10);
  const [customMinutes, setCustomMinutes] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [isDnd, setIsDnd] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0);

  // Breathing technique
  const [techniqueId, setTechniqueId] = useState("calm");
  const technique = BREATH_TECHNIQUES.find((t) => t.id === techniqueId) ?? BREATH_TECHNIQUES[0];

  // Breathing animation
  const [breathPhaseIdx, setBreathPhaseIdx] = useState(0);
  const [breathProgress, setBreathProgress] = useState(0);
  const breathTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(() => {
    const total = parseInt(localStorage.getItem("clobile_meditation_total") ?? "0", 10);
    const s = parseInt(localStorage.getItem("clobile_meditation_streak") ?? "0", 10);
    const level = getGardenLevel(total);
    setTotalMinutes(total);
    setGardenLevel(level);
    setStreak(s);
    setGardenCells(getGardenCells(level));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Main countdown timer
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current!);
            handleSessionEnd(selectedMinutes);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // Breathing cycle
  useEffect(() => {
    if (isActive) {
      const cycle = technique.cycle[breathPhaseIdx % technique.cycle.length];
      const stepMs = (cycle.duration * 1000) / 100;
      breathTimerRef.current = setInterval(() => {
        setBreathProgress((p) => {
          if (p >= 100) {
            setBreathPhaseIdx((idx) => (idx + 1) % technique.cycle.length);
            return 0;
          }
          return p + 1;
        });
      }, stepMs);
    } else {
      if (breathTimerRef.current) clearInterval(breathTimerRef.current);
      setBreathProgress(0);
      setBreathPhaseIdx(0);
    }
    return () => { if (breathTimerRef.current) clearInterval(breathTimerRef.current); };
  }, [isActive, breathPhaseIdx, technique]);

  function handleSessionEnd(minutes: number) {
    setIsActive(false);
    setIsDnd(false);
    setSessionComplete(true);
    setSessionMinutes(minutes);

    const prevTotal = parseInt(localStorage.getItem("clobile_meditation_total") ?? "0", 10);
    const newTotal = prevTotal + minutes;
    const newLevel = getGardenLevel(newTotal);
    const today = new Date().toISOString().split("T")[0];
    const lastDay = localStorage.getItem("clobile_last_meditation_day");
    const prevStreak = parseInt(localStorage.getItem("clobile_meditation_streak") ?? "0", 10);

    let newStreak = prevStreak;
    if (lastDay !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toISOString().split("T")[0];
      newStreak = lastDay === yesterdayKey ? prevStreak + 1 : 1;
    }

    localStorage.setItem("clobile_meditation_total", String(newTotal));
    localStorage.setItem("clobile_garden_level", String(newLevel));
    localStorage.setItem("clobile_meditation_streak", String(newStreak));
    localStorage.setItem("clobile_last_meditation_day", today);

    setTotalMinutes(newTotal);
    setGardenLevel(newLevel);
    setStreak(newStreak);
    setGardenCells(getGardenCells(newLevel));
  }

  function startSession() {
    const mins = customMinutes ? parseInt(customMinutes, 10) : selectedMinutes;
    if (!mins || mins < 1) return;
    setSelectedMinutes(mins);
    setSecondsLeft(mins * 60);
    setSessionComplete(false);
    setBreathPhaseIdx(0);
    setBreathProgress(0);
    setIsActive(true);
    setIsDnd(true);
  }

  function endEarly() {
    const elapsed = Math.max(1, Math.floor((selectedMinutes * 60 - secondsLeft) / 60));
    if (timerRef.current) clearInterval(timerRef.current);
    handleSessionEnd(elapsed);
  }

  const currentPhase = technique.cycle[breathPhaseIdx % technique.cycle.length];
  const breathScale = currentPhase.phase === "inhale"
    ? 1 + 0.4 * (breathProgress / 100)
    : currentPhase.phase === "exhale"
    ? 1.4 - 0.4 * (breathProgress / 100)
    : currentPhase.phase === "hold"
    ? 1.4
    : 1;

  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;
  const timeStr = `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;

  const levelLabels: Record<number, string> = {
    1: "Bare soil", 2: "First sprouts", 3: "Young growth",
    4: "Flowers forming", 5: "In bloom", 6: "Cherry blossoms",
    7: "Tall trees", 8: "Dense forest", 9: "Zen forest", 10: "Eternal garden",
  };

  return (
    <>
      {/* DND / Meditation overlay */}
      {isDnd && (
        <div className="fixed inset-0 z-50 bg-[#0D0B08] flex flex-col items-center justify-center">
          {/* Timer */}
          <p className="text-5xl font-mono font-light text-white/90 mb-8 tracking-widest">
            {timeStr}
          </p>

          {/* Breathing circle */}
          <div
            className="rounded-full bg-[var(--primary)] flex items-center justify-center transition-transform"
            style={{
              width: 160,
              height: 160,
              transform: `scale(${breathScale})`,
              transition: `transform ${currentPhase.duration * 10}ms linear`,
              opacity: 0.85,
              boxShadow: `0 0 60px color-mix(in srgb, var(--primary) 40%, transparent)`,
            }}
          />

          {/* Phase label */}
          <p className="mt-8 text-white/60 text-sm tracking-widest uppercase">
            {currentPhase.label}
          </p>

          {/* End button */}
          <button
            onClick={endEarly}
            className="mt-12 text-white/40 hover:text-white/80 text-sm transition-colors underline underline-offset-4"
          >
            End session
          </button>
        </div>
      )}

      <div className="px-6 py-8 md:px-10 max-w-2xl animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold tracking-tight">🧘 Meditate</h2>
          <p className="text-[var(--muted)] text-sm mt-2">
            Sit still. The garden grows with you.
          </p>
        </div>

        {/* Session complete banner */}
        {sessionComplete && (
          <div className="mb-6 p-4 bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] border border-[var(--primary)] rounded-2xl animate-fade-in">
            <p className="text-sm font-medium text-[var(--primary)]">
              ✦ Session complete — {sessionMinutes} minute{sessionMinutes !== 1 ? "s" : ""} of peace
            </p>
            <p className="text-xs text-[var(--muted)] mt-1">
              Your garden has grown. Total: {totalMinutes}m · Streak: {streak}d
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: "🧘", value: `${totalMinutes}m`, label: "Total" },
            { icon: "🔥", value: `${streak}d`, label: "Streak" },
            { icon: "🌿", value: `Lv. ${gardenLevel}`, label: "Garden" },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-4 text-center">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-lg font-semibold">{s.value}</div>
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Breathing technique */}
        <section className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">
            Breathing technique
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {BREATH_TECHNIQUES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTechniqueId(t.id); setBreathPhaseIdx(0); setBreathProgress(0); }}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-center transition-all ${
                  techniqueId === t.id
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                }`}
              >
                <span className={`text-sm font-semibold ${techniqueId === t.id ? "text-white" : "text-[var(--foreground)]"}`}>
                  {t.name}
                </span>
                <span className={`text-[10px] leading-tight ${techniqueId === t.id ? "text-white/80" : "text-[var(--muted)]"}`}>
                  {t.description}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Timer setup */}
        <section className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-4">
            Session length
          </h3>
          <div className="flex gap-2 flex-wrap mb-3">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => { setSelectedMinutes(p); setCustomMinutes(""); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  selectedMinutes === p && !customMinutes
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                }`}
              >
                {p} min
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min={1}
              max={120}
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              placeholder="Custom (min)"
              className="w-32 text-sm px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
          <button
            onClick={startSession}
            className="mt-4 w-full py-3 rounded-xl bg-[var(--primary)] text-white font-medium text-sm hover:bg-[var(--primary-dark)] transition-colors"
          >
            Begin session — {customMinutes ? customMinutes : selectedMinutes} min
          </button>
        </section>

        {/* Zen Garden */}
        <section className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                Zen Garden — Level {gardenLevel}
              </h3>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {levelLabels[gardenLevel]}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--muted)]">Next level</p>
              <LevelProgress level={gardenLevel} total={totalMinutes} />
            </div>
          </div>

          {/* Garden grid */}
          <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}>
            {gardenCells.map((cell, i) => (
              <div
                key={i}
                className="aspect-square flex items-center justify-center text-base leading-none rounded-lg bg-[var(--surface-soft)]"
              >
                {cell}
              </div>
            ))}
          </div>

          <p className="text-xs text-[var(--muted)] mt-4 text-center leading-relaxed">
            Each minute you meditate, your garden flourishes. Keep going.
          </p>
        </section>
      </div>
    </>
  );
}

const LEVEL_THRESHOLDS = [0, 5, 15, 30, 60, 120, 180, 300, 480, 720];

function LevelProgress({ level, total }: { level: number; total: number }) {
  if (level >= 10) return <p className="text-xs text-[var(--primary)] font-medium">Max level ✦</p>;
  const current = LEVEL_THRESHOLDS[level - 1];
  const next = LEVEL_THRESHOLDS[level];
  const pct = Math.min(100, Math.round(((total - current) / (next - current)) * 100));
  return (
    <div className="flex items-center gap-2 mt-0.5">
      <div className="w-16 h-1.5 rounded-full bg-[var(--surface-soft)] overflow-hidden">
        <div
          className="h-full bg-[var(--primary)] rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-[var(--muted)]">{pct}%</span>
    </div>
  );
}
