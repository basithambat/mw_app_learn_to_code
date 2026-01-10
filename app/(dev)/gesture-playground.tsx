import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import ExpandNewsItem from '@/components/ExpandNewsItem';
import { useExpandedArticleGestures } from '@/hooks/useExpandedArticleGestures';

// Mock article data for testing
const MOCK_ARTICLES = [
    {
        id: 1,
        title: 'Test Article 1 - Gesture Playground',
        summary: 'This is a test article for the gesture playground. Swipe up to open comments, swipe down to dismiss.',
        image_url: 'https://picsum.photos/400/600?random=1',
        category_id: 1,
    },
    {
        id: 2,
        title: 'Test Article 2 - Second Article',
        summary: 'Second test article. Test horizontal paging by swiping left/right.',
        image_url: 'https://picsum.photos/400/600?random=2',
        category_id: 2,
    },
    {
        id: 3,
        title: 'Test Article 3 - Third Article',
        summary: 'Third test article for pagination testing.',
        image_url: 'https://picsum.photos/400/600?random=3',
        category_id: 1,
    },
];

/**
 * DEV-ONLY Gesture Playground
 * 
 * Test screen for validating gesture state machine and animations.
 * Provides stress testing and detailed logging.
 */
const GesturePlayground = () => {
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    // Mock gesture hook for testing outside detail view
    const {
        mode,
        openComments,
        closeComments,
        dismissDetail,
        commentProgress,
        dismissY,
    } = useExpandedArticleGestures({
        onDismiss: () => {
            addLog('🚪 Detail dismissed');
            setIsDetailVisible(false);
        },
    });

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        setLogs(prev => [logMessage, ...prev].slice(0, 50)); // Keep last 50 logs
    };

    // Log mode transitions
    useEffect(() => {
        addLog(`📊 Mode: ${mode}`);
    }, [mode]);

    // Log SharedValue changes (polling - not ideal but works for DEV)
    useEffect(() => {
        const interval = setInterval(() => {
            if (commentProgress.value !== 0 && commentProgress.value !== 1) {
                addLog(`📈 commentProgress: ${commentProgress.value.toFixed(2)}`);
            }
            if (dismissY.value !== 0) {
                addLog(`📉 dismissY: ${dismissY.value.toFixed(0)}px`);
            }
        }, 100);

        return () => clearInterval(interval);
    }, []);

    // Stress test: Open/Close 20 times
    const stressTestOpenClose = async () => {
        addLog('🔥 STRESS TEST: Open/Close 20x');
        for (let i = 0; i < 20; i++) {
            addLog(`  Iteration ${i + 1}/20`);
            openComments();
            await new Promise(resolve => setTimeout(resolve, 300));
            closeComments();
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        addLog('✅ STRESS TEST COMPLETE');
    };

    // Stress test: Dismiss 10 times
    const stressTestDismiss = async () => {
        addLog('🔥 STRESS TEST: Open/Dismiss 10x');
        for (let i = 0; i < 10; i++) {
            addLog(`  Iteration ${i + 1}/10`);
            setIsDetailVisible(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            dismissDetail();
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        addLog('✅ STRESS TEST COMPLETE');
        setIsDetailVisible(false);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>🎮 Gesture Playground</Text>
                <Text style={styles.subtitle}>DEV ONLY - Test Gesture State Machine</Text>
            </View>

            {/* Control Panel */}
            <View style={styles.controls}>
                <Text style={styles.sectionTitle}>Controls</Text>

                <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={() => {
                        setIsDetailVisible(true);
                        addLog('🚀 Detail opened');
                    }}
                >
                    <Text style={styles.buttonText}>Open Detail View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => {
                        openComments();
                        addLog('⬆️ Comments opened');
                    }}
                    disabled={!isDetailVisible}
                >
                    <Text style={styles.buttonText}>Open Comments</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={() => {
                        closeComments();
                        addLog('⬇️ Comments closed');
                    }}
                    disabled={!isDetailVisible}
                >
                    <Text style={styles.buttonText}>Close Comments</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.dangerButton]}
                    onPress={() => {
                        dismissDetail();
                        addLog('✖️ Detail dismissed manually');
                    }}
                    disabled={!isDetailVisible}
                >
                    <Text style={styles.buttonText}>Dismiss Detail</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Stress Tests</Text>

                <TouchableOpacity
                    style={[styles.button, styles.warningButton]}
                    onPress={stressTestOpenClose}
                    disabled={!isDetailVisible}
                >
                    <Text style={styles.buttonText}>🔥 Open/Close 20x</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.warningButton]}
                    onPress={stressTestDismiss}
                >
                    <Text style={styles.buttonText}>🔥 Dismiss 10x</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.infoButton]}
                    onPress={() => setLogs([])}
                >
                    <Text style={styles.buttonText}>Clear Logs</Text>
                </TouchableOpacity>
            </View>

            {/* Status Display */}
            <View style={styles.status}>
                <Text style={styles.statusText}>Mode: <Text style={styles.highlight}>{mode}</Text></Text>
                <Text style={styles.statusText}>Detail Visible: <Text style={styles.highlight}>{isDetailVisible ? 'Yes' : 'No'}</Text></Text>
            </View>

            {/* Logs */}
            <View style={styles.logsContainer}>
                <Text style={styles.sectionTitle}>Logs (last 50)</Text>
                <ScrollView style={styles.logs}>
                    {logs.map((log, index) => (
                        <Text key={index} style={styles.logText}>{log}</Text>
                    ))}
                </ScrollView>
            </View>

            {/* Detail View */}
            {isDetailVisible && (
                <View style={styles.detailOverlay}>
                    <ExpandNewsItem
                        items={MOCK_ARTICLES}
                        initialArticleId={1}
                        isVisible={isDetailVisible}
                        onClose={() => {
                            setIsDetailVisible(false);
                            addLog('🚪 Detail closed via onClose');
                        }}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    controls: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    button: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#007AFF',
    },
    secondaryButton: {
        backgroundColor: '#34C759',
    },
    dangerButton: {
        backgroundColor: '#FF3B30',
    },
    warningButton: {
        backgroundColor: '#FF9500',
    },
    infoButton: {
        backgroundColor: '#5856D6',
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 16,
    },
    status: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    statusText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    highlight: {
        fontWeight: 'bold',
        color: '#007AFF',
    },
    logsContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
    },
    logs: {
        flex: 1,
    },
    logText: {
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#333',
        marginBottom: 4,
    },
    detailOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
});

// Only export in DEV
export default __DEV__ ? GesturePlayground : () => <Text>Not available in production</Text>;
