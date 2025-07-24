import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useOrderStore } from '@/store/orderStore';
import { useBagStore } from '@/store/bagStore';
import colors from '@/constants/colors';
import { formatDateTime } from '@/utils/dateUtils';
import { OrderStatus } from '@/types/order';
import { Share, Clock, CheckCircle, XCircle, AlertCircle, DollarSign, Calendar, MapPin, ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { shareOrder } from '@/utils/linkUtils';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getOrderById, updateOrderStatus } = useOrderStore();
  const { getBagById, getMemberById } = useBagStore();
  
  const order = getOrderById(id);
  const bag = order ? getBagById(order.bagId) : undefined;
  const member = bag ? getMemberById(bag.memberId) : undefined;

  if (!order || !bag || !member) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const handleStatusChange = (status: OrderStatus) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    updateOrderStatus(order.id, status);
  };

  const handleShare = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const result = await shareOrder(order.id, getTypeLabel(), member.name);
    
    if (result.success) {
      if (result.message) {
        Alert.alert('Success', result.message);
      }
    } else {
      Alert.alert('Error', 'Failed to share order link');
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

  const getPriorityColor = () => {
    switch (order.priority) {
      case 'urgent': return colors.danger;
      case 'high': return colors.warning;
      case 'medium': return colors.secondary;
      case 'low': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = () => {
    switch (order.status) {
      case 'pending': return <Clock size={20} color={colors.warning} />;
      case 'in_progress': return <AlertCircle size={20} color={colors.primary} />;
      case 'completed': return <CheckCircle size={20} color={colors.success} />;
      case 'cancelled': return <XCircle size={20} color={colors.danger} />;
      default: return <Clock size={20} color={colors.textSecondary} />;
    }
  };

  const renderStatusButton = (status: OrderStatus, label: string, color: string) => (
    <TouchableOpacity
      style={[
        styles.statusButton,
        order.status === status && { backgroundColor: color },
      ]}
      onPress={() => handleStatusChange(status)}
    >
      <Text
        style={[
          styles.statusButtonText,
          order.status === status && styles.statusButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: `${getTypeLabel()} - ${member.name}`,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerSection}>
        <View style={styles.headerLeft}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.bagNumber}>Bag {bag.bagNumber}</Text>
          <Text style={styles.orderType}>{getTypeLabel()}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share size={20} color={colors.primary} />
          </TouchableOpacity>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
            <Text style={styles.priorityText}>{order.priority.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Status</Text>
        <View style={styles.currentStatus}>
          {getStatusIcon()}
          <Text style={styles.currentStatusText}>
            {order.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.statusButtons}>
          {renderStatusButton('pending', 'Pending', colors.warning)}
          {renderStatusButton('in_progress', 'In Progress', colors.primary)}
          {renderStatusButton('completed', 'Completed', colors.success)}
          {renderStatusButton('cancelled', 'Cancelled', colors.danger)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Details</Text>
        <Text style={styles.description}>{order.description}</Text>
        
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Requested by:</Text>
            <Text style={styles.detailValue}>{order.requestedBy}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Created:</Text>
            <Text style={styles.detailValue}>
              {formatDateTime(new Date(order.createdAt))}
            </Text>
          </View>
          
          {order.estimatedCost && (
            <View style={styles.detailItem}>
              <DollarSign size={16} color={colors.textSecondary} />
              <Text style={styles.detailValue}>${order.estimatedCost}</Text>
            </View>
          )}
          
          {order.dueDate && (
            <View style={styles.detailItem}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text style={styles.detailValue}>
                Due: {formatDateTime(new Date(order.dueDate))}
              </Text>
            </View>
          )}
          
          {order.targetLocation && (
            <View style={styles.detailItem}>
              <MapPin size={16} color={colors.textSecondary} />
              <Text style={styles.detailValue}>{order.targetLocation}</Text>
            </View>
          )}
        </View>
      </View>

      {order.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{order.notes}</Text>
        </View>
      )}

      {order.completedAt && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completion</Text>
          <Text style={styles.completedText}>
            Completed on {formatDateTime(new Date(order.completedAt))}
          </Text>
        </View>
      )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  memberName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  bagNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  orderType: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
    marginTop: 4,
  },
  shareButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  currentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentStatusText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: 'white',
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    marginLeft: 4,
  },
  notesText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  completedText: {
    fontSize: 16,
    color: colors.success,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 18,
    color: colors.danger,
    textAlign: 'center',
    marginTop: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
});