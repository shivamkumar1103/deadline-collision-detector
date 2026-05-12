import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Play, Pause, Square, Timer, Coffee, Moon } from "lucide-react";
import { useCollisionData } from "../contexts/CollisionContext";
import Navbar from "../components/common/Navbar";
import { Show } from "@clerk/react";
import LoginPage from "./LoginPage";

type TimerMode = "focus" | "shortBreak" | "longBreak";

const TIMER_SETTINGS = {
  focus: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
};

export default function PomodoroPage() {
  const { tasks } = useCollisionData();
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(TIMER_SETTINGS.focus);
  const [isActive, setIsActive] = useState(false);
  
  const timerRef = useRef<number | null>(null);

  // Clear timer when unmounting or stopping
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsActive(false);
      // Optional: Play a sound here
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(TIMER_SETTINGS[mode]);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(TIMER_SETTINGS[newMode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((TIMER_SETTINGS[mode] - timeLeft) / TIMER_SETTINGS[mode]) * 100;

  const pendingTasks = tasks.filter((t) => t.status !== "Completed");

  return (
    <>
      <Show when="signed-out">
        <LoginPage />
      </Show>
      <Show when="signed-in">
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans transition-colors flex flex-col">
          <Navbar />
          <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-12">
            
            <header className="mb-8 text-center">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase flex items-center justify-center gap-4">
                <Timer size={64} className="hidden md:block" />
                Pomodoro
              </h1>
              <p className="text-xl font-medium text-neutral-600 dark:text-neutral-400 mt-2">
                Focus on your tasks and avoid burnout.
              </p>
            </header>

            <div className="w-full max-w-2xl bg-white dark:bg-black p-8 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              
              {/* Task Selector */}
              <div className="mb-8">
                <label className="block text-sm font-bold uppercase tracking-widest mb-2">
                  What are you working on?
                </label>
                <select
                  className="w-full bg-transparent border-2 border-black dark:border-white p-4 font-bold focus:outline-none appearance-none"
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  disabled={isActive}
                >
                  <option value="">-- Select a Task (Optional) --</option>
                  {pendingTasks.map((task) => (
                    <option key={task.id} value={task.id.toString()}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Switcher */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <button
                  onClick={() => switchMode("focus")}
                  className={`flex items-center gap-2 px-6 py-3 border-2 border-black dark:border-white font-bold uppercase tracking-widest transition-colors ${
                    mode === "focus"
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  }`}
                >
                  <Timer size={18} />
                  Focus
                </button>
                <button
                  onClick={() => switchMode("shortBreak")}
                  className={`flex items-center gap-2 px-6 py-3 border-2 border-black dark:border-white font-bold uppercase tracking-widest transition-colors ${
                    mode === "shortBreak"
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  }`}
                >
                  <Coffee size={18} />
                  Short Break
                </button>
                <button
                  onClick={() => switchMode("longBreak")}
                  className={`flex items-center gap-2 px-6 py-3 border-2 border-black dark:border-white font-bold uppercase tracking-widest transition-colors ${
                    mode === "longBreak"
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  }`}
                >
                  <Moon size={18} />
                  Long Break
                </button>
              </div>

              {/* Timer Display */}
              <div className="flex flex-col items-center justify-center mb-12 relative">
                {/* Progress bar container (pseudo circular/linear) */}
                <div className="w-full h-4 bg-neutral-200 dark:bg-neutral-800 border-2 border-black dark:border-white mb-8 overflow-hidden">
                  <motion.div
                    className="h-full bg-black dark:bg-white origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: progress / 100 }}
                    transition={{ ease: "linear", duration: 1 }}
                  />
                </div>
                
                <h2 className="text-[6rem] sm:text-[8rem] md:text-[10rem] font-black tracking-tighter leading-none tabular-nums">
                  {formatTime(timeLeft)}
                </h2>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-6">
                <button
                  onClick={toggleTimer}
                  className="flex items-center gap-3 px-8 py-4 bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white font-extrabold uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  {isActive ? (
                    <>
                      <Pause size={24} /> Pause
                    </>
                  ) : (
                    <>
                      <Play size={24} /> Start
                    </>
                  )}
                </button>
                <button
                  onClick={resetTimer}
                  className="flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-black dark:border-white font-extrabold uppercase tracking-widest hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-black dark:text-white"
                >
                  <Square size={24} />
                  Reset
                </button>
              </div>
            </div>

          </div>
        </div>
      </Show>
    </>
  );
}
