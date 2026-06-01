import React from "react";
import { Show } from "@clerk/react";
import Navbar from "../components/common/Navbar";
import LoginPage from "./LoginPage";
import { useCollisionData } from "../contexts/CollisionContext";
import { PieChart, TrendingUp, AlertTriangle, Layers } from "lucide-react";

export default function AnalyticsPage() {
  const dashboard = useCollisionData();

  const totalTasks = dashboard.tasks.length;
  
  // Category Stats
  const categories = ["Assignment", "Exam", "Project", "Quiz", "General"];
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = dashboard.tasks.filter(t => t.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  // Priority Stats based on calculated scores
  const priorityCounts = {
    "Critical (≥20)": dashboard.tasks.filter(t => (t.priority_score || 0) >= 20).length,
    "Moderate (10-19)": dashboard.tasks.filter(t => (t.priority_score || 0) >= 10 && (t.priority_score || 0) < 20).length,
    "Routine (<10)": dashboard.tasks.filter(t => (t.priority_score || 0) < 10).length,
  };
  const maxPriorityCount = Math.max(...Object.values(priorityCounts), 1);

  // Colors
  const categoryColors: Record<string, string> = {
    Assignment: "bg-blue-400",
    Exam: "bg-red-400",
    Project: "bg-purple-400",
    Quiz: "bg-pink-400",
    General: "bg-neutral-400",
  };

  const priorityColors: Record<string, string> = {
    "Critical (≥20)": "bg-red-500",
    "Moderate (10-19)": "bg-yellow-400",
    "Routine (<10)": "bg-emerald-400",
  };

  return (
    <>
      <Show when="signed-out">
        <LoginPage />
      </Show>
      <Show when="signed-in">
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans transition-colors">
          <Navbar />
          <div className="max-w-6xl mx-auto p-4 md:p-12">
            <header className="mb-12">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase mb-4">
                Analytics
              </h1>
              <p className="text-xl font-medium text-neutral-600 dark:text-neutral-400">
                Insights and statistics for your academic workload.
              </p>
            </header>

            {totalTasks === 0 ? (
              <div className="p-12 text-center border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                <PieChart className="mx-auto mb-6 text-neutral-400" size={64} />
                <p className="font-bold text-2xl uppercase tracking-widest text-neutral-500">
                  Not enough data
                </p>
                <p className="text-neutral-500 mt-2 font-medium">
                  Add some tasks to see your analytics.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Tasks by Category */}
                <div className="border-4 border-black dark:border-white bg-white dark:bg-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                  <div className="flex items-center gap-3 mb-8">
                    <Layers size={28} />
                    <h2 className="text-2xl font-extrabold uppercase tracking-widest">Tasks By Category</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {categories.map(cat => {
                      const count = categoryCounts[cat];
                      const percentage = Math.round((count / maxCategoryCount) * 100) || 0;
                      
                      return (
                        <div key={cat} className="space-y-2">
                          <div className="flex justify-between text-sm font-bold uppercase tracking-widest">
                            <span>{cat}</span>
                            <span>{count}</span>
                          </div>
                          <div className="h-8 border-2 border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 w-full relative overflow-hidden">
                            <div 
                              className={`h-full absolute left-0 top-0 border-r-2 border-black dark:border-white transition-all duration-1000 ${categoryColors[cat]}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tasks by Priority */}
                <div className="border-4 border-black dark:border-white bg-white dark:bg-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                  <div className="flex items-center gap-3 mb-8">
                    <TrendingUp size={28} />
                    <h2 className="text-2xl font-extrabold uppercase tracking-widest">Workload Priority</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {Object.entries(priorityCounts).map(([priority, count]) => {
                      const percentage = Math.round((count / maxPriorityCount) * 100) || 0;

                      return (
                        <div key={priority} className="space-y-2">
                          <div className="flex justify-between text-sm font-bold uppercase tracking-widest">
                            <span>{priority}</span>
                            <span>{count}</span>
                          </div>
                          <div className="h-8 border-2 border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 w-full relative overflow-hidden">
                            <div
                              className={`h-full absolute left-0 top-0 border-r-2 border-black dark:border-white transition-all duration-1000 ${priorityColors[priority]}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Clash Overview */}
                <div className="lg:col-span-2 border-4 border-black dark:border-white bg-white dark:bg-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle size={28} className={dashboard.clashes.length > 0 ? "text-red-500" : ""} />
                      <h2 className="text-2xl font-extrabold uppercase tracking-widest">Collision Health</h2>
                    </div>
                    <p className="font-medium text-neutral-600 dark:text-neutral-400">
                      Based on your current schedule, you have a total of <strong className="text-black dark:text-white">{dashboard.clashes.length}</strong> active clashes out of {totalTasks} tasks. 
                      {dashboard.clashes.length > 0 ? " You should consider rescheduling some items to balance your workload." : " Your schedule is clear!"}
                    </p>
                  </div>
                  <div className={`p-8 border-4 border-black dark:border-white flex flex-col items-center justify-center min-w-[200px] ${dashboard.clashes.length > 0 ? 'bg-red-400 dark:bg-red-500 text-white dark:text-black' : 'bg-emerald-400 text-black'}`}>
                    <span className="text-7xl font-extrabold tracking-tighter">{dashboard.clashes.length}</span>
                    <span className="font-bold uppercase tracking-widest mt-2 text-sm">Total Clashes</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </Show>
    </>
  );
}
