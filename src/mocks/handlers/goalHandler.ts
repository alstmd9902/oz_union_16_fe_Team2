import { delay, http, HttpResponse } from 'msw'

import { toMswApiUrl } from '@/apis/apiPath'
import {
  blueCharacterImage,
  pinkCharacterImage,
  yellowCharacterImage,
} from '@/assets/images'

const MAX_MOCK_GOALS = 20
const MOCK_TODAY = '2026-05-15'
const HEATMAP_YEAR = 2026

const initialGoals = [
  {
    goal_id: 1,
    title: '매일 아침 3km 달리기',
    start_date: '2026-05-01',
    end_date: '2026-05-31',
    status: 'in_progress',
    created_at: '2026-05-01T00:00:00.000Z',
    progress_rate: 45,
    is_checked_today: false,
  },
  {
    goal_id: 2,
    title: '하루 20페이지 독서하기',
    start_date: '2026-05-05',
    end_date: '2026-06-05',
    status: 'completed',
    created_at: '2026-05-05T00:00:00.000Z',
    progress_rate: 100,
    is_checked_today: true,
  },
  {
    goal_id: 3,
    title: '매일 물 2L 마시기',
    start_date: '2026-04-01',
    end_date: '2026-05-10',
    status: 'failed',
    created_at: '2026-04-01T00:00:00.000Z',
    progress_rate: 65,
    is_checked_today: false,
  },
]

let goals = initialGoals.map((goal) => ({ ...goal }))

export const resetGoalHandlerState = () => {
  goals = initialGoals.map((goal) => ({ ...goal }))
}

const getGoalStatus = (goal: (typeof goals)[number]) => {
  if (goal.progress_rate >= 100 || goal.status === 'completed') {
    return 'completed'
  }

  if (goal.end_date < MOCK_TODAY) {
    return 'failed'
  }

  return 'in_progress'
}

const normalizeGoal = (goal: (typeof goals)[number]) => ({
  ...goal,
  status: getGoalStatus(goal),
})

const toDateKey = (date: Date) => date.toISOString().slice(0, 10)

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)
  return nextDate
}

const getHeatmapFirstWeekStart = (year: number) => {
  const firstDay = new Date(Date.UTC(year, 0, 1))
  const mondayOffset = (firstDay.getUTCDay() + 6) % 7
  return addDays(firstDay, -mondayOffset)
}

const createHeatmapDays = (start?: string | null, end?: string | null) => {
  const yearStart = `${HEATMAP_YEAR}-01-01`
  const yearEnd = `${HEATMAP_YEAR}-12-31`
  const startDate = start ?? yearStart
  const endDate = end ?? yearEnd
  const dayCountMap = new Map<string, number>()
  const firstWeekStart = getHeatmapFirstWeekStart(HEATMAP_YEAR)
  const textStartColumn = 3
  const letterWidth = 5
  const letterGap = 1
  const jaksimPattern = [
    ['11110', '00100', '00100', '00100', '10100', '10100', '01100'], // J
    ['01110', '10001', '10001', '11111', '10001', '10001', '10001'], // A
    ['10001', '10010', '10100', '11000', '10100', '10010', '10001'], // K
    ['01111', '10000', '10000', '01110', '00001', '00001', '11110'], // S
    ['11111', '00100', '00100', '00100', '00100', '00100', '11111'], // I
    ['10001', '11011', '10101', '10101', '10001', '10001', '10001'], // M
  ]

  jaksimPattern.forEach((letter, letterIndex) => {
    const letterStartColumn =
      textStartColumn + letterIndex * (letterWidth + letterGap)

    letter.forEach((rowPattern, rowIndex) => {
      rowPattern.split('').forEach((cell, cellIndex) => {
        if (cell !== '1') return

        const gridColumn = letterStartColumn + cellIndex
        const gridRow = rowIndex + 1
        const date = addDays(firstWeekStart, (gridColumn - 2) * 7 + gridRow - 1)
        const dateKey = toDateKey(date)

        if (dateKey >= yearStart && dateKey <= yearEnd) {
          dayCountMap.set(dateKey, 3)
        }
      })
    })
  })

  return Array.from(dayCountMap.entries())
    .filter(([date]) => date >= startDate && date <= endDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, check_count]) => ({ date, check_count }))
}

const getGoalHistoryByDate = (date: string | null) => {
  if (!date) return goals.map(normalizeGoal)

  const heatmapDays = createHeatmapDays(date, date)
  const checkCount = heatmapDays[0]?.check_count ?? 0
  const checkedGoals = goals
    .map(normalizeGoal)
    .filter((goal) => goal.start_date <= date && goal.end_date >= date)

  return checkedGoals.slice(0, checkCount).map((goal) => ({
    ...goal,
    is_checked_today: true,
  }))
}

export const goalHandler = [
  http.get(toMswApiUrl('/goals/'), async ({ request }) => {
    await delay(180)
    const status = new URL(request.url).searchParams.get('status')
    const normalizedGoals = goals.map(normalizeGoal)
    const results = status
      ? normalizedGoals.filter((goal) => goal.status === status)
      : normalizedGoals

    return HttpResponse.json({
      count: results.length,
      next: null,
      previous: null,
      results,
    })
  }),

  http.post(toMswApiUrl('/goals/'), async ({ request }) => {
    await delay(180)
    const body = (await request.json()) as {
      title?: string
      start_date?: string
      end_date?: string
    }

    const newGoal = {
      goal_id: Date.now(),
      title: body.title ?? 'New mock goal',
      start_date: body.start_date ?? '2026-05-15',
      end_date: body.end_date ?? '2026-06-15',
      status: 'in_progress',
      created_at: new Date().toISOString(),
      progress_rate: 0,
      is_checked_today: false,
    }

    goals = [newGoal, ...goals].slice(0, MAX_MOCK_GOALS)

    return HttpResponse.json(newGoal, { status: 201 })
  }),

  http.get(toMswApiUrl('/goals/history/'), async ({ request }) => {
    await delay(180)
    const date = new URL(request.url).searchParams.get('date')
    const results = getGoalHistoryByDate(date)

    return HttpResponse.json({
      count: results.length,
      next: null,
      previous: null,
      results,
    })
  }),

  http.patch(toMswApiUrl('/goals/:goalId/'), async ({ params, request }) => {
    await delay(150)
    const body = (await request.json()) as { title?: string }
    const goal = goals.find((item) => item.goal_id === Number(params.goalId))
    if (goal && body.title) {
      goal.title = body.title
    }

    return HttpResponse.json({
      goal_id: Number(params.goalId),
      title: body.title ?? goal?.title ?? 'Updated mock goal',
      start_date: goal?.start_date ?? '2026-05-15',
      end_date: goal?.end_date ?? '2026-06-15',
    })
  }),

  http.delete(toMswApiUrl('/goals/:goalId/'), async ({ params }) => {
    await delay(150)
    goals = goals.filter((goal) => goal.goal_id !== Number(params.goalId))

    return HttpResponse.json({ detail: 'Goal deleted.' })
  }),

  http.post(toMswApiUrl('/goals/:goalId/check/'), async ({ params }) => {
    await delay(150)
    const goal = goals.find((item) => item.goal_id === Number(params.goalId))
    const isGoalEndTodayOrPast = goal ? goal.end_date <= MOCK_TODAY : false
    const nextProgressRate = isGoalEndTodayOrPast
      ? 100
      : Math.min((goal?.progress_rate ?? 0) + 10, 100)

    if (goal) {
      goal.is_checked_today = true
      goal.progress_rate = nextProgressRate
      goal.status = getGoalStatus(goal)
    }

    return HttpResponse.json({
      detail: 'Goal checked.',
      goal_id: Number(params.goalId),
      progress_rate: nextProgressRate,
    })
  }),

  http.get(toMswApiUrl('/goals/achievement'), async ({ request }) => {
    await delay(180)
    const searchParams = new URL(request.url).searchParams

    return HttpResponse.json({
      detail: {
        year: HEATMAP_YEAR,
        days: createHeatmapDays(
          searchParams.get('start'),
          searchParams.get('end')
        ),
      },
    })
  }),

  http.get(toMswApiUrl('/goals/ranking/:type'), async ({ params }) => {
    await delay(180)
    const type = String(params.type)
    const countKey =
      type === 'monthly'
        ? 'month_cert_count'
        : type === 'total'
          ? 'total_cert_count'
          : 'week_cert_count'

    return HttpResponse.json({
      detail: {
        rankings: [
          {
            user_id: 1,
            nickname: '오즈러너',
            profile_img_url: blueCharacterImage,
            rank: 1,
            [countKey]: 18,
          },
          {
            user_id: 2,
            nickname: '습관메이커',
            profile_img_url: yellowCharacterImage,
            rank: 2,
            [countKey]: 14,
          },
          {
            user_id: 3,
            nickname: '꾸준러너',
            profile_img_url: pinkCharacterImage,
            rank: 3,
            [countKey]: 11,
          },
        ],
      },
    })
  }),
]
