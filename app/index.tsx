import { authStore } from '@/src/store/auth.store';
import { Redirect } from 'expo-router';

export default function Index() {
  const { user } = authStore();
  return <Redirect href={user ? '/(stack)/(tabs)/dashboard' : '/(stack)/(auth)/login'} />;
}
