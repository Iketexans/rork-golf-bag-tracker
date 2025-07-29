import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Mail, Phone, ExternalLink } from 'lucide-react-native';
import { useTheme } from '@/store/themeStore';

export default function HelpCenterScreen() {
  const { colors } = useTheme();
  
  const handleEmailPress = () => {
    Linking.openURL('mailto:bagroomcaddy.com');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+18325705545');
  };

  const renderFAQItem = (question: string, answer: string) => (
    <View style={styles.faqItem}>
      <Text style={styles.faqQuestion}>{question}</Text>
      <Text style={styles.faqAnswer}>{answer}</Text>
    </View>
  );

  const renderContactOption = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.contactOption} onPress={onPress}>
      <View style={styles.contactIconContainer}>
        {icon}
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
      <ExternalLink size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const styles = createStyles(colors);
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Help Center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          
          {renderContactOption(
            <Mail size={24} color={colors.primary} />,
            'Email Support',
            'bagroomcaddy.com',
            handleEmailPress
          )}
          
          {renderContactOption(
            <Phone size={24} color={colors.primary} />,
            'Phone Support',
            '832-570-5545',
            handlePhonePress
          )}
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {renderFAQItem(
            'How do I add a new bag to the system?',
            'Navigate to the Bags tab and tap the "+" button. Fill in the member information and bag details, then tap "Add Bag" to save.'
          )}
          
          {renderFAQItem(
            'How do I create a work order?',
            'Go to the Orders tab and tap the "+" button. Select the bag you want to create an order for, add the service details, and tap "Create Order".'
          )}
          
          {renderFAQItem(
            'How do I delete a bag or order?',
            'Swipe left on any bag or order item to reveal the delete option. Tap the delete button to remove the item.'
          )}
          
          {renderFAQItem(
            'Can I search for specific bags or orders?',
            'Yes! Use the Search tab to find bags by member name, phone number, or bag details. You can also search for orders by service type or status.'
          )}
          
          {renderFAQItem(
            'How do I change my subscription plan?',
            'Go to Settings > Manage Subscription to view and change your current plan. You can upgrade or downgrade at any time.'
          )}
          
          {renderFAQItem(
            'What happens if my subscription expires?',
            'You\'ll receive notifications before your subscription expires. After expiration, you\'ll have limited access until you renew your subscription.'
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
  backButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
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
  contactOption: {
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
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  faqItem: {
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
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  resourceSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
});