import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function PrivacyPolicyScreen() {
  const renderSection = (title: string, content: string) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Privacy Policy',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last updated: December 2024</Text>
        </View>

        {renderSection(
          'Information We Collect',
          'Bagroom Caddy collects information necessary to provide our golf club bagroom management services. This includes member information (names, contact details), bag details, and service orders that you input into the app. We also collect usage data to improve our services and ensure proper functionality.'
        )}

        {renderSection(
          'How We Use Your Information',
          'We use the collected information to provide bagroom management services, track golf bags and orders, facilitate communication between club staff and members, and improve our app functionality. Your data is used solely for the purpose of delivering our services to your golf club.'
        )}

        {renderSection(
          'Data Storage and Security',
          'Your data is stored securely using industry-standard encryption and security measures. We implement appropriate technical and organizational safeguards to protect your information against unauthorized access, alteration, disclosure, or destruction.'
        )}

        {renderSection(
          'Data Sharing',
          'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with trusted service providers who assist us in operating our app, conducting our business, or serving our users.'
        )}

        {renderSection(
          'Data Retention',
          'We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. When you discontinue use of our services, we will delete or anonymize your personal information in accordance with applicable laws.'
        )}

        {renderSection(
          'Your Rights',
          'You have the right to access, update, or delete your personal information. You may also request that we restrict or stop processing your data. To exercise these rights, please contact us using the information provided in our app.'
        )}

        {renderSection(
          'Changes to This Policy',
          'We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy in the app and updating the "last updated" date. Your continued use of the app after changes constitutes acceptance of the updated policy.'
        )}

        {renderSection(
          'Contact Us',
          'If you have any questions about this privacy policy or our data practices, please contact us at bagroomcaddy.com or call 832-570-5545.'
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
});