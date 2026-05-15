import { api } from '../../../lib/api/http'
import { DueDateStatus, IssueStatus, ReferenceItem } from '../../issues/types'

export type SettingsEntity = 'statuses' | 'priorities' | 'types' | 'severities' | 'tags' | 'due-date-statuses'

export type SettingsItem = ReferenceItem | IssueStatus | DueDateStatus

export const settingsApi = {
  list: <T extends SettingsItem = SettingsItem>(entity: SettingsEntity): Promise<T[]> => api.get(`/${entity}/`),
  create: <T extends SettingsItem = SettingsItem>(entity: SettingsEntity, payload: any): Promise<T> =>
    api.post(`/${entity}/`, payload),
  update: <T extends SettingsItem = SettingsItem>(
    entity: SettingsEntity,
    id: string | number,
    payload: any
  ): Promise<T> => api.put(`/${entity}/${id}/`, payload),
  delete: (entity: SettingsEntity, id: string | number): Promise<{ deleted: boolean; id: number }> =>
    api.del(`/${entity}/${id}/`)
}
