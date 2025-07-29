import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useOrderStore } from '@/store/orderStore';
import { useBagStore } from '@/store/bagStore';
import SwipeableOrderCard from '@/components/SwipeableOrderCard';
import CreateOrderModal from '@/components/CreateOrderModal';
import { useTheme } from '@/store/themeStore';
import FloatingActionButton from '@/components/FloatingActionButton';
import { OrderStatus } from '@/types/order';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrdersScreen() {
  const { colors } = useTheme();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();
  
  const { getCurrentUserOrders } = useOrderStore();
  const orders = getCurrentUserOrders();
  const { getBagById, getMemberById } = useBagStore();

  const filteredOrders = orders.filter(order => 
    selectedStatus ? order.status === selectedStatus : true
  ).sort((a, b) => {
    // Sort by priority first, then by creation date
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getStatusCounts = () => {
    return {
      pending: orders.filter(o => o.status === 'pending').length,
      in_progress: orders.filter(o => o.status === 'in_progress').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  };

  const statusCounts = getStatusCounts();

  const renderStatusFilter = () => {
    const statuses: { label: string; value: OrderStatus | null; count?: number }[] = [
      { label: 'All', value: null, count: orders.length },
      { label: 'Pending', value: 'pending', count: statusCounts.pending },
      { label: 'In Progress', value: 'in_progress', count: statusCounts.in_progress },
      { label: 'Completed', value: 'completed', count: statusCounts.completed },
    ];

    return (
      <View style={styles.filterContainer}>
        {statuses.map((status) => (
          <TouchableOpacity
            key={status.label}
            style={[
              styles.filterButton,
              selectedStatus === status.value && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedStatus(status.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedStatus === status.value && styles.filterButtonTextActive,
              ]}
            >
              {status.label} ({status.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    header: {
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    filterContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      flexWrap: 'wrap',
      gap: 8,
    },
    filterButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterButtonText: {
      color: colors.textSecondary,
      fontWeight: '500',
      fontSize: 12,
    },
    filterButtonTextActive: {
      color: 'white',
    },
    listContent: {
      paddingBottom: 80,
    },
    emptyState: {
      padding: 24,
      backgroundColor: colors.card,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
    },
    emptyStateText: {
      color: colors.textSecondary,
      fontSize: 16,
      marginBottom: 16,
    },
    emptyStateButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    emptyStateButtonText: {
      color: 'white',
      fontWeight: '500',
    },
  });

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
      </View>
      
      {renderStatusFilter()}
      
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const bag = getBagById(item.bagId);
          const member = bag ? getMemberById(bag.memberId) : undefined;
          
          if (!bag || !member) return null;
          
          return (
            <SwipeableOrderCard
              order={item}
              bag={bag}
              member={member}
              onPress={() => router.push(`/order/${item.id}`)}
            />
          );
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No orders found</Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.emptyStateButtonText}>Create First Order</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <FloatingActionButton onPress={() => setShowCreateModal(true)} />

      <CreateOrderModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </SafeAreaView>
  );
}