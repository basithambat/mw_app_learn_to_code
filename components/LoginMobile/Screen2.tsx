import React, { useRef } from 'react';
import { View, TextInput, Text, StyleSheet, Dimensions } from 'react-native';
import Title from '../Typography/Title';
import Button from '../Buttons/Button';
import { maskMobileNumber } from '@/utils/PhoneNumberHelper';

interface Screen2Props {
    mobileNumber: string;
    isBtnDisabaled: boolean;
    mobileOtp: string;
    setMobileOtp: (mobileOtp: string) => void;
    countryCode: string;
    buttonAction?: () => void;
}

const Screen2 = ({
    mobileNumber,
    isBtnDisabaled,
    mobileOtp,
    setMobileOtp,
    countryCode,
    buttonAction,
}: Screen2Props) => {
    const inputRefs = useRef<(TextInput | null)[]>([]); // Refs for each TextInput
    const otpCount = 6;

    const handleInputChange = (text: string, index: number) => {
        const cleanText = text.slice(-1); // Only consider the last digit entered
        // @ts-ignore
        setMobileOtp((prevOtp) => {
            const updatedOtp = prevOtp.split('');
            updatedOtp[index] = cleanText; // Update the character at the index
            return updatedOtp.join('');
        });

        // Move focus to the next input if a valid digit is entered
        if (cleanText && index < otpCount - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        // Handle backspace to move focus to the previous input
        if (e.nativeEvent.key === 'Backspace' && mobileOtp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const screenWidth = Dimensions.get('window').width; // Get screen width
    const boxMargin = 8; // Margin between OTP boxes
    const boxWidth = (screenWidth - boxMargin * (otpCount - 1)) / otpCount; // Dynamically calculate box width

    return (
        <>
            <View className="w-full">
                <Title>Enter the OTP sent to</Title>
                <Title>{countryCode + maskMobileNumber(mobileNumber)}</Title>
            </View>
            <View className="w-full flex-1 h-full relative flex flex-col justify-between mt-10 pb-10">
                <View style={[styles.otpContainer]}>
                    {Array.from({ length: otpCount }, (_, index) => (
                        <TextInput
                        key={index}
                        style={[styles.otpBox, { width: boxWidth }]}
                        keyboardType="numeric"
                        maxLength={1}
                        value={mobileOtp[index] || ''} // Get the character at the current index
                        onChangeText={(text) => handleInputChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        ref={(ref) => (inputRefs.current[index] = ref)}
                    />
                    ))}
                </View>
                <Button disabled={isBtnDisabaled} handleAction={buttonAction}>
                    <Text
                        className="text-center font-geist text-base font-medium"
                        style={{ color: '#FFF' }}
                    >
                        Confirm
                    </Text>
                </Button>
            </View>
        </>
    );
};

export default Screen2;

const styles = StyleSheet.create({
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
        gap: 4
    },
    otpBox: {
        height: 71,
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 36,
        // marginHorizontal: 6, // Half of `boxMargin` for even spacing
        backgroundColor: '#F5F3F0',
    },
});
