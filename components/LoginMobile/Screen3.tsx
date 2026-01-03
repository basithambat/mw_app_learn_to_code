import React from 'react'
import Title from '../Typography/Title';
import { View } from 'react-native';
import { TextInput } from 'react-native';
import Button from '../Buttons/Button';
import { Text } from 'react-native';

interface Screen3Props {
    isBtnDisabaled: boolean;
    setName: (name: string) => void
    name: string;
    buttonAction?: ()=> void;
}

const Screen3 = ({ isBtnDisabaled, setName, name, buttonAction }: Screen3Props) => {

    return (
        <>
            <Title>What should we call you?</Title>
            <View className='w-full flex-1 h-full relative flex flex-col justify-between mt-10 pb-10'>
                <TextInput placeholder='Enter your name' className='text-xl placeholder:tex-[#B2B9BD] text-black font-geist font-medium' value={name} onChangeText={(text) => setName(text)} />
                <Button disabled={isBtnDisabaled} handleAction={buttonAction}>
                    <Text className='text-center font-geist text-base font-medium' style={{ color: "#FFF" }}>Start Reading</Text>
                </Button>
            </View>
        </>
    )
}

export default Screen3;