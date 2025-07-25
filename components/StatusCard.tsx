import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/store/themeStore';
import { BagLocation } from '@/types/bag';

interface StatusCardProps {
  location: BagLocation;
  count: number;
}

export default function StatusCard({ location, count }: StatusCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const getCardStyle = () => {
    switch (location) {
      case 'bagroom':
        return styles.bagroomCard;
      case 'player':
        return styles.playerCard;
      case 'course':
        return styles.courseCard;
      default:
        return styles.bagroomCard;
    }
  };

  const getTitle = () => {
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

  return (
    <View style={[styles.card, getCardStyle()]}>
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.title}>{getTitle()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bagroomCard: {
    backgroundColor: colors.primary,
  },
  playerCard: {
    backgroundColor: colors.warning,
  },
  courseCard: {
    backgroundColor: colors.success,
  },
  count: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
});