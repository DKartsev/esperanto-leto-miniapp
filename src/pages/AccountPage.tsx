import MyAccount from '../features/account/MyAccount'
import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

const AccountPage = () => {
  const navigate = useNavigate()

  const handleBackToHome = useCallback(() => {
    document.activeElement?.blur()
    navigate('/', { replace: true })
  }, [navigate])

  return (
    <MyAccount
      onBackToHome={handleBackToHome}
      onStartChapter={(id: number) =>
        navigate('/', { state: { chapter: id }, replace: true })
      }
    />
  );
};

export default AccountPage;
