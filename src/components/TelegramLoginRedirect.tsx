import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrGetProfile } from '../services/profileService';

const TelegramLoginRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const tgUser = window?.Telegram?.WebApp?.initDataUnsafe?.user;

    if (tgUser) {
      const upsertProfile = async () => {
        await createOrGetProfile(tgUser);
        navigate('/account');
      };
      upsertProfile();
    }
  }, []);

  return null;
};

export default TelegramLoginRedirect;
