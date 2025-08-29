"use client";

import { Task } from "@/types/task";
import { Checkbox } from "@/components/ui/checkbox";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

type TaskCardProps = {
  task: Task;
};

export default function TaskCard({ task }: TaskCardProps) {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const handleToggleSubtask = async (index: number) => {
    const updatedSubTasks = [...task.subTasks];
    updatedSubTasks[index].done = !updatedSubTasks[index].done;
    const allDone = updatedSubTasks.every((s) => s.done);

    await updateDoc(doc(db, "tasks", task.id), {
      subTasks: updatedSubTasks,
      completed: allDone,
      status: allDone ? "completed" : "pending",
    });
  };

  const completedCount = task.subTasks.filter((s) => s.done).length;
  const progressText = `${completedCount}/${task.subTasks.length} subtasks completed`;

  return (
    <div className="p-4 rounded-2xl bg-transparent cursor-default">
  <div className="mb-2">
    <div className="font-bold text-white text-2xl">{task.title}</div>
    <div className="text-xs text-gray-400 mt-1">
      Created: {formatDate(task.createdAt)} &nbsp;|&nbsp; Due: {formatDate(task.dueDate)}
    </div>
  </div>

      <div className="text-sm text-gray-300 mb-2">
        {task.subject} |{" "}
        <span
          className={`font-semibold ${
            task.priority === "high"
              ? "text-red-400"
              : task.priority === "medium"
              ? "text-yellow-400"
              : "text-green-400"
          }`}
        >
          {task.priority}
        </span>
      </div>

      <div className="text-xs text-gray-400 italic mb-3">{progressText}</div>

      <div className="space-y-2">
        {task.subTasks.map((sub, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 text-sm text-white"
          >
            <Checkbox
              checked={sub.done}
              onCheckedChange={() => handleToggleSubtask(idx)}
              className="h-5 w-5 border-white/30 hover:scale-110"
            />
            <span className={sub.done ? "line-through text-green-400" : ""}>
              {sub.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
