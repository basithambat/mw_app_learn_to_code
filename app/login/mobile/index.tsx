import React, { useEffect, useState } from 'react'
import { StyleSheet, Alert } from 'react-native'
import { SafeAreaView, View } from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign';
import { usePathname, useRouter } from 'expo-router';
import Screen1 from '@/components/LoginMobile/Screen1';
import Screen2 from '@/components/LoginMobile/Screen2';
import Screen3 from '@/components/LoginMobile/Screen3';
import { signInWithPhoneNumber, confirmPhoneOTP, updateProfile } from '@/services/firebaseAuth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

const MobileLogin = () => {
    const router = useRouter();
    const pathname = usePathname();

    const [currentStep, setCurrentStep] = useState(1);
    const [mobileNumber, setMobileNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [userName, setUserName] = useState('');
    const [isBtnDisabaled, setIsButtonDisabled] = useState(true);
    const [otpbuttonDisable, setOtpbuttonDisable] = useState(true);
    const [finalButtonDisable, setFinalButtonDisable] = useState(true);
    const [otp, setOtp] = useState('');

    // Store confirmation result
    const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

    useEffect(() => {
        if (pathname == '/firebaseauth/link') router.back();
    }, [pathname])

    const handleBack = () => {
        if (currentStep == 3) setCurrentStep(2)
        if (currentStep == 2) setCurrentStep(1)
        if (currentStep == 1) router.back()
    }

    const handleSendOtp = async () => {
        const number = `${countryCode}${mobileNumber}`; // Remove space
        try {
            const confirmation = await signInWithPhoneNumber(number);
            setConfirm(confirmation);
            setCurrentStep(2);
        } catch (error: any) {
            console.error("Error sending OTP:", error);
            Alert.alert("Error", error.message || "Failed to send OTP");
        }
    }

    async function confirmCode() {
        if (!confirm) {
            Alert.alert("Error", "Please request OTP first");
            return;
        }
        
        try {
            const firebaseUser = await confirmPhoneOTP(confirm, otp);
            
            // Check if user needs to set display name
            if (!firebaseUser.displayName) {
                setCurrentStep(3);
            } else {
                // User already has name, navigate to discover
                router.replace({
                    pathname: "/discoverScreens"
                });
            }
        } catch (error: any) {
            console.error('Invalid code:', error);
            Alert.alert("Error", error.message || 'Invalid OTP code');
        }
    }

    const handleFinalSubmit = async () => {
        if (!userName) {
            Alert.alert("Error", "Please enter your name");
            return;
        }

        try {
            // Update user's profile with the new username
            await updateProfile({
                displayName: userName
            });

            // Navigate to discover screen
            router.replace({
                pathname: "/discoverScreens"
            });
        } catch (error: any) {
            console.error('Error updating user profile:', error);
            Alert.alert("Error", error.message || 'Failed to update profile');
        }
    };

    useEffect(() => {
        if (otp.length == 4) setOtpbuttonDisable(false)
        if (userName.length > 0) setFinalButtonDisable(false)
    }, [otp, userName])

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Screen1 selectedValue={countryCode} setSelectedValue={setCountryCode} isBtnDisabled={isBtnDisabaled} setMobileNumber={setMobileNumber} setIsButtonDisabled={setIsButtonDisabled} buttonAction={handleSendOtp} mobileNumber={mobileNumber} />;
            case 2:
                return <Screen2 mobileNumber={mobileNumber} countryCode={countryCode} isBtnDisabaled={otpbuttonDisable} mobileOtp={otp} setMobileOtp={setOtp} buttonAction={confirmCode} />;
            case 3:
                return <Screen3 isBtnDisabaled={finalButtonDisable} setName={setUserName} name={userName} buttonAction={handleFinalSubmit} />;
            default:
                return null;
        }
    };
    
    return (
        <SafeAreaView style={styles.container}>
            <View className='px-[16px] flex-1'>
                <AntDesign name="arrowleft" style={{ marginTop: 16 }} size={28} color="#000" onPress={handleBack} />
                <View className='mt-8 flex-1'>
                    {renderStep()}
                </View>
            </View>
        </SafeAreaView>
    )
}

export default MobileLogin;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    }
});
