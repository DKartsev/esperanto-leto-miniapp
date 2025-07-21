import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../components/SupabaseAuthProvider';
import { isAdmin } from '../utils/adminUtils';

const LandingPage = () => {
  const { profile } = useAuth();
  const isAdminUser = isAdmin(profile?.username, profile?.email as string | undefined);

  const isTelegramWebApp = !!window?.Telegram?.WebApp?.initData;

  return (
    <div>
      <Header isTelegramWebApp={isTelegramWebApp} isAdmin={isAdminUser} />
      <div className="py-24 text-center">
        <h1 className="text-4xl font-bold mb-4 text-emerald-900">Esperanto-Leto</h1>
        <p className="text-emerald-700">Мини-приложение для изучения эсперанто</p>
      </div>
      <Footer isTelegramWebApp={isTelegramWebApp} isAdmin={isAdminUser} />
    </div>
  );
};

export default LandingPage;
