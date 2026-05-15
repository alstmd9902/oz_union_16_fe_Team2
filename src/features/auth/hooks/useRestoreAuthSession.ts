import { useEffect } from 'react'

import axios from 'axios'

import { API_BASE_URL, MSW_BASE_URL } from '@/apis/apiPath'
import { AUTH_ENDPOINTS, type RefreshTokenResponse } from '@/apis/auth'
import { buildAuthSession } from '@/features/auth/utils/buildAuthSession'
import { useAuthStore } from '@/store/authStore'

//브라우저 처음 켰을 때 로그인 상태 복구하는 로직

export function useRestoreAuthSession() {
  // 컴포넌트 마운트 시 1회 실행 (의존성 배열 [])
  useEffect(() => {
    const abortController = new AbortController()

    // 실제 세션 복구 로직
    const restoreSession = async () => {
      const {
        accessToken,
        setAccessToken,
        setAuthStatus,
        setSession,
        clearSession,
      } = useAuthStore.getState()

      setAuthStatus('checking')

      try {
        if (!accessToken) {
          const refreshResponse = await axios.post<RefreshTokenResponse>(
            (API_BASE_URL || MSW_BASE_URL) + AUTH_ENDPOINTS.refreshToken,
            undefined,
            {
              withCredentials: true,
              signal: abortController.signal,
            }
          )

          setAccessToken(refreshResponse.data.access_token)
        }

        const session = await buildAuthSession()

        setSession(session.accessToken, session.user)
      } catch {
        // abort는 정상 종료로 취급
        if (abortController.signal.aborted) {
          return
        }

        // refresh까지 실패한 경우만 로그아웃
        clearSession()
      }
    }

    // 비동기 함수 실행 (즉시 호출)
    void restoreSession()

    return () => {
      abortController.abort()
    }
  }, [])
}
