import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function RedirectHandler() {
  const router = useRouter();
  const { success, page } = useLocalSearchParams<{ success: string; page: string }>();

  useEffect(() => {
    try {
      if (!page) {
        router.replace('/dashboard');
        return;
      }

      const cleanPage = String(page).replace(/\\/g, '').replace(/^\/+/, '');

      if (!cleanPage || cleanPage.includes('..')) {
        router.replace('/dashboard');
        return;
      }

      router.replace({
        pathname: `/${cleanPage}` as any,
        params: {
          success: success === 'true' ? 'true' : 'false',
        },
      });
    } catch (e) {
      console.error('redirect-handler', e);
      router.replace('/dashboard');
    }
  }, [success, page, router]);

  return null;
}
