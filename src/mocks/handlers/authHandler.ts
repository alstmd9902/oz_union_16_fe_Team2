import { delay, http, HttpResponse } from 'msw'

import { toMswApiUrl } from '@/apis/apiPath'
import {
  blueCharacterImage,
  orangeCharacterImage,
  pinkCharacterImage,
  yellowCharacterImage,
} from '@/assets/images'

import { resetGoalHandlerState } from './goalHandler'
import { resetPostHandlerState } from './postHandler'

type MockUser = {
  id: number
  email: string
  password: string
  nickname: string
  profile_image_url: string
  provider: string
  login_type: string
  auth_provider: string
  is_social: boolean
}

const profileImages = [
  {
    code: 'blue',
    image_url: blueCharacterImage,
  },
  {
    code: 'yellow',
    image_url: yellowCharacterImage,
  },
  {
    code: 'pink',
    image_url: pinkCharacterImage,
  },
  {
    code: 'orange',
    image_url: orangeCharacterImage,
  },
]

const defaultUser: MockUser = {
  id: 1,
  email: 'test@example.com',
  password: 'password123',
  nickname: '오즈러너',
  profile_image_url: blueCharacterImage,
  provider: 'email',
  login_type: 'email',
  auth_provider: 'email',
  is_social: false,
}

const mockUsers: MockUser[] = [defaultUser]
let activeUser: MockUser = defaultUser

const getProfileImageUrl = (profileImage?: string) => {
  if (!profileImage) return profileImages[0].image_url

  return (
    profileImages.find(
      (image) => image.code === profileImage || image.image_url === profileImage
    )?.image_url ?? profileImage
  )
}

const toMeResponse = (user: MockUser) => ({
  id: user.id,
  nickname: user.nickname,
  profile_image_url: user.profile_image_url,
  provider: user.provider,
  login_type: user.login_type,
  auth_provider: user.auth_provider,
  is_social: user.is_social,
})

export const authHandler = [
  http.post(toMswApiUrl('/accounts/signup'), async ({ request }) => {
    await delay(200)
    const body = (await request.json()) as {
      email?: string
      password?: string
      nickname?: string
      profile_image?: string
    }

    if (mockUsers.some((user) => user.email === body.email)) {
      return HttpResponse.json(
        { error_detail: { email: ['이미 가입된 이메일입니다.'] } },
        { status: 400 }
      )
    }

    if (mockUsers.some((user) => user.nickname === body.nickname)) {
      return HttpResponse.json(
        { error_detail: { nickname: ['이미 사용 중인 닉네임입니다.'] } },
        { status: 400 }
      )
    }

    mockUsers.push({
      id: mockUsers.length + 1,
      email: body.email ?? '',
      password: body.password ?? '',
      nickname: body.nickname ?? '',
      profile_image_url: getProfileImageUrl(body.profile_image),
      provider: 'email',
      login_type: 'email',
      auth_provider: 'email',
      is_social: false,
    })

    return HttpResponse.json({ detail: 'Signup completed.' }, { status: 201 })
  }),

  http.post(toMswApiUrl('/accounts/login'), async ({ request }) => {
    await delay(200)
    const body = (await request.json()) as {
      email?: string
      password?: string
    }
    const user = mockUsers.find(
      (mockUser) =>
        mockUser.email === body.email && mockUser.password === body.password
    )

    if (!user) {
      return HttpResponse.json(
        { error_detail: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    activeUser = user
    return HttpResponse.json({ access_token: 'mock-access-token' })
  }),

  http.post(toMswApiUrl('/accounts/logout'), async () => {
    await delay(150)
    resetGoalHandlerState()
    resetPostHandlerState()
    activeUser = defaultUser

    return HttpResponse.json({ detail: 'Logged out.' })
  }),

  http.post(toMswApiUrl('/accounts/token/refresh'), async () => {
    await delay(150)
    return HttpResponse.json({ access_token: 'mock-refreshed-access-token' })
  }),

  http.get(toMswApiUrl('/accounts/me'), async () => {
    await delay(150)
    return HttpResponse.json(toMeResponse(activeUser))
  }),

  http.patch(
    toMswApiUrl('/accounts/me/change-nickname'),
    async ({ request }) => {
      await delay(150)
      const body = (await request.json()) as { nickname?: string }
      const nickname = body.nickname ?? activeUser.nickname

      if (
        mockUsers.some(
          (mockUser) =>
            mockUser.id !== activeUser.id && mockUser.nickname === nickname
        )
      ) {
        return HttpResponse.json(
          { error_detail: { nickname: ['이미 사용 중인 닉네임입니다.'] } },
          { status: 400 }
        )
      }

      activeUser.nickname = nickname

      return HttpResponse.json({
        detail: {
          message: 'Nickname changed.',
          nickname,
        },
      })
    }
  ),

  http.patch(toMswApiUrl('/accounts/change-password'), async () => {
    await delay(150)
    return HttpResponse.json({ detail: 'Password changed.' })
  }),

  http.post(toMswApiUrl('/accounts/change-password/check'), async () => {
    await delay(150)
    return HttpResponse.json({
      detail: {
        current_password_match: true,
      },
    })
  }),

  http.get(toMswApiUrl('/accounts/profile-images'), async () => {
    await delay(150)
    return HttpResponse.json({
      detail: profileImages,
    })
  }),

  http.post(toMswApiUrl('/accounts/verification/send-email'), async () => {
    await delay(150)
    return HttpResponse.json({ detail: 'Verification email sent.' })
  }),

  http.post(toMswApiUrl('/accounts/verification/verify-email'), async () => {
    await delay(150)
    return HttpResponse.json({
      detail: 'Email verified.',
      email_token: 'mock-email-token',
    })
  }),

  http.get(toMswApiUrl('/accounts/check-nickname'), async ({ request }) => {
    await delay(120)
    const nickname = new URL(request.url).searchParams.get('nickname')

    if (mockUsers.some((user) => user.nickname === nickname)) {
      return HttpResponse.json(
        { error_detail: { nickname: ['이미 사용 중인 닉네임입니다.'] } },
        { status: 400 }
      )
    }

    return HttpResponse.json({ detail: 'Available nickname.' })
  }),

  http.post(
    toMswApiUrl('/accounts/social-login/:provider/callback'),
    async () => {
      await delay(200)
      return HttpResponse.json({ access_token: 'mock-social-access-token' })
    }
  ),
]
