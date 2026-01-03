import { AuthPayload } from '@/types/UserTypes';
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

// Define the UsersState interface
export interface UsersState {
  user: AuthPayload | null;
  isAuthenticated: boolean;
}

// Define the initial state with proper types
const initialState: UsersState = {
  user: null,
  isAuthenticated: false,
};

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Add typing for the `state` parameter
    setUser: (state: UsersState, action: PayloadAction<any>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state: UsersState) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
})

export const { setUser, clearUser } = usersSlice.actions

// Add typing for the `state` parameter in selectors
export const loggedInUserDataSelector = (state: { users: UsersState }) => state.users.user;
export const isAuthenticatedSelector = (state: { users: UsersState }) => state.users.isAuthenticated;

export default usersSlice.reducer;