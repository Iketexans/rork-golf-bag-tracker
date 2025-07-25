import React, { useRef } from 'react';
import { StyleSheet, Text, View, Animated, Alert, Platform } from 'react-native';
import { Bag, Member } from '@/types/bag';
import colors from '@/constants/colors';
import { Trash2 } from 'lucide-react-native';
import BagListItem from './BagListItem';
import { useBagStore } from '@/store/bagStore';
import * as Haptics from 'expo-haptics';

// Conditional import for gesture handler - only on native platforms
let PanGestureHandler: any = null;
let State: any = null;

if (Platform.OS !== 'web') {
  try {
    const GestureHandler = require('react-native-gesture-handler');
    PanGestureHandler = GestureHandler.PanGestureHandler;
    State = GestureHandler.State;
  } catch (error) {
    console.warn('Gesture handler not available:', error);
    PanGestureHandler = null;
    State = null;
  }
}

interface SwipeableBagItemProps {
  bag: Bag;
  member: Member;
  showStarButton?: boolean;
}

export default function SwipeableBagItem({ bag, member, showStarButton = true }: SwipeableBagItemProps) {
  const { deleteBag } = useBagStore();
  const translateX = useRef(new Animated.Value(0)).current;
  const swipeThreshold = -80;

  const handleGestureEvent = Platform.OS !== 'web' && PanGestureHandler ? Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  ) : undefined;

  const handleStateChange = (event: any) => {
    if (Platform.OS === 'web' || !State) return;
    
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      
      if (translationX < swipeThreshold) {
        // Show delete confirmation
        showDeleteConfirmation();
      }
      
      // Reset position
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  const showDeleteConfirmation = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      'Delete Bag',
      `Are you sure you want to delete ${member.name}'s bag (${bag.bagNumber})?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            deleteBag(bag.id);
          },
        },
      ]
    );
  };

  // On web or when gesture handler is not available, just show the regular item without swipe functionality
  if (Platform.OS === 'web' || !PanGestureHandler) {
    return (
      <BagListItem 
        bag={bag} 
        member={member} 
        showStarButton={showStarButton}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.deleteBackground}>
        <View style={styles.deleteAction}>
          <Trash2 size={24} color="white" />
          <Text style={styles.deleteText}>Delete</Text>
        </View>
      </View>
      
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
        activeOffsetX={[-10, 10]}
      >
        <Animated.View
          style={[
            styles.swipeableContent,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <BagListItem 
            bag={bag} 
            member={member} 
            showStarButton={showStarButton}
          />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 12,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: colors.danger,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  swipeableContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
  },
});