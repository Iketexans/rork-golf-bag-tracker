import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { X, Package, User, DollarSign, Calendar } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useOrderStore } from '@/store/orderStore';
import { useBagStore } from '@/store/bagStore';
import { OrderType, OrderPriority } from '@/types/order';
import * as Haptics from 'expo-haptics';

interface CreateOrderModalProps {
  visible: boolean;
  onClose: () => void;
  preselectedBagId?: string;
}

export default function CreateOrderModal({ visible, onClose, preselectedBagId }: CreateOrderModalProps) {
  const [selectedBagId, setSelectedBagId] = useState(preselectedBagId || '');
  const [orderType, setOrderType] = useState<OrderType>('regroup');
  const [priority, setPriority] = useState<OrderPriority>('medium');
  const [description, setDescription] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [targetLocation, setTargetLocation] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [dueDate, setDueDate] = useState('');

  const { createOrder } = useOrderStore();
  const { bags, getMemberById } = useBagStore();

  const resetForm = () => {
    setSelectedBagId(preselectedBagId || '');
    setOrderType('regroup');
    setPriority('medium');
    setDescription('');
    setRequestedBy('');
    setNotes('');
    setTargetLocation('');
    setEstimatedCost('');
    setDueDate('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedBagId || !description.trim() || !requestedBy.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const selectedBag = bags.find(bag => bag.id === selectedBagId);
    if (!selectedBag) {
      Alert.alert('Error', 'Selected bag not found');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    createOrder({
      bagId: selectedBagId,
      memberId: selectedBag.memberId,
      type: orderType,
      status: 'pending',
      priority,
      description: description.trim(),
      requestedBy: requestedBy.trim(),
      notes: notes.trim() || undefined,
      targetLocation: (orderType === 'move' || orderType === 'ship') ? targetLocation : undefined,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });

    Alert.alert('Success', 'Order created successfully');
    handleClose();
  };

  const getOrderTypeDescription = (type: OrderType) => {
    switch (type) {
      case 'regroup': return 'Reorganize clubs in bag';
      case 'move': return 'Move bag to different location';
      case 'clean': return 'Clean bag and clubs';
      case 'repair': return 'Repair bag or equipment';
      case 'regrip': return 'Replace club grips';
      case 'ship': return 'Ship clubs to destination';
      case 'storage': return 'Store bag for extended period';
      case 'maintenance': return 'General maintenance service';
      default: return '';
    }
  };

  const renderTypeButton = (type: OrderType, label: string) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        orderType === type && styles.optionButtonActive,
      ]}
      onPress={() => setOrderType(type)}
    >
      <Text
        style={[
          styles.optionButtonText,
          orderType === type && styles.optionButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderPriorityButton = (prio: OrderPriority, label: string, color: string) => (
    <TouchableOpacity
      style={[
        styles.priorityButton,
        priority === prio && { backgroundColor: color },
      ]}
      onPress={() => setPriority(prio)}
    >
      <Text
        style={[
          styles.priorityButtonText,
          priority === prio && styles.priorityButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const needsLocation = orderType === 'move' || orderType === 'ship';
  const needsCost = orderType === 'regrip' || orderType === 'ship' || orderType === 'repair';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Service Order</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Select Bag *</Text>
            <ScrollView style={styles.bagSelector} nestedScrollEnabled>
              {bags.map((bag) => {
                const member = getMemberById(bag.memberId);
                return (
                  <TouchableOpacity
                    key={bag.id}
                    style={[
                      styles.bagOption,
                      selectedBagId === bag.id && styles.bagOptionActive,
                    ]}
                    onPress={() => setSelectedBagId(bag.id)}
                  >
                    <Package size={16} color={selectedBagId === bag.id ? 'white' : colors.primary} />
                    <View style={styles.bagOptionText}>
                      <Text
                        style={[
                          styles.bagOptionName,
                          selectedBagId === bag.id && styles.bagOptionNameActive,
                        ]}
                      >
                        {member?.name} - {bag.bagNumber}
                      </Text>
                      <Text
                        style={[
                          styles.bagOptionLocation,
                          selectedBagId === bag.id && styles.bagOptionLocationActive,
                        ]}
                      >
                        Currently: {bag.location}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Service Type *</Text>
            <View style={styles.optionGrid}>
              {renderTypeButton('regroup', 'Regroup')}
              {renderTypeButton('move', 'Move')}
              {renderTypeButton('clean', 'Clean')}
              {renderTypeButton('repair', 'Repair')}
              {renderTypeButton('regrip', 'Regrip')}
              {renderTypeButton('ship', 'Ship')}
              {renderTypeButton('storage', 'Storage')}
              {renderTypeButton('maintenance', 'Maintenance')}
            </View>
            <Text style={styles.typeDescription}>
              {getOrderTypeDescription(orderType)}
            </Text>
          </View>

          {needsLocation && (
            <View style={styles.section}>
              <Text style={styles.label}>
                {orderType === 'ship' ? 'Shipping Destination *' : 'Target Location *'}
              </Text>
              <TextInput
                style={styles.input}
                value={targetLocation}
                onChangeText={setTargetLocation}
                placeholder={orderType === 'ship' ? 'Enter destination address' : 'Where should the bag be moved?'}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          )}

          {needsCost && (
            <View style={styles.section}>
              <Text style={styles.label}>Estimated Cost</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={estimatedCost}
                  onChangeText={setEstimatedCost}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>Due Date</Text>
            <View style={styles.inputContainer}>
              <Calendar size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD (optional)"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Priority *</Text>
            <View style={styles.priorityGrid}>
              {renderPriorityButton('low', 'Low', colors.textSecondary)}
              {renderPriorityButton('medium', 'Medium', colors.secondary)}
              {renderPriorityButton('high', 'High', colors.warning)}
              {renderPriorityButton('urgent', 'Urgent', colors.danger)}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Service Description *</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the service needed in detail..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Requested By *</Text>
            <View style={styles.inputContainer}>
              <User size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={requestedBy}
                onChangeText={setRequestedBy}
                placeholder="Pro Shop, Member, Caddie Master, etc."
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder="Special instructions, member preferences, etc..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={2}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Create Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
  },
  bagSelector: {
    maxHeight: 150,
  },
  bagOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bagOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bagOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  bagOptionName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  bagOptionNameActive: {
    color: 'white',
  },
  bagOptionLocation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bagOptionLocationActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    minWidth: '22%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionButtonText: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 12,
  },
  optionButtonTextActive: {
    color: 'white',
  },
  typeDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  priorityGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  priorityButtonTextActive: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});