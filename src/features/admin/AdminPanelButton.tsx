import { FC } from 'react';
import { Shield } from 'lucide-react';

const AdminPanelButton: FC = () => {
  return (
    <button
      onClick={() => {
        window.location.href = '/admin-panel'
      }}
      className="bg-green-100 text-green-900 rounded-xl px-4 py-2 shadow mr-4 inline-flex items-center space-x-2"
    >
      <Shield className="w-4 h-4" />
      <span>Панель администратора</span>
    </button>
  );
};

export default AdminPanelButton;

