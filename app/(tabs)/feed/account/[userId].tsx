import { useLocalSearchParams, Stack } from 'expo-router';
import Account from '../../../../components/Account';

export default function OtherUserAccount() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  return (
    <Account userId={userId} />
  );
}