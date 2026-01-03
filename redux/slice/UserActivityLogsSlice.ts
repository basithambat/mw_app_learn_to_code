import { ActivityTypes } from '@/types/Activity';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

// Define the state type
export interface ActivityState {
    userActivityLogs: ActivityTypes[]; // Array of Activity
}

// Initial state
const initialState: ActivityState = {
    userActivityLogs: [], // Start with an empty array
};

// Create the slice
export const activitySlice = createSlice({
    name: 'userActivity',
    initialState,
    reducers: {
        // Properly type the `state` and `action` parameters
        setUserActivityLogs: (state, action: PayloadAction<ActivityTypes[]>) => {
            state.userActivityLogs = action.payload;
        }
    },
});

export const { setUserActivityLogs } = activitySlice.actions;

// Add typing for the `state` parameter in selectors
export const UserActivityLogsSelector = (state: { userActivity: ActivityState }) => state.userActivity.userActivityLogs;

export default activitySlice.reducer;