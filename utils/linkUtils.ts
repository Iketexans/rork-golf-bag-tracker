import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export const createBagLink = (bagId: string): string => {
  const baseUrl = __DEV__ 
    ? 'bagroom://bag/' 
    : 'https://bagroom-manager.app/bag/';
  
  return `${baseUrl}${bagId}`;
};

export const createOrderLink = (orderId: string): string => {
  const baseUrl = __DEV__ 
    ? 'bagroom://order/' 
    : 'https://bagroom-manager.app/order/';
  
  return `${baseUrl}${orderId}`;
};

export const createMemberLink = (memberId: string): string => {
  const baseUrl = __DEV__ 
    ? 'bagroom://member/' 
    : 'https://bagroom-manager.app/member/';
  
  return `${baseUrl}${memberId}`;
};

export const shareBag = async (bagId: string, memberName: string, bagNumber: string) => {
  const link = createBagLink(bagId);
  const message = `Check out ${memberName}'s bag (${bagNumber}) in the Bagroom Manager: ${link}`;
  
  if (Platform.OS === 'web') {
    // For web, copy to clipboard
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(link);
      return { success: true, message: 'Link copied to clipboard' };
    }
  } else {
    // For mobile, use native sharing
    const { Share } = await import('react-native');
    try {
      await Share.share({
        message,
        url: link,
        title: `Bag ${bagNumber} - ${memberName}`,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
  
  return { success: false, error: 'Sharing not supported' };
};

export const shareOrder = async (orderId: string, orderType: string, memberName: string) => {
  const link = createOrderLink(orderId);
  const message = `Service order for ${memberName} (${orderType}): ${link}`;
  
  if (Platform.OS === 'web') {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(link);
      return { success: true, message: 'Link copied to clipboard' };
    }
  } else {
    const { Share } = await import('react-native');
    try {
      await Share.share({
        message,
        url: link,
        title: `Order: ${orderType} - ${memberName}`,
      });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
  
  return { success: false, error: 'Sharing not supported' };
};

export const parseDeepLink = (url: string) => {
  const parsed = Linking.parse(url);
  
  if (parsed.path) {
    const pathParts = parsed.path.split('/').filter(Boolean);
    
    if (pathParts.length >= 2) {
      const [type, id] = pathParts;
      return { type, id };
    }
  }
  
  return null;
};