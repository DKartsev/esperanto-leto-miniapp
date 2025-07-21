import MyAccount from '../features/account/MyAccount';
import { useAuth } from '../components/SupabaseAuthProvider';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth() as any;

  return (
    <MyAccount
      onBackToHome={() => navigate('/')}
      onStartChapter={(id: number) => navigate('/', { state: { chapter: id } })}
    />
  );
};

export default AccountPage;
