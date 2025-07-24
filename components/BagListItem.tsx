import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Bag, Member } from '@/types/bag';
import colors from '@/constants/colors';
import { formatDistanceToNow } from '@/utils/dateUtils';
import { useRouter } from 'expo-router';
import { useBagStore } from '@/store/bagStore';
import { Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

interface BagListItemProps {
  bag: Bag;
  member: Member;
  showStarButton?: boolean;
}

export default function BagListItem({ bag, member, showStarButton = true }: BagListItemProps) {
  const router = useRouter();
  const { toggleStarBag, isBagStarred } = useBagStore();
  const isStarred = isBagStarred(bag.id);

  const getStatusColor = () => {
    switch (bag.location) {
      case 'bagroom':
        return colors.primary;
      case 'player':
        return colors.warning;
      case 'course':
        return colors.success;
      default:
        return colors.inactive;
    }
  };

  const getStatusLabel = () => {
    switch (bag.location) {
      case 'bagroom':
        return 'In Bagroom';
      case 'player':
        return 'With Player';
      case 'course':
        return 'On Course';
      default:
        return 'Unknown';
    }
  };

  const handlePress = () => {
    router.push(`/bag/${bag.id}`);
  };

  const handleStarPress = (e: any) => {
    e.stopPropagation();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleStarBag(bag.id);
  };

  return (
    <TouchableOpacity
      style={[styles.container, isStarred && styles.containerStarred]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {member.photoUrl ? (
          <Image source={{ uri: member.photoUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>
              {member.name.charAt(0)}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{member.name}</Text>
          <View style={styles.headerRight}>
            <Text style={styles.bagNumber}>{bag.bagNumber}</Text>
            {showStarButton && (
              <TouchableOpacity
                style={styles.starButton}
                onPress={handleStarPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Star
                  size={20}
                  color={isStarred ? colors.warning : colors.textSecondary}
                  fill={isStarred ? colors.warning : 'transparent'}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.membershipId}>ID: {member.membershipId}</Text>
        <View style={styles.footer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusLabel()}</Text>
          </View>
          <Text style={styles.timestamp}>
            Updated {formatDistanceToNow(new Date(bag.lastUpdated))}
          </Text>
        </View>
        {isStarred && (
          <View style={styles.playingTodayBadge}>
            <Star size={12} color="white" fill="white" />
            <Text style={styles.playingTodayText}>Playing Today</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  containerStarred: {
    borderWidth: 2,
    borderColor: colors.warning,
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderImage: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  bagNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  starButton: {
    padding: 2,
  },
  membershipId: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  playingTodayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  playingTodayText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
});