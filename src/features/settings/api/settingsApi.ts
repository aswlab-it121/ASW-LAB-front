import { api } from '../../../lib/api/http'

type Entity = 'statuses' | 'priorities' | 'types' | 'severities' | 'tags' | 'dueDates'

export const settingsApi = {
  list: (entity: Entity) => api.get(`/settings/${entity}`),
  create: (entity: Entity, payload: any) => api.post(`/settings/${entity}`, { data: payload }),
  update: (entity: Entity, id: string, payload: any) => api.put(`/settings/${entity}/${id}`, { data: payload }),
  delete: (entity: Entity, id: string) => api.del(`/settings/${entity}/${id}`)
}
