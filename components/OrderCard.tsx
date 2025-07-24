import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Order } from '@/types/order';
import { Member, Bag } from '@/types/bag';
import colors from '@/constants/colors';
import { formatDistanceToNow } from '@/utils/dateUtils';
import { Clock, AlertCircle, CheckCircle, XCircle, DollarSign, Calendar, MapPin } from 'lucide-react-native';

interface OrderCardProps {
  order: Order;
  member: Member;
  bag: Bag;
  onPress: () => void;
}

export default function OrderCard({ order, member, bag, onPress }: OrderCardProps) {
  const getPriorityColor = () => {
    switch (order.priority) {
      case 'urgent':
        return colors.danger;
      case 'high':
        return colors.warning;
      case 'medium':
        return colors.secondary;
      case 'low':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = () => {
    switch (order.status) {
      case 'pending':
        return <Clock size={16} color={colors.warning} />;
      case 'in_progress':
        return <AlertCircle size={16} color={colors.primary} />;
      case 'completed':
        return <CheckCircle size={16} color={colors.success} />;
      case 'cancelled':
        return <XCircle size={16} color={colors.danger} />;
      default:
        return <Clock size={16} color={colors.textSecondary} />;
    }
  };

  const getStatusLabel = () => {
    switch (order.status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const getTypeLabel = () => {
    switch (order.type) {
      case 'regroup':
        return 'Regroup Clubs';
      case 'move':
        return 'Move Bag';
      case 'clean':
        return 'Clean Bag';
      case 'repair':
        return 'Repair Bag';
      case 'regrip':
        return 'Regrip Clubs';
      case 'ship':
        return 'Ship Clubs';
      case 'storage':
        return 'Storage Service';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Unknown';
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.bagNumber}>Bag {bag.bagNumber}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
          <Text style={styles.priorityText}>{order.priority.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.orderType}>{getTypeLabel()}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {order.description}
      </Text>

      {/* Additional order details */}
      <View style={styles.detailsContainer}>
        {order.estimatedCost && (
          <View style={styles.detailItem}>
            <DollarSign size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>${order.estimatedCost}</Text>
          </View>
        )}
        
        {order.dueDate && (
          <View style={styles.detailItem}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>{formatDueDate(order.dueDate)}</Text>
          </View>
        )}
        
        {order.targetLocation && (
          <View style={styles.detailItem}>
            <MapPin size={14} color={colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>{order.targetLocation}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.statusContainer}>
          {getStatusIcon()}
          <Text style={styles.statusText}>{getStatusLabel()}</Text>
        </View>
        <Text style={styles.timestamp}>
          {formatDistanceToNow(new Date(order.createdAt))}
        </Text>
      </View>

      <Text style={styles.requestedBy}>Requested by: {order.requestedBy}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  bagNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  orderType: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  requestedBy: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});