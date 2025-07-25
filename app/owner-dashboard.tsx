import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import colors from '@/constants/colors';
import { Users, Plus, Trash2, Calendar, DollarSign, Building, Mail, User, X } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function OwnerDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    email: '',
    username: '',
    password: '',
    clubName: '',
  });
  
  const { user, clubAccounts, createClubAccount, deleteClubAccount, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      router.replace('/auth/login');
    }
  }, [user]);

  const handleCreateAccount = async () => {
    if (!newAccount.email || !newAccount.username || !newAccount.password || !newAccount.clubName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const success = await createClubAccount(
      newAccount.email,
      newAccount.username,
      newAccount.password,
      newAccount.clubName
    );

    if (success) {
      Alert.alert('Success', 'Club account created successfully');
      setNewAccount({ email: '', username: '', password: '', clubName: '' });
      setShowCreateModal(false);
    } else {
      Alert.alert('Error', 'Username already exists or invalid data');
    }
  };

  const handleDeleteAccount = (accountId: string, clubName: string) => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete ${clubName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteClubAccount(accountId),
        },
      ]
    );
  };

  const getAccountStatus = (account: any) => {
    const now = new Date();
    
    if (account.subscriptionPlan && account.subscriptionExpiry) {
      const subscriptionEnd = new Date(account.subscriptionExpiry);
      if (now < subscriptionEnd) {
        return {
          status: 'Subscribed',
          color: colors.success,
          daysLeft: Math.ceil((subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        };
      }
    }
    
    const trialStart = new Date(account.trialStarted);
    const trialEnd = new Date(trialStart.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    if (now < trialEnd) {
      return {
        status: 'Trial',
        color: colors.warning,
        daysLeft: Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      };
    }
    
    return {
      status: 'Expired',
      color: colors.danger,
      daysLeft: 0,
    };
  };

  if (!user || user.role !== 'owner') {
    return null;
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Owner Dashboard',
          headerRight: () => (
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Building size={32} color={colors.primary} />
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>Welcome, {user.username}</Text>
              <Text style={styles.welcomeSubtitle}>Bagroom Caddy Owner Dashboard</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color="white" />
            <Text style={styles.createButtonText}>Create Club Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={24} color={colors.primary} />
            <Text style={styles.statNumber}>{clubAccounts.length}</Text>
            <Text style={styles.statLabel}>Total Clubs</Text>
          </View>
          
          <View style={styles.statCard}>
            <DollarSign size={24} color={colors.success} />
            <Text style={styles.statNumber}>
              {clubAccounts.filter(acc => acc.subscriptionPlan).length}
            </Text>
            <Text style={styles.statLabel}>Subscribed</Text>
          </View>
          
          <View style={styles.statCard}>
            <Calendar size={24} color={colors.warning} />
            <Text style={styles.statNumber}>
              {clubAccounts.filter(acc => !acc.subscriptionPlan).length}
            </Text>
            <Text style={styles.statLabel}>On Trial</Text>
          </View>
        </View>

        <View style={styles.accountsList}>
          <Text style={styles.sectionTitle}>Club Accounts</Text>
          
          {clubAccounts.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Club Accounts</Text>
              <Text style={styles.emptySubtitle}>Create your first club account to get started</Text>
            </View>
          ) : (
            clubAccounts.map((account) => {
              const status = getAccountStatus(account);
              return (
                <View key={account.id} style={styles.accountCard}>
                  <View style={styles.accountHeader}>
                    <View style={styles.accountInfo}>
                      <Text style={styles.clubName}>{account.clubName}</Text>
                      <Text style={styles.username}>@{account.username}</Text>
                      <Text style={styles.email}>{account.email}</Text>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteAccount(account.id, account.clubName)}
                    >
                      <Trash2 size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.accountDetails}>
                    <View style={styles.statusContainer}>
                      <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                        <Text style={styles.statusText}>{status.status}</Text>
                      </View>
                      {status.daysLeft > 0 && (
                        <Text style={styles.daysLeft}>{status.daysLeft} days left</Text>
                      )}
                    </View>
                    
                    <View style={styles.credentialsContainer}>
                      <Text style={styles.credentialsTitle}>Login Credentials:</Text>
                      <Text style={styles.credentialsText}>Username: {account.username}</Text>
                      <Text style={styles.credentialsText}>Password: {account.id}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Club Account</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCreateModal(false)}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Club Name</Text>
              <View style={styles.inputContainer}>
                <Building size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={newAccount.clubName}
                  onChangeText={(text) => setNewAccount({ ...newAccount, clubName: text })}
                  placeholder="Enter club name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={newAccount.email}
                  onChangeText={(text) => setNewAccount({ ...newAccount, email: text })}
                  placeholder="Enter email address"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputContainer}>
                <User size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={newAccount.username}
                  onChangeText={(text) => setNewAccount({ ...newAccount, username: text })}
                  placeholder="Enter username"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={newAccount.password}
                  onChangeText={(text) => setNewAccount({ ...newAccount, password: text })}
                  placeholder="This will be auto-generated"
                  placeholderTextColor={colors.textSecondary}
                  editable={false}
                />
              </View>
              <Text style={styles.helperText}>Password will be the account ID (auto-generated)</Text>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={handleCreateAccount}
            >
              <Text style={styles.createAccountButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  createButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoutText: {
    color: colors.primary,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  accountsList: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  accountCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  accountInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  username: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  accountDetails: {
    gap: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  daysLeft: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  credentialsContainer: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  credentialsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  credentialsText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  createAccountButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createAccountButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});