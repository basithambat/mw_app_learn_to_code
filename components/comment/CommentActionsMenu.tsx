/**
 * Comment Actions Menu
 * Shows edit/delete/report options for comments
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useFirebaseAuth } from '@/config/firebaseAuthContext';
import { apiReportComment, apiBlockUser } from '@/api/apiComments';
import { ArticleComment } from '@/app/types';

interface CommentActionsMenuProps {
  comment: ArticleComment;
  isVisible: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  currentUserId?: string;
}

export const CommentActionsMenu: React.FC<CommentActionsMenuProps> = ({
  comment,
  isVisible,
  onClose,
  onEdit,
  onDelete,
  currentUserId,
}) => {
  const { token } = useFirebaseAuth();
  const [reporting, setReporting] = useState(false);

  const isOwnComment = currentUserId && (comment.user_id === currentUserId || comment.persona?.id);

  const handleReport = async (reason: 'spam' | 'hate' | 'harassment' | 'misinfo' | 'other') => {
    if (!token) return;

    setReporting(true);
    try {
      await apiReportComment(comment.id, reason, undefined, token);
      onClose();
      // Show success message (you can add a toast here)
      alert('Comment reported. Thank you for helping keep the community safe.');
    } catch (error: any) {
      alert(error.message || 'Failed to report comment');
    } finally {
      setReporting(false);
    }
  };

  const handleBlockUser = async () => {
    if (!token || !comment.user_id) return;

    try {
      await apiBlockUser(comment.user_id, token);
      onClose();
      alert('User blocked. You won\'t see their comments anymore.');
    } catch (error: any) {
      alert(error.message || 'Failed to block user');
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menu}>
          {isOwnComment && (
            <>
              {onEdit && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    onClose();
                    onEdit();
                  }}
                >
                  <AntDesign name="edit" size={20} color="#333" />
                  <Text style={styles.menuItemText}>Edit</Text>
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  style={[styles.menuItem, styles.dangerItem]}
                  onPress={() => {
                    onClose();
                    onDelete();
                  }}
                >
                  <AntDesign name="delete" size={20} color="#FF3B30" />
                  <Text style={[styles.menuItemText, styles.dangerText]}>Delete</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {!isOwnComment && (
            <>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleReport('spam')}
                disabled={reporting}
              >
                <AntDesign name="warning" size={20} color="#FF9500" />
                <Text style={styles.menuItemText}>Report Spam</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleReport('hate')}
                disabled={reporting}
              >
                <AntDesign name="warning" size={20} color="#FF9500" />
                <Text style={styles.menuItemText}>Report Hate Speech</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleReport('harassment')}
                disabled={reporting}
              >
                <AntDesign name="warning" size={20} color="#FF9500" />
                <Text style={styles.menuItemText}>Report Harassment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, styles.dangerItem]}
                onPress={handleBlockUser}
              >
                <AntDesign name="deleteuser" size={20} color="#FF3B30" />
                <Text style={[styles.menuItemText, styles.dangerText]}>Block User</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={[styles.menuItem, styles.cancelItem]}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menu: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  dangerItem: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dangerText: {
    color: '#FF3B30',
  },
  cancelItem: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});
