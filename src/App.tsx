import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import CalendarPage from "./pages/CalendarPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import PomodoroPage from "./pages/PomodoroPage";
import { CollisionProvider } from "./contexts/CollisionContext";

export default function App() {
  return (
    <BrowserRouter>
      <CollisionProvider>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/pomodoro" element={<PomodoroPage />} />
        </Routes>
      </CollisionProvider>
    </BrowserRouter>
  );
}
