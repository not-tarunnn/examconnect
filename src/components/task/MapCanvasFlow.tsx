"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Task } from '@/types/task';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import ExamConnectHelpButton from '@/components/task/ExamConnectHelpButton';

import TaskNode from './nodes/TaskNode';
import SubjectNode from './nodes/SubjectNode';
import TextNode from './nodes/TextNode';



interface MapCanvasFlowProps {
  tasks: Task[];
  onEditTask?: (task: Task) => void;
}

const nodeTypes = {
  taskNode: TaskNode,
  subjectNode: SubjectNode,
  textNode: TextNode,
};

export default function MapCanvasFlow({ tasks, onEditTask }: MapCanvasFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Utility functions for managing comma-separated subjects
  const addSubjectToTask = useCallback((currentSubject: string, newSubject: string): string => {
    const subjects = currentSubject ? currentSubject.split(',').map(s => s.trim()) : [];
    if (!subjects.includes(newSubject)) {
      subjects.push(newSubject);
    }
    return subjects.join(',');
  }, []);

  const removeSubjectFromTask = useCallback((currentSubject: string, subjectToRemove: string): string => {
    const subjects = currentSubject ? currentSubject.split(',').map(s => s.trim()) : [];
    const filtered = subjects.filter(s => s !== subjectToRemove);
    return filtered.join(',');
  }, []);

  // Firebase update function for subtasks
  const handleToggleSubtask = useCallback(async (taskId: string, subtaskIndex: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedSubTasks = [...task.subTasks];
      updatedSubTasks[subtaskIndex].done = !updatedSubTasks[subtaskIndex].done;
      const allDone = updatedSubTasks.every((s) => s.done);

      await updateDoc(doc(db, "tasks", taskId), {
        subTasks: updatedSubTasks,
        completed: allDone,
        status: allDone ? "completed" : "pending",
      });
    } catch (error) {
      console.error('Failed to update subtask:', error);
    }
  }, [tasks]);

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
          // Split comma-separated subjects and add each one
          const taskSubjects = task.subject.split(',').map(s => s.trim()).filter(s => s.length > 0);
          taskSubjects.forEach(subject => subjectsSet.add(subject));
        }
      });
      setSubjects(Array.from(subjectsSet));
    });

    return () => unsub();
  }, [user]);

  // Create nodes and edges from tasks and subjects
  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Create subject nodes
    subjects.forEach((subject, index) => {
      newNodes.push({
        id: `subject-${index}`,
        type: 'subjectNode',
        position: { x: 300 + (index * 300), y: 100 },
        data: { subject },
        draggable: true,
      });
    });

    // Create task nodes with dynamic height calculation
    let cumulativeYOffset = 0;
    tasks.forEach((task, index) => {
      // Get all subjects for this task (comma-separated)
      const taskSubjects = task.subject ? task.subject.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
      const firstSubjectIndex = taskSubjects.length > 0 ? subjects.indexOf(taskSubjects[0]) : -1;

      // Calculate dynamic height based on subtasks
      const baseHeight = 140;
      const subtaskHeight = 28;
      const dynamicHeight = baseHeight + (task.subTasks.length * subtaskHeight);

      const taskNode: Node = {
        id: `task-${task.id}`,
        type: 'taskNode',
        position: {
          x: 100 + (firstSubjectIndex >= 0 ? firstSubjectIndex * 300 : 0),
          y: 300 + cumulativeYOffset
        },
        data: {
          task,
          onToggleSubtask: handleToggleSubtask,
          onEditTask: onEditTask
        },
        draggable: true,
        style: {
          height: dynamicHeight,
        }
      };

      newNodes.push(taskNode);

      // Create edges for all connected subjects
      taskSubjects.forEach(taskSubject => {
        const subjectIndex = subjects.indexOf(taskSubject);
        if (subjectIndex >= 0) {
          newEdges.push({
            id: `edge-${task.id}-${subjectIndex}`,
            source: `task-${task.id}`,
            target: `subject-${subjectIndex}`,
            sourceHandle: 'task-output',
            targetHandle: 'subject-input',
            type: 'smoothstep',
            animated: false,
            style: {
              stroke: '#6b7280',
              strokeWidth: 3,
            },
          });
        }
      });

      cumulativeYOffset += dynamicHeight + 50;
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [subjects, tasks, setNodes, setEdges, handleToggleSubtask, onEditTask]);

  // Handle new connections
  const onConnect = useCallback(
    async (params: Connection) => {
      // Only allow task -> subject connections
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);

      if (sourceNode?.type === 'taskNode' && targetNode?.type === 'subjectNode') {
        const newEdge: Edge = {
          ...params,
          id: `edge-${params.source}-${params.target}`,
          type: 'smoothstep',
          animated: false,
          style: {
            stroke: '#6b7280',
            strokeWidth: 3,
          },
        };
        setEdges((eds) => addEdge(newEdge, eds));

        // Update Firebase with new subject connection
        try {
          const taskId = params.source?.replace('task-', '');
          const subjectName = targetNode.data.subject;
          const task = tasks.find(t => t.id === taskId);

          if (task && taskId && subjectName) {
            const updatedSubject = addSubjectToTask(task.subject, subjectName);
            await updateDoc(doc(db, "tasks", taskId), {
              subject: updatedSubject,
            });
          }
        } catch (error) {
          console.error('Failed to update task subject:', error);
        }
      }
    },
    [nodes, setEdges, tasks, addSubjectToTask, removeSubjectFromTask]
  );


  // Custom edge styles
  const defaultEdgeOptions = useMemo(() => ({
    type: 'smoothstep',
    animated: false,
    style: {
      stroke: '#6b7280',
      strokeWidth: 3,
    },
  }), []);

  return (
    <div className="w-full h-full bg-transparent">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgesChange={(changes) => {
          // Handle edge removal to remove subjects from tasks
          changes.forEach(async (change) => {
            if (change.type === 'remove') {
              try {
                const edge = edges.find(e => e.id === change.id);
                if (edge) {
                  const sourceNode = nodes.find(n => n.id === edge.source);
                  const targetNode = nodes.find(n => n.id === edge.target);

                  if (sourceNode?.type === 'taskNode' && targetNode?.type === 'subjectNode') {
                    const taskId = edge.source?.replace('task-', '');
                    const subjectName = targetNode.data.subject;
                    const task = tasks.find(t => t.id === taskId);

                    if (task && taskId && subjectName) {
                      const updatedSubject = removeSubjectFromTask(task.subject, subjectName);
                      await updateDoc(doc(db, "tasks", taskId), {
                        subject: updatedSubject,
                      });
                    }
                  }
                }
              } catch (error) {
                console.error('Failed to remove subject from task:', error);
              }
            }
          });
          onEdgesChange(changes);
        }}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
        style={{ backgroundColor: 'transparent' }}
      >
        <Controls 
          position="top-left"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
          style={{
            button: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }
          }}
        />
        <MiniMap 
          position="top-right"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
          nodeColor={(node) => {
            switch (node.type) {
              case 'taskNode': return '#10b981';
              case 'subjectNode': return '#fbbf24';
              case 'textNode': return '#ffffff';
              default: return '#6b7280';
            }
          }}
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="rgba(255, 255, 255, 0.1)"
        />
      </ReactFlow>
      
      {/* Instructions */}
      <ExamConnectHelpButton className='mb-20 mr-4' />
    </div>
    
  );
}
