import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Globe, Mail, MapPin } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';

export default function AboutScreen() {
  const { colors } = useTheme();
  
  const handleWebsitePress = () => {
    Linking.openURL('https://www.bagroomcaddy.com');
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:bagroomcaddy.com');
  };

  const renderInfoItem = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    onPress?: () => void
  ) => (
    <TouchableOpacity 
      style={styles.infoItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.infoIconContainer}>
        {icon}
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFeature = (title: string, description: string) => (
    <View style={styles.featureItem}>
      <View style={styles.featureBullet} />
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );

  const styles = createStyles(colors);
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'About',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Logo/Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/80x80/4F46E5/FFFFFF?text=Logo' }}
              style={styles.logo}
            />
          </View>
          <Text style={styles.appName}>Bagroom Caddy</Text>
          <Text style={styles.appTagline}>Professional Golf Club Management</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Information</Text>
          
          {renderInfoItem(
            <Globe size={24} color={colors.primary} />,
            'Website',
            'www.bagroomcaddy.com',
            handleWebsitePress
          )}
          
          {renderInfoItem(
            <Mail size={24} color={colors.primary} />,
            'Contact Email',
            'bagroomcaddy.com',
            handleEmailPress
          )}
          
          {renderInfoItem(
            <MapPin size={24} color={colors.primary} />,
            'Location',
            'Houston, Texas, United States'
          )}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This App</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              Bagroom Caddy is a specialized app designed to streamline and enhance the management of members&apos; golf bags at clubs. By providing precise, real-time tracking and organization, the app ensures an efficient and seamless bagroom operation, reducing errors and wait times. With a user-friendly interface tailored for club staff, Bagroom Caddy supports elevated member service, helping clubs maintain their high standards of professionalism and care. Our goal is to simplify bag tracking so clubs can focus on delivering an exceptional experience to their members.
            </Text>
          </View>
        </View>

        {/* Key Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          
          {renderFeature(
            'Bag Management',
            'Easily track and manage member golf bags with detailed information and status updates.'
          )}
          
          {renderFeature(
            'Order Tracking',
            'Create and monitor work orders with real-time status updates and completion tracking.'
          )}
          
          {renderFeature(
            'Smart Search',
            'Quickly find bags and orders using our powerful search functionality.'
          )}
        </View>



        {/* Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credits</Text>
          <View style={styles.creditsCard}>
            <Text style={styles.creditsText}>
              Bagroom Caddy was created by a former member services professional with firsthand experience in club operations. Special thanks to the early users and club partners for their valuable feedback. Built to improve efficiency and elevate service.
            </Text>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          <TouchableOpacity 
            style={styles.legalItem}
            onPress={() => router.push('/privacy-policy')}
          >
            <Text style={styles.legalText}>Privacy Policy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.legalItem}
            onPress={() => router.push('/terms-of-service')}
          >
            <Text style={styles.legalText}>Terms of Service</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.legalItem}
            onPress={() => router.push('/open-source-licenses')}
          >
            <Text style={styles.legalText}>Open Source Licenses</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>
          © 2024 Bagroom Caddy. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  aboutCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  aboutText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  creditsCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  creditsText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  creditsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  legalItem: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  legalText: {
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
  },
  copyright: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
});