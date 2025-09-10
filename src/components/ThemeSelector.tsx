// src/components/ThemeSelector.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface ThemeOption {
  value: 'light' | 'dark' | 'system';
  label: string;
  description: string;
  icon: string;
}

export const ThemeSelector: React.FC = () => {
  const { themeMode, setThemeMode, colors } = useTheme();
  const { t } = useLanguage();
  const [modalVisible, setModalVisible] = React.useState(false);

  const themeOptions: ThemeOption[] = [
    {
      value: 'light',
      label: t('theme.light'),
      description: t('theme.lightDescription'),
      icon: '☀️',
    },
    {
      value: 'dark',
      label: t('theme.dark'),
      description: t('theme.darkDescription'),
      icon: '🌙',
    },
    {
      value: 'system',
      label: t('theme.system'),
      description: t('theme.systemDescription'),
      icon: '⚙️',
    },
  ];

  const selectedOption = themeOptions.find(option => option.value === themeMode);

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.surface }]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.leftContent}>
          <Text style={styles.icon}>��</Text>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('settings.themeMode')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {selectedOption?.label}
            </Text>
          </View>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.selectedIcon}>{selectedOption?.icon}</Text>
          <Text style={styles.arrow}>›</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('settings.themeMode')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeButton, { color: colors.primary }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsContainer}>
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    { 
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                    themeMode === option.value && {
                      backgroundColor: colors.primary + '20',
                      borderColor: colors.primary,
                    }
                  ]}
                  onPress={() => {
                    setThemeMode(option.value);
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.optionLeft}>
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <View style={styles.optionText}>
                      <Text style={[styles.optionTitle, { color: colors.text }]}>
                        {option.label}
                      </Text>
                      <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  {themeMode === option.value && (
                    <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  arrow: {
    fontSize: 18,
    color: '#8E8E93',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionsContainer: {
    padding: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});