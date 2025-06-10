import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChatHeaderProps } from '../../types/chat';

const colors = {
  background: '#FFD700',
  cardBackground: '#FFFFFF',
  border: '#000000',
  text: '#000000',
  secondaryText: '#666666',
};

const ChatHeader: React.FC<ChatHeaderProps> = ({
  communityName,
  memberCount,
  onBackPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.groupInfo}>
          <View style={styles.groupAvatar}>
            <Text style={styles.groupInitial}>
              {communityName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.communityName} numberOfLines={1}>
              {communityName}
            </Text>
            <Text style={styles.memberCount}>
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 3,
    borderBottomColor: colors.border,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 8,
    shadowColor: colors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  groupInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupAvatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    shadowColor: colors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  groupInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  titleContainer: {
    flex: 1,
  },
  communityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  memberCount: {
    fontSize: 14,
    color: colors.secondaryText,
    fontWeight: '600',
  },
  infoButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: 8,
    shadowColor: colors.border,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
});

export default ChatHeader; 