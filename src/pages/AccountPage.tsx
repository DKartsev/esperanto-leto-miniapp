import MyAccount from '../features/account/MyAccount';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
  const navigate = useNavigate();

  return (
    <MyAccount
      onBackToHome={() => navigate('/')}
      onStartChapter={(id: number) => navigate('/', { state: { chapter: id } })}
    />
  );
};

export default AccountPage;
