import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import colors from '@/constants/colors';
import { Check, Crown, Calendar, DollarSign } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function SubscriptionScreen() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { setSubscription, isAuthenticated, isSubscriptionActive } = useAuthStore();
  const router = useRouter();

  // Check if user is already subscribed and redirect
  useEffect(() => {
    if (isAuthenticated && isSubscriptionActive) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isSubscriptionActive]);

  const plans = [
    {
      id: 'monthly' as const,
      name: 'Monthly Plan',
      price: '$225',
      period: 'per month',
      savings: null,
      features: [
        'Unlimited bag tracking',
        'Order management',
        'Member profiles',
        'Excel/CSV import',
        'Real-time updates',
        'Priority support',
      ],
    },
    {
      id: 'yearly' as const,
      name: 'Annual Plan',
      price: '$2,500',
      period: 'per year',
      savings: 'Save $200',
      features: [
        'Unlimited bag tracking',
        'Order management',
        'Member profiles',
        'Excel/CSV import',
        'Real-time updates',
        'Priority support',
      ],
    },
  ];

  const handleSelectPlan = (planId: 'monthly' | 'yearly') => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setSelectedPlan(planId);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }

    setIsLoading(true);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calculate expiry date
      const now = new Date();
      const expiryDate = selectedPlan === 'monthly' 
        ? new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
        : new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      
      setSubscription(selectedPlan, expiryDate.toISOString());
      
      Alert.alert(
        'Success!',
        'Your subscription has been activated. Welcome to Bagroom Caddy!',
        [
          {
            text: 'Get Started',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPlan = (plan: typeof plans[0]) => {
    const isSelected = selectedPlan === plan.id;
    const isPopular = plan.id === 'yearly';

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          isSelected && styles.planCardSelected,
          isPopular && styles.planCardPopular,
        ]}
        onPress={() => handleSelectPlan(plan.id)}
      >
        {isPopular && (
          <View style={styles.popularBadge}>
            <Crown size={16} color="white" />
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}
        
        <View style={styles.planHeader}>
          <Text style={[styles.planName, isSelected && styles.planNameSelected]}>
            {plan.name}
          </Text>
          {plan.savings && (
            <Text style={styles.savingsText}>{plan.savings}</Text>
          )}
        </View>

        <View style={styles.priceContainer}>
          <Text style={[styles.price, isSelected && styles.priceSelected]}>
            {plan.price}
          </Text>
          <Text style={[styles.period, isSelected && styles.periodSelected]}>
            {plan.period}
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Check 
                size={16} 
                color={isSelected ? 'white' : colors.success} 
                style={styles.featureIcon}
              />
              <Text style={[styles.featureText, isSelected && styles.featureTextSelected]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Check size={20} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Select the perfect plan for your golf club's bagroom management needs
        </Text>
      </View>

      <View style={styles.plansContainer}>
        {plans.map(renderPlan)}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.subscribeButton,
            !selectedPlan && styles.subscribeButtonDisabled,
            isLoading && styles.subscribeButtonLoading,
          ]}
          onPress={handleSubscribe}
          disabled={!selectedPlan || isLoading}
        >
          <DollarSign size={20} color="white" style={styles.subscribeIcon} />
          <Text style={styles.subscribeButtonText}>
            {isLoading ? 'Processing...' : 'Start Subscription'}
          </Text>
        </TouchableOpacity>

        <View style={styles.guaranteeContainer}>
          <Text style={styles.guaranteeText}>
            ✓ 30-day money-back guarantee
          </Text>
          <Text style={styles.guaranteeText}>
            ✓ Cancel anytime
          </Text>
          <Text style={styles.guaranteeText}>
            ✓ Secure payment processing
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  plansContainer: {
    gap: 16,
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  planCardPopular: {
    borderColor: colors.secondary,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 24,
    right: 24,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    maxWidth: 140,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  planNameSelected: {
    color: 'white',
  },
  savingsText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  priceSelected: {
    color: 'white',
  },
  period: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  periodSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  featureTextSelected: {
    color: 'white',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 16,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  subscribeButtonDisabled: {
    backgroundColor: colors.inactive,
  },
  subscribeButtonLoading: {
    opacity: 0.8,
  },
  subscribeIcon: {
    marginRight: 8,
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  guaranteeContainer: {
    alignItems: 'center',
    gap: 4,
  },
  guaranteeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});