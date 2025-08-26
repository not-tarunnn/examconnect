"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

interface Block {
  id: string;
  type: 'subject' | 'task' | 'text';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  connections: string[];
  data?: any;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  fromPoint: { x: number; y: number };
  toPoint: { x: number; y: number };
}

interface MapCanvasProps {
  tasks: Task[];
}

export default function MapCanvas({ tasks }: MapCanvasProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragOffset: { x: number; y: number };
    draggedBlock: string | null;
  }>({
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    draggedBlock: null,
  });
  const [connecting, setConnecting] = useState<{
    from: string | null;
    isConnecting: boolean;
    dragLine: { x: number; y: number } | null;
  }>({ from: null, isConnecting: false, dragLine: null });
  const [textBlocks, setTextBlocks] = useState<{ [key: string]: boolean }>({});

  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Auth state tracking
  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch subjects from Firebase tasks for current user
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "tasks"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const subjectsSet = new Set<string>();
      snap.forEach((doc) => {
        const task = doc.data() as Task;
        if (task.subject) {
          subjectsSet.add(task.subject);
        }
      });
      setSubjects(Array.from(subjectsSet));
    });

    return () => unsub();
  }, [user]);

  // Create initial blocks from subjects and tasks
  useEffect(() => {
    const initialBlocks: Block[] = [];

    // Create subject blocks from Firebase data
    subjects.forEach((subject, index) => {
      initialBlocks.push({
        id: `subject-${index}`,
        type: 'subject',
        content: subject,
        position: { x: 100 + (index * 250), y: 100 },
        size: { width: 180, height: 60 },
        connections: [],
        data: { subject }
      });
    });

    // Create task blocks with dynamic height
    let cumulativeYOffset = 0;
    tasks.forEach((task, index) => {
      const subjectIndex = subjects.indexOf(task.subject);
      const baseY = 250;
      const tasksInSameSubject = tasks.filter(t => t.subject === task.subject);
      const taskIndexInSubject = tasksInSameSubject.findIndex(t => t.id === task.id);

      // Calculate dynamic height based on subtasks
      const baseHeight = 140; // Base height for title, date, subject, progress
      const subtaskHeight = 28; // Height per subtask row
      const dynamicHeight = baseHeight + (task.subTasks.length * subtaskHeight);

      initialBlocks.push({
        id: `task-${task.id}`,
        type: 'task',
        content: task.title,
        position: {
          x: 100 + (subjectIndex * 250),
          y: baseY + cumulativeYOffset
        },
        size: { width: 220, height: dynamicHeight },
        connections: subjectIndex >= 0 ? [`subject-${subjectIndex}`] : [],
        data: task
      });

      // Add spacing for next task
      cumulativeYOffset += dynamicHeight + 20;
    });

    setBlocks(initialBlocks);
  }, [subjects, tasks]);

  // Update connections when blocks change
  useEffect(() => {
    const newConnections: Connection[] = [];

    blocks.forEach(block => {
      block.connections.forEach(connectedId => {
        const connectedBlock = blocks.find(b => b.id === connectedId);
        if (connectedBlock) {
          // For task blocks, connect from the connection handle (top-left)
          // For other blocks, connect from center
          const fromPoint = {
            x: block.type === 'task'
              ? block.position.x
              : block.position.x + block.size.width / 2,
            y: block.type === 'task'
              ? block.position.y
              : block.position.y + block.size.height / 2
          };

          // For subject blocks, connect to center
          // For task blocks, connect to connection handle
          const toPoint = {
            x: connectedBlock.type === 'task'
              ? connectedBlock.position.x
              : connectedBlock.position.x + connectedBlock.size.width / 2,
            y: connectedBlock.type === 'task'
              ? connectedBlock.position.y
              : connectedBlock.position.y + connectedBlock.size.height / 2
          };

          newConnections.push({
            id: `${block.id}-${connectedId}`,
            from: block.id,
            to: connectedId,
            fromPoint,
            toPoint
          });
        }
      });
    });

    setConnections(newConnections);
  }, [blocks]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const handleMouseDown = useCallback((e: React.MouseEvent, blockId: string) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    setDragState({
      isDragging: true,
      dragOffset: {
        x: e.clientX - rect.left - block.position.x,
        y: e.clientY - rect.top - block.position.y
      },
      draggedBlock: blockId
    });

    setSelectedBlock(blockId);
  }, [blocks]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Handle connection dragging
    if (connecting.isConnecting && connecting.from) {
      setConnecting(prev => ({
        ...prev,
        dragLine: { x: mouseX, y: mouseY }
      }));
      return;
    }

    // Handle block dragging
    if (!dragState.isDragging || !dragState.draggedBlock) return;

    const newX = mouseX - dragState.dragOffset.x;
    const newY = mouseY - dragState.dragOffset.y;

    setBlocks(prev => prev.map(block =>
      block.id === dragState.draggedBlock
        ? { ...block, position: { x: newX, y: newY } }
        : block
    ));
  }, [dragState, connecting]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      draggedBlock: null
    });

    // Cancel connection dragging but keep connection mode active
    if (connecting.isConnecting && connecting.dragLine) {
      setConnecting(prev => ({ ...prev, dragLine: null }));
    }
  }, [connecting]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Cancel connection if clicking on empty canvas
    if (connecting.isConnecting) {
      setConnecting({ from: null, isConnecting: false, dragLine: null });
    }
  }, [connecting]);

  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBlock: Block = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Click to edit',
      position: { x: x - 75, y: y - 20 },
      size: { width: 150, height: 40 },
      connections: []
    };

    setBlocks(prev => [...prev, newBlock]);
    setTextBlocks(prev => ({ ...prev, [newBlock.id]: true }));
  }, []);

  const handleBlockEdit = useCallback((blockId: string, newContent: string) => {
    setBlocks(prev => prev.map(block =>
      block.id === blockId ? { ...block, content: newContent } : block
    ));
  }, []);

  const startConnection = useCallback((blockId: string) => {
    setConnecting({ from: blockId, isConnecting: true, dragLine: null });
  }, []);

  const handleConnectionHandleMouseDown = useCallback((e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setConnecting({
      from: blockId,
      isConnecting: true,
      dragLine: { x: e.clientX - rect.left, y: e.clientY - rect.top }
    });
  }, []);

  const handleConnectionHandleClick = useCallback((e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();

    if (connecting.isConnecting && connecting.from && connecting.from !== blockId) {
      // If currently connecting and clicking a different block, create connection
      const fromBlock = blocks.find(b => b.id === connecting.from);
      const toBlock = blocks.find(b => b.id === blockId);

      if (fromBlock && toBlock) {
        // Only allow task -> subject connections
        if (fromBlock.type === 'task' && toBlock.type === 'subject') {
          setBlocks(prev => prev.map(block =>
            block.id === connecting.from
              ? { ...block, connections: [...block.connections.filter(id => id !== blockId), blockId] }
              : block
          ));
        }
      }

      setConnecting({ from: null, isConnecting: false, dragLine: null });
    } else if (connecting.isConnecting && connecting.from === blockId) {
      // Clicking the same handle cancels connection
      setConnecting({ from: null, isConnecting: false, dragLine: null });
    } else {
      // Start new connection
      setConnecting({ from: blockId, isConnecting: true, dragLine: null });
    }
  }, [connecting, blocks]);

  const disconnectFromSubject = useCallback((taskId: string, subjectId: string) => {
    setBlocks(prev => prev.map(block =>
      block.id === taskId
        ? { ...block, connections: block.connections.filter(id => id !== subjectId) }
        : block
    ));
  }, []);

  const handleToggleSubtask = useCallback(async (taskId: string, index: number) => {
    // This would need to be connected to Firebase update
    console.log('Toggle subtask', taskId, index);
  }, []);

  const renderTaskBlock = (block: Block, isSelected: boolean) => {
    const task = block.data as Task;
    const completedCount = task.subTasks.filter((s) => s.done).length;
    const progressText = `${completedCount}/${task.subTasks.length} subtasks completed`;

    const borderStyle = isSelected ? '3px solid white' : 'none';

    return (
      <div className="relative">
        {/* Connection Handle */}
        <div
          className={`absolute -top-2 -left-2 w-4 h-4 rounded-full border-2 cursor-pointer hover:scale-110 transition-transform z-10 ${
            connecting.isConnecting && connecting.from === block.id
              ? 'bg-blue-400 border-blue-600 animate-pulse'
              : 'bg-white border-gray-600'
          }`}
          onClick={(e) => handleConnectionHandleClick(e, block.id)}
          onMouseDown={(e) => handleConnectionHandleMouseDown(e, block.id)}
          onContextMenu={(e) => {
            e.preventDefault();
            // Right-click to disconnect all connections
            setBlocks(prev => prev.map(b =>
              b.id === block.id ? { ...b, connections: [] } : b
            ));
          }}
          title={connecting.isConnecting && connecting.from === block.id
            ? "Click a subject to connect or click here to cancel"
            : "Click to connect to a subject, right-click to disconnect all"}
        />

        <div className="p-4 rounded-2xl bg-black/30 hover:bg-white/10 transition-all" style={{ border: borderStyle }}>
          {/* Title + Created/Due Date */}
          <div className="mb-2">
            <div className="font-bold text-white text-lg">{task.title}</div>
            <div className="text-xs text-gray-400 mt-1">
              Created: {formatDate(task.createdAt)} | Due: {formatDate(task.dueDate)}
            </div>
          </div>

          {/* Subject & Priority */}
          <div className="text-sm text-gray-300 mb-2">
            {task.subject} |{" "}
            <span
              className={`font-semibold ${
                task.priority === "High"
                  ? "text-red-400"
                  : task.priority === "Medium"
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
                  onCheckedChange={() => handleToggleSubtask(task.id, idx)}
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
  };

  const renderSubjectBlock = (block: Block, isSelected: boolean) => {
    const borderStyle = isSelected ? '3px solid black' : 'none';
    const isConnectionTarget = connecting.isConnecting && connecting.from &&
      blocks.find(b => b.id === connecting.from)?.type === 'task';

    return (
      <div
        className={`p-4 rounded-lg bg-white shadow-lg transition-all ${
          isConnectionTarget ? 'ring-2 ring-blue-400 bg-blue-50' : ''
        }`}
        style={{ border: borderStyle }}
        onClick={(e) => {
          if (isConnectionTarget) {
            e.stopPropagation();
            handleConnectionHandleClick(e, block.id);
          }
        }}
      >
        <div className="text-center">
          <div className="font-bold text-black text-lg">{block.content}</div>
          <div className="text-xs text-gray-600 mt-1">
            {isConnectionTarget ? 'Click to connect' : 'Subject'}
          </div>
        </div>
      </div>
    );
  };

  const renderTextBlock = (block: Block) => {
    return (
      <div className="p-2">
        {textBlocks[block.id] ? (
          <input
            type="text"
            value={block.content}
            onChange={(e) => handleBlockEdit(block.id, e.target.value)}
            onBlur={() => setTextBlocks(prev => ({ ...prev, [block.id]: false }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setTextBlocks(prev => ({ ...prev, [block.id]: false }));
              }
            }}
            className="bg-transparent border-none outline-none text-white w-full text-center"
            autoFocus
          />
        ) : (
          <div className="text-center text-white cursor-text">
            {block.content}
          </div>
        )}
      </div>
    );
  };

  const getBlockStyle = (block: Block) => {
    return {
      position: 'absolute' as const,
      left: block.position.x,
      top: block.position.y,
      width: block.size.width,
      height: block.size.height,
      cursor: dragState.isDragging ? 'grabbing' : 'grab',
      userSelect: 'none' as const,
    };
  };

  return (
    <div className="relative w-full h-full bg-transparent overflow-hidden">
      {/* Instructions */}
      <div className="absolute top-4 left-4 z-10 text-white text-sm bg-black/50 p-3 rounded-lg">
        <div>• Double-click to add text blocks</div>
        <div>• Click white circles on tasks to connect to subjects</div>
        <div>• Right-click white circles to disconnect all</div>
        <div>• Drag blocks to reposition</div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-full cursor-default"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        style={{ minHeight: '600px' }}
      >
        {/* SVG for connections */}
        <svg
          ref={svgRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6b7280"
              />
            </marker>
          </defs>
          {connections.map(connection => {
            const { fromPoint, toPoint } = connection;
            const dx = toPoint.x - fromPoint.x;
            const dy = toPoint.y - fromPoint.y;

            // Create a curved path for rope-like effect
            const curvature = Math.abs(dx) * 0.3;
            const cp1x = fromPoint.x + curvature;
            const cp1y = fromPoint.y;
            const cp2x = toPoint.x - curvature;
            const cp2y = toPoint.y;

            const pathD = `M ${fromPoint.x} ${fromPoint.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toPoint.x} ${toPoint.y}`;

            return (
              <path
                key={connection.id}
                d={pathD}
                stroke="#6b7280"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                markerEnd="url(#arrowhead)"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}
              />
            );
          })}

          {/* Drag Connection Line */}
          {connecting.isConnecting && connecting.from && connecting.dragLine && (() => {
            const fromBlock = blocks.find(b => b.id === connecting.from);
            if (!fromBlock) return null;

            const fromPoint = {
              x: fromBlock.position.x,
              y: fromBlock.position.y
            };
            const toPoint = connecting.dragLine;

            const dx = toPoint.x - fromPoint.x;
            const curvature = Math.abs(dx) * 0.3;
            const cp1x = fromPoint.x + curvature;
            const cp1y = fromPoint.y;
            const cp2x = toPoint.x - curvature;
            const cp2y = toPoint.y;

            const pathD = `M ${fromPoint.x} ${fromPoint.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toPoint.x} ${toPoint.y}`;

            return (
              <path
                d={pathD}
                stroke="#3b82f6"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="5,5"
                opacity="0.7"
              />
            );
          })()}
        </svg>

        {/* Blocks */}
        {blocks.map(block => (
          <div
            key={block.id}
            style={getBlockStyle(block)}
            onMouseDown={(e) => handleMouseDown(e, block.id)}
            onClick={() => {
              if (block.type === 'text') {
                setTextBlocks(prev => ({ ...prev, [block.id]: true }));
              }
            }}
          >
            {block.type === 'task' && renderTaskBlock(block, selectedBlock === block.id)}
            {block.type === 'subject' && renderSubjectBlock(block, selectedBlock === block.id)}
            {block.type === 'text' && renderTextBlock(block)}
          </div>
        ))}

        {/* Connection mode indicator */}
        {connecting.isConnecting && connecting.from && (
          <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-lg">
            Click a subject to connect or click canvas to cancel
          </div>
        )}
      </div>
    </div>
  );
}
