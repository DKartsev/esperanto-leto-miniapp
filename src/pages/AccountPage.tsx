import { FC, useCallback } from 'react'
import MyAccount from '../features/account/MyAccount'

interface AccountPageProps {
  onNavigateHome: () => void
  onStartChapter?: (id: number) => void
}

const AccountPage: FC<AccountPageProps> = ({ onNavigateHome, onStartChapter }) => {
  const handleBackToHome = useCallback(() => {
    (document.activeElement as HTMLElement | null)?.blur()
    onNavigateHome()
  }, [onNavigateHome])

  return (
    <MyAccount onBackToHome={handleBackToHome} onStartChapter={onStartChapter} />
  )
}

export default AccountPage;
