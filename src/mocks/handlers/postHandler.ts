import { delay, http, HttpResponse } from 'msw'

import { toMswApiUrl } from '@/apis/apiPath'
import {
  blueCharacterImage,
  pinkCharacterImage,
  yellowCharacterImage,
} from '@/assets/images'

const now = '2026-05-15T09:00:00.000Z'
const MAX_MOCK_POSTS = 20

type MockVoteInfo = {
  vote_id: number
  start_at: string
  end_at: string
  status: string
  options: Array<{
    option_id: number
    content: string
    sort_order: number
  }>
}

type MockPost = {
  post_id: number
  images: string[]
  profile_image_url: string
  nickname: string
  created_at: string
  title: string
  content: string
  tags: string[]
  content_preview: string
  like_count: number
  comment_count: number
  is_liked: boolean
  is_scrapped: boolean
  is_owner?: boolean
  has_goal?: boolean
  goal_id?: number
  vote_info?: MockVoteInfo | null
}

type MockComment = {
  id: number
  post_id: number
  user_id: number
  nickname: string
  content: string
  created_at: string
  like_count: number
  is_liked: boolean
  profile_image_url: string
}

const goals = [
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
    status: 'in_progress',
    created_at: '2026-05-05T00:00:00.000Z',
    progress_rate: 32,
    is_checked_today: true,
  },
]

const tags = [
  { id: 1, name: '운동' },
  { id: 2, name: '공부' },
  { id: 3, name: '루틴' },
  { id: 4, name: '건강' },
]

const initialPosts: MockPost[] = [
  {
    post_id: 101,
    images: [blueCharacterImage],
    profile_image_url: blueCharacterImage,
    nickname: '오즈러너',
    created_at: '2026-05-15T08:10:00.000Z',
    title: '아침 러닝 인증 완료',
    content: '출근 전에 3km 달리기를 끝냈어요. 오늘도 streak 유지했습니다.',
    tags: ['운동', '루틴'],
    content_preview:
      '출근 전에 3km 달리기를 끝냈어요. 오늘도 streak 유지했습니다.',
    like_count: 12,
    comment_count: 2,
    is_liked: false,
    is_scrapped: true,
  },
  {
    post_id: 102,
    images: [],
    profile_image_url: yellowCharacterImage,
    nickname: '습관메이커',
    created_at: '2026-05-14T21:30:00.000Z',
    title: '독서 기록 10일차',
    content: '오늘도 한 챕터를 읽고 핵심 내용을 정리했습니다.',
    tags: ['공부'],
    content_preview: '오늘도 한 챕터를 읽고 핵심 내용을 정리했습니다.',
    like_count: 7,
    comment_count: 1,
    is_liked: true,
    is_scrapped: false,
  },
]

const initialComments: MockComment[] = [
  {
    id: 1,
    post_id: 101,
    user_id: 2,
    nickname: '습관메이커',
    content: '좋아요! 꾸준히 하는 게 제일 어려운데 대단해요.',
    created_at: '2026-05-15T08:30:00.000Z',
    like_count: 1,
    is_liked: false,
    profile_image_url: yellowCharacterImage,
  },
  {
    id: 2,
    post_id: 101,
    user_id: 3,
    nickname: '꾸준러너',
    content: '아침 운동하면 하루가 훨씬 가벼워지는 것 같아요.',
    created_at: '2026-05-15T08:45:00.000Z',
    like_count: 0,
    is_liked: false,
    profile_image_url: pinkCharacterImage,
  },
]

let posts = initialPosts.map((post) => ({ ...post }))
let comments = initialComments.map((comment) => ({ ...comment }))

export const resetPostHandlerState = () => {
  posts = initialPosts.map((post) => ({ ...post }))
  comments = initialComments.map((comment) => ({ ...comment }))
}

const buildPostDetail = (postId: number) => {
  const post = posts.find((item) => item.post_id === postId) ?? posts[0]
  const goal = goals.find((item) => item.goal_id === post.goal_id) ?? goals[0]

  return {
    post_id: postId,
    images: post.images,
    profile_image_url: post.profile_image_url ?? '',
    nickname: post.nickname,
    created_at: post.created_at,
    title: post.title,
    content:
      post.content ??
      'MSW로 내려주는 목업 게시글입니다. 백엔드 서버 없이도 화면 흐름을 확인할 수 있어요.',
    tags: post.tags,
    like_count: post.like_count,
    comment_count: post.comment_count,
    is_liked: post.is_liked,
    is_scrapped: post.is_scrapped,
    is_owner: postId === 101,
    has_goal: post.has_goal ?? true,
    goal_info:
      post.has_goal === false
        ? null
        : {
            goal_id: goal.goal_id,
            goal_title: goal.title,
            goal_start_date: goal.start_date,
            goal_end_date: goal.end_date,
            goal_progress: goal.progress_rate,
          },
    has_vote: Boolean(post.vote_info),
    vote_info: post.vote_info ?? null,
  }
}

const buildPagedPosts = (items = posts) => ({
  posts: items,
  page: 1,
  size: items.length,
  total_count: items.length,
})

export const postHandler = [
  http.get(toMswApiUrl('/goals/'), async () => {
    await delay(150)
    return HttpResponse.json({
      count: goals.length,
      next: null,
      previous: null,
      results: goals,
    })
  }),

  http.get(toMswApiUrl('/posts/tags'), async () => {
    await delay(100)
    return HttpResponse.json({ results: tags })
  }),

  http.get(toMswApiUrl('/posts/'), async () => {
    await delay(200)
    return HttpResponse.json({ detail: buildPagedPosts() })
  }),

  http.post(toMswApiUrl('/posts/'), async ({ request }) => {
    await delay(200)
    const body = (await request.json()) as {
      title?: string
      content?: string
      images?: string[]
      has_goal?: boolean
      goal_id?: number
      has_vote?: boolean
      vote?: {
        options?: string[]
        start_at?: string
        end_at?: string
      }
      tag_ids?: number[]
    }
    const postId = Date.now()
    const tagNames =
      body.tag_ids
        ?.map((tagId) => tags.find((tag) => tag.id === tagId)?.name)
        .filter((tagName): tagName is string => Boolean(tagName)) ?? []
    const voteInfo =
      body.has_vote && body.vote?.options?.length
        ? {
            vote_id: postId,
            start_at: body.vote.start_at ?? now,
            end_at: body.vote.end_at ?? now,
            status: 'in_progress',
            options: body.vote.options.map((option, index) => ({
              option_id: postId + index,
              content: option,
              sort_order: index + 1,
            })),
          }
        : null
    const newPost = {
      post_id: postId,
      images: body.images ?? [],
      profile_image_url: blueCharacterImage,
      nickname: '오즈러너',
      created_at: new Date().toISOString(),
      title: body.title ?? '새 mock 게시글',
      content: body.content ?? '',
      tags: tagNames,
      content_preview: body.content ?? '',
      like_count: 0,
      comment_count: 0,
      is_liked: false,
      is_scrapped: false,
      is_owner: true,
      has_goal: body.has_goal ?? false,
      goal_id: body.goal_id,
      vote_info: voteInfo,
    }

    posts = [newPost, ...posts].slice(0, MAX_MOCK_POSTS)

    return HttpResponse.json(
      { detail: 'Post created.', post_id: postId },
      { status: 201 }
    )
  }),

  http.get(toMswApiUrl('/posts/me'), async () => {
    await delay(200)
    return HttpResponse.json({ detail: buildPagedPosts(posts) })
  }),

  http.get(toMswApiUrl('/posts/scraps'), async () => {
    await delay(200)
    return HttpResponse.json({
      ...buildPagedPosts(posts.filter((post) => post.is_scrapped)),
      posts: posts.filter((post) => post.is_scrapped),
    })
  }),

  http.get(toMswApiUrl('/posts/search'), async ({ request }) => {
    await delay(200)
    const keyword = new URL(request.url).searchParams.get('keyword') ?? ''
    const filtered = posts.filter((post) =>
      post.title.toLowerCase().includes(keyword.toLowerCase())
    )

    return HttpResponse.json({
      detail: {
        search_results: filtered,
        keyword,
        total_count: filtered.length,
        sort_by: 'latest',
        page: 1,
        size: filtered.length,
      },
    })
  }),

  http.get(toMswApiUrl('/posts/trending'), async () => {
    await delay(200)
    return HttpResponse.json({ detail: buildPagedPosts() })
  }),

  http.get(toMswApiUrl('/posts/suggestions'), async () => {
    await delay(200)
    return HttpResponse.json({ detail: buildPagedPosts() })
  }),

  http.get(toMswApiUrl('/posts/:postId/'), async ({ params }) => {
    await delay(200)
    return HttpResponse.json(buildPostDetail(Number(params.postId)))
  }),

  http.patch(toMswApiUrl('/posts/:postId/'), async ({ params, request }) => {
    await delay(150)
    const body = (await request.json()) as {
      title?: string
      content?: string
      images?: string[]
      has_goal?: boolean
      goal_id?: number
      tag_ids?: number[]
    }
    const post = posts.find((item) => item.post_id === Number(params.postId))

    if (post) {
      post.title = body.title ?? post.title
      post.content = body.content ?? post.content
      post.content_preview = body.content ?? post.content_preview
      post.images = body.images ?? post.images
      post.has_goal = body.has_goal ?? post.has_goal
      post.goal_id = body.goal_id ?? post.goal_id
      post.tags =
        body.tag_ids
          ?.map((tagId) => tags.find((tag) => tag.id === tagId)?.name)
          .filter((tagName): tagName is string => Boolean(tagName)) ?? post.tags
    }

    return new HttpResponse(null, { status: 204 })
  }),

  http.delete(toMswApiUrl('/posts/:postId/'), async ({ params }) => {
    await delay(150)
    posts = posts.filter((post) => post.post_id !== Number(params.postId))

    return new HttpResponse(null, { status: 204 })
  }),

  http.post(toMswApiUrl('/posts/:postId/likes/'), async ({ params }) => {
    await delay(120)
    const post = posts.find((item) => item.post_id === Number(params.postId))
    if (post) {
      post.is_liked = !post.is_liked
      post.like_count += post.is_liked ? 1 : -1
    }

    return new HttpResponse(null, { status: 204 })
  }),

  http.post(toMswApiUrl('/posts/:postId/scraps'), async ({ params }) => {
    await delay(120)
    const post = posts.find((item) => item.post_id === Number(params.postId))
    if (post) {
      post.is_scrapped = true
    }

    return new HttpResponse(null, { status: 204 })
  }),

  http.delete(toMswApiUrl('/posts/:postId/scraps'), async ({ params }) => {
    await delay(120)
    const post = posts.find((item) => item.post_id === Number(params.postId))
    if (post) {
      post.is_scrapped = false
    }

    return new HttpResponse(null, { status: 204 })
  }),

  http.post(toMswApiUrl('/posts/:postId/reports/'), async () => {
    await delay(150)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(toMswApiUrl('/posts/presigned-url/'), async ({ request }) => {
    await delay(150)
    const body = (await request.json()) as { filename?: string }
    const filename = body.filename ?? 'mock-image.png'

    return HttpResponse.json({
      detail: {
        presigned_url: 'https://example.com/mock-upload-url',
        image_url: `${blueCharacterImage}?name=${encodeURIComponent(filename)}`,
      },
    })
  }),

  http.put('https://example.com/mock-upload-url', async () => {
    await delay(120)
    return new HttpResponse(null, { status: 200 })
  }),

  http.get(toMswApiUrl('/posts/:postId/comments'), async ({ params }) => {
    await delay(200)
    const postComments = comments.filter(
      (comment) => comment.post_id === Number(params.postId)
    )

    return HttpResponse.json({
      results: {
        comments: postComments,
        page: 1,
        size: postComments.length,
        total_count: postComments.length,
      },
    })
  }),

  http.post(
    toMswApiUrl('/posts/:postId/comments'),
    async ({ params, request }) => {
      await delay(150)
      const body = (await request.json()) as { content: string }
      const postId = Number(params.postId)
      const newComment = {
        id: Date.now(),
        post_id: postId,
        user_id: 1,
        nickname: '오즈러너',
        content: body.content,
        created_at: now,
        like_count: 0,
        is_liked: false,
        profile_image_url: blueCharacterImage,
      }

      comments = [newComment, ...comments].slice(0, 50)
      const post = posts.find((item) => item.post_id === postId)
      if (post) {
        post.comment_count += 1
      }

      return HttpResponse.json(newComment, { status: 201 })
    }
  ),

  http.patch(
    toMswApiUrl('/posts/:postId/comments/:commentId'),
    async ({ params, request }) => {
      await delay(120)
      const body = (await request.json()) as { content?: string }
      const comment = comments.find(
        (item) =>
          item.post_id === Number(params.postId) &&
          item.id === Number(params.commentId)
      )

      if (comment && body.content) {
        comment.content = body.content
      }

      return new HttpResponse(null, { status: 204 })
    }
  ),

  http.delete(
    toMswApiUrl('/posts/:postId/comments/:commentId'),
    async ({ params }) => {
      await delay(120)
      const postId = Number(params.postId)
      const commentId = Number(params.commentId)
      const beforeCount = comments.length

      comments = comments.filter(
        (comment) => !(comment.post_id === postId && comment.id === commentId)
      )

      const post = posts.find((item) => item.post_id === postId)
      if (post && comments.length < beforeCount) {
        post.comment_count = Math.max(post.comment_count - 1, 0)
      }

      return new HttpResponse(null, { status: 204 })
    }
  ),

  http.post(
    toMswApiUrl('/posts/comments/:commentId/likes'),
    async ({ params }) => {
      await delay(120)
      const comment = comments.find(
        (item) => item.id === Number(params.commentId)
      )

      if (comment && !comment.is_liked) {
        comment.is_liked = true
        comment.like_count += 1
      }

      return new HttpResponse(null, { status: 204 })
    }
  ),

  http.delete(
    toMswApiUrl('/posts/comments/:commentId/likes'),
    async ({ params }) => {
      await delay(120)
      const comment = comments.find(
        (item) => item.id === Number(params.commentId)
      )

      if (comment && comment.is_liked) {
        comment.is_liked = false
        comment.like_count = Math.max(comment.like_count - 1, 0)
      }

      return new HttpResponse(null, { status: 204 })
    }
  ),

  http.post(toMswApiUrl('/posts/comments/:commentId/report'), async () => {
    await delay(120)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(toMswApiUrl('/votes/:voteId/participations/'), async () => {
    await delay(150)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(toMswApiUrl('/votes/:voteId/'), async () => {
    await delay(150)
    return HttpResponse.json(buildPostDetail(101).vote_info)
  }),

  http.patch(toMswApiUrl('/votes/:voteId/'), async () => {
    await delay(150)
    return new HttpResponse(null, { status: 204 })
  }),

  http.delete(toMswApiUrl('/votes/:voteId/'), async () => {
    await delay(150)
    return new HttpResponse(null, { status: 204 })
  }),
]
