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
    displayName: 'EncryptEx',
    username: 'EncryptEx',
    email: 'user@example.com',
    apiKey: 'd519c9b214466e4e841b7571a8304c7e49e3f743799c3b011d3f6e250aa931b1'
  },
  {
    id: 2,
    displayName: 'marc',
    username: 'marc',
    email: 'marc@example.com',
    apiKey: '229c698ebababd0847efcaa89f75ae1bff9e159bfeafc7d7e8377cf295111778'
  }
]

export const useUserStore = create<UserState>((set, get) => ({
  users: hardcodedUsers,
  selectedId: hardcodedUsers[0].id,
  pendingSelectedId: null,
  isEditingIssue: false,
  setSelected(id) {
    if (get().isEditingIssue) {
      set({ pendingSelectedId: Number(id) })
    } else {
      set({ selectedId: Number(id) })
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
