// components/TermsModal/index.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';

interface TermsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isVisible, onClose, onAccept }) => {
  const router = useRouter();

  const handleAccept = () => {
    onAccept();
    onClose();
    router.push('/login/loginScreen');
  };

  return (
    <Modal
    animationType="slide"
    transparent={true}
    visible={isVisible}
    onRequestClose={onClose}
  >
    <View className="flex-1 justify-center items-center bg-black/50">
      <View className="w-[90%] bg-white rounded-2xl p-4 max-h-[60%]">
        <Text className="text-xl font-bold mb-4 text-center">
          Terms and Conditions
        </Text>
        
        <ScrollView className="mb-4">
          <Text className="text-base leading-6 text-gray-700 mb-4">
            By using Whatsay, you agree to:
          </Text>

          <View className="mb-4">
            <Text className="text-base leading-6 text-gray-700 mb-2">• Create and maintain your account securely using Google or phone number authentication</Text>
            <Text className="text-base leading-6 text-gray-700 mb-2">• Use news content for personal, non-commercial purposes only</Text>
            <Text className="text-base leading-6 text-gray-700 mb-2">• Post comments that don't violate laws or others' rights</Text>
            <Text className="text-base leading-6 text-gray-700 mb-2">• Grant us permission to display and distribute your comments</Text>
            <Text className="text-base leading-6 text-gray-700 mb-2">• Not misuse the service or attempt to interfere with its operation</Text>
            <Text className="text-base leading-6 text-gray-700 mb-2">• Accept that we may terminate accounts that violate our terms</Text>
          </View>

          <View className="mt-4">
            <Text className="text-base leading-6 text-gray-700 mb-2">
              This is a summary of our full Terms and Conditions. Please read the complete version before using the app.
            </Text>
            <Text className="text-base leading-6 text-gray-700 font-medium">
              By continuing, you confirm that you have read and agree to our <Text className="text-blue-500 " onPress={() => Linking.openURL('https://whatsay-web.vercel.app/terms')}>Terms and Conditions</Text> and <Text className="text-blue-500 " onPress={() => Linking.openURL('https://whatsay-privacy-and-policy.vercel.app/')}>Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>

        <View className="flex-row justify-between gap-4">
          <TouchableOpacity 
            onPress={onClose}
            className="flex-1 py-3 bg-gray-200 rounded-lg"
          >
            <Text className="text-center text-gray-700 font-medium">
              Decline
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleAccept}
            className="flex-1 py-3 bg-blue-500 rounded-lg"
          >
            <Text className="text-center text-white font-medium">
              Accept
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
  );
};

export default TermsModal;