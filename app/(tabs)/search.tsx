import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useBagStore } from '@/store/bagStore';
import BagListItem from '@/components/BagListItem';
import SearchBar from '@/components/SearchBar';
import { useTheme } from '@/store/themeStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search as SearchIcon } from 'lucide-react-native';

export default function SearchScreen() {
  const { colors } = useTheme();
  const { getFilteredBags, getMemberById, setSearchQuery, searchQuery } = useBagStore();
  
  const filteredBags = getFilteredBags();

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
    listContent: {
      paddingBottom: 16,
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
    placeholderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 100,
    },
    placeholderIcon: {
      marginBottom: 16,
      opacity: 0.5,
    },
    placeholderText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>
      
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by name, ID, or bag number..."
      />
      
      {searchQuery.length > 0 ? (
        <FlatList
          data={filteredBags}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BagListItem bag={item} member={getMemberById(item.memberId)!} />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No results found</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <SearchIcon size={64} color={colors.textSecondary} style={styles.placeholderIcon} />
          <Text style={styles.placeholderText}>
            Search for members, bags, or IDs
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

