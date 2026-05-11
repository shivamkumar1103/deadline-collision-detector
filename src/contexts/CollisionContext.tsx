import React, { createContext, useContext, useEffect, useState, type FormEvent, ReactNode } from "react";
import { useUser } from "@clerk/react";

export interface Subject {
  subject_id: number;
  subject_name: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  deadline: string;
  category: string;
  estimated_effort: number;
  category_weight?: number;
  priority_score?: number;
  created_at: string;
  subject_id?: number;
}

export interface Clash {
  task1_id: number;
  task1_title: string;
  task1_deadline: string;
  task2_id: number;
  task2_title: string;
  task2_deadline: string;
}

export interface Suggestion {
  id: number;
  task_id: number;
  suggested_date: string;
  status: string;
}

export interface DeleteConfirmationState {
  isOpen: boolean;
  type: "task" | "subject" | null;
  id: number | null;
  title?: string;
}

export interface TaskFormState {
  title: string;
  description: string;
  deadline: string;
  category: string;
  estimated_effort: number;
  subject_id: string;
}

const emptyFormState: TaskFormState = {
  title: "",
  description: "",
  deadline: "",
  category: "General",
  estimated_effort: 1,
  subject_id: "",
};

const emptyDeleteState: DeleteConfirmationState = {
  isOpen: false,
  type: null,
  id: null,
};

export const getRelativeTime = (dateString: string) => {
  const now = new Date();
  const deadline = new Date(dateString);
  now.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today!";
  if (diffDays === 1) return "Tomorrow!";
  return `In ${diffDays} days`;
};


interface CollisionContextType {
  tasks: Task[];
  clashes: Clash[];
  suggestions: Suggestion[];
  loading: boolean;
  showForm: boolean;
  editingTask: Task | null;
  error: string | null;
  subjects: Subject[];
  showSubjectForm: boolean;
  newSubjectName: string;
  deleteConfirmation: DeleteConfirmationState;
  formData: TaskFormState;
  setShowForm: (show: boolean) => void;
  setShowSubjectForm: (show: boolean) => void;
  setNewSubjectName: (name: string) => void;
  setFormData: (data: TaskFormState) => void;
  setDeleteConfirmation: (data: DeleteConfirmationState) => void;
  openCreateTask: () => void;
  startEdit: (task: Task) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleAddSubject: (e: FormEvent) => Promise<void>;
  handleDeleteSubject: (id: number, name: string) => void;
  handleDelete: (id: number, title: string) => void;
  confirmDelete: () => Promise<void>;
  isClashing: (taskId: number) => boolean;
  handleSuggestion: (suggestionId: number, action: "accept" | "reject") => Promise<void>;
}

const CollisionContext = createContext<CollisionContextType | undefined>(undefined);

export function CollisionProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clashes, setClashes] = useState<Clash[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmationState>(emptyDeleteState);
  const [formData, setFormData] = useState<TaskFormState>(emptyFormState);

  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...options.headers,
      "x-user-email": user?.primaryEmailAddress?.emailAddress || "",
    };
    return fetch(url, { ...options, headers });
  };

  const syncUser = async () => {
    if (!user) return;

    try {
      await apiFetch("/api/users/sync", {
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

  const fetchSubjects = async () => {
    try {
      const res = await apiFetch("/api/subjects");
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (err) {
      console.error("Failed to fetch subjects", err);
    }
  };

  const checkClashes = async () => {
    try {
      const response = await apiFetch("/api/tasks/detect-clashes");
      if (response.ok) {
        const data = await response.json();
        setClashes(data);
      }

      const sugResponse = await apiFetch("/api/suggestions");
      if (sugResponse.ok) {
        const sugData = await sugResponse.json();
        setSuggestions(sugData);
      }
    } catch (err) {
      console.error("Clash detection failed", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await apiFetch("/api/tasks");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch tasks");
      }

      setTasks(data);
      setError(null);
      await Promise.all([checkClashes(), fetchSubjects()]);
    } catch (err: any) {
      setError(err.message || "Could not connect to the database server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    void (async () => {
      await syncUser();
      await fetchTasks();
    })();
  }, [user]);

  const resetForm = () => {
    setFormData({
      ...emptyFormState,
      subject_id: subjects[0]?.subject_id?.toString() || "",
    });
  };

  const openCreateTask = () => {
    setEditingTask(null);
    resetForm();
    setShowForm(true);
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      deadline: new Date(task.deadline).toISOString().slice(0, 16),
      category: task.category,
      estimated_effort: task.estimated_effort || 1,
      subject_id: task.subject_id ? task.subject_id.toString() : "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : "/api/tasks";
      const method = editingTask ? "PUT" : "POST";

      const response = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save task");

      resetForm();
      setShowForm(false);
      setEditingTask(null);
      await fetchTasks();
    } catch (err: any) {
      console.error("Submit failed:", err);
      alert(
        "Error: " +
          (err.message || "Make sure your server/MySQL is running properly."),
      );
    }
  };

  const handleAddSubject = async (e: FormEvent) => {
    e.preventDefault();

    if (!newSubjectName.trim()) return;

    try {
      const res = await apiFetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubjectName }),
      });

      if (res.ok) {
        setNewSubjectName("");
        await fetchSubjects();
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
        await apiFetch(`/api/subjects/${id}`, { method: "DELETE" });
        await fetchSubjects();
        await fetchTasks();
      } else if (type === "task") {
        await apiFetch(`/api/tasks/${id}`, { method: "DELETE" });
        await fetchTasks();
      }

      setDeleteConfirmation(emptyDeleteState);
    } catch (err) {
      console.error(err);
    }
  };

  const isClashing = (taskId: number) =>
    clashes.some(
      (clash) => clash.task1_id === taskId || clash.task2_id === taskId,
    );

  const handleSuggestion = async (
    suggestionId: number,
    action: "accept" | "reject",
  ) => {
    try {
      const res = await apiFetch(`/api/suggestions/${suggestionId}/${action}`, {
        method: "POST",
      });

      if (res.ok) {
        await fetchTasks();
      }
    } catch (err) {
      console.error(`Failed to ${action} suggestion`, err);
    }
  };

  return (
    <CollisionContext.Provider value={{
      tasks,
      clashes,
      suggestions,
      loading,
      showForm,
      editingTask,
      error,
      subjects,
      showSubjectForm,
      newSubjectName,
      deleteConfirmation,
      formData,
      setShowForm,
      setShowSubjectForm,
      setNewSubjectName,
      setFormData,
      setDeleteConfirmation,
      openCreateTask,
      startEdit,
      handleSubmit,
      handleAddSubject,
      handleDeleteSubject,
      handleDelete,
      confirmDelete,
      isClashing,
      handleSuggestion,
    }}>
      {children}
    </CollisionContext.Provider>
  );
}

export function useCollisionData() {
  const context = useContext(CollisionContext);
  if (context === undefined) {
    throw new Error("useCollisionData must be used within a CollisionProvider");
  }
  return context;
}
