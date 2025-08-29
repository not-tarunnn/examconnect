"use client";

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';

interface TaskNodeData {
  task: Task;
  isSelected?: boolean;
  onToggleSubtask?: (taskId: string, subtaskIndex: number) => Promise<void>;
  onEditTask?: (task: Task) => void;
}

const TaskNode = memo(({ data, selected }: NodeProps<TaskNodeData>) => {
  const { task } = data;
  
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const handleToggleSubtask = async (index: number) => {
    if (data.onToggleSubtask) {
      await data.onToggleSubtask(task.id, index);
    } else {
      console.log('No toggle function provided for subtask', task.id, index);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onEditTask) {
      data.onEditTask(task);
    }
  };

  const completedCount = task.subTasks.filter((s) => s.done).length;
  const progressText = `${completedCount}/${task.subTasks.length} subtasks completed`;

  const borderStyle = selected ? '3px solid white' : 'none';

  return (
    <div className="relative">
      {/* Connection Handle */}
      <Handle
        type="source"
        position={Position.Left}
        id="task-output"
        className="w-4 h-4 bg-white border-2 border-gray-600 hover:scale-110 transition-transform"
        style={{ 
          left: -8, 
          top: -8,
          borderRadius: '50%'
        }}
      />
      
      <div
        className="p-4 rounded-2xl bg-black/30 hover:bg-white/10 transition-all min-w-[220px] cursor-pointer"
        style={{ border: borderStyle }}
        onDoubleClick={handleDoubleClick}
        title="Double-click to edit task"
      >
        {/* Title + Created/Due Date */}
        <div className="mb-2">
          <div className="font-bold text-white text-lg">{task.title}</div>
          <div className="text-xs text-gray-400 mt-1">
            Created: {formatDate(task.createdAt)} | Due: {formatDate(task.dueDate)}
          </div>
        </div>

        {/* Subject & Priority */}
        <div className="text-sm text-gray-300 mb-2">
          {task.subject ? task.subject.split(',').map(s => s.trim()).join(' | ') : 'No subject'} |{" "}
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

        {/* Subtask Progress */}
        <div className="text-xs text-gray-400 italic mb-3">{progressText}</div>

        {/* All Subtasks */}
        <div className="space-y-2">
          {task.subTasks.map((sub, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 text-sm text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={sub.done}
                onCheckedChange={() => handleToggleSubtask(idx)}
                className="h-4 w-4 border-white/30"
              />
              <span className={sub.done ? "line-through text-green-400" : ""}>
                {sub.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

TaskNode.displayName = 'TaskNode';

export default TaskNode;
