import { create } from 'zustand'
import { workspacesApi } from '../api/workspaces'

const useWorkspaceStore = create((set) => ({
  workspaces: [],
  activeWorkspace: null,
  isLoading: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await workspacesApi.getAll()
      set({ workspaces: res.data.workspaces, isLoading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load workspaces', isLoading: false })
    }
  },

  fetchWorkspace: async (id) => {
    set({ isLoading: true })
    try {
      const res = await workspacesApi.getById(id)
      set({ activeWorkspace: res.data.workspace, isLoading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Workspace not found', isLoading: false })
    }
  },

  createWorkspace: async (data) => {
    try {
      const res = await workspacesApi.create(data)
      set((s) => ({ workspaces: [res.data.workspace, ...s.workspaces] }))
      return { success: true, workspace: res.data.workspace }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to create workspace' }
    }
  },

  updateWorkspace: async (id, data) => {
    try {
      const res = await workspacesApi.update(id, data)
      set((s) => ({
        workspaces: s.workspaces.map((w) => (w._id === id ? res.data.workspace : w)),
        activeWorkspace: s.activeWorkspace?._id === id ? res.data.workspace : s.activeWorkspace,
      }))
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Update failed' }
    }
  },

  deleteWorkspace: async (id) => {
    try {
      await workspacesApi.delete(id)
      set((s) => ({ workspaces: s.workspaces.filter((w) => w._id !== id) }))
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Delete failed' }
    }
  },

  clearActive: () => set({ activeWorkspace: null }),
}))

export default useWorkspaceStore
