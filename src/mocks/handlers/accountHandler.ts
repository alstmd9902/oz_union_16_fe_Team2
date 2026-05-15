import { delay, http, HttpResponse } from 'msw'

import { toMswApiUrl } from '@/apis/apiPath'

export const accountHandler = [
  http.get(toMswApiUrl('/accounts/me/activity-summary/days'), async () => {
    await delay(120)
    return HttpResponse.json({
      detail: {
        days_together: 42,
      },
    })
  }),

  http.get(
    toMswApiUrl('/accounts/me/activity-summary/achievement-rate'),
    async () => {
      await delay(120)
      return HttpResponse.json({
        detail: {
          total_goals_count: 8,
          completed_goals_count: 5,
          total_achievement_rate: 63,
        },
      })
    }
  ),

  http.get(
    toMswApiUrl('/accounts/me/activity-summary/completed-goals'),
    async () => {
      await delay(120)
      return HttpResponse.json({
        detail: {
          completed_goals_count: 5,
        },
      })
    }
  ),
]
