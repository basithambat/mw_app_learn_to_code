import DiscoverScreen from '@/components/DiscoverScreen';
import NavBar from '@/components/Navbar';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View, Platform, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

const DiscoverScreens = () => {
    return (
        <>
            <View style={styles.statusBarBackground} />
            <View style={styles.wrapper}>
                <NavBar />
                <SafeAreaView style={styles.container}>
                    <ExpoStatusBar style='dark' backgroundColor='transparent' translucent={true} />
                    <GestureHandlerRootView style={styles.contentContainer}>

                        <DiscoverScreen />
                    </GestureHandlerRootView>
                </SafeAreaView>
            </View>
        </>
    )
}

export default DiscoverScreens

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contentContainer: {
        flex: 1,
    },
    statusBarBackground: {
        // height: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10, // Put it behind everything
    }
});