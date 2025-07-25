import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useBagStore } from '@/store/bagStore';
import colors from '@/constants/colors';
import { formatDateTime } from '@/utils/dateUtils';
import LocationStatusButton from '@/components/LocationStatusButton';
import { BagLocation } from '@/types/bag';
import { Save, Edit2, Share, ExternalLink, ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { shareBag } from '@/utils/linkUtils';

export default function BagDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getBagById, getMemberById, updateBagLocation, updateBagNotes } = useBagStore();
  
  const bag = getBagById(id);
  const member = bag ? getMemberById(bag.memberId) : undefined;
  
  const [notes, setNotes] = useState(bag?.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  if (!bag || !member) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Bag not found</Text>
      </View>
    );
  }

  const handleLocationChange = (location: BagLocation) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    updateBagLocation(bag.id, location);
  };

  const handleSaveNotes = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    updateBagNotes(bag.id, notes);
    setIsEditingNotes(false);
  };

  const handleShare = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const result = await shareBag(bag.id, member.name, bag.bagNumber);
    
    if (result.success) {
      if (result.message) {
        Alert.alert('Success', result.message);
      }
    } else {
      Alert.alert('Error', 'Failed to share bag link');
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: `${member.name} - Bag ${bag.bagNumber}`,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
        }} 
      />
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
          <View style={styles.bagNumberContainer}>
            <Text style={styles.bagNumberLabel}>Bag Number:</Text>
            <Text style={styles.bagNumber}>{bag.bagNumber}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Location</Text>
        <View style={styles.locationButtons}>
          <LocationStatusButton
            location="bagroom"
            currentLocation={bag.location}
            onPress={handleLocationChange}
          />
          <LocationStatusButton
            location="player"
            currentLocation={bag.location}
            onPress={handleLocationChange}
          />
          <LocationStatusButton
            location="course"
            currentLocation={bag.location}
            onPress={handleLocationChange}
          />
        </View>
        <Text style={styles.lastUpdated}>
          Last updated: {formatDateTime(new Date(bag.lastUpdated))}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.notesHeader}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {!isEditingNotes ? (
            <TouchableOpacity
              onPress={() => setIsEditingNotes(true)}
              style={styles.editButton}
            >
              <Edit2 size={16} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSaveNotes}
              style={styles.saveButton}
            >
              <Save size={16} color={colors.primary} />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
        {isEditingNotes ? (
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Add notes about this bag..."
            placeholderTextColor={colors.textSecondary}
          />
        ) : (
          <Text style={styles.notesText}>
            {notes || "No notes available."}
          </Text>
        )}
      </View>

      <View style={styles.linkSection}>
        <Text style={styles.linkSectionTitle}>Quick Actions</Text>
        <Text style={styles.linkDescription}>
          Share this bag with other staff members or access it quickly via link
        </Text>
        <TouchableOpacity style={styles.linkButton} onPress={handleShare}>
          <ExternalLink size={16} color={colors.primary} />
          <Text style={styles.linkButtonText}>Share Bag Link</Text>
        </TouchableOpacity>
      </View>
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  profileImagePlaceholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImagePlaceholderText: {
    color: 'white',
    fontSize: 28,
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
    marginBottom: 8,
  },
  bagNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bagNumberLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 4,
  },
  bagNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  shareButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
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
  locationButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  notesInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  linkSection: {
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
  linkSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  linkDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkButtonText: {
    color: colors.primary,
    marginLeft: 8,
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