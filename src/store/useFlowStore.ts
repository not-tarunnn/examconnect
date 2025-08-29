// useFlowStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from 'reactflow'

type Position = { x: number; y: number }

interface FlowState {
  // runtime-only nodes (not persisted because node.data may contain functions)
  nodes: Node[]
  // edges are persisted (they are plain objects)
  edges: Edge[]
  // persist just the coordinates by node id
  positions: Record<string, Position>

  setNodes: (updater: Node[] | ((prev: Node[]) => Node[])) => void
  setEdges: (updater: Edge[] | ((prev: Edge[]) => Edge[])) => void
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void

  getPosition: (id: string) => Position | undefined
}

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      positions: {},

      setNodes: (updater) =>
        set((state) => {
          const nextNodes: Node[] =
            typeof updater === 'function' ? (updater as (prev: Node[]) => Node[])(state.nodes) : updater

          // snapshot coords from nodes into positions map (so we persist latest positions)
          const nextPositions: Record<string, Position> = { ...state.positions }
          nextNodes.forEach((n) => {
            if (n.position) nextPositions[n.id] = n.position as Position
          })

          return { nodes: nextNodes, positions: nextPositions }
        }),

      setEdges: (updater) =>
        set((state) => ({
          edges: typeof updater === 'function' ? (updater as (prev: Edge[]) => Edge[])(state.edges) : updater,
        })),

      onNodesChange: (changes) => {
        const updatedNodes = applyNodeChanges(changes, get().nodes)
        // snapshot coords after change (drag/move)
        const positions = { ...get().positions }
        updatedNodes.forEach((n) => {
          if (n.position) positions[n.id] = n.position as Position
        })
        // update runtime nodes and persisted positions
        set({ nodes: updatedNodes, positions })
      },

      onEdgesChange: (changes) =>
        set({ edges: applyEdgeChanges(changes, get().edges) }),

      getPosition: (id) => get().positions[id],
    }),
    {
      name: 'flow-storage',
      // SSR-safe: only access localStorage in the browser
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      // persist only positions + edges (omit nodes because node.data can contain functions)
      partialize: (state) => ({
        positions: state.positions,
        edges: state.edges,
      }),
    }
  )
)
