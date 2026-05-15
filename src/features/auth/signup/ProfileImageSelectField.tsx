import { useMemo, useState } from 'react'

import { orangeCharacterImage } from '@/assets/images'
import { CharacterSelectModal } from '@/components/common/overlay'
import { useProfileImagesQuery } from '@/query/auth/useProfileImagesQuery'
import { getProfileAvatarImageUrl } from '@/shared/profileAvatar'
import { cn } from '@/utils/cn'

type ProfileImageSelectFieldProps = {
  value?: string
  onChange: (value: string, imageUrl?: string) => void
}

export function ProfileImageSelectField({
  value,
  onChange,
}: ProfileImageSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const {
    data: profileAvatarOptions = [],
    isFetching,
    refetch,
  } = useProfileImagesQuery({ enabled: false })

  // 폼에는 서버로 보낼 profile_image (code)를 저장하고,
  // 화면에서는 해당 code로 avatar를 찾아서 보여줍니다.
  const selectedCharacter = useMemo(
    () =>
      profileAvatarOptions.find(
        (character) => character.code === value || character.imageUrl === value
      ) ?? profileAvatarOptions[0],
    [profileAvatarOptions, value]
  )
  const selectedImageUrl = getProfileAvatarImageUrl(
    value ?? selectedCharacter?.imageUrl,
    profileAvatarOptions
  )
  const previewImageUrl = selectedImageUrl || orangeCharacterImage
  const isSelectDisabled = isFetching

  const handleSelectCharacter = (code: string) => {
    const character = profileAvatarOptions.find((item) => item.code === code)
    if (!character) return
    onChange(character.code, character.imageUrl)
    setIsActive(true)
    setIsOpen(false)
  }

  const handleOpenCharacterModal = async () => {
    if (profileAvatarOptions.length > 0) {
      setIsOpen(true)
      return
    }

    const { data } = await refetch()
    if (data && data.length > 0) {
      setIsOpen(true)
    }
  }

  return (
    <div className="grid w-full grid-cols-[26%_1fr] items-center">
      <span className="text-sm leading-tight">프로필 선택</span>
      <button
        type="button"
        aria-label="프로필 선택"
        className="group relative size-16 cursor-pointer rounded-full transition-transform duration-200 ease-out hover:scale-110"
        disabled={isSelectDisabled}
        onClick={handleOpenCharacterModal}
      >
        <img
          src={previewImageUrl}
          alt={selectedCharacter?.label ?? '프로필 캐릭터'}
          className="size-12 sm:size-16 rounded-full object-contain shrink-0"
        />
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 rounded-full bg-gray-200/70 transition-opacity duration-200 dark:bg-gray-950/50',
            'group-hover:opacity-0 group-focus-visible:opacity-0',
            (isOpen || isActive) && 'opacity-0'
          )}
        />
      </button>

      {isOpen ? (
        <CharacterSelectModal
          characters={profileAvatarOptions}
          defaultSelectedCode={selectedCharacter?.code}
          onClose={() => setIsOpen(false)}
          onSelect={handleSelectCharacter}
        />
      ) : null}
    </div>
  )
}
