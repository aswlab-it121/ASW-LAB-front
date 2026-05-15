import { settingsApi } from '../../settings/api/settingsApi'
import { DueDateStatus } from '../../issues/types'

export const deadlinesApi = {
  list: (): Promise<DueDateStatus[]> => settingsApi.list<DueDateStatus>('due-date-statuses')
}
