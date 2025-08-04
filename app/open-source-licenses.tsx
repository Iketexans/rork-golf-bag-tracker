import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';

export default function OpenSourceLicensesScreen() {
  const { colors } = useTheme();
  
  const renderLicense = (name: string, license: string, description?: string) => (
    <View style={styles.licenseItem}>
      <Text style={styles.licenseName}>{name}</Text>
      {description && <Text style={styles.licenseDescription}>{description}</Text>}
      <Text style={styles.licenseType}>{license}</Text>
    </View>
  );

  const styles = createStyles(colors);
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Open Source Licenses',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Open Source Licenses</Text>
          <Text style={styles.subtitle}>
            ClubCaddy Pro is built using various open source libraries and frameworks. 
            We are grateful to the open source community for their contributions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Core Framework</Text>
          
          {renderLicense(
            'React Native',
            'MIT License',
            'A framework for building native apps using React'
          )}
          
          {renderLicense(
            'Expo',
            'MIT License',
            'An open-source platform for making universal native apps'
          )}
          
          {renderLicense(
            'React',
            'MIT License',
            'A JavaScript library for building user interfaces'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation & Routing</Text>
          
          {renderLicense(
            'Expo Router',
            'MIT License',
            'File-based routing for React Native and web'
          )}
          
          {renderLicense(
            'React Navigation',
            'MIT License',
            'Routing and navigation for React Native apps'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UI Components & Icons</Text>
          
          {renderLicense(
            'Lucide React Native',
            'ISC License',
            'Beautiful & consistent icon toolkit'
          )}
          
          {renderLicense(
            'React Native Safe Area Context',
            'MIT License',
            'A flexible way to handle safe area insets'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Development Tools</Text>
          
          {renderLicense(
            'TypeScript',
            'Apache License 2.0',
            'A typed superset of JavaScript'
          )}
          
          {renderLicense(
            'ESLint',
            'MIT License',
            'A tool for identifying and reporting on patterns in JavaScript'
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This app is built with love and respect for the open source community. 
            All licenses are respected and maintained according to their terms.
            
            © 2025 ClubCaddy Pro Technologies. All rights reserved.
          </Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
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
  licenseItem: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  licenseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  licenseDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  licenseType: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  footer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});