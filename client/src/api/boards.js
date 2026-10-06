import api from './axios'

export const boardsApi = {
  create:       (workspaceId, data)  => api.post(`/workspaces/${workspaceId}/boards`, data),
  getByWorkspace: (workspaceId)      => api.get(`/workspaces/${workspaceId}/boards`),
  getById:      (boardId)            => api.get(`/boards/${boardId}`),
  update:       (boardId, data)      => api.patch(`/boards/${boardId}`, data),
  delete:       (boardId)            => api.delete(`/boards/${boardId}`),
}

export const listsApi = {
  create:    (boardId, data) => api.post(`/boards/${boardId}/lists`, data),
  getByBoard: (boardId)      => api.get(`/boards/${boardId}/lists`),
  update:    (listId, data)  => api.patch(`/lists/${listId}`, data),
  delete:    (listId)        => api.delete(`/lists/${listId}`),
}

export const cardsApi = {
  create:    (listId, data)  => api.post(`/cards/lists/${listId}/cards`, data),
  getByList: (listId)        => api.get(`/cards/lists/${listId}/cards`),
  getById:   (cardId)        => api.get(`/cards/${cardId}`),
  update:    (cardId, data)  => api.patch(`/cards/${cardId}`, data),
  delete:    (cardId)        => api.delete(`/cards/${cardId}`),
  move:      (cardId, data)  => api.patch(`/cards/${cardId}/move`, data),
}
