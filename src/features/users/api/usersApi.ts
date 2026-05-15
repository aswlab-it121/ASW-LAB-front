import { api } from '../../../lib/api/http'
import { ApiUser } from '../../issues/types'

export const usersApi = {
  list: (): Promise<ApiUser[]> => api.get('/users/'),
  get: (id: string | number): Promise<ApiUser> => api.get(`/users/${id}/`),
  me: (): Promise<ApiUser> => api.get('/users/me/'),
  updateMe: (payload: Pick<ApiUser, 'first_name' | 'last_name' | 'description'>): Promise<ApiUser> =>
    api.put('/users/me/', payload),
  uploadMyPicture: (file: File): Promise<ApiUser> => {
    const form = new FormData()
    form.append('picture', file)
    return api.formPut('/users/me/picture/', form)
  }
}
