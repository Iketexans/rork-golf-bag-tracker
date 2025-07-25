import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useBagStore } from '@/store/bagStore';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/store/themeStore';
import StatusCard from '@/components/StatusCard';
import BagListItem from '@/components/BagListItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Users } from 'lucide-react-native';

export default function DashboardScreen() {
  const { getLocationCounts, getBagsByLocation, getMemberById, getStarredBags } = useBagStore();
  const { user } = useAuthStore();
  const { colors } = useTheme();
  
  const counts = getLocationCounts();
  const recentBags = getBagsByLocation('bagroom').slice(0, 5);
  const starredBags = getStarredBags();
  
  const styles = createStyles(colors);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.clubName}>{user?.clubName}</Text>
        </View>

        {starredBags.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Star size={20} color={colors.warning} fill={colors.warning} />
              <Text style={styles.sectionTitle}>Playing Today ({starredBags.length})</Text>
            </View>
            {starredBags.slice(0, 3).map((bag) => (
              <BagListItem
                key={bag.id}
                bag={bag}
                member={getMemberById(bag.memberId)!}
                showStarButton={false}
              />
            ))}
            {starredBags.length > 3 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>
                  View all {starredBags.length} players
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        <View style={styles.statusContainer}>
          <StatusCard location="bagroom" count={counts.bagroom} />
          <StatusCard location="player" count={counts.player} />
          <StatusCard location="course" count={counts.course} />
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Recent Bags in Bagroom</Text>
          </View>
          {recentBags.length > 0 ? (
            recentBags.map((bag) => (
              <BagListItem
                key={bag.id}
                bag={bag}
                member={getMemberById(bag.memberId)!}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No bags in bagroom</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  clubName: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  viewAllButton: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  viewAllText: {
    color: colors.primary,
    fontWeight: '500',
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
});