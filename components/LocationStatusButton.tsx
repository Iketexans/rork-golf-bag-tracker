import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BagLocation } from '@/types/bag';
import colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface LocationStatusButtonProps {
  location: BagLocation;
  currentLocation: BagLocation;
  onPress: (location: BagLocation) => void;
}

export default function LocationStatusButton({
  location,
  currentLocation,
  onPress,
}: LocationStatusButtonProps) {
  const isActive = location === currentLocation;

  const getButtonStyle = () => {
    if (isActive) {
      switch (location) {
        case 'bagroom':
          return styles.bagroomActive;
        case 'player':
          return styles.playerActive;
        case 'course':
          return styles.courseActive;
        default:
          return styles.bagroomActive;
      }
    }
    return styles.inactive;
  };

  const getTextStyle = () => {
    return isActive ? styles.activeText : styles.inactiveText;
  };

  const getLocationLabel = () => {
    switch (location) {
      case 'bagroom':
        return 'In Bagroom';
      case 'player':
        return 'With Player';
      case 'course':
        return 'On Course';
      default:
        return '';
    }
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onPress(location);
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle()]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={getTextStyle()}>{getLocationLabel()}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  inactive: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bagroomActive: {
    backgroundColor: colors.primary,
  },
  playerActive: {
    backgroundColor: colors.warning,
  },
  courseActive: {
    backgroundColor: colors.success,
  },
  activeText: {
    color: 'white',
    fontWeight: '600',
  },
  inactiveText: {
    color: colors.textSecondary,
  },
});