"use client"

import { CategoryType } from '@/types/CategoryTypes';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import CategoryArticles from './CategoryArticles';
import { getCategories } from '@/api/apiCategories';
import useLocation from '@/hooks/useLocation';
import { useRouter } from 'expo-router'; // Added
import { getAllArticlesByCategories } from '@/api/apiArticles'; // Added
import { CardStackFeed } from '@/components/home/CardStackFeed'; // Added
import Animated, {
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    interpolate,
    Extrapolate,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { getLast48HoursRange } from '@/utils/DataAndTimeHelper';
import { useSelector } from 'react-redux';
import { loggedInUserDataSelector } from '@/redux/slice/userSlice';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const INITIAL_GRADIENT_HEIGHT = 150;
const MAX_PULL_DISTANCE = 220;

const GRADIENT_COLORS = [
    ['rgba(5,225,215,0.6)', 'rgba(5,235,215,0)'],           // Turquoise
    ['rgba(255,105,180,0.6)', 'rgba(255,105,180,0)'],       // Hot Pink
    ['rgba(147,112,219,0.6)', 'rgba(147,112,219,0)'],       // Purple
    ['rgba(255,165,0,0.6)', 'rgba(255,165,0,0)'],           // Orange
    ['rgba(50,205,50,0.6)', 'rgba(50,205,50,0)']            // Lime Green
] as const;

const DEFAULT_GRADIENT = ['rgba(5,225,215,0.6)', 'rgba(5,235,215,0)'];

const DiscoverScreen = () => {
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [currentGradientIndex, setCurrentGradientIndex] = useState(0);
    const { location, errorMsg } = useLocation();
    const scrollY = useSharedValue(0);
    const isRefreshing = useSharedValue(false);
    const router = useRouter(); // Initialize router

    const loggedInUserData = useSelector(loggedInUserDataSelector);

    const getCurrentGradientColors = () => {
        try {
            return GRADIENT_COLORS[currentGradientIndex] || DEFAULT_GRADIENT;
        } catch (error) {
            console.error('Error getting gradient colors:', error);
            return DEFAULT_GRADIENT;
        }
    };

    const [articles, setArticles] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            const { from, to } = getLast48HoursRange();
            const userId: string = loggedInUserData?.user?.id as string || 'anonymous';
            try {
                // Fetch all recent articles for the stack
                // Note: We might want a dedicated endpoint for "Feed" later.
                // For now, let's use a "General" or "All" fetch if available, 
                // or just fetch categories and flatten them.
                // Let's rely on getCategories for now and flatten content? 
                // Or better: Use `getAllArticlesByCategories('all')` if supported?
                // Looking at CategoryArticles.tsx, it uses `getAllArticlesByCategories`.

                // Let's assume we can fetch a "Today" feed.
                // If not, we'll fetch heavily populated categories.
                // Simpler: Just fetch categories first (as before) then fetch articles for them?
                // Or let's just use MOCK data or fetch for the first category to start.

                const response = await getCategories(from, to, userId);
                setCategories(response);

                // Flatten articles?
                // Actually `CardStackFeed` needs a list of articles.
                // Let's fetch articles for the first few categories to populate the stack.
                // This is a temporary data bridge.

                if (response.length > 0) {
                    // Fetch for top 3 categories
                    // This is pseudo-code logic adaptation.
                    // Ideally we have `getFeed()`.
                    // Let's just pass `categories` to CardStackFeed? 
                    // No, it expects items.
                    // I will quickly fetch articles for the first category to demonstrate.
                    // In real app, we'd want a unified feed endpoint.

                    // Placeholder: Fetching articles for first category
                    // Import needed at top
                }
            } catch (error) {
                console.error("[DiscoverScreen] Error fetching categories:", error);
            }
        })();
    }, [location]);

    // NEW: Fetch ALL articles for the stack (Unified Feed)
    useEffect(() => {
        if (categories.length > 0) {
            (async () => {
                const { from, to } = getLast48HoursRange();
                const allArticles: any[] = [];
                // Fetch top 3 categories
                for (const cat of categories.slice(0, 3)) {
                    const catId = typeof cat.id === 'number' ? cat.id.toString() : cat.id;
                    const arts = await getAllArticlesByCategories(catId, from, to);
                    allArticles.push(...arts);
                }
                // Remove duplicates
                const unique = Array.from(new Set(allArticles.map(a => a.id)))
                    .map(id => allArticles.find(a => a.id === id));

                setArticles(unique);
            })();
        }
    }, [categories]);

    const handleOpenArticle = (article: any) => {
        router.push({
            pathname: '/(news)/[slug]',
            params: {
                slug: article.id.toString(),
                categoryId: (article.category_id || 'all').toString() // Ensure string
            }
        });
    };

    const currentGradientColors = getCurrentGradientColors(); // Restored

    return (
        <View style={styles.container}>
            <View style={styles.gradientContainer}>
                <AnimatedLinearGradient
                    colors={currentGradientColors}
                    style={[styles.gradient, { height: INITIAL_GRADIENT_HEIGHT }]}
                />
            </View>
            {/* STACK RESTORED */}
            {articles.length > 0 ? (
                <CardStackFeed
                    items={articles}
                    onOpenArticle={handleOpenArticle}
                />
            ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    {/* Placeholder loading */}
                </View>
            )}
        </View>
    );
};

export default DiscoverScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        marginTop: 20,
    },
    gradientContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        height: INITIAL_GRADIENT_HEIGHT,
        overflow: 'visible',
    },
    gradient: {
        width: '100%',
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingTop: 88,
        zIndex: 50,
    }
});