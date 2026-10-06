import { create } from 'zustand'
import { boardsApi } from '../api/boards'

const useBoardStore = create((set, get) => ({
  // Normalized: { [workspaceId]: Board[] }
  boards: {},
  activeBoard: null,
  isLoading: false,
  error: null,

  // ── Board actions ──────────────────────────────────────────────────────────
  fetchBoards: async (workspaceId) => {
    set({ isLoading: true, error: null })
    try {
      const res = await boardsApi.getByWorkspace(workspaceId)
      set((s) => ({
        boards: { ...s.boards, [workspaceId]: res.data.boards },
        isLoading: false,
      }))
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load boards', isLoading: false })
    }
  },

  createBoard: async (workspaceId, data) => {
    try {
      const res = await boardsApi.create(workspaceId, data)
      const board = res.data.board
      set((s) => ({
        boards: {
          ...s.boards,
          [workspaceId]: [board, ...(s.boards[workspaceId] || [])],
        },
      }))
      return { success: true, board }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to create board' }
    }
  },

  updateBoard: async (boardId, workspaceId, data) => {
    try {
      const res = await boardsApi.update(boardId, data)
      const updated = res.data.board
      set((s) => ({
        boards: {
          ...s.boards,
          [workspaceId]: (s.boards[workspaceId] || []).map((b) =>
            b._id === boardId ? updated : b
          ),
        },
        activeBoard: s.activeBoard?._id === boardId ? updated : s.activeBoard,
      }))
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update board' }
    }
  },

  deleteBoard: async (boardId, workspaceId) => {
    try {
      await boardsApi.delete(boardId)
      set((s) => ({
        boards: {
          ...s.boards,
          [workspaceId]: (s.boards[workspaceId] || []).filter((b) => b._id !== boardId),
        },
        activeBoard: s.activeBoard?._id === boardId ? null : s.activeBoard,
      }))
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to delete board' }
    }
  },

  setActiveBoard: (board) => set({ activeBoard: board }),
  clearActiveBoard: () => set({ activeBoard: null }),
  clearError: () => set({ error: null }),
}))

export default useBoardStore
