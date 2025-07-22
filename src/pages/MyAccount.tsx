import { useUserId, useUserProfile } from '../context/UserContext';

function MyAccount() {
  const userId = useUserId();
  const profile = useUserProfile();

  return (
    <div>
      <div>Ваш UUID: {userId}</div>
      {profile && (
        <pre>{JSON.stringify(profile, null, 2)}</pre>
      )}
    </div>
  );
}

export default MyAccount;
