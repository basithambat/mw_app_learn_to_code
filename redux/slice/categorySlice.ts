import { CategoryType } from '@/types/CategoryTypes';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

// Define the CategoryState interface
interface CategoryState {
    categories: CategoryType[];
    userPreferredCategories: CategoryType[];
}

// Define the initial state
const initialState: CategoryState = {
    categories: [],
    userPreferredCategories: []
};

export const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {
        // Reducer to set categories
        setCategories: (state, action: PayloadAction<CategoryType[]>) => {
            state.categories = action.payload;
        },
        // Reducer to set categories
        setUserPreferredCategories: (state, action: PayloadAction<CategoryType[]>) => {
            state.userPreferredCategories = action.payload;
        },
    },
});

export const { setCategories, setUserPreferredCategories } = categorySlice.actions;

// Selector with proper typing
export const categoriesDataSelector = (state: { category: CategoryState }) => state.category.categories;
export const userPreferredCategoriesDataSelector = (state: { category: CategoryState }) => state.category.userPreferredCategories;

export default categorySlice.reducer;
