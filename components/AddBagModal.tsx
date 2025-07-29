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
import { X, Upload, User, Hash, FileSpreadsheet, FileText } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useBagStore } from '@/store/bagStore';
import { BagLocation } from '@/types/bag';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import * as XLSX from 'xlsx';

interface AddBagModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddBagModal({ visible, onClose }: AddBagModalProps) {
  const [memberName, setMemberName] = useState('');
  const [membershipId, setMembershipId] = useState('');
  const [bagNumber, setBagNumber] = useState('');
  const [location, setLocation] = useState<BagLocation>('bagroom');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const { addBag, addMember } = useBagStore();

  const resetForm = () => {
    setMemberName('');
    setMembershipId('');
    setBagNumber('');
    setLocation('bagroom');
    setNotes('');
    setUploadedFile(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!memberName.trim() || !bagNumber.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Create new member
    const memberId = Date.now().toString();
    addMember({
      id: memberId,
      name: memberName.trim(),
      membershipId: membershipId.trim() || undefined,
    });

    // Create new bag
    addBag({
      id: (Date.now() + 1).toString(),
      memberId,
      bagNumber: bagNumber.trim(),
      location,
      lastUpdated: new Date().toISOString(),
      notes: notes.trim() || undefined,
    });

    Alert.alert('Success', 'Bag added successfully');
    handleClose();
  };

  const handleFileUpload = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/csv',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setUploadedFile(file.name);
        
        // Process the file immediately
        await processUploadedFile(file);
      }
    } catch (error) {
      console.error('File upload error:', error);
      Alert.alert('Error', 'Failed to upload file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const processUploadedFile = async (file: any) => {
    try {
      console.log('Processing file:', file.name, 'URI:', file.uri);
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      let extractedData: Array<{memberName: string, bagNumber: string, membershipId?: string}> = [];
      
      if (fileExtension === 'csv' || fileExtension === 'xlsx' || fileExtension === 'xls') {
        extractedData = await processSpreadsheetFile(file);
      } else if (fileExtension === 'docx' || fileExtension === 'doc' || fileExtension === 'txt') {
        extractedData = await processTextFile(file);
      } else {
        Alert.alert('Unsupported Format', 'Please upload an Excel (.xlsx, .xls), CSV (.csv), Word (.docx, .doc), or text (.txt) file.');
        return;
      }
      
      if (extractedData.length > 0) {
        Alert.alert(
          'File Processed Successfully',
          `Found ${extractedData.length} entries in "${file.name}".\n\nWould you like to import these bags?`,
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Import All',
              onPress: () => importBagsFromData(extractedData)
            }
          ]
        );
      } else {
        Alert.alert('No Data Found', 'The file appears to be empty or contains no valid member/bag data. Please ensure your file has columns for member names and bag numbers.');
      }
    } catch (error) {
      console.error('File processing error:', error);
      Alert.alert('Processing Error', 'Failed to process the uploaded file. Please check the file format and try again.');
    }
  };

  const processSpreadsheetFile = async (file: any): Promise<Array<{memberName: string, bagNumber: string, membershipId?: string}>> => {
    try {
      let fileContent: string;
      
      if (Platform.OS === 'web') {
        // For web, file.uri might be a blob URL or data URL
        const response = await fetch(file.uri);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        return parseWorkbook(workbook);
      } else {
        // For mobile, read the file from the URI
        const fileInfo = await FileSystem.getInfoAsync(file.uri);
        if (!fileInfo.exists) {
          throw new Error('File does not exist');
        }
        
        if (file.name.toLowerCase().endsWith('.csv')) {
          // Handle CSV files
          fileContent = await FileSystem.readAsStringAsync(file.uri);
          return parseCSV(fileContent);
        } else {
          // Handle Excel files
          const base64 = await FileSystem.readAsStringAsync(file.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const workbook = XLSX.read(base64, { type: 'base64' });
          return parseWorkbook(workbook);
        }
      }
    } catch (error) {
      console.error('Error processing spreadsheet:', error);
      throw error;
    }
  };

  const parseWorkbook = (workbook: XLSX.WorkBook): Array<{memberName: string, bagNumber: string, membershipId?: string}> => {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    return parseTableData(jsonData);
  };

  const parseCSV = (csvContent: string): Array<{memberName: string, bagNumber: string, membershipId?: string}> => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    const data = lines.map(line => {
      // Simple CSV parsing - handle quoted fields
      const fields = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      fields.push(current.trim());
      return fields;
    });
    
    return parseTableData(data);
  };

  const parseTableData = (data: any[][]): Array<{memberName: string, bagNumber: string, membershipId?: string}> => {
    if (data.length === 0) return [];
    
    const results: Array<{memberName: string, bagNumber: string, membershipId?: string}> = [];
    
    // Try to find header row and identify columns
    let headerRowIndex = -1;
    let nameColIndex = -1;
    let bagColIndex = -1;
    let memberIdColIndex = -1;
    
    // Look for headers in first few rows
    for (let i = 0; i < Math.min(3, data.length); i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      
      for (let j = 0; j < row.length; j++) {
        const cell = String(row[j] || '').toLowerCase().trim();
        
        if (cell.includes('name') || cell.includes('member')) {
          nameColIndex = j;
          headerRowIndex = i;
        }
        if (cell.includes('bag') || cell.includes('number')) {
          bagColIndex = j;
          headerRowIndex = i;
        }
        if (cell.includes('id') || cell.includes('membership')) {
          memberIdColIndex = j;
        }
      }
      
      if (nameColIndex >= 0 && bagColIndex >= 0) break;
    }
    
    // If no headers found, assume first column is name, second is bag number
    if (nameColIndex === -1 || bagColIndex === -1) {
      nameColIndex = 0;
      bagColIndex = 1;
      memberIdColIndex = 2;
      headerRowIndex = -1; // No header row
    }
    
    // Process data rows
    const startRow = headerRowIndex + 1;
    for (let i = startRow; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      
      const memberName = String(row[nameColIndex] || '').trim();
      const bagNumber = String(row[bagColIndex] || '').trim();
      const membershipId = memberIdColIndex >= 0 ? String(row[memberIdColIndex] || '').trim() : '';
      
      if (memberName && bagNumber) {
        results.push({
          memberName,
          bagNumber,
          membershipId: membershipId || undefined
        });
      }
    }
    
    return results;
  };

  const processTextFile = async (file: any): Promise<Array<{memberName: string, bagNumber: string, membershipId?: string}>> => {
    try {
      let fileContent: string;
      
      if (Platform.OS === 'web') {
        const response = await fetch(file.uri);
        fileContent = await response.text();
      } else {
        fileContent = await FileSystem.readAsStringAsync(file.uri);
      }
      
      const results: Array<{memberName: string, bagNumber: string, membershipId?: string}> = [];
      const lines = fileContent.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        // Try to extract name and bag number from various formats
        // Format 1: "Name - Bag123" or "Name: Bag123"
        let match = line.match(/^(.+?)\s*[-:]\s*([A-Za-z0-9]+)\s*(.*)$/);
        if (match) {
          const memberName = match[1].trim();
          const bagNumber = match[2].trim();
          const membershipId = match[3].trim() || undefined;
          
          if (memberName && bagNumber) {
            results.push({ memberName, bagNumber, membershipId });
            continue;
          }
        }
        
        // Format 2: "Name Bag123" (space separated)
        match = line.match(/^(.+?)\s+([A-Za-z0-9]+)\s*(.*)$/);
        if (match) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 2) {
            const bagNumber = parts[parts.length - 1];
            const memberName = parts.slice(0, -1).join(' ');
            
            if (memberName && bagNumber && /[A-Za-z0-9]/.test(bagNumber)) {
              results.push({ memberName, bagNumber });
            }
          }
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error processing text file:', error);
      throw error;
    }
  };
  
  const importBagsFromData = (data: Array<{memberName: string, bagNumber: string, membershipId?: string}>) => {
    let importedCount = 0;
    
    data.forEach((item, index) => {
      try {
        // Create new member
        const memberId = (Date.now() + index).toString();
        addMember({
          id: memberId,
          name: item.memberName,
          membershipId: item.membershipId,
        });

        // Create new bag
        addBag({
          id: (Date.now() + index + 1000).toString(),
          memberId,
          bagNumber: item.bagNumber,
          location: 'bagroom',
          lastUpdated: new Date().toISOString(),
        });
        
        importedCount++;
      } catch (error) {
        console.error(`Failed to import item ${index}:`, error);
      }
    });
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Alert.alert(
      'Import Complete',
      `Successfully imported ${importedCount} bags from the file.`,
      [{ text: 'OK', onPress: handleClose }]
    );
  };

  const renderLocationButton = (loc: BagLocation, label: string) => (
    <TouchableOpacity
      style={[
        styles.locationButton,
        location === loc && styles.locationButtonActive,
      ]}
      onPress={() => setLocation(loc)}
    >
      <Text
        style={[
          styles.locationButtonText,
          location === loc && styles.locationButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Bag</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Import from File</Text>
            <Text style={styles.sectionDescription}>
              Upload an Excel spreadsheet or CSV file containing member and bag information
            </Text>
            
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleFileUpload}
              disabled={isLoading}
            >
              <View style={styles.uploadButtonContent}>
                {isLoading ? (
                  <Text style={styles.uploadButtonText}>Processing...</Text>
                ) : (
                  <>
                    <Upload size={24} color={colors.primary} />
                    <View style={styles.uploadTextContainer}>
                      <Text style={styles.uploadButtonText}>
                        Upload Spreadsheet or Document
                      </Text>
                      <Text style={styles.uploadButtonSubtext}>
                        Excel, CSV, or Word documents supported
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {uploadedFile && (
              <View style={styles.uploadedFileContainer}>
                <FileSpreadsheet size={16} color={colors.success} />
                <Text style={styles.uploadedFileName}>{uploadedFile}</Text>
              </View>
            )}

            <View style={styles.supportedFormats}>
              <Text style={styles.supportedFormatsTitle}>Supported formats:</Text>
              <View style={styles.formatsList}>
                <View style={styles.formatItem}>
                  <FileSpreadsheet size={16} color={colors.textSecondary} />
                  <Text style={styles.formatText}>Excel (.xlsx, .xls)</Text>
                </View>
                <View style={styles.formatItem}>
                  <FileText size={16} color={colors.textSecondary} />
                  <Text style={styles.formatText}>CSV (.csv)</Text>
                </View>
                <View style={styles.formatItem}>
                  <FileText size={16} color={colors.textSecondary} />
                  <Text style={styles.formatText}>Word (.docx, .doc)</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.orText}>OR</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manual Entry</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Member Name *</Text>
              <View style={styles.inputContainer}>
                <User size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={memberName}
                  onChangeText={setMemberName}
                  placeholder="Enter member name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Membership ID (Optional)</Text>
              <View style={styles.inputContainer}>
                <Hash size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={membershipId}
                  onChangeText={setMembershipId}
                  placeholder="Enter membership ID (optional)"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bag Number *</Text>
              <View style={styles.inputContainer}>
                <Hash size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={bagNumber}
                  onChangeText={setBagNumber}
                  placeholder="Enter bag number"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Initial Location</Text>
              <View style={styles.locationButtons}>
                {renderLocationButton('bagroom', 'Bagroom')}
                {renderLocationButton('player', 'With Player')}
                {renderLocationButton('course', 'On Course')}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={styles.textArea}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes about this bag..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Add Bag</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  uploadButton: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  uploadButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextContainer: {
    marginLeft: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  uploadButtonSubtext: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  uploadedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  uploadedFileName: {
    color: colors.success,
    marginLeft: 8,
    fontWeight: '500',
  },
  supportedFormats: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  supportedFormatsTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  formatsList: {
    gap: 4,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formatText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  orText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
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
  locationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  locationButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  locationButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  locationButtonText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  locationButtonTextActive: {
    color: 'white',
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