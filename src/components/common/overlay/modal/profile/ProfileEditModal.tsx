import { useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import * as z from 'zod'

import { Button, Input, type InputProps } from '@/components/common/ui'
import { usePasswordVisibility } from '@/features/auth/hooks/usePasswordVisibility'
import { PasswordVisibilityButton } from '@/features/auth/PasswordVisibilityButton'
import { ProfileImageSelectField } from '@/features/auth/signup'
import {
  useCheckCurrentPasswordMutation,
  useCheckNicknameMutation,
} from '@/query/auth'
import { cn } from '@/utils/cn'

import { Modal, type ModalProps } from '../base/Modal'

export type ProfileEditFormValues = {
  nickname: string
  profileImageUrl: string
  currentPassword: string
  newPassword: string
  passwordConfirm: string
}

type ProfileEditModalProps = {
  nickname: string
  profileImageUrl: string
  isSubmitting?: boolean
  canChangePassword?: boolean
  onSubmit: (values: ProfileEditFormValues) => Promise<void> | void
} & Omit<ModalProps, 'children'>

const PASSWORD_FIELD_NAMES = [
  'currentPassword',
  'newPassword',
  'passwordConfirm',
] as const
const CURRENT_PASSWORD_CHECK_ERROR_TYPE = 'current-password-check'
const CURRENT_PASSWORD_MISMATCH_MESSAGE = '기존 비밀번호가 일치하지 않습니다.'
const NICKNAME_CHECK_ERROR_TYPE = 'nickname-check'

const passwordSchema = z
  .string()
  .min(8, '비밀번호는 8자 이상이어야 합니다.')
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d).+$/,
    '비밀번호는 영문과 숫자를 모두 포함해야 합니다.'
  )

const profileEditFormSchema = z
  .object({
    nickname: z.string().trim().min(1, '닉네임을 입력해주세요'),
    profileImageUrl: z.string().min(1, '프로필 캐릭터를 선택해주세요'),
    currentPassword: z.string(),
    newPassword: z.string(),
    passwordConfirm: z.string(),
  })
  .superRefine((data, ctx) => {
    const hasPasswordInput =
      data.currentPassword.length > 0 ||
      data.newPassword.length > 0 ||
      data.passwordConfirm.length > 0

    if (!hasPasswordInput) return

    // 비밀번호 변경을 시도할 때만 현재 비밀번호와 새 비밀번호 세트를 검증합니다.
    if (!data.currentPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['currentPassword'],
        message: '현재 비밀번호를 입력해주세요',
      })
    }

    if (data.currentPassword && data.currentPassword === data.newPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: '현재 비밀번호와 다른 비밀번호를 입력해주세요',
      })
      return
    }

    const passwordResult = passwordSchema.safeParse(data.newPassword)
    if (!passwordResult.success) {
      passwordResult.error.issues.forEach((issue) => {
        ctx.addIssue({
          code: 'custom',
          path: ['newPassword'],
          message: issue.message,
        })
      })
    }

    if (!data.passwordConfirm) {
      ctx.addIssue({
        code: 'custom',
        path: ['passwordConfirm'],
        message: '새 비밀번호 확인을 입력해주세요',
      })
      return
    }

    if (data.newPassword !== data.passwordConfirm) {
      ctx.addIssue({
        code: 'custom',
        path: ['passwordConfirm'],
        message: '새 비밀번호가 일치하지 않습니다',
      })
    }
  })

type ProfileEditFormSchema = z.infer<typeof profileEditFormSchema>
type PasswordVisibility = ReturnType<typeof usePasswordVisibility>

function getFirstErrorMessage(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return (
      value.map(getFirstErrorMessage).find((message) => message !== null) ??
      null
    )
  }
  if (value !== null && typeof value === 'object') {
    return (
      Object.values(value)
        .map(getFirstErrorMessage)
        .find((message) => message !== null) ?? null
    )
  }
  return null
}

function getAxiosErrorMessage(error: unknown): string | null {
  if (!isAxiosError(error)) return null
  return getFirstErrorMessage(error.response?.data?.error_detail)
}

function PasswordInput({
  visibility,
  ...props
}: InputProps & {
  visibility: PasswordVisibility
}) {
  return (
    <div className="relative">
      <Input
        {...props}
        type={visibility.inputType}
        className={cn('pr-12 sm:pr-14', props.className)}
      />
      <div className="absolute right-3 top-3.5 sm:right-4">
        <PasswordVisibilityButton
          isVisible={visibility.isVisible}
          onToggle={visibility.toggleVisibility}
        />
      </div>
    </div>
  )
}

export function ProfileEditModal({
  nickname,
  profileImageUrl,
  isSubmitting = false,
  canChangePassword = true,
  onSubmit,
  onClose,
  className,
  size,
  rounded,
  border,
}: ProfileEditModalProps) {
  const {
    control,
    formState: { errors },
    clearErrors,
    getValues,
    handleSubmit,
    register,
    setError,
    setValue,
    trigger,
  } = useForm<ProfileEditFormSchema>({
    resolver: zodResolver(profileEditFormSchema),
    defaultValues: {
      nickname,
      profileImageUrl,
      currentPassword: '',
      newPassword: '',
      passwordConfirm: '',
    },
  })
  const nicknameValue = useWatch({ control, name: 'nickname' })
  const profileImageValue = useWatch({ control, name: 'profileImageUrl' })
  const currentPasswordValue = useWatch({ control, name: 'currentPassword' })
  const { mutateAsync: checkNickname } = useCheckNicknameMutation()
  const { mutateAsync: checkCurrentPassword } =
    useCheckCurrentPasswordMutation()
  const currentPasswordField = register('currentPassword')
  const newPasswordField = register('newPassword')
  const passwordConfirmField = register('passwordConfirm')
  const currentPasswordVisibility = usePasswordVisibility()
  const newPasswordVisibility = usePasswordVisibility()
  const passwordConfirmVisibility = usePasswordVisibility()
  const nicknameErrorValueRef = useRef<string | null>(null)

  useEffect(() => {
    const trimmedNickname = nicknameValue.trim()

    if (
      errors.nickname?.type === NICKNAME_CHECK_ERROR_TYPE &&
      nicknameErrorValueRef.current !== null &&
      nicknameErrorValueRef.current !== trimmedNickname
    ) {
      nicknameErrorValueRef.current = null
      clearErrors('nickname')
    }

    if (!trimmedNickname || trimmedNickname === nickname) {
      if (
        errors.nickname?.type === NICKNAME_CHECK_ERROR_TYPE &&
        trimmedNickname === nickname
      ) {
        nicknameErrorValueRef.current = null
        clearErrors('nickname')
      }
      return
    }

    if (
      errors.nickname?.type === NICKNAME_CHECK_ERROR_TYPE &&
      trimmedNickname !== nickname
    ) {
      return
    }

    let ignoreResult = false

    const timer = window.setTimeout(() => {
      void checkNickname({ nickname: trimmedNickname })
        .then(() => {
          if (ignoreResult) return
          nicknameErrorValueRef.current = null
          clearErrors('nickname')
        })
        .catch((error) => {
          if (ignoreResult) return

          nicknameErrorValueRef.current = trimmedNickname
          setError('nickname', {
            type: NICKNAME_CHECK_ERROR_TYPE,
            message:
              getAxiosErrorMessage(error) ?? '이미 사용 중인 닉네임입니다.',
          })
        })
    }, 500)

    return () => {
      ignoreResult = true
      window.clearTimeout(timer)
    }
  }, [
    checkNickname,
    clearErrors,
    errors.nickname?.type,
    nickname,
    nicknameValue,
    setError,
  ])

  useEffect(() => {
    if (!canChangePassword) return

    const passwordToCheck = currentPasswordValue

    if (!passwordToCheck) {
      if (errors.currentPassword?.type === CURRENT_PASSWORD_CHECK_ERROR_TYPE) {
        clearErrors('currentPassword')
      }
      return
    }

    let ignoreResult = false

    const timer = window.setTimeout(() => {
      void checkCurrentPassword({ password: passwordToCheck })
        .then((response) => {
          if (ignoreResult) return

          if (response.detail.current_password_match) {
            clearErrors('currentPassword')
            return
          }

          setError('currentPassword', {
            type: CURRENT_PASSWORD_CHECK_ERROR_TYPE,
            message: CURRENT_PASSWORD_MISMATCH_MESSAGE,
          })
        })
        .catch((error) => {
          if (ignoreResult) return

          setError('currentPassword', {
            type: CURRENT_PASSWORD_CHECK_ERROR_TYPE,
            message:
              getAxiosErrorMessage(error) ?? CURRENT_PASSWORD_MISMATCH_MESSAGE,
          })
        })
    }, 500)

    return () => {
      ignoreResult = true
      window.clearTimeout(timer)
    }
  }, [
    canChangePassword,
    checkCurrentPassword,
    clearErrors,
    currentPasswordValue,
    errors.currentPassword?.type,
    setError,
  ])

  const handlePasswordFieldChange =
    (onChange: typeof currentPasswordField.onChange) =>
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      await onChange(event)

      const values = getValues()
      const hasFilledPasswordFields = PASSWORD_FIELD_NAMES.every(
        (name) => values[name].length > 0
      )
      const canValidateNewPasswordRelation =
        values.currentPassword.length > 0 && values.newPassword.length > 0
      const hasPasswordError = PASSWORD_FIELD_NAMES.some((name) => errors[name])

      if (
        canValidateNewPasswordRelation ||
        hasFilledPasswordFields ||
        hasPasswordError
      ) {
        void trigger(PASSWORD_FIELD_NAMES)
      }
    }

  const handleSubmitProfileEdit = handleSubmit(async (values) => {
    try {
      await onSubmit({
        nickname: values.nickname.trim(),
        profileImageUrl: values.profileImageUrl,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        passwordConfirm: values.passwordConfirm,
      })
    } catch (error) {
      if (!isAxiosError(error)) {
        setError('nickname', {
          type: 'server',
          message: '내정보 변경에 실패했습니다',
        })
        return
      }

      const errorDetail = error.response?.data?.error_detail

      // 400 응답은 서버 field name을 react-hook-form field name으로 맞춰 해당 input 아래에 표시합니다.
      if (typeof errorDetail === 'object' && errorDetail !== null) {
        let hasMappedFieldError = false
        const fallbackErrorMessage = getFirstErrorMessage(errorDetail)
        const nicknameError = errorDetail?.nickname?.[0]
        const passwordError = errorDetail?.password?.[0]
        const newPasswordError = errorDetail?.new_password?.[0]
        const passwordConfirmError = errorDetail?.new_password_confirm?.[0]

        if (nicknameError) {
          setError('nickname', {
            type: 'server',
            message: nicknameError,
          })
          hasMappedFieldError = true
        }

        if (passwordError) {
          setError('currentPassword', {
            type: 'server',
            message: passwordError,
          })
          hasMappedFieldError = true
        }

        if (newPasswordError) {
          setError('newPassword', {
            type: 'server',
            message: newPasswordError,
          })
          hasMappedFieldError = true
        }

        if (passwordConfirmError) {
          setError('passwordConfirm', {
            type: 'server',
            message: passwordConfirmError,
          })
          hasMappedFieldError = true
        }

        if (!hasMappedFieldError) {
          setError('currentPassword', {
            type: 'server',
            message:
              fallbackErrorMessage ?? '기존 비밀번호가 일치하지 않습니다.',
          })
        }

        return
      }

      // 서버가 동일 비밀번호를 문자열로 내려주는 경우는 새 비밀번호 쪽에 붙입니다.
      if (
        typeof errorDetail === 'string' &&
        (errorDetail.includes('동일') || errorDetail.includes('같'))
      ) {
        setError('newPassword', {
          type: 'server',
          message: errorDetail,
        })
        return
      }

      // 문서상 401/403은 문자열이며, 403 기존 비밀번호 불일치는 현재 비밀번호 필드에 표시합니다.
      setError('currentPassword', {
        type: 'server',
        message:
          typeof errorDetail === 'string'
            ? errorDetail
            : '내정보 변경에 실패했습니다',
      })
    }
  })

  return (
    <Modal
      onClose={onClose}
      size={size}
      rounded={rounded}
      border={border}
      className={cn('w-[calc(100vw-32px)] max-w-[440px] p-6 sm:p-7', className)}
    >
      <Modal.Header>내정보 변경</Modal.Header>
      <form onSubmit={handleSubmitProfileEdit}>
        <Modal.Content className="mt-5">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3">
              <ProfileImageSelectField
                value={profileImageValue}
                onChange={(_, imageUrl) => {
                  if (!imageUrl) return
                  setValue('profileImageUrl', imageUrl, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }}
              />
            </div>

            <label className="flex flex-col gap-2 text-sm font-semibold text-text-primary">
              닉네임
              <Input
                {...register('nickname')}
                error={Boolean(errors.nickname)}
                errorMessage={errors.nickname?.message}
                placeholder="닉네임을 입력해주세요"
                className="text-sm font-normal"
                wrapperClassName="gap-2"
                disabled={isSubmitting}
              />
            </label>

            {canChangePassword ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-text-primary">
                  비밀번호 변경
                </p>
                <PasswordInput
                  visibility={currentPasswordVisibility}
                  {...currentPasswordField}
                  onChange={handlePasswordFieldChange(
                    currentPasswordField.onChange
                  )}
                  error={Boolean(errors.currentPassword)}
                  errorMessage={errors.currentPassword?.message}
                  placeholder="현재 비밀번호"
                  wrapperClassName="gap-2"
                  disabled={isSubmitting}
                />
                <PasswordInput
                  visibility={newPasswordVisibility}
                  {...newPasswordField}
                  onChange={handlePasswordFieldChange(
                    newPasswordField.onChange
                  )}
                  error={Boolean(errors.newPassword)}
                  errorMessage={errors.newPassword?.message}
                  placeholder="새 비밀번호"
                  wrapperClassName="gap-2"
                  disabled={isSubmitting}
                />
                <PasswordInput
                  visibility={passwordConfirmVisibility}
                  {...passwordConfirmField}
                  onChange={handlePasswordFieldChange(
                    passwordConfirmField.onChange
                  )}
                  error={Boolean(errors.passwordConfirm)}
                  errorMessage={errors.passwordConfirm?.message}
                  placeholder="새 비밀번호 확인"
                  wrapperClassName="gap-2"
                  disabled={isSubmitting}
                />
              </div>
            ) : null}
          </div>
        </Modal.Content>

        <Modal.Footer className="mt-7 grid grid-cols-2 gap-3 sm:flex">
          <Button
            variant="modal"
            rounded="lg"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full px-5 py-2 text-sm font-light sm:w-auto"
          >
            닫기
          </Button>
          <Button
            type="submit"
            variant="primary"
            rounded="lg"
            disabled={isSubmitting}
            className="w-full px-5 py-2 text-sm font-light sm:w-auto"
          >
            {isSubmitting ? '저장 중' : '저장'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
