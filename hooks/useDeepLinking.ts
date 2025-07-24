import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { parseDeepLink } from '@/utils/linkUtils';
import { useAuthStore } from '@/store/authStore';

export const useDeepLinking = () => {
  const router = useRouter();
  const { isAuthenticated, isSubscriptionActive } = useAuthStore();

  useEffect(() => {
    // Only handle deep links if user is authenticated and has active subscription
    if (!isAuthenticated || !isSubscriptionActive) {
      return;
    }

    // Handle initial URL when app is opened from a link
    const handleInitialURL = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          handleDeepLink(initialUrl);
        }
      } catch (error) {
        console.error('Error handling initial URL:', error);
      }
    };

    // Handle URL when app is already running
    const handleURL = (event: { url: string }) => {
      handleDeepLink(event.url);
    };

    const handleDeepLink = (url: string) => {
      try {
        const parsed = parseDeepLink(url);
        
        if (parsed) {
          const { type, id } = parsed;
          
          switch (type) {
            case 'bag':
              router.push(`/bag/${id}`);
              break;
            case 'order':
              router.push(`/order/${id}`);
              break;
            case 'member':
              router.push(`/member/${id}`);
              break;
            default:
              console.log('Unknown deep link type:', type);
          }
        }
      } catch (error) {
        console.error('Error parsing deep link:', error);
      }
    };

    handleInitialURL();
    
    const subscription = Linking.addEventListener('url', handleURL);
    
    return () => {
      subscription?.remove();
    };
  }, [router, isAuthenticated, isSubscriptionActive]);
};