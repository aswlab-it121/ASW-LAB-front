import { create } from 'zustand'

export type AppUser = {
  id: number
  displayName: string
  username: string
  email: string
  avatarUrl?: string
  apiKey: string
}

type UserState = {
  users: AppUser[]
  selectedId: number
  pendingSelectedId: number | null
  isEditingIssue: boolean
  setSelected: (id: number | string) => void
  setEditingIssue: (editing: boolean) => void
  applyPendingSelection: () => void
}

const hardcodedUsers: AppUser[] = [
  {
    id: 1,
    displayName: 'Jaume Lopez',
    username: 'EncryptEx',
    email: 'limusina10@gmail.com',
    apiKey: '161501b8eff0fefe6ea3762894f5dfa77bc0a8efa3987f32a6316c8e39de75f0'
  },
  {
    id: 2,
    displayName: 'marcal',
    username: 'marcaltm19',
    email: 'marcal.tejedor@estudiantat.upc.edu',
    apiKey: 'bdd28a6a3d8e899dcd86d75142b7425de72f0b5b9826b3d47904897ae53124b6'
  }
]

export const useUserStore = create<UserState>((set, get) => ({
  users: hardcodedUsers,
  selectedId: (() => {
    try {
      const raw = localStorage.getItem('selectedId')
      const parsed = raw !== null ? Number(raw) : NaN
      return Number.isFinite(parsed) ? parsed : hardcodedUsers[0].id
    } catch (e) {
      return hardcodedUsers[0].id
    }
  })(),
  pendingSelectedId: null,
  isEditingIssue: false,
  setSelected(id) {
    if (get().isEditingIssue) {
      set({ pendingSelectedId: Number(id) })
    } else {
      const num = Number(id)
      set({ selectedId: num })
      try {
        localStorage.setItem('selectedId', String(num))
      } catch (e) {
        // ignore
      }
      window.location.reload()
    }
  },
  setEditingIssue(editing) {
    set({ isEditingIssue: editing })
  },
  applyPendingSelection() {
    const { pendingSelectedId } = get()
    if (pendingSelectedId !== null) {
      set({ selectedId: pendingSelectedId, pendingSelectedId: null, isEditingIssue: false })
      try {
        localStorage.setItem('selectedId', String(pendingSelectedId))
      } catch (e) {
        // ignore
      }
      window.location.reload()
    } else {
      set({ isEditingIssue: false })
    }
  }
}))

export const getSelectedApiKey = () => {
  const state = useUserStore.getState()
  const user = state.users.find((item) => item.id === state.selectedId)
  return user?.apiKey
}

export const getSelectedUser = (): AppUser | undefined => {
  const state = useUserStore.getState()
  return state.users.find((item) => item.id === state.selectedId)
}
