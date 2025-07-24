import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, FlatList, Alert, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useBagStore } from '@/store/bagStore';
import { useOrderStore } from '@/store/orderStore';
import colors from '@/constants/colors';
import BagListItem from '@/components/BagListItem';
import OrderCard from '@/components/OrderCard';
import { Share, Package, ClipboardList } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getMemberById, bags } = useBagStore();
  const { orders } = useOrderStore();
  
  const member = getMemberById(id);
  const memberBags = bags.filter(bag => bag.memberId === id);
  const memberOrders = orders.filter(order => order.memberId === id);

  if (!member) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Member not found</Text>
      </View>
    );
  }

  const handleShare = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const memberLink = `bagroom://member/${member.id}`;
    const message = `View ${member.name}'s profile in Bagroom Manager: ${memberLink}`;
    
    if (Platform.OS === 'web') {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(memberLink);
        Alert.alert('Success', 'Link copied to clipboard');
      }
    } else {
      const { Share } = await import('react-native');
      try {
        await Share.share({
          message,
          url: memberLink,
          title: `${member.name} - Member Profile`,
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to share member link');
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileSection}>
        {member.photoUrl ? (
          <Image source={{ uri: member.photoUrl }} style={styles.profileImage} />
        ) : (
          <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
            <Text style={styles.profileImagePlaceholderText}>
              {member.name.charAt(0)}
            </Text>
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.membershipId}>ID: {member.membershipId}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Package size={16} color={colors.primary} />
              <Text style={styles.statText}>{memberBags.length} bags</Text>
            </View>
            <View style={styles.statItem}>
              <ClipboardList size={16} color={colors.secondary} />
              <Text style={styles.statText}>{memberOrders.length} orders</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bags ({memberBags.length})</Text>
        {memberBags.length > 0 ? (
          memberBags.map((bag) => (
            <BagListItem
              key={bag.id}
              bag={bag}
              member={member}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No bags found</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Orders ({memberOrders.length})</Text>
        {memberOrders.length > 0 ? (
          memberOrders.slice(0, 5).map((order) => {
            const bag = memberBags.find(b => b.id === order.bagId);
            if (!bag) return null;
            
            return (
              <OrderCard
                key={order.id}
                order={order}
                bag={bag}
                member={member}
                onPress={() => {
                  // Navigate to order details
                  console.log('Order pressed:', order.id);
                }}
              />
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No orders found</Text>
          </View>
        )}
      </View>
    </ScrollView>
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
  profileSection: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileImagePlaceholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImagePlaceholderText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  membershipId: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 4,
    fontWeight: '500',
  },
  shareButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    padding: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    color: colors.danger,
    textAlign: 'center',
    marginTop: 24,
  },
});