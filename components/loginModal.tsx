// components/GoogleAccountsModal.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';

interface GoogleAccount {
  name: string;
  email: string;
  avatar: any; // Using 'any' for image require type
}

interface GoogleAccountsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectAccount: (account: GoogleAccount) => void;
  accounts: GoogleAccount[];
}

const GoogleAccountsModal: React.FC<GoogleAccountsModalProps> = ({
  visible,
  onClose,
  onSelectAccount,
  accounts,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <Pressable 
          className="flex-1"
          onPress={onClose}
        />
        <View className="bg-white rounded-t-[20px] p-6">
          <View className="flex-row justify-between items-center mb-4">
            <Image
              source={require("@/assets/googleIcon.webp")}
              className="w-6 h-6"
              resizeMode="contain"
            />
            <TouchableOpacity 
              onPress={onClose}
              className="w-8 h-8 items-center justify-center"
            >
              <Text className="text-2xl">×</Text>
            </TouchableOpacity>
          </View>
          
          <Text className="text-xl font-medium mb-1">Choose an account</Text>
          <Text className="text-gray-500 mb-6">to continue to Whatsay</Text>

          {accounts.map((account) => (
            <TouchableOpacity
              key={account.email}
              className="flex-row items-center py-3"
              onPress={() => {
                onSelectAccount(account);
                onClose();
              }}
            >
              <Image
                source={account.avatar}
                className="w-10 h-10 rounded-full mr-4"
                resizeMode="cover"
              />
              <View>
                <Text className="font-medium text-base">{account.name}</Text>
                <Text className="text-gray-500">{account.email}</Text>
              </View>
            </TouchableOpacity>
          ))}
          
          <View className="h-8" />
        </View>
      </View>
    </Modal>
  );
};

export default GoogleAccountsModal;