import { useNavigate } from 'react-router-dom';
import AdminPanel from '../features/admin/AdminPanel';
import { useAuth } from '../components/SupabaseAuthProvider';

const AdminPanelPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  return (
    <AdminPanel
      onClose={() => navigate('/')}
      currentUser={profile?.username || ''}
      currentEmail={profile?.email || ''}
    />
  );
};

export default AdminPanelPage;
