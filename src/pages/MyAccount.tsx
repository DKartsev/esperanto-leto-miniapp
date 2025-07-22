import { useUserId } from '../context/UserContext';

function MyAccount() {
  const userId = useUserId();

  return <div>Ваш UUID: {userId}</div>;
}

export default MyAccount;
