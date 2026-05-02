/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  Filter,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Show, UserButton, useUser } from "@clerk/react";
import { ThemeToggle } from "./components/ThemeToggle";
import LoginPage from "./pages/LoginPage";

interface Subject {
  subject_id: number;
  subject_name: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  deadline: string;
  category: string;
  priority: number;
  created_at: string;
}

interface Clash {
  task1_id: number;
  task1_title: string;
  task1_deadline: string;
  task2_id: number;
  task2_title: string;
  task2_deadline: string;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clashes, setClashes] = useState<Clash[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Subject State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: "task" | "subject" | null;
    id: number | null;
    title?: string;
  }>({ isOpen: false, type: null, id: null });

  const { user } = useUser();

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    category: "General",
    priority: 1,
    subject_id: "",
  });

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch tasks");
      }

      setTasks(data);
      setError(null);
      checkClashes();
      fetchSubjects();
    } catch (err: any) {
      setError(err.message || "Could not connect to the database server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkClashes = async () => {
    try {
      const response = await fetch("/api/tasks/detect-clashes");
      if (response.ok) {
        const data = await response.json();
        setClashes(data);
      }
    } catch (err) {
      console.error("Clash detection failed", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/subjects");
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (err) {
      console.error("Failed to fetch subjects", err);
    }
  };

  const syncUser = async () => {
    if (!user) return;
    try {
      await fetch("/api/users/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.fullName || user.username || "Student",
          email: user.primaryEmailAddress?.emailAddress,
        }),
      });
    } catch (err) {
      console.error("User sync failed", err);
    }
  };

  useEffect(() => {
    if (user) {
      syncUser();
      fetchTasks();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : "/api/tasks";
      const method = editingTask ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save task");

      setFormData({
        title: "",
        description: "",
        deadline: "",
        category: "General",
        priority: 1,
        subject_id: "",
      });
      setShowForm(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err: any) {
      console.error("Submit failed:", err);
      alert(
        "Error: " +
          (err.message || "Make sure your server/MySQL is running properly."),
      );
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubjectName }),
      });
      if (res.ok) {
        setNewSubjectName("");
        fetchSubjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubject = (id: number, name: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: "subject",
      id,
      title: name,
    });
  };

  const handleDelete = (id: number, title: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: "task",
      id,
      title,
    });
  };

  const confirmDelete = async () => {
    const { type, id } = deleteConfirmation;
    if (!type || id === null) return;

    try {
      if (type === "subject") {
        await fetch(`/api/subjects/${id}`, { method: "DELETE" });
        fetchSubjects();
        fetchTasks();
      } else if (type === "task") {
        await fetch(`/api/tasks/${id}`, { method: "DELETE" });
        fetchTasks();
      }
      setDeleteConfirmation({ isOpen: false, type: null, id: null });
    } catch (err) {
      console.error(err);
    }
  };


  const startEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      deadline: new Date(task.deadline).toISOString().slice(0, 16),
      category: task.category,
      priority: task.priority || 1,
      subject_id: (task as any).subject_id
        ? (task as any).subject_id.toString()
        : "",
    });
    setShowForm(true);
  };

  const isClashing = (taskId: number) => {
    return clashes.some((c) => c.task1_id === taskId || c.task2_id === taskId);
  };

  return (
    <>
      <Show when="signed-out">
        <LoginPage />
      </Show>
      <Show when="signed-in">
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans p-4 md:p-12 transition-colors">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6 border-b-2 border-black dark:border-white pb-6">
              <div>
                <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-black dark:text-white leading-none">
                  Collision Detector
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button
                  onClick={() => setShowSubjectForm(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white font-bold hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all active:scale-95"
                >
                  <Plus size={18} />
                  New Subject
                </button>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setFormData({
                      title: "",
                      description: "",
                      deadline: "",
                      category: "General",
                      priority: 1,
                      subject_id: subjects[0]?.subject_id?.toString() || "",
                    });
                    setShowForm(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all active:scale-95"
                  id="add-task-btn"
                >
                  <Plus size={20} />
                  Add New Task
                </button>
                <div className="bg-white dark:bg-black p-2 border-2 border-black dark:border-white flex items-center justify-center">
                  <UserButton />
                </div>
              </div>
            </header>

            {/* Alerts Section */}
            {clashes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 p-6 bg-neutral-100 dark:bg-neutral-900 border-2 border-black dark:border-white flex items-start gap-4"
              >
                <div className="p-2 bg-black text-white dark:bg-white dark:text-black shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl uppercase tracking-wider">
                    Deadline Clashes Detected
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1 font-medium">
                    The following tasks have deadlines within 24 hours of each
                    other. Consider rescheduling.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {clashes.map((clash, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white dark:bg-black border-2 border-black dark:border-white text-xs font-bold uppercase tracking-widest"
                      >
                        "{clash.task1_title}" vs "{clash.task2_title}"
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Recommendation Section */}
            {(() => {
              const recommendedTask =
                tasks.length > 0
                  ? tasks.reduce((prev, current) => {
                      if (current.priority > prev.priority) return current;
                      if (
                        current.priority === prev.priority &&
                        new Date(current.deadline) < new Date(prev.deadline)
                      )
                        return current;
                      return prev;
                    })
                  : null;

              if (!recommendedTask) return null;

              return (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-12 p-8 bg-black dark:bg-white text-white dark:text-black flex flex-col md:flex-row items-center md:items-start gap-8 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]"
                >
                  <div className="p-4 border-2 border-white dark:border-black shrink-0 bg-transparent">
                    <Star
                      size={40}
                      className="text-yellow-400 dark:text-yellow-500"
                      fill="currentColor"
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-block px-4 py-1 border-2 border-white dark:border-black text-xs font-bold uppercase tracking-widest mb-4 bg-yellow-400 text-black">
                      Start This First
                    </div>
                    <h3 className="font-extrabold text-4xl mb-2 tracking-tight">
                      {recommendedTask.title}
                    </h3>
                    <p className="text-neutral-300 dark:text-neutral-600 font-medium mb-4">
                      Highest priority task with the soonest deadline.
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-2 font-bold border-2 border-white dark:border-black w-fit px-5 py-2 mx-auto md:mx-0">
                      <Clock size={18} />
                      <span>
                        Due:{" "}
                        {new Date(recommendedTask.deadline).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* Error State */}
            {error && (
              <div className="border-2 border-black dark:border-white p-8 mb-12 text-center bg-red-50 dark:bg-red-950/20">
                <AlertTriangle
                  className="mx-auto text-black dark:text-white mb-4"
                  size={40}
                />
                <h3 className="font-extrabold text-2xl uppercase tracking-wider mb-2">
                  Backend Connection Error
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 font-medium max-w-lg mx-auto">
                  The application is unable to connect to your MySQL database.
                  If you are testing this locally, make sure your MySQL server
                  (XAMPP/MySQL) is running.
                </p>
              </div>
            )}

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`group bg-white dark:bg-black p-6 border-2 transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] flex flex-col ${
                      isClashing(task.id)
                        ? "border-black dark:border-white"
                        : "border-neutral-200 dark:border-neutral-800"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 border-2 border-black dark:border-white text-[10px] font-bold uppercase tracking-widest text-black ${
                          task.category === "Exam" ? "bg-red-300" :
                          task.category === "Assignment" ? "bg-blue-300" :
                          task.category === "Project" ? "bg-purple-300" :
                          task.category === "Quiz" ? "bg-pink-300" : "bg-neutral-300"
                        }`}>
                          {task.category}
                        </span>
                        <span className={`px-3 py-1 border-2 border-black dark:border-white text-[10px] font-bold uppercase tracking-widest text-black ${
                          task.priority === 3 ? "bg-red-500 text-white" :
                          task.priority === 2 ? "bg-yellow-400" : "bg-emerald-400"
                        }`}>
                          {task.priority === 3
                            ? "High Priority"
                            : task.priority === 2
                              ? "Med Priority"
                              : "Low Priority"}
                        </span>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(task)}
                          className="p-2 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id, task.title)}
                          className="p-2 border border-black dark:border-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-2xl font-extrabold tracking-tight mb-3 line-clamp-2">
                      {task.title}
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium mb-6 line-clamp-3 flex-1">
                      {task.description || "No description provided."}
                    </p>

                    <div className="flex items-center justify-between border-t-2 border-black dark:border-white pt-4 mt-auto">
                      <div className="flex items-center gap-2 font-bold">
                        <Clock size={18} />
                        <span className="text-sm">
                          {new Date(task.deadline).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                      {isClashing(task.id) ? (
                        <div className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-widest px-2 py-1 bg-black dark:bg-white text-white dark:text-black">
                          <AlertTriangle size={12} />
                          Clash
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                          <CheckCircle2 size={12} />
                          Clear
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {tasks.length === 0 && !loading && (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-black dark:border-white">
                  <Clock className="mx-auto mb-6" size={64} />
                  <p className="font-bold text-2xl uppercase tracking-widest">
                    No tasks found.
                  </p>
                  <p className="text-neutral-500 mt-2 font-medium">
                    Time to add some deadlines.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Applet */}
            {showForm && (
              <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white dark:bg-black border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] w-full max-w-xl overflow-hidden"
                >
                  <div className="p-6 border-b-4 border-black dark:border-white flex justify-between items-center bg-neutral-100 dark:bg-neutral-900">
                    <h2 className="text-2xl font-extrabold uppercase tracking-widest">
                      {editingTask ? "Edit Task" : "New Task"}
                    </h2>
                    <button
                      onClick={() => setShowForm(false)}
                      className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest">
                        Task Title
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g., Final Year DBMS Viva"
                        className="w-full px-4 py-4 border-2 border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white font-medium"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest">
                          Subject
                        </label>
                        <select
                          required
                          className="w-full px-4 py-4 border-2 border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none appearance-none font-medium"
                          value={formData.subject_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              subject_id: e.target.value,
                            })
                          }
                        >
                          <option value="" disabled>
                            Select Subject
                          </option>
                          {subjects.map((sub) => (
                            <option key={sub.subject_id} value={sub.subject_id}>
                              {sub.subject_name}
                            </option>
                          ))}
                        </select>
                        {subjects.length === 0 && (
                          <p className="text-[10px] font-bold mt-1">
                            Please add a subject first!
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest">
                          Category
                        </label>
                        <select
                          className="w-full px-4 py-4 border-2 border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none appearance-none font-medium"
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({ ...formData, category: e.target.value })
                          }
                        >
                          <option>General</option>
                          <option>Assignment</option>
                          <option>Exam</option>
                          <option>Project</option>
                          <option>Quiz</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest">
                          Priority
                        </label>
                        <select
                          className="w-full px-4 py-4 border-2 border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none appearance-none font-medium"
                          value={formData.priority}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              priority: parseInt(e.target.value),
                            })
                          }
                        >
                          <option value={1}>Low</option>
                          <option value={2}>Medium</option>
                          <option value={3}>High</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest">
                          Deadline
                        </label>
                        <input
                          required
                          type="datetime-local"
                          className="w-full px-4 py-4 border-2 border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none font-medium"
                          value={formData.deadline}
                          onChange={(e) =>
                            setFormData({ ...formData, deadline: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest">
                        Description (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Brief details about the task..."
                        className="w-full px-4 py-4 border-2 border-black dark:border-white bg-transparent text-black dark:text-white focus:outline-none resize-none font-medium"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-extrabold uppercase tracking-widest text-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors mt-8"
                    >
                      {editingTask ? "Apply Changes" : "Create Task"}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}

            {/* Subject Modal */}
            {showSubjectForm && (
              <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white dark:bg-black border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] w-full max-w-md overflow-hidden"
                >
                  <div className="p-6 border-b-4 border-black dark:border-white flex justify-between items-center bg-neutral-100 dark:bg-neutral-900">
                    <h2 className="text-xl font-extrabold uppercase tracking-widest">
                      Subjects
                    </h2>
                    <button
                      onClick={() => setShowSubjectForm(false)}
                      className="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-6 max-h-60 overflow-y-auto space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest">
                      Existing Subjects
                    </label>
                    {subjects.length === 0 ? (
                      <p className="text-sm font-medium p-4 border-2 border-dashed border-black dark:border-white text-center">
                        No subjects added yet.
                      </p>
                    ) : (
                      subjects.map((sub) => (
                        <div
                          key={sub.subject_id}
                          className="flex items-center justify-between p-4 border-2 border-black dark:border-white group"
                        >
                          <span className="font-bold">
                            {sub.subject_name}
                          </span>
                          <button
                            onClick={() => handleDeleteSubject(sub.subject_id, sub.subject_name)}
                            className="p-2 border-2 border-transparent hover:border-black dark:hover:border-white transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <form
                    onSubmit={handleAddSubject}
                    className="p-6 pt-0 space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest">
                        Add New
                      </label>
                      <div className="flex gap-3">
                        <input
                          required
                          type="text"
                          placeholder="e.g., Mathematics"
                          className="flex-1 px-4 py-3 border-2 border-black dark:border-white bg-transparent focus:outline-none font-medium"
                          value={newSubjectName}
                          onChange={(e) => setNewSubjectName(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="px-6 bg-black dark:bg-white text-white dark:text-black font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
            {/* Delete Confirmation Modal */}
            {deleteConfirmation.isOpen && (
              <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white dark:bg-black border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] w-full max-w-sm overflow-hidden"
                >
                  <div className="p-6 border-b-4 border-black dark:border-white flex justify-between items-center bg-red-100 dark:bg-red-900">
                    <h2 className="text-xl font-extrabold uppercase tracking-widest text-red-900 dark:text-red-100">
                      Confirm Deletion
                    </h2>
                    <button
                      onClick={() =>
                        setDeleteConfirmation({ isOpen: false, type: null, id: null })
                      }
                      className="p-2 border-2 border-red-900 dark:border-red-100 text-red-900 dark:text-red-100 hover:bg-red-900 hover:text-white dark:hover:bg-red-100 dark:hover:text-red-900 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-8">
                    <p className="text-lg font-bold mb-2">
                      Are you sure you want to delete this {deleteConfirmation.type}?
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400 font-medium mb-8 border-l-4 border-black dark:border-white pl-4">
                      {deleteConfirmation.title}
                    </p>

                    {deleteConfirmation.type === "subject" && (
                      <div className="mb-8 p-4 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-red-800 dark:text-red-200 text-sm font-bold flex items-start gap-3">
                        <AlertTriangle size={20} className="shrink-0" />
                        <p>
                          Deleting this subject will also delete ALL associated tasks. This action cannot be undone.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        onClick={() =>
                          setDeleteConfirmation({ isOpen: false, type: null, id: null })
                        }
                        className="flex-1 py-4 border-2 border-black dark:border-white bg-transparent text-black dark:text-white font-extrabold uppercase tracking-widest hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmDelete}
                        className="flex-1 py-4 border-2 border-red-600 bg-red-600 text-white font-extrabold uppercase tracking-widest hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </Show>
    </>
  );
}
