import { NavLink } from "react-router-dom";
import { UserButton } from "@clerk/react";
import { ThemeToggle } from "./ThemeToggle";
import {
  Calendar,
  LayoutDashboard,
  ListTodo,
  PieChart,
  Timer,
} from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-black border-b-4 border-black dark:border-white shadow-[0_4px_0_0_rgba(0,0,0,1)] dark:shadow-[0_4px_0_0_rgba(255,255,255,1)]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex justify-between h-20 items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-2xl uppercase tracking-tighter text-black dark:text-white">
              ⚡ Collision <span className="hidden sm:inline">Detector</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 xl:gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 xl:px-4 py-2 border-2 border-black dark:border-white font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] -translate-y-[2px] -translate-x-[2px]"
                    : "bg-transparent text-black dark:text-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[2px] hover:-translate-x-[2px]"
                } active:translate-y-[0px] active:translate-x-[0px] active:shadow-none dark:active:shadow-none`
              }
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 xl:px-4 py-2 border-2 border-black dark:border-white font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] -translate-y-[2px] -translate-x-[2px]"
                    : "bg-transparent text-black dark:text-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[2px] hover:-translate-x-[2px]"
                } active:translate-y-[0px] active:translate-x-[0px] active:shadow-none dark:active:shadow-none`
              }
            >
              <ListTodo size={18} />
              Tasks
            </NavLink>
            <NavLink
              to="/calendar"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 xl:px-4 py-2 border-2 border-black dark:border-white font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] -translate-y-[2px] -translate-x-[2px]"
                    : "bg-transparent text-black dark:text-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[2px] hover:-translate-x-[2px]"
                } active:translate-y-[0px] active:translate-x-[0px] active:shadow-none dark:active:shadow-none`
              }
            >
              <Calendar size={18} />
              Calendar
            </NavLink>
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 xl:px-4 py-2 border-2 border-black dark:border-white font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] -translate-y-[2px] -translate-x-[2px]"
                    : "bg-transparent text-black dark:text-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[2px] hover:-translate-x-[2px]"
                } active:translate-y-[0px] active:translate-x-[0px] active:shadow-none dark:active:shadow-none`
              }
            >
              <PieChart size={18} />
              Analytics
            </NavLink>
            <NavLink
              to="/pomodoro"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 xl:px-4 py-2 border-2 border-black dark:border-white font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] -translate-y-[2px] -translate-x-[2px]"
                    : "bg-transparent text-black dark:text-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[2px] hover:-translate-x-[2px]"
                } active:translate-y-[0px] active:translate-x-[0px] active:shadow-none dark:active:shadow-none`
              }
            >
              <Timer size={18} />
              Focus
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="bg-white dark:bg-black p-2 border-2 border-black dark:border-white flex items-center justify-center transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[2px] hover:-translate-x-[2px] active:translate-y-[0px] active:translate-x-[0px] active:shadow-none dark:active:shadow-none">
              <UserButton />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="lg:hidden border-t-2 border-black dark:border-white bg-white dark:bg-black overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex justify-start gap-3 p-3 min-w-max">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-white font-bold uppercase tracking-widest text-xs transition-all shrink-0 ${
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] -translate-y-[1px] -translate-x-[1px]"
                  : "bg-transparent text-black dark:text-white hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[1px] hover:-translate-x-[1px]"
              } active:translate-y-[0px] active:translate-x-[0px] active:shadow-none dark:active:shadow-none`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-white font-bold uppercase tracking-widest text-xs transition-all shrink-0 ${
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] -translate-y-[1px] -translate-x-[1px]"
                  : "bg-transparent text-black dark:text-white hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[1px] hover:-translate-x-[1px]"
              } active:translate-y-[0px] active:translate-x-[0px] active:shadow-none dark:active:shadow-none`
            }
          >
            Tasks
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-white font-bold uppercase tracking-widest text-xs transition-all shrink-0 ${
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] -translate-y-[1px] -translate-x-[1px]"
                  : "bg-transparent text-black dark:text-white hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[1px] hover:-translate-x-[1px]"
              } active:translate-y-[0px] active:translate-x-[0px] active:shadow-none dark:active:shadow-none`
            }
          >
            Calendar
          </NavLink>
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-white font-bold uppercase tracking-widest text-xs transition-all shrink-0 ${
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] -translate-y-[1px] -translate-x-[1px]"
                  : "bg-transparent text-black dark:text-white hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[1px] hover:-translate-x-[1px]"
              } active:translate-y-[0px] active:translate-x-[0px] active:shadow-none dark:active:shadow-none`
            }
          >
            Analytics
          </NavLink>
          <NavLink
            to="/pomodoro"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-white font-bold uppercase tracking-widest text-xs transition-all shrink-0 ${
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] -translate-y-[1px] -translate-x-[1px]"
                  : "bg-transparent text-black dark:text-white hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[1px] hover:-translate-x-[1px]"
              } active:translate-y-[0px] active:translate-x-[0px] active:shadow-none dark:active:shadow-none`
            }
          >
            Focus
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
