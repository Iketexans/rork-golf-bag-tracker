import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { QrCode, Share } from 'lucide-react-native';
import colors from '@/constants/colors';
import { createBagLink } from '@/utils/linkUtils';
import * as Haptics from 'expo-haptics';

interface QRCodeGeneratorProps {
  bagId: string;
  bagNumber: string;
  memberName: string;
}

export default function QRCodeGenerator({ bagId, bagNumber, memberName }: QRCodeGeneratorProps) {
  const handleGenerateQR = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const link = createBagLink(bagId);
    
    // In a real app, you would generate a QR code here
    // For now, we'll show the link that would be encoded
    Alert.alert(
      'QR Code Link',
      `This QR code would contain:\n\n${link}\n\nScan this code to quickly access ${memberName}'s bag (${bagNumber}) in the Bagroom Manager app.`,
      [
        {
          text: 'Copy Link',
          onPress: async () => {
            if (Platform.OS === 'web') {
              if (navigator.clipboard) {
                await navigator.clipboard.writeText(link);
                Alert.alert('Success', 'Link copied to clipboard');
              }
            } else {
              const { Clipboard } = await import('expo-clipboard');
              await Clipboard.setStringAsync(link);
              Alert.alert('Success', 'Link copied to clipboard');
            }
          }
        },
        {
          text: 'Share',
          onPress: async () => {
            if (Platform.OS !== 'web') {
              const { Share } = await import('react-native');
              try {
                await Share.share({
                  message: `Access ${memberName}'s bag (${bagNumber}): ${link}`,
                  url: link,
                  title: `Bag ${bagNumber} - ${memberName}`,
                });
              } catch (error) {
                console.error('Error sharing:', error);
              }
            }
          }
        },
        { text: 'OK', style: 'cancel' }
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleGenerateQR}>
      <QrCode size={20} color={colors.primary} />
      <Text style={styles.text}>Generate QR Code</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
});