import { create } from 'zustand'
import { listsApi, cardsApi } from '../api/boards'

const useKanbanStore = create((set, get) => ({
  // { [boardId]: List[] }
  lists: {},
  // { [listId]: Card[] }
  cards: {},
  isLoadingLists: false,
  isLoadingCards: {},
  error: null,

  // ── List actions ──────────────────────────────────────────────────────────
  fetchLists: async (boardId) => {
    set({ isLoadingLists: true, error: null })
    try {
      const res = await listsApi.getByBoard(boardId)
      set((s) => ({
        lists: { ...s.lists, [boardId]: res.data.lists },
        isLoadingLists: false,
      }))
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load lists', isLoadingLists: false })
    }
  },

  createList: async (boardId, data) => {
    try {
      const res = await listsApi.create(boardId, data)
      const list = res.data.list
      set((s) => ({
        lists: {
          ...s.lists,
          [boardId]: [...(s.lists[boardId] || []), list],
        },
        cards: { ...s.cards, [list._id]: [] },
      }))
      return { success: true, list }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to create list' }
    }
  },

  updateList: async (listId, boardId, data) => {
    try {
      const res = await listsApi.update(listId, data)
      const updated = res.data.list
      set((s) => ({
        lists: {
          ...s.lists,
          [boardId]: (s.lists[boardId] || []).map((l) => (l._id === listId ? updated : l)),
        },
      }))
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update list' }
    }
  },

  deleteList: async (listId, boardId) => {
    try {
      await listsApi.delete(listId)
      set((s) => {
        const newCards = { ...s.cards }
        delete newCards[listId]
        return {
          lists: {
            ...s.lists,
            [boardId]: (s.lists[boardId] || []).filter((l) => l._id !== listId),
          },
          cards: newCards,
        }
      })
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to delete list' }
    }
  },

  // ── Card actions ──────────────────────────────────────────────────────────
  fetchCards: async (listId) => {
    set((s) => ({ isLoadingCards: { ...s.isLoadingCards, [listId]: true } }))
    try {
      const res = await cardsApi.getByList(listId)
      set((s) => ({
        cards: { ...s.cards, [listId]: res.data.cards },
        isLoadingCards: { ...s.isLoadingCards, [listId]: false },
      }))
    } catch (err) {
      set((s) => ({ isLoadingCards: { ...s.isLoadingCards, [listId]: false } }))
    }
  },

  createCard: async (listId, data) => {
    try {
      const res = await cardsApi.create(listId, data)
      const card = res.data.card
      set((s) => ({
        cards: {
          ...s.cards,
          [listId]: [...(s.cards[listId] || []), card],
        },
      }))
      return { success: true, card }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to create card' }
    }
  },

  updateCard: async (cardId, listId, data) => {
    try {
      const res = await cardsApi.update(cardId, data)
      const updated = res.data.card
      set((s) => ({
        cards: {
          ...s.cards,
          [listId]: (s.cards[listId] || []).map((c) => (c._id === cardId ? updated : c)),
        },
      }))
      return { success: true, card: updated }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update card' }
    }
  },

  deleteCard: async (cardId, listId) => {
    try {
      await cardsApi.delete(cardId)
      set((s) => ({
        cards: {
          ...s.cards,
          [listId]: (s.cards[listId] || []).filter((c) => c._id !== cardId),
        },
      }))
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to delete card' }
    }
  },

  /**
   * Optimistic drag-and-drop move.
   * 1. Immediately update UI state.
   * 2. Send API request.
   * 3. On failure, rollback to snapshot.
   */
  moveCard: async ({ cardId, sourceListId, destinationListId, sourceIndex, destinationIndex }) => {
    const snapshot = { cards: get().cards }

    // ── Optimistic update ──────────────────────────────────────────────────
    set((s) => {
      const srcCards = [...(s.cards[sourceListId] || [])]
      const [removed] = srcCards.splice(sourceIndex, 1)

      let destCards
      if (sourceListId === destinationListId) {
        destCards = srcCards
        destCards.splice(destinationIndex, 0, removed)
      } else {
        destCards = [...(s.cards[destinationListId] || [])]
        destCards.splice(destinationIndex, 0, { ...removed, list: destinationListId })
      }

      return {
        cards: {
          ...s.cards,
          [sourceListId]: sourceListId === destinationListId ? destCards : srcCards,
          [destinationListId]: destCards,
        },
      }
    })

    // ── API call ───────────────────────────────────────────────────────────
    try {
      await cardsApi.move(cardId, {
        sourceListId,
        destinationListId,
        position: destinationIndex,
      })
    } catch {
      // Rollback
      set({ cards: snapshot.cards })
    }
  },

  /**
   * Reorder lists optimistically within a board.
   */
  reorderLists: async ({ boardId, sourceIndex, destinationIndex, listId }) => {
    const snapshot = { lists: get().lists }

    // Optimistic
    set((s) => {
      const arr = [...(s.lists[boardId] || [])]
      const [removed] = arr.splice(sourceIndex, 1)
      arr.splice(destinationIndex, 0, removed)
      return { lists: { ...s.lists, [boardId]: arr } }
    })

    // Fire-and-forget position update
    try {
      await listsApi.update(listId, { position: destinationIndex })
    } catch {
      set({ lists: snapshot.lists })
    }
  },

  clearBoard: (boardId) =>
    set((s) => {
      const newLists = { ...s.lists }
      const newCards = { ...s.cards }
      delete newLists[boardId]
      return { lists: newLists, cards: newCards }
    }),
}))

export default useKanbanStore
