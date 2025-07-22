import AdminPanel from '../features/admin/AdminPanel';
import { useAuth } from '../components/SupabaseAuthProvider';

const AdminPanelPage = () => {
  const { profile } = useAuth();
  return (
    <AdminPanel
      onClose={() => window.history.back()}
      currentUser={profile?.username || ''}
      currentEmail={profile?.email || ''}
    />
  );
};

export default AdminPanelPage;
