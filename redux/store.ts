import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Use AsyncStorage for React Native
import { usersSlice } from "./slice/userSlice";
import { commentSlice } from "./slice/articlesComments";
import { categorySlice } from "./slice/categorySlice";
import { activitySlice } from "./slice/UserActivityLogsSlice";

// Configuring the persistence - Only persist essential state for faster loading
const persistConfig = {
  key: "root",
  version: 1,
  storage: AsyncStorage, // Use AsyncStorage instead of the default storage
  whitelist: ["users", "category"], // Only persist user auth and categories
  blacklist: ["comments", "userActivity"], // Don't persist large/complex state
};

// Combine reducers
export const reducer = combineReducers({
  users: usersSlice.reducer,
  comments: commentSlice.reducer,
  category: categorySlice.reducer,
  userActivity: activitySlice.reducer
});

// Persist the reducer
const persistedReducer = persistReducer(persistConfig, reducer);

// Configure the store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
