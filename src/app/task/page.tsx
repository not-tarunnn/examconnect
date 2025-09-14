"use client";

import { useEffect, useState } from "react";
import TaskManagerModal from "@/components/task/TaskManagerModal";
import { Task } from "@/types/task";
import { collection, query, where, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

// ⬇️ Add imports for Sidebar and HeaderApp
import Sidebar from "@/components/Sidebar";
import HeaderApp from "@/components/HeaderApp";
import { FaPlus } from "react-icons/fa";
import { TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import MapCanvasFlow from "@/components/task/MapCanvasFlow";
import DifficultyRatingModal from "@/components/task/DifficultyRatingModal";

export default function TasksPage() {
  
  const getTodayLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // shift to local timezone
  return d.toISOString().split("T")[0];
};
  const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const [activeTab, setActiveTab] = useState<"tasks" | "habits" | "map">("tasks");
  const [taskFilter, setTaskFilter] = useState<"pending" | "completed">("pending");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [dueDateFilter, setDueDateFilter] = useState<string | null>(getTodayLocal());
  const [difficultyModalOpen, setDifficultyModalOpen] = useState(false);
  const [completedTask, setCompletedTask] = useState<Task | null>(null);
const handleDeleteTask = async (taskId: string) => {
  try {
    await deleteDoc(doc(db, "tasks", taskId));
  } catch (error) {
    console.error("Failed to delete task:", error);
  }
};

const handleDifficultySubmit = async (rating: number) => {
  if (!completedTask?.id || !user) {
    console.error("❌ Missing taskId or user");
    return;
  }

  console.log("➡️ Submitting review for task:", completedTask.id);

  try {
    // Update the task directly in Firestore with the rating
    const taskRef = doc(db, "tasks", completedTask.id);
    await updateDoc(taskRef, {
      userRating: rating, // Save the rating in the Firestore task document
    });

    console.log("✅ Task updated with new difficulty rating");

  } catch (err) {
    console.error("💥 Error submitting review:", err);
  }
};

const handleDifficultyModalClose = () => {
  setDifficultyModalOpen(false);
  setCompletedTask(null);
};
  // ✅ Auth state tracking
  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  // ✅ Fetch tasks when user is ready
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "tasks"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const fetchedTasks: Task[] = [];
      snap.forEach((doc) =>
        fetchedTasks.push({ ...(doc.data() as Task), id: doc.id })
      );
      setTasks(fetchedTasks);
    });

    return () => unsub();
  }, [user]);

  const filteredTasks = tasks.filter((t) => {
  const matchesStatus = t.status === taskFilter;
  const matchesPriority = priorityFilter ? t.priority === priorityFilter : true;
  const matchesSubject = subjectFilter ? t.subject === subjectFilter : true;
  const matchesDueDate = dueDateFilter ? t.dueDate === dueDateFilter : true;

  return matchesStatus && matchesPriority && matchesSubject && matchesDueDate;
});

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="z-[49] sm:relative fixed">
      <Sidebar />
    </div>


      {/* Main Content Area */}
      <div className="flex flex-col flex-1 pl-16 sm:pl-0">
        {/* Header */}
        <HeaderApp />

        {/* Page Content */}
        <div className="w-full flex-1 flex flex-col px-6 pb-6 overflow-hidden">

          <div className="flex justify-center mb-4">
 <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
  <button
    onClick={() => setActiveTab("tasks")}
    className={`px-3 py-1 text-sm font-medium rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
      activeTab === "tasks"
        ? "bg-background text-foreground shadow"
        : "hover:text-foreground"
    }`}
  >
    Tasks
  </button>
  <button
    onClick={() => setActiveTab("habits")}
    className={`px-3 py-1 text-sm font-medium rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
      activeTab === "habits"
        ? "bg-background text-foreground shadow"
        : "hover:text-foreground"
    }`}
  >
    Habits
  </button>
  <button
    onClick={() => setActiveTab("map")}
    className={`px-3 py-1 text-sm font-medium rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
      activeTab === "map"
        ? "bg-background text-foreground shadow"
        : "hover:text-foreground"
    }`}
  >
    Map
  </button>
</div>

</div>

 
          {activeTab === "tasks" && (
            <>
              <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
  {/* Left: Pending / Completed */}
  <div className="flex gap-4 items-start">
    <button
      onClick={() => setTaskFilter("pending")}
      className={taskFilter === "pending" ? "underline font-medium" : ""}
    >
      Pending
    </button>
    <button
      onClick={() => setTaskFilter("completed")}
      className={taskFilter === "completed" ? "underline font-medium" : ""}
    >
      Completed
    </button>
  </div>

  {/* Right: Filters */}
  <div className="flex gap-3 flex-wrap text-black">
    <select
      value={priorityFilter || ""}
      onChange={(e) => setPriorityFilter(e.target.value || null)}
      className="border px-3 py-1 rounded"
    >
      <option value="">All Priorities</option>
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
    </select>

    <select
      value={subjectFilter || ""}
      onChange={(e) => setSubjectFilter(e.target.value || null)}
      className="border px-3 py-1 rounded"
    >
      <option value="">All Subjects</option>
      {[...new Set(tasks.map((t) => t.subject))].map((subj) => (
        <option key={subj} value={subj}>
          {subj}
        </option>
      ))}
    </select>

    <input
  type="date"
  value={dueDateFilter || getTodayLocal()}
  onChange={(e) => setDueDateFilter(e.target.value || null)}
  className="border px-3 py-1 rounded"
/>
  </div>
</div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[calc(100vh-370px)] sm:max-h-[calc(100vh-210px)]">
  {filteredTasks.map((task) => {
    const completedCount = task.subTasks.filter((s) => s.done).length;
    const totalCount = task.subTasks.length;
    const progressText = `${completedCount}/${totalCount} subtasks completed`;

    const handleToggleSubtask = async (index: number) => {
      const updatedSubTasks = [...task.subTasks];
      updatedSubTasks[index].done = !updatedSubTasks[index].done;
      const allDone = updatedSubTasks.every((s) => s.done);

      await updateDoc(doc(db, "tasks", task.id), {
        subTasks: updatedSubTasks,
        completed: allDone,
        status: allDone ? "completed" : "pending",
      });

      // Show difficulty rating modal whenever task is completed
      if (allDone) {
        setCompletedTask(task);
        setDifficultyModalOpen(true);
      }
    };

    return (
      <div
        key={task.id}
        onClick={(e) => {
          if ((e.target as HTMLElement).tagName.toLowerCase() === "input") return;
          setEditingTask(task);
          setModalOpen(true);
        }}
        className="border border-white/10 p-4 rounded-2xl bg-black/30 hover:bg-white/10 transition cursor-pointer"
      >
        {/* Title + Created/Due Date + Trash in same row */}
<div className="flex justify-between items-start mb-2">
  {/* Title */}
  <div className="font-bold text-white text-lg">{task.title}</div>

  {/* Dates + Trash on same line */}
  <div className="flex items-center gap-3 text-xs text-gray-400 text-right">
    <div>
      Created: {formatDate(task.createdAt)} &nbsp;|&nbsp; Due: {formatDate(task.dueDate)}
    </div>

    {/* Trash Icon */}
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent modal from opening
        handleDeleteTask(task.id);
      }}
      className="text-red-500 hover:text-red-600 transition"
      title="Delete Task"
    >
      <Trash2 size={18} />
    </button>
  </div>
</div>

      

        {/* Subject & Priority */}
        <div className="text-sm text-gray-300 mb-2">
          {task.subject ? task.subject.split(',').map(s => s.trim()).join(' | ') : 'No subject'} |{" "}
          <span
            className={`font-semibold ${
  task.priority.toLowerCase() === "high"
    ? "text-red-400"
    : task.priority.toLowerCase() === "medium"
    ? "text-yellow-400"
    : "text-green-400"
}`}

          >
            {task.priority ? (task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()) : "Medium"}
          </span>
        </div>

        {/* Subtask Progress */}
        <div className="text-xs text-gray-400 italic mb-3">{progressText}</div>

        {/* All Subtask Checkboxes */}
        <div className="space-y-2">
          {task.subTasks.map((sub, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 text-sm text-white"
              onClick={(e) => e.stopPropagation()} // prevent modal from opening
            >
              <Checkbox
                checked={sub.done}
                onCheckedChange={() => handleToggleSubtask(idx)}
                className="h-5 w-5 border-white/30"
              />
              <span className={sub.done ? "line-through text-green-400" : ""}>
                {sub.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  })}
</div>

            </>
          )}

          {activeTab === "habits" && (
  <div className="flex-1 flex items-center justify-center text-muted-foreground text-xl font-medium">
    🚧 Habits feature is under development.
  </div>
)}

          {activeTab === "map" && (
  <div className="flex-1 relative overflow-hidden">
    <MapCanvasFlow
      tasks={tasks}
      onEditTask={(task) => {
        setEditingTask(task);
        setModalOpen(true);
      }}
    />
  </div>
)}
  
        </div>

        {/* Floating Button */}
        <button
  onClick={() => {
    setEditingTask(null);
    setModalOpen(true);
  }}
  className="fixed bottom-6 right-6 p-4 rounded-full border border-white/30 backdrop-blur-xl bg-white/10 text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/20"
>
  <FaPlus className="w-5 h-5" />
</button>


        {/* Task Manager Modal */}
        <TaskManagerModal
          open={modalOpen}
          onCloseAction={() => setModalOpen(false)}
          initialTask={editingTask}
        />

        {/* Difficulty Rating Modal */}
<DifficultyRatingModal
  open={difficultyModalOpen}
  onCloseAction={handleDifficultyModalClose}
  onSubmitAction={handleDifficultySubmit}
  taskTitle={completedTask?.title || ""}
  existingRating={completedTask?.userRating}
  taskId={completedTask?.id || ""}  // Ensure taskId is passed
/>


        
      </div>
    </div>
  );
}
