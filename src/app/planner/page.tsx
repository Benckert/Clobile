"use client";

import { useState } from "react";

type Status = "todo" | "doing" | "done";

interface Card {
  id: string;
  text: string;
  status: Status;
}

const COLUMNS: { id: Status; label: string; icon: string; color: string }[] = [
  { id: "todo", label: "To Do", icon: "○", color: "var(--muted)" },
  { id: "doing", label: "In Progress", icon: "◑", color: "var(--earth)" },
  { id: "done", label: "Done", icon: "●", color: "var(--primary)" },
];

export default function PlannerPage() {
  const [cards, setCards] = useState<Card[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("clobile_kanban");
    return stored ? (JSON.parse(stored) as Card[]) : [];
  });
  const [newText, setNewText] = useState<Record<Status, string>>({ todo: "", doing: "", done: "" });
  const [dragId, setDragId] = useState<string | null>(null);

  function persist(updated: Card[]) {
    setCards(updated);
    localStorage.setItem("clobile_kanban", JSON.stringify(updated));
  }

  function addCard(status: Status) {
    const text = newText[status].trim();
    if (!text) return;
    const nextId = String(cards.reduce((max, c) => Math.max(max, parseInt(c.id) || 0), 0) + 1);
    const card: Card = { id: nextId, text, status };
    persist([...cards, card]);
    setNewText((prev) => ({ ...prev, [status]: "" }));
  }

  function deleteCard(id: string) {
    persist(cards.filter((c) => c.id !== id));
  }

  function moveCard(id: string, to: Status) {
    persist(cards.map((c) => (c.id === id ? { ...c, status: to } : c)));
  }

  function onDragStart(id: string) {
    setDragId(id);
  }

  function onDrop(status: Status) {
    if (!dragId) return;
    moveCard(dragId, status);
    setDragId(null);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  const totalCards = cards.length;
  const doneCards = cards.filter((c) => c.status === "done").length;

  return (
    <div className="px-6 py-8 md:px-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight">📋 Planner</h2>
        <p className="text-[var(--muted)] text-sm mt-2">
          Drag cards between columns or use the arrows to move them.
        </p>
        {totalCards > 0 && (
          <p className="text-xs text-[var(--primary)] mt-1 font-medium">
            {doneCards} of {totalCards} completed
          </p>
        )}
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colCards = cards.filter((c) => c.status === col.id);
          return (
            <div
              key={col.id}
              className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] min-h-[300px]"
              onDragOver={onDragOver}
              onDrop={() => onDrop(col.id)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: col.color }}>
                    {col.icon}
                  </span>
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    {col.label}
                  </span>
                </div>
                <span className="text-xs text-[var(--muted)] bg-[var(--surface)] rounded-full px-2 py-0.5 border border-[var(--border)]">
                  {colCards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 p-3 flex-1">
                {colCards.map((card) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => onDragStart(card.id)}
                    className={`group bg-[var(--surface)] rounded-xl border border-[var(--border)] p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all ${
                      dragId === card.id ? "opacity-50" : ""
                    }`}
                  >
                    <p className={`text-sm text-[var(--foreground)] leading-relaxed ${col.id === "done" ? "line-through text-[var(--muted)]" : ""}`}>
                      {card.text}
                    </p>
                    {/* Actions */}
                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {COLUMNS.filter((c) => c.id !== col.id).map((target) => (
                        <button
                          key={target.id}
                          onClick={() => moveCard(card.id, target.id)}
                          title={`Move to ${target.label}`}
                          className="text-[10px] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-lg px-2 py-1 hover:border-[var(--primary)] transition-colors"
                        >
                          → {target.label}
                        </button>
                      ))}
                      <button
                        onClick={() => deleteCard(card.id)}
                        className="ml-auto text-[10px] text-[var(--muted)] hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                {colCards.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-xs text-[var(--muted)] italic">
                      {col.id === "todo" ? "Nothing yet" : col.id === "doing" ? "Nothing in progress" : "Nothing done yet"}
                    </p>
                  </div>
                )}
              </div>

              {/* Add card input */}
              <div className="p-3 border-t border-[var(--border)]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newText[col.id]}
                    onChange={(e) => setNewText((prev) => ({ ...prev, [col.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && addCard(col.id)}
                    placeholder="Add a task…"
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
                  />
                  <button
                    onClick={() => addCard(col.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-[var(--primary)] text-white text-sm hover:bg-[var(--primary-dark)] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
