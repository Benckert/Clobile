"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "✦", label: "Dashboard" },
  { href: "/morning", icon: "🌅", label: "Morning" },
  { href: "/journal", icon: "📔", label: "Journal" },
  { href: "/planner", icon: "📋", label: "Planner" },
  { href: "/meditate", icon: "🧘", label: "Meditate" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen border-r border-[var(--border)] bg-[var(--surface)] px-3 py-6 shrink-0">
        <div className="px-3 mb-8">
          <h1 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
            Clobile
          </h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">your mindful space</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pt-4 border-t border-[var(--border)]">
          <p className="text-[10px] text-[var(--muted)] leading-relaxed">
            Breathe. Grow. Flourish.
          </p>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-[var(--border)] bg-[var(--surface)]">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                active ? "text-[var(--primary)]" : "text-[var(--muted)]"
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
