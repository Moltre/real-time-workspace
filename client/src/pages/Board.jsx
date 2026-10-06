import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { boardsApi } from '../api/boards'
import useBoardStore from '../store/boardStore'
import useKanbanStore from '../store/kanbanStore'
import useAuthStore from '../store/authStore'

// ── Priority helpers ──────────────────────────────────────────────────────────
const PRIORITY_META = {
  low:    { label:'Low',    cls:'priority-low',    icon:'▽' },
  medium: { label:'Medium', cls:'priority-medium', icon:'◇' },
  high:   { label:'High',   cls:'priority-high',   icon:'△' },
  urgent: { label:'Urgent', cls:'priority-urgent',  icon:'⚡' },
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ListSkeleton() {
  return (
    <div className="kanban-list skeleton-list">
      <div className="skeleton-title" />
      {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
    </div>
  )
}

// ── Card Detail Modal ─────────────────────────────────────────────────────────
function CardModal({ card, listId, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    title: card.title,
    description: card.description || '',
    priority: card.priority || 'medium',
    dueDate: card.dueDate ? card.dueDate.slice(0,10) : '',
    labels: (card.labels || []).join(', '),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    const payload = {
      title: form.title,
      description: form.description,
      priority: form.priority,
      dueDate: form.dueDate || null,
      labels: form.labels ? form.labels.split(',').map(l => l.trim()).filter(Boolean) : [],
    }
    const res = await onSave(card._id, listId, payload)
    setSaving(false)
    if (res.success) onClose()
    else setError(res.message)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this card?')) return
    await onDelete(card._id, listId)
    onClose()
  }

  const pm = PRIORITY_META[form.priority] || PRIORITY_META.medium

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2 style={{ fontSize:'1.1rem' }}>Edit Card</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" required value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={4} value={form.description}
              style={{ resize:'vertical' }}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="modal-row">
            <div className="form-group" style={{ flex:1 }}>
              <label className="form-label">Priority</label>
              <select className="form-input" value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                {Object.entries(PRIORITY_META).map(([k,v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex:1 }}>
              <label className="form-label">Due Date</label>
              <input className="form-input" type="date" value={form.dueDate}
                onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Labels <span className="text-muted text-sm">(comma-separated)</span></label>
            <input className="form-input" placeholder="bug, feature, frontend"
              value={form.labels} onChange={e => setForm(p => ({ ...p, labels: e.target.value }))} />
          </div>

          {/* Assignees (display only for now) */}
          {card.assignedTo?.length > 0 && (
            <div className="form-group">
              <label className="form-label">Assigned To</label>
              <div className="flex gap-2" style={{ flexWrap:'wrap' }}>
                {card.assignedTo.map(u => (
                  <span key={u._id} className="badge badge-primary">
                    {u.name || u.email}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete}>
              🗑 Delete
            </button>
            <div className="flex gap-2">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><span className="spinner" /> Saving…</> : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Add Card Form ─────────────────────────────────────────────────────────────
function AddCardForm({ listId, onAdd, onCancel }) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const ref = useRef()

  useEffect(() => { ref.current?.focus() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    await onAdd(listId, { title: title.trim() })
    setLoading(false)
    setTitle('')
    onCancel()
  }

  return (
    <form className="add-card-form" onSubmit={handleSubmit}>
      <textarea ref={ref} className="form-input add-card-textarea" placeholder="Card title…"
        value={title} onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); handleSubmit(e) } if(e.key==='Escape') onCancel() }}
        rows={2} />
      <div className="flex gap-2 mt-2">
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !title.trim()}>
          {loading ? <span className="spinner" /> : 'Add Card'}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>✕</button>
      </div>
    </form>
  )
}

// ── Kanban Card ───────────────────────────────────────────────────────────────
function KanbanCard({ card, index, listId, searchQuery, filters, onClick }) {
  const pm = PRIORITY_META[card.priority] || PRIORITY_META.medium

  // Filter matching
  const matchesSearch = !searchQuery || card.title.toLowerCase().includes(searchQuery.toLowerCase())
  const matchesPriority = !filters.priority || card.priority === filters.priority
  const matchesAssignee = !filters.assignee || card.assignedTo?.some(u => u._id === filters.assignee)

  if (!matchesSearch || !matchesPriority || !matchesAssignee) return null

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date()
  const isDueSoon = card.dueDate && !isOverdue &&
    (new Date(card.dueDate) - new Date()) / (1000*60*60*24) <= 3

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`kanban-card ${snapshot.isDragging ? 'dragging' : ''}`}
          onClick={() => onClick(card)}
        >
          {/* Priority stripe */}
          <div className={`card-priority-stripe ${pm.cls}`} />

          {/* Labels */}
          {card.labels?.length > 0 && (
            <div className="card-labels">
              {card.labels.slice(0,3).map((l,i) => (
                <span key={i} className="card-label">{l}</span>
              ))}
            </div>
          )}

          <div className="kanban-card-title">{card.title}</div>

          {card.description && (
            <div className="kanban-card-desc">{card.description.slice(0,80)}{card.description.length>80?'…':''}</div>
          )}

          <div className="kanban-card-meta">
            <span className={`priority-badge ${pm.cls}`}>{pm.icon} {pm.label}</span>

            {card.dueDate && (
              <span className={`due-date ${isOverdue?'overdue':isDueSoon?'due-soon':''}`}>
                📅 {new Date(card.dueDate).toLocaleDateString()}
              </span>
            )}

            {card.assignedTo?.length > 0 && (
              <div className="card-assignees">
                {card.assignedTo.slice(0,3).map(u => (
                  <div key={u._id} className="assignee-avatar" title={u.name}>
                    {u.name?.[0]?.toUpperCase() || '?'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}

// ── Kanban List ───────────────────────────────────────────────────────────────
function KanbanList({ list, index, boardId, cards, searchQuery, filters, onCardClick, onAddCard }) {
  const { updateList, deleteList } = useKanbanStore()
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(list.name)
  const [showAdd, setShowAdd] = useState(false)

  const filteredCards = cards.filter(card => {
    const matchesSearch = !searchQuery || card.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = !filters.priority || card.priority === filters.priority
    const matchesAssignee = !filters.assignee || card.assignedTo?.some(u => u._id === filters.assignee)
    return matchesSearch && matchesPriority && matchesAssignee
  })

  const handleRename = async (e) => {
    e.preventDefault()
    if (name.trim() && name !== list.name) {
      await updateList(list._id, boardId, { name: name.trim() })
    }
    setEditingName(false)
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete list "${list.name}" and all its cards?`)) return
    deleteList(list._id, boardId)
  }

  return (
    <Draggable draggableId={`list-${list._id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`kanban-list ${snapshot.isDragging ? 'list-dragging' : ''}`}
        >
          {/* List Header */}
          <div className="kanban-list-header" {...provided.dragHandleProps}>
            {editingName ? (
              <form onSubmit={handleRename} style={{ flex:1 }}>
                <input className="form-input list-name-input" value={name} autoFocus
                  onChange={e => setName(e.target.value)}
                  onBlur={handleRename}
                  onClick={e => e.stopPropagation()} />
              </form>
            ) : (
              <span className="list-name" onDoubleClick={() => setEditingName(true)}>
                {list.name}
              </span>
            )}
            <div className="list-header-right">
              <span className="list-count">{filteredCards.length}</span>
              <div className="list-menu">
                <button className="list-menu-btn">⋯</button>
                <div className="list-menu-dropdown">
                  <button onClick={() => setEditingName(true)}>✏️ Rename</button>
                  <button className="danger" onClick={handleDelete}>🗑 Delete</button>
                </div>
              </div>
            </div>
          </div>

          {/* Cards drop zone */}
          <Droppable droppableId={list._id} type="CARD">
            {(prov, snap) => (
              <div
                ref={prov.innerRef}
                {...prov.droppableProps}
                className={`kanban-cards ${snap.isDraggingOver ? 'drag-over' : ''}`}
              >
                {cards.length === 0 && !showAdd && (
                  <div className="list-empty">Drop cards here</div>
                )}
                {cards.map((card, idx) => (
                  <KanbanCard
                    key={card._id}
                    card={card}
                    index={idx}
                    listId={list._id}
                    searchQuery={searchQuery}
                    filters={filters}
                    onClick={onCardClick}
                  />
                ))}
                {prov.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add card */}
          {showAdd ? (
            <AddCardForm
              listId={list._id}
              onAdd={onAddCard}
              onCancel={() => setShowAdd(false)}
            />
          ) : (
            <button className="add-card-btn" onClick={() => setShowAdd(true)}>
              + Add Card
            </button>
          )}
        </div>
      )}
    </Draggable>
  )
}

// ── Add List Form ─────────────────────────────────────────────────────────────
function AddListForm({ boardId, onAdd, onCancel }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const ref = useRef()
  useEffect(() => { ref.current?.focus() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await onAdd(boardId, { name: name.trim() })
    setLoading(false)
    setName('')
    onCancel()
  }

  return (
    <form className="add-list-form" onSubmit={handleSubmit}>
      <input ref={ref} className="form-input" placeholder="List name…" value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if(e.key==='Escape') onCancel() }} />
      <div className="flex gap-2 mt-2">
        <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !name.trim()}>
          {loading ? <span className="spinner" /> : 'Add List'}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>✕</button>
      </div>
    </form>
  )
}

// ── Main Board Page ───────────────────────────────────────────────────────────
export default function BoardPage() {
  const { boardId } = useParams()
  const { activeBoard, setActiveBoard } = useBoardStore()
  const {
    lists, cards, isLoadingLists,
    fetchLists, fetchCards,
    createList, createCard, updateCard, deleteCard,
    moveCard, reorderLists,
    clearBoard,
  } = useKanbanStore()

  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedCardListId, setSelectedCardListId] = useState(null)
  const [showAddList, setShowAddList] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ priority: '', assignee: '' })
  const [boardLoading, setBoardLoading] = useState(true)
  const [boardError, setBoardError] = useState('')

  const { boardsApi: ba } = (() => {
    try { return { boardsApi: require('../api/boards') } } catch { return { boardsApi: null } }
  })()

  // Fetch board details
  useEffect(() => {
    const load = async () => {
      setBoardLoading(true)
      try {
        const res = await boardsApi.getById(boardId)
        setActiveBoard(res.data.board)
      } catch (err) {
        setBoardError(err.response?.data?.message || 'Failed to load board')
      } finally {
        setBoardLoading(false)
      }
    }
    load()
    return () => clearBoard(boardId)
  }, [boardId])


  // Fetch lists
  useEffect(() => {
    fetchLists(boardId)
  }, [boardId])

  // Fetch cards for each list
  const boardLists = lists[boardId] || []
  useEffect(() => {
    boardLists.forEach(list => {
      if (!cards[list._id]) fetchCards(list._id)
    })
  }, [boardLists.length])

  // ── Drag end handler ──────────────────────────────────────────────────────
  const onDragEnd = (result) => {
    const { source, destination, type, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    if (type === 'LIST') {
      const listId = draggableId.replace('list-', '')
      reorderLists({
        boardId,
        sourceIndex: source.index,
        destinationIndex: destination.index,
        listId,
      })
      return
    }

    // Card move
    moveCard({
      cardId: draggableId,
      sourceListId: source.droppableId,
      destinationListId: destination.droppableId,
      sourceIndex: source.index,
      destinationIndex: destination.index,
    })
  }

  const handleCardClick = (card) => {
    // Find which list this card belongs to
    const listId = Object.keys(cards).find(lid =>
      cards[lid]?.some(c => c._id === card._id)
    )
    setSelectedCard(card)
    setSelectedCardListId(listId)
  }

  if (boardLoading) return (
    <div className="board-page">
      <div className="board-topbar">
        <div className="skeleton-title" style={{ width:200 }} />
      </div>
      <div className="kanban-board">
        {[1,2,3].map(i => <ListSkeleton key={i} />)}
      </div>
    </div>
  )

  if (boardError) return (
    <div className="page-content" style={{ textAlign:'center', paddingTop:'4rem' }}>
      <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>⚠️</div>
      <h2>{boardError}</h2>
      <Link to="/workspaces" className="btn btn-primary" style={{ marginTop:'1rem', display:'inline-flex' }}>
        ← Back to Workspaces
      </Link>
    </div>
  )

  const board = activeBoard
  const workspaceId = board?.workspace?._id || board?.workspace

  return (
    <div className="board-page">
      {/* Board Topbar */}
      <div className="board-topbar">
        <div className="flex items-center gap-3">
          <Link to={`/workspace/${workspaceId}`} className="btn btn-ghost btn-icon btn-sm">←</Link>
          <div>
            <div style={{ fontWeight:700, fontSize:'1.05rem' }}>{board?.name}</div>
            {board?.description && (
              <div className="text-muted" style={{ fontSize:'0.75rem' }}>{board.description}</div>
            )}
          </div>
        </div>

        {/* Search + Filters */}
        <div className="board-toolbar">
          <input
            className="form-input board-search"
            placeholder="🔍 Search cards…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <select className="form-input board-filter"
            value={filters.priority}
            onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
            <option value="">All Priorities</option>
            {Object.entries(PRIORITY_META).map(([k,v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
          {(searchQuery || filters.priority) && (
            <button className="btn btn-ghost btn-sm"
              onClick={() => { setSearchQuery(''); setFilters({ priority:'', assignee:'' }) }}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`board-${boardId}`} type="LIST" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="kanban-board"
            >
              {isLoadingLists ? (
                [1,2,3].map(i => <ListSkeleton key={i} />)
              ) : (
                <>
                  {boardLists.map((list, index) => (
                    <KanbanList
                      key={list._id}
                      list={list}
                      index={index}
                      boardId={boardId}
                      cards={cards[list._id] || []}
                      searchQuery={searchQuery}
                      filters={filters}
                      onCardClick={handleCardClick}
                      onAddCard={createCard}
                    />
                  ))}
                  {provided.placeholder}

                  {/* Add list */}
                  {showAddList ? (
                    <AddListForm
                      boardId={boardId}
                      onAdd={createList}
                      onCancel={() => setShowAddList(false)}
                    />
                  ) : (
                    <button className="add-list-btn" onClick={() => setShowAddList(true)}>
                      + Add List
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          listId={selectedCardListId}
          onClose={() => { setSelectedCard(null); setSelectedCardListId(null) }}
          onSave={updateCard}
          onDelete={deleteCard}
        />
      )}
    </div>
  )
}
