import { useNavigate } from 'react-router-dom';
import AdminPanel from '../components/AdminPanel';
import { useAuth } from '../components/SupabaseAuthProvider';

const AdminPanelPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  return (
    <AdminPanel onClose={() => navigate('/')} currentUser={profile?.username || ''} />
  );
};

export default AdminPanelPage;
