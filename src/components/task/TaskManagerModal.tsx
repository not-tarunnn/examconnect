"use client";

import { useEffect, useState } from "react";
import { Task } from "@/types/task";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
// Already included above, just confirming the required components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  open: boolean;
  onCloseAction: () => void;
  initialTask?: Task | null;
};

export default function TaskManagerModal({ open, onCloseAction, initialTask }: Props) {
  const auth = getAuth();
  const user = auth.currentUser;

  const [title, setTitle] = useState("");
  const [subTasks, setSubTasks] = useState([{ title: "", done: false }]);
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Low");
  const [dueDate, setDueDate] = useState("");
  const [completed, setCompleted] = useState(false);

  
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setSubTasks(initialTask.subTasks);
      setSubject(initialTask.subject);
      setPriority(initialTask.priority);
      setDueDate(initialTask.dueDate);
      setCompleted(initialTask.completed);
    } else {
      setTitle("");
      setSubTasks([{ title: "", done: false }]);
      setSubject("");
      setPriority("Low");
      setDueDate("");
      setCompleted(false);
    }
  }, [initialTask]);

  const handleSave = async () => {
    if (!user) return;

    const taskData: Omit<Task, "id"> = {
      uid: user.uid,
      title,
      subTasks,
      subject,
      priority,
      dueDate,
      createdAt: initialTask?.createdAt || new Date().toISOString(),
      completed,
      status: completed ? "completed" : "pending",
    };

    if (initialTask) {
      await updateDoc(doc(db, "tasks", initialTask.id), taskData);
    } else {
      await addDoc(collection(db, "tasks"), taskData);
    }

    onCloseAction();
  };

  const handleDelete = async () => {
    if (initialTask) {
      await deleteDoc(doc(db, "tasks", initialTask.id));
      onCloseAction();
    }
  };

  if (!open) return null;

return (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-[#121212] text-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">

      <h2 className="text-xl font-semibold mb-4">
        {initialTask ? "Edit Task" : "New Task"}
      </h2>

      <div className="space-y-4">
        <Input
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-zinc-900 text-white border-zinc-700"
        />

        {subTasks.map((sub, idx) => (
          <Input
            key={idx}
            placeholder={`Subtask ${idx + 1}`}
            value={sub.title}
            onChange={(e) => {
              const updated = [...subTasks];
              updated[idx].title = e.target.value;
              setSubTasks(updated);
            }}
            className="bg-zinc-900 text-white border-zinc-700"
          />
        ))}

        <Button
          variant="ghost"
          size="sm"
          className="text-blue-400 hover:text-blue-300 p-0"
          onClick={() =>
            setSubTasks([...subTasks, { title: "", done: false }])
          }
        >
          + Add Subtask
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-400 hover:text-red-600 p-0 ml-4"
          onClick={() => {
            if (subTasks.length > 1) {
              setSubTasks((prev) => prev.slice(0, -1));
            }
          }}
              >
               – Remove Last Subtask
              </Button>
        
        <Input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="bg-zinc-900 text-white border-zinc-700"
        />

        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Priority</Label>
          <Select
            value={priority}
            onValueChange={(val) => setPriority(val as "Low" | "Medium" | "High")}
          >
            <SelectTrigger className="bg-zinc-900 text-white border-zinc-700">
              <SelectValue placeholder="Select Priority" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Due Date</Label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="bg-zinc-900 text-white border-zinc-700"
          />
        </div>

        <div className="flex items-center space-x-2 pt-2">
  <Checkbox
    id="completed"
    checked={completed}
    onCheckedChange={(val) => setCompleted(!!val)}
    className="border border-white bg-transparent data-[state=checked]:bg-white data-[state=checked]:text-black transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 focus:outline-none"
  />
  <Label
    htmlFor="completed"
    className="text-white text-sm font-medium"
  >
    Mark as Completed
  </Label>
</div>

        <div className="pt-4 flex justify-between">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500">
            Save
          </Button>

          {initialTask && (
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-600"
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}

          <Button
            variant="ghost"
            className="text-gray-400 hover:text-black"
            onClick={onCloseAction}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  </div>
);
}