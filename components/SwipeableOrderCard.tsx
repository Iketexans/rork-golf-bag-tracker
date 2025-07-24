import React, { useRef } from 'react';
import { StyleSheet, Text, View, Animated, Alert, Platform } from 'react-native';
import { Order } from '@/types/order';
import { Member, Bag } from '@/types/bag';
import colors from '@/constants/colors';
import { Trash2 } from 'lucide-react-native';
import OrderCard from './OrderCard';
import { useOrderStore } from '@/store/orderStore';
import * as Haptics from 'expo-haptics';

// Conditional import for gesture handler
let PanGestureHandler: any;
let State: any;

if (Platform.OS !== 'web') {
  const GestureHandler = require('react-native-gesture-handler');
  PanGestureHandler = GestureHandler.PanGestureHandler;
  State = GestureHandler.State;
}

interface SwipeableOrderCardProps {
  order: Order;
  member: Member;
  bag: Bag;
  onPress: () => void;
}

export default function SwipeableOrderCard({ order, member, bag, onPress }: SwipeableOrderCardProps) {
  const { deleteOrder } = useOrderStore();
  const translateX = useRef(new Animated.Value(0)).current;
  const swipeThreshold = -80;

  const handleGestureEvent = Platform.OS !== 'web' ? Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  ) : undefined;

  const handleStateChange = (event: any) => {
    if (Platform.OS === 'web') return;
    
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

  const getTypeLabel = () => {
    switch (order.type) {
      case 'regroup': return 'Regroup Clubs';
      case 'move': return 'Move Bag';
      case 'clean': return 'Clean Bag';
      case 'repair': return 'Repair Bag';
      case 'regrip': return 'Regrip Clubs';
      case 'ship': return 'Ship Clubs';
      case 'storage': return 'Storage Service';
      case 'maintenance': return 'Maintenance';
      default: return 'Unknown';
    }
  };

  const showDeleteConfirmation = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      'Delete Order',
      `Are you sure you want to delete the ${getTypeLabel()} order for ${member.name}?`,
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
            deleteOrder(order.id);
          },
        },
      ]
    );
  };

  // On web, just show the regular item without swipe functionality
  if (Platform.OS === 'web') {
    return (
      <OrderCard 
        order={order} 
        member={member} 
        bag={bag}
        onPress={onPress}
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
          <OrderCard 
            order={order} 
            member={member} 
            bag={bag}
            onPress={onPress}
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