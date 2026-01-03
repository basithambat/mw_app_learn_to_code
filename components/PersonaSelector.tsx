/**
 * PersonaSelector Component
 * Allows users to switch between Anonymous and Verified personas when commenting
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useFirebaseAuth } from '@/config/firebaseAuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_USED_PERSONA_KEY = '@last_used_persona_id';

interface PersonaSelectorProps {
  selectedPersonaId: string | null;
  onPersonaChange: (personaId: string) => void;
  style?: any;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  selectedPersonaId,
  onPersonaChange,
  style,
}) => {
  const { personas } = useFirebaseAuth();
  const [modalVisible, setModalVisible] = useState(false);

  // Get selected persona details
  const selectedPersona = personas?.find(p => p.id === selectedPersonaId) || personas?.[0];
  const anonymousPersona = personas?.find(p => p.type === 'anonymous');
  const verifiedPersona = personas?.find(p => p.type === 'verified');

  // Load last used persona on mount
  useEffect(() => {
    const loadLastUsedPersona = async () => {
      try {
        const lastUsedId = await AsyncStorage.getItem(LAST_USED_PERSONA_KEY);
        if (lastUsedId && personas?.some(p => p.id === lastUsedId)) {
          onPersonaChange(lastUsedId);
        } else if (anonymousPersona) {
          // Default to anonymous
          onPersonaChange(anonymousPersona.id);
        }
      } catch (error) {
        console.warn('Failed to load last used persona:', error);
        if (anonymousPersona) {
          onPersonaChange(anonymousPersona.id);
        }
      }
    };

    if (personas && personas.length > 0) {
      loadLastUsedPersona();
    }
  }, [personas]);

  const handlePersonaSelect = async (personaId: string) => {
    onPersonaChange(personaId);
    setModalVisible(false);
    
    // Save last used persona
    try {
      await AsyncStorage.setItem(LAST_USED_PERSONA_KEY, personaId);
    } catch (error) {
      console.warn('Failed to save last used persona:', error);
    }
  };

  if (!personas || personas.length === 0) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[styles.selectorButton, style]}
        activeOpacity={0.7}
      >
        <View style={styles.selectorContent}>
          {selectedPersona?.avatarUrl ? (
            <Image
              source={{ uri: selectedPersona.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {selectedPersona?.displayName?.charAt(0)?.toUpperCase() || 'A'}
              </Text>
            </View>
          )}
          <View style={styles.selectorTextContainer}>
            <Text style={styles.selectorName} numberOfLines={1}>
              {selectedPersona?.displayName || 'Anonymous'}
            </Text>
            {selectedPersona?.badge && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>
                  {selectedPersona.badge === 'google_verified' ? '✓ Google' : '✓ Phone'}
                </Text>
              </View>
            )}
          </View>
          <AntDesign name="down" size={14} color="#666" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Identity</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <AntDesign name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.personaList}>
              {/* Anonymous Persona */}
              {anonymousPersona && (
                <TouchableOpacity
                  style={[
                    styles.personaOption,
                    selectedPersonaId === anonymousPersona.id && styles.personaOptionSelected,
                  ]}
                  onPress={() => handlePersonaSelect(anonymousPersona.id)}
                >
                  <View style={styles.personaOptionContent}>
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarText}>
                        {anonymousPersona.displayName?.charAt(0)?.toUpperCase() || 'A'}
                      </Text>
                    </View>
                    <View style={styles.personaOptionText}>
                      <Text style={styles.personaOptionName}>
                        {anonymousPersona.displayName || 'Anonymous'}
                      </Text>
                      <Text style={styles.personaOptionDescription}>
                        Others see only your handle
                      </Text>
                    </View>
                  </View>
                  {selectedPersonaId === anonymousPersona.id && (
                    <AntDesign name="checkcircle" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              )}

              {/* Verified Persona */}
              {verifiedPersona && (
                <TouchableOpacity
                  style={[
                    styles.personaOption,
                    selectedPersonaId === verifiedPersona.id && styles.personaOptionSelected,
                  ]}
                  onPress={() => handlePersonaSelect(verifiedPersona.id)}
                >
                  <View style={styles.personaOptionContent}>
                    {verifiedPersona.avatarUrl ? (
                      <Image
                        source={{ uri: verifiedPersona.avatarUrl }}
                        style={styles.avatar}
                      />
                    ) : (
                      <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>
                          {verifiedPersona.displayName?.charAt(0)?.toUpperCase() || 'V'}
                        </Text>
                      </View>
                    )}
                    <View style={styles.personaOptionText}>
                      <View style={styles.personaNameRow}>
                        <Text style={styles.personaOptionName}>
                          {verifiedPersona.displayName || 'Verified'}
                        </Text>
                        {verifiedPersona.badge && (
                          <View style={styles.badgeContainer}>
                            <Text style={styles.badgeText}>
                              {verifiedPersona.badge === 'google_verified' ? '✓ Google' : '✓ Phone'}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.personaOptionDescription}>
                        Shows your chosen name + verified badge
                      </Text>
                    </View>
                  </View>
                  {selectedPersonaId === verifiedPersona.id && (
                    <AntDesign name="checkcircle" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.modalFooter}>
              <Text style={styles.footerText}>
                Your phone/email is never public
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  avatarPlaceholder: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  selectorTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  selectorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  badgeContainer: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  personaList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  personaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9F9F9',
  },
  personaOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  personaOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personaOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  personaNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  personaOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  personaOptionDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
