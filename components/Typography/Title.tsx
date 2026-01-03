import React from 'react'
import { Text } from 'react-native'

const Title = ({ children }: { children: React.ReactNode }) => {
    return (
        <Text className='text-[28px] font-adamina font-normal'>{children}</Text>
    )
}

export default Title