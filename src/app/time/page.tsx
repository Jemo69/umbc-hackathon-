"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import {
  Clock,
  Target,
  Zap,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Timer,
  Activity,
  Brain,
  CheckCircle2,
} from "lucide-react";

// ---------------------------------------------
// Utilities
// ---------------------------------------------

function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function isoDay(ts: number) {
  const d = new Date(ts);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

// ---------------------------------------------
// Minimal Markdown Renderer (safe-ish)
// ---------------------------------------------

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function mdToHtml(md: string) {
  // Escape first to prevent injection
  let html = escapeHtml(md);
  // Basic line breaks
  html = html.replace(/\n\n/g, "<br/><br/>");
  html = html.replace(/\n/g, "<br/>");
  // Headings
  html = html.replace(/^######\s(.+)$/gim, '<h6 class="text-title-small font-medium">$1</h6>');
  html = html.replace(/^#####\s(.+)$/gim, '<h5 class="text-title-medium font-medium">$1</h5>');
  html = html.replace(/^####\s(.+)$/gim, '<h4 class="text-title-large font-semibold">$1</h4>');
  html = html.replace(/^###\s(.+)$/gim, '<h3 class="text-headline-small font-semibold">$1</h3>');
  html = html.replace(/^##\s(.+)$/gim, '<h2 class="text-headline-medium font-bold">$1</h2>');
  html = html.replace(/^#\s(.+)$/gim, '<h1 class="text-headline-large font-bold">$1</h1>');
  // Bold, italics, inline code
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/gim, '<code class="px-1 py-0.5 rounded bg-surface-200 text-on-surface">$1</code>');
  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gim, '<a class="text-primary-600 underline" href="$2" target="_blank" rel="noopener noreferrer">$1<\/a>');
  // Bulleted list - a very simple version
  html = html.replace(/(?:^|<br\/>)[\-\*]\s(.+?)(?=<br\/>|$)/gim, '<li>$1<\/li>');
  html = html.replace(/(<li>.*<\/li>)/gims, '<ul class="list-disc pl-6 space-y-1">$1<\/ul>');
  return html;
}

export  function MarkdownRenderer({ value }: { value: string }) {
  const html = useMemo(() => mdToHtml(value || ""), [value]);
  return <div className="prose prose-sm max-w-none text-on-surface" dangerouslySetInnerHTML={{ __html: html }} />;
}

// ---------------------------------------------
// Local storage of focus sessions for initial UX
// ---------------------------------------------

type LocalSession = {
  mode: "focus" | "shortBreak" | "longBreak";
  startedAt: number;
  endedAt: number;
  minutes: number;
  completed: boolean;
};

function loadSessions(): LocalSession[] {
  try {
    const raw = localStorage.getItem("focus_sessions");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: LocalSession[]) {
  localStorage.setItem("focus_sessions", JSON.stringify(sessions));
}

function computeStreak(sessions: LocalSession[]) {
  // Days with any completed focus session
  const days = new Set<string>();
  sessions
    .filter((s) => s.completed && s.mode === "focus" && s.minutes >= 5)
    .forEach((s) => days.add(isoDay(s.startedAt)));

  // Count consecutive days up to today
  let streak = 0; let longest = 0;
  let cursor = startOfDay(Date.now());

  // Check for up to 365 days back
  for (let i = 0; i < 365; i++) {
    const key = isoDay(cursor);
    if (days.has(key)) {
      streak++;
      if (streak > longest) longest = streak;
      cursor -= 24 * 60 * 60 * 1000; // previous day
    } else {
      // reset counting, but keep scanning to find longest
      let temp = 0;
      let c2 = cursor;
      for (let j = i; j < 365; j++) {
        const k = isoDay(c2);
        if (days.has(k)) {
          temp++;
          if (temp > longest) longest = temp;
          c2 -= 24 * 60 * 60 * 1000;
        } else {
          break;
        }
      }
      break;
    }
  }

  return { streak, longest };
}

function sumMinutesInRange(sessions: LocalSession[], start: number, end: number) {
  return sessions
    .filter((s) => s.completed && s.mode === "focus" && s.startedAt >= start && s.startedAt < end)
    .reduce((acc, s) => acc + s.minutes, 0);
}

// ---------------------------------------------
// Pomodoro Timer
// ---------------------------------------------

function PomodoroTimer() {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [cyclesUntilLongBreak, setCyclesUntilLongBreak] = useState(4);

  const [mode, setMode] = useState<"focus" | "shortBreak" | "longBreak">("focus");
  const [timeLeft, setTimeLeft] = useState(focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Recompute time when settings or mode changes
  useEffect(() => {
    if (!isRunning) {
      if (mode === "focus") setTimeLeft(focusMinutes * 60);
      if (mode === "shortBreak") setTimeLeft(shortBreakMinutes * 60);
      if (mode === "longBreak") setTimeLeft(longBreakMinutes * 60);
    }
  }, [focusMinutes, shortBreakMinutes, longBreakMinutes, mode, isRunning]);

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        // Session complete
        handleComplete();
        return 0;
      }
      return prev - 1;
    });
  }, []);

  useEffect(() => {
    if (isRunning && !intervalRef.current) {
      intervalRef.current = setInterval(tick, 1000);
    }
    if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  function logLocalSession(mode: LocalSession["mode"], seconds: number) {
    const sessions = loadSessions();
    const startedAt = Date.now() - seconds * 1000;
    const endedAt = Date.now();
    const entry: LocalSession = {
      mode,
      startedAt,
      endedAt,
      minutes: Math.round(seconds / 60),
      completed: true,
    };
    sessions.push(entry);
    saveSessions(sessions);
  }

  function handleComplete() {
    // Log the completed session locally
    const initialSeconds =
      mode === "focus"
        ? focusMinutes * 60
        : mode === "shortBreak"
        ? shortBreakMinutes * 60
        : longBreakMinutes * 60;
    logLocalSession(mode, initialSeconds);

    if (mode === "focus") {
      setCompletedSessions((s) => s + 1);
      const nextCycle = cycleCount + 1;
      setCycleCount(nextCycle);
      if (nextCycle % cyclesUntilLongBreak === 0) {
        setMode("longBreak");
        setTimeLeft(longBreakMinutes * 60);
      } else {
        setMode("shortBreak");
        setTimeLeft(shortBreakMinutes * 60);
      }
    } else {
      setMode("focus");
      setTimeLeft(focusMinutes * 60);
    }

    // Auto start next session
    setIsRunning(false);
  }

  function start() {
    setIsRunning(true);
  }
  function pause() {
    setIsRunning(false);
  }
  function reset() {
    setIsRunning(false);
    setCycleCount(0);
    setCompletedSessions(0);
    setMode("focus");
    setTimeLeft(focusMinutes * 60);
  }

  return (
    <div className="m3-surface p-6 rounded-m3-2xl liquid-glass border border-surface-200 animate-m3-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Timer className="w-6 h-6 text-primary-600" />
          <h2 className="text-title-large text-on-surface font-semibold">Pomodoro Timer</h2>
        </div>
        <div className="flex items-center space-x-2 text-body-small text-on-surface-variant">
          <span className="inline-flex items-center"><Flame className="w-4 h-4 mr-1 text-accent-amber"/> Cycles: {cycleCount}</span>
          <span className="inline-flex items-center"><CheckCircle2 className="w-4 h-4 mr-1 text-green-600"/> Completed: {completedSessions}</span>
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center py-6">
        <div className="mx-auto w-48 h-48 rounded-full m3-primary-container flex items-center justify-center shadow-m3-1">
          <div>
            <div className="text-display-small font-bold text-gray-800">{formatMMSS(timeLeft)}</div>
            <div className="text-body-medium text-gray-900 capitalize">{mode === "focus" ? "focus" : mode === "shortBreak" ? "short break" : "long break"}</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6">
          {!isRunning ? (
            <button onClick={start} className="m3-primary text-white px-4 py-2 rounded-m3-lg inline-flex items-center space-x-2">
              <Play className="w-4 h-4" /> <span>Start</span>
            </button>
          ) : (
            <button onClick={pause} className="bg-black text-gray-900 px-4 py-2 rounded-m3-lg inline-flex items-center space-x-2">
              <Pause className="w-4 h-4" /> <span>Pause</span>
            </button>
          )}
          <button onClick={reset} className="bg-surface-200 text-on-surface text-gray-800 px-4 py-2 rounded-m3-lg inline-flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" /> <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="m3-surface p-3 rounded-m3-xl border border-surface-200">
          <label className="text-body-small text-on-surface-variant">Focus (min)</label>
          <input type="number" min={5} max={120} value={focusMinutes} onChange={(e) => setFocusMinutes(parseInt(e.target.value || "25", 10))} className="w-full mt-1 px-3 py-2 rounded-m3-lg bg-surface-700 text-on-surface outline-none text-gray-900" />
        </div>
        <div className="m3-surface p-3 rounded-m3-xl border border-surface-200">
          <label className="text-body-small text-on-surface-variant">Short Break (min)</label>
          <input type="number" min={3} max={60} value={shortBreakMinutes} onChange={(e) => setShortBreakMinutes(parseInt(e.target.value || "5", 10))} className="w-full mt-1 px-3 py-2 rounded-m3-lg bg-surface-700  text-on-surface outline-none" />
        </div>
        <div className="m3-surface p-3 rounded-m3-xl border border-surface-200">
          <label className="text-body-small text-on-surface-variant">Long Break (min)</label>
          <input type="number" min={5} max={60} value={longBreakMinutes} onChange={(e) => setLongBreakMinutes(parseInt(e.target.value || "15", 10))} className="w-full mt-1 px-3 py-2 rounded-m3-lg bg-surface-700 text-on-surface outline-none" />
        </div>
        <div className="m3-surface p-3 rounded-m3-xl border border-surface-200">
          <label className="text-body-small text-on-surface-variant">Cycles until long break</label>
          <input type="number" min={1} max={8} value={cyclesUntilLongBreak} onChange={(e) => setCyclesUntilLongBreak(parseInt(e.target.value || "4", 10))} className="w-full mt-1 px-3 py-2 rounded-m3-lg bg-surface-700 text-on-surface outline-none" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------
// Stats Sidebar
// ---------------------------------------------

function StatsPanel() {
  const [sessions, setSessions] = useState<LocalSession[]>([]);

  useEffect(() => {
    setSessions(loadSessions());
    const onStorage = () => setSessions(loadSessions());
    window.addEventListener("storage", onStorage);
    const id = setInterval(() => setSessions(loadSessions()), 3000);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(id);
    };
  }, []);

  const { streak, longest } = useMemo(() => computeStreak(sessions), [sessions]);

  const todayStart = startOfDay(Date.now());
  const tomorrowStart = todayStart + 24 * 60 * 60 * 1000;
  const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000; // last 7 days

  const todayMinutes = useMemo(
    () => sumMinutesInRange(sessions, todayStart, tomorrowStart),
    [sessions, todayStart, tomorrowStart]
  );
  const weekMinutes = useMemo(
    () => sumMinutesInRange(sessions, weekStart, tomorrowStart),
    [sessions, weekStart, tomorrowStart]
  );

  const sessionsThisWeek = useMemo(
    () => sessions.filter((s) => s.startedAt >= weekStart && s.startedAt < tomorrowStart && s.completed && s.mode === "focus").length,
    [sessions, weekStart, tomorrowStart]
  );

  return (
    <div className="space-y-4">
      <div className="bg-surface-700/20 p-6 rounded-m3-2xl liquid-glass border border-surface-200">
        <div className="flex items-center space-x-2 mb-2">
          <Flame className="w-5 h-5 text-accent-amber" />
          <h3 className="text-title-medium text-on-surface">Study Streak</h3>
        </div>
        <div className="text-headline-small text-primary-600 font-bold">{streak} days</div>
        <div className="text-body-small text-on-surface-variant">Longest: {longest} days</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="m3-surface p-4 rounded-m3-xl border border-surface-200">
          <div className="text-body-small text-on-surface-variant mb-1">Today Focus</div>
          <div className="text-headline-small text-primary-600 font-bold">{todayMinutes}m</div>
        </div>
        <div className="m3-surface p-4 rounded-m3-xl border border-surface-200">
          <div className="text-body-small text-on-surface-variant mb-1">This Week</div>
          <div className="text-headline-small text-secondary-600 font-bold">{weekMinutes}m</div>
        </div>
      </div>

      <div className="m3-surface p-6 rounded-m3-2xl border border-surface-200">
        <div className="flex items-center space-x-2 mb-2">
          <Activity className="w-5 h-5 text-accent-purple" />
          <h3 className="text-title-medium text-on-surface">Productivity</h3>
        </div>
        <div className="text-body-medium text-on-surface-variant">Sessions this week</div>
        <div className="text-headline-small text-accent-purple font-bold">{sessionsThisWeek}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------
// AI Planner Panel
// ---------------------------------------------

function AIPlanner() {
  const sendMessage = useAction(api.chat.sendChatMessage);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [response, setResponse] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!input.trim()) return;
    setBusy(true);
    try {
      const res: any = await sendMessage({ message: input });
      setResponse(res?.message || "");
      if (res?.sessionId) setSessionId(res.sessionId);
    } catch (e: any) {
      setResponse(e?.message || "AI failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="m3-surface p-6 rounded-m3-2xl liquid-glass border border-surface-200">
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-6 h-6 text-secondary-600" />
        <h2 className="text-title-large text-on-surface font-semibold">AI Time Planner</h2>
      </div>

      <p className="text-body-medium text-on-surface-variant mb-3">Ask the AI to plan your study time, e.g. "plan my day for 2 hours across math and history".</p>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., Plan my time: 90 minutes focusing on calculus and biology"
          className="flex-1 px-3 py-2 rounded-m3-lg bg-surface-700 text-on-surface outline-none"
        />
        <button onClick={submit} disabled={busy} className="m3-primary text-white px-4 py-2 rounded-m3-lg inline-flex items-center space-x-2">
          <Zap className="w-4 h-4" />
          <span>{busy ? "Planning..." : "Plan"}</span>
        </button>
      </div>

      {response && (
        <div className="mt-4 p-4 rounded-m3-xl bg-surface-700 border border-surface-200">
          <MarkdownRenderer value={response} />
        </div>
      )}

      {sessionId && (
        <div className="mt-3 text-body-small text-on-surface-variant">
          Session created: <span className="font-mono">{sessionId}</span>. Check the Chat page for tool results.
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------
// Page
// ---------------------------------------------

function TimeManagement() {
  return (
    <div className="min-h-screen bg-background pt-20 lg:pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 m3-primary rounded-m3-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-headline-large font-bold text-on-surface">Time Management</h1>
              <p className="text-body-medium text-on-surface-variant">Pomodoro, study streaks, productivity, and AI planning.</p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <PomodoroTimer />
            <AIPlanner />
            {/* Markdown scratchpad */}
            <div className="m3-surface p-6 rounded-m3-2xl border border-surface-200">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-primary-600" />
                <h3 className="text-title-medium text-on-surface">Study Notes (Markdown)</h3>
              </div>
              <MarkdownScratchpad />
            </div>
          </div>
          <div>
            <StatsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

function MarkdownScratchpad() {
  const [text, setText] = useState<string>("## Quick Notes\n\n- Use Pomodoro (25/5)\n- Prioritize tasks due soon\n- Ask AI to plan a 90m block\n\n**Tip:** Stay hydrated!");
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          className="w-full h-48 px-3 py-2 rounded-m3-lg bg-surface-700 text-on-surface outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="p-3 rounded-m3-lg bg-white/70 backdrop-blur border border-surface-200">
          <MarkdownRenderer value={text} />
        </div>
      </div>
    </div>
  );
}

export default function TimePage() {
  return (
    <ProtectedRoute>
      <TimeManagement />
    </ProtectedRoute>
  );
}
