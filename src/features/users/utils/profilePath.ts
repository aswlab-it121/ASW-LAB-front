type LinkableUser = {
  id?: number | null
}

export function profilePath(user?: LinkableUser | null, selectedUserId?: number | null) {
  if (!user?.id) return '/profile'
  return selectedUserId && user.id === selectedUserId ? '/profile' : `/users/${user.id}`
}
