import { configureStore } from '@reduxjs/toolkit';
import { 
  useDispatch as useReduxDispatch, 
  useSelector as useReduxSelector,
  TypedUseSelectorHook 
} from 'react-redux';

// Import reducers (even if we don't use them much, for future expansion)
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';

// Configure store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/setToken'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user.lastLogin'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
export const useAppDispatch = () => useReduxDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

// Optional: Redux persist configuration (if needed in future)
// import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';

// const persistConfig = {
//   key: 'root',
//   storage,
//   whitelist: ['auth', 'ui'] // Only persist auth and ui state
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);
// export const persistor = persistStore(store);
