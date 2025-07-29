import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';

export default function TermsOfServiceScreen() {
  const { colors } = useTheme();
  
  const renderSection = (title: string, content: string) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{content}</Text>
    </View>
  );

  const styles = createStyles(colors);
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Terms of Service',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Terms of Service</Text>
          <Text style={styles.lastUpdated}>Last updated: July 2025</Text>
        </View>

        {renderSection(
          'Acceptance of Terms',
          'By accessing and using Bagroom Caddy, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
        )}

        {renderSection(
          'Description of Service',
          'Bagroom Caddy is a specialized application designed for golf clubs to manage member golf bags and related services. The app provides tools for tracking, organizing, and managing bagroom operations to enhance member service and operational efficiency.'
        )}

        {renderSection(
          'User Responsibilities',
          'Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account. You agree to use the service only for lawful purposes and in accordance with these terms. You are responsible for the accuracy of information entered into the system.'
        )}

        {renderSection(
          'Subscription and Payment',
          'Bagroom Caddy operates on a subscription basis. Payment terms and subscription details are provided during the signup process. Subscriptions automatically renew unless cancelled. Refunds are handled on a case-by-case basis in accordance with our refund policy.'
        )}

        {renderSection(
          'Data and Privacy',
          'Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these terms by reference. By using our service, you consent to the collection and use of information as outlined in our Privacy Policy.'
        )}

        {renderSection(
          'Service Availability',
          'We strive to maintain high service availability, but we do not guarantee uninterrupted access to the service. We may temporarily suspend access for maintenance, updates, or other operational reasons. We are not liable for any inconvenience caused by service interruptions.'
        )}

        {renderSection(
          'Limitation of Liability',
          'Bagroom Caddy and its developers shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the service. This includes but is not limited to damages for loss of profits, data, or other intangible losses.'
        )}

        {renderSection(
          'Termination',
          'We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these terms or is harmful to other users, us, or third parties, or for any other reason in our sole discretion.'
        )}

        {renderSection(
          'Changes to Terms',
          'We reserve the right to modify these terms at any time. We will notify users of significant changes through the app or via email. Your continued use of the service after changes constitutes acceptance of the new terms.'
        )}

        {renderSection(
          'Contact Information',
          'If you have any questions about these Terms of Service, please contact us at bagroomcaddy.com or call 832-570-5545.'
        )}
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