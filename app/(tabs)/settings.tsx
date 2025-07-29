import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Bell, HelpCircle, LogOut, User, Building } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/store/themeStore';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const { user, logout } = useAuthStore();
  const { colors } = useTheme();

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const toggleNotifications = () => {
    setNotifications(!notifications);
    handlePress();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            console.log('Logout button pressed');
            logout();
            // Force navigation to auth screen
            setTimeout(() => {
              router.replace('/auth/login');
            }, 100);
          },
        },
      ]
    );
  };



  const styles = createStyles(colors);

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={() => {
        handlePress();
        onPress && onPress();
      }}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        {icon}
        <Text style={styles.settingItemText}>{title}</Text>
      </View>
      {rightElement || <ChevronRight size={20} color={colors.textSecondary} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.accountCard}>
            <View style={styles.accountInfo}>
              <View style={styles.accountHeader}>
                <User size={20} color={colors.primary} />
                <Text style={styles.accountName}>{user?.username}</Text>
              </View>
              <View style={styles.accountDetail}>
                <Building size={16} color={colors.textSecondary} />
                <Text style={styles.accountText}>{user?.clubName}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {renderSettingItem(
            <Bell size={20} color={colors.primary} style={styles.settingIcon} />,
            'Notifications',
            undefined,
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.inactive, true: colors.primary }}
              thumbColor="white"
            />
          )}
        </View>



        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {renderSettingItem(
            <HelpCircle size={20} color={colors.primary} style={styles.settingIcon} />,
            'Help Center',
            () => router.push('/help-center')
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="white" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Version 1.0.0</Text>
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },
  accountCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  accountInfo: {
    gap: 8,
  },
  accountHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 4,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginLeft: 8,
  },
  accountDetail: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  accountText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  expiryText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic' as const,
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  settingItemLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingItemText: {
    fontSize: 16,
    color: colors.text,
  },
  logoutButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.danger,
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  versionText: {
    textAlign: 'center' as const,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
});