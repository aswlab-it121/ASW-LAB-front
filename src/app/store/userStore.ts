import create from 'zustand'

export type AppUser = {
  id: string
  displayName: string
  email: string
  avatarUrl?: string
  apiKey: string
}

type UserState = {
  users: AppUser[]
  selectedId: string
  setSelected: (id: string) => void
}

const hardcodedUsers: AppUser[] = [
  {
    id: 'u1',
    displayName: 'Alice Admin',
    email: 'alice@example.com',
    avatarUrl: 'https://i.pravatar.cc/40?img=1',
    apiKey: 'apikey-alice-001'
  },
  {
    id: 'u2',
    displayName: 'Bob Builder',
    email: 'bob@example.com',
    avatarUrl: 'https://i.pravatar.cc/40?img=2',
    apiKey: 'apikey-bob-002'
  },
  {
    id: 'u3',
    displayName: 'Carol Contributor',
    email: 'carol@example.com',
    avatarUrl: 'https://i.pravatar.cc/40?img=3',
    apiKey: 'apikey-carol-003'
  }
]

export const useUserStore = create<UserState>(() => ({
  users: hardcodedUsers,
  selectedId: hardcodedUsers[0].id,
  setSelected(id: string) {
    // simple setter; persistence could be added
    // eslint-disable-next-line no-use-before-define
    setSelectedImpl(id)
  }
}))

// helper to avoid TS complaining when setting in the closure above
function setSelectedImpl(id: string) {
  // Recreate store update: direct access via create is complex; instead use a new create to get set
  // Simpler: mutate the store via (useUserStore as any).setState
  ;(useUserStore as any).setState({ selectedId: id })
}

export const getSelectedApiKey = () => {
  const s = useUserStore.getState()
  const user = s.users.find((u) => u.id === s.selectedId)
  return user?.apiKey
}

export const getSelectedUser = (): AppUser | undefined => {
  const s = useUserStore.getState()
  return s.users.find((u) => u.id === s.selectedId)
}
