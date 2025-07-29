import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useBagStore } from '@/store/bagStore';
import SwipeableBagItem from '@/components/SwipeableBagItem';
import SearchBar from '@/components/SearchBar';
import AddBagModal from '@/components/AddBagModal';
import FloatingActionButton from '@/components/FloatingActionButton';
import { useTheme } from '@/store/themeStore';
import { BagLocation } from '@/types/bag';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star } from 'lucide-react-native';

export default function BagsScreen() {
  const { colors } = useTheme();
  const { getCurrentUserBags, getCurrentUserMembers, getMemberById, setSearchQuery, searchQuery, getStarredBags } = useBagStore();
  const bags = getCurrentUserBags();
  const members = getCurrentUserMembers();
  const [selectedLocation, setSelectedLocation] = useState<BagLocation | null>(null);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const starredBags = getStarredBags();

  const filteredBags = bags.filter(bag => {
    // Filter by location
    if (selectedLocation && bag.location !== selectedLocation) return false;
    
    // Filter by starred status
    if (showStarredOnly && !starredBags.some(starred => starred.id === bag.id)) return false;
    
    // Filter by search query
    if (searchQuery) {
      const member = members.find(m => m.id === bag.memberId);
      const query = searchQuery.toLowerCase();
      
      return (
        bag.bagNumber.toLowerCase().includes(query) ||
        member?.name.toLowerCase().includes(query) ||
        member?.membershipId.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const renderLocationFilter = () => {
    const locations: { label: string; value: BagLocation | null }[] = [
      { label: 'All', value: null },
      { label: 'In Bagroom', value: 'bagroom' },
      { label: 'With Player', value: 'player' },
      { label: 'On Course', value: 'course' },
    ];

    return (
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.starredFilter,
            showStarredOnly && styles.starredFilterActive,
          ]}
          onPress={() => setShowStarredOnly(!showStarredOnly)}
        >
          <Star
            size={16}
            color={showStarredOnly ? 'white' : colors.warning}
            fill={showStarredOnly ? 'white' : colors.warning}
          />
          <Text
            style={[
              styles.starredFilterText,
              showStarredOnly && styles.starredFilterTextActive,
            ]}
          >
            Playing Today ({starredBags.length})
          </Text>
        </TouchableOpacity>
        
        {locations.map((location) => (
          <TouchableOpacity
            key={location.label}
            style={[
              styles.filterButton,
              selectedLocation === location.value && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedLocation(location.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedLocation === location.value && styles.filterButtonTextActive,
              ]}
            >
              {location.label}
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
      flexWrap: 'wrap',
      marginBottom: 16,
      gap: 8,
    },
    starredFilter: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: 2,
      borderColor: colors.warning,
    },
    starredFilterActive: {
      backgroundColor: colors.warning,
      borderColor: colors.warning,
    },
    starredFilterText: {
      color: colors.warning,
      fontWeight: '600',
      marginLeft: 4,
      fontSize: 12,
    },
    starredFilterTextActive: {
      color: 'white',
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
    },
  });

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Bags</Text>
      </View>
      
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search bags..."
      />
      
      {renderLocationFilter()}
      
      <FlatList
        data={filteredBags}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SwipeableBagItem bag={item} member={getMemberById(item.memberId)!} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {showStarredOnly ? 'No bags marked for today' : 'No bags found'}
            </Text>
          </View>
        }
      />

      <FloatingActionButton onPress={() => setShowAddModal(true)} />

      <AddBagModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </SafeAreaView>
  );
}