import { useLocalSearchParams, Stack } from 'expo-router';
import Account from '../../../../components/Account';

// export const screenOptions = {
//   gestureEnabled: true,
//   gestureDirection: 'horizontal',
//   presentation: 'card',
// };

export default function OtherUserAccount() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  return (
    <Account userId={userId} />
  );
}
