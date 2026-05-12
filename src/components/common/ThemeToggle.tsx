import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../providers";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-3 border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white transition-all hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[2px] hover:-translate-x-[2px] active:translate-y-[0px] active:translate-x-[0px] active:shadow-none dark:active:shadow-none"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
