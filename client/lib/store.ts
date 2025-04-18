import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';

// Конфигурация persistence
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'], // Только эти reducers будут сохраняться
};

// Корневой reducer
const rootReducer = combineReducers({
  auth: authReducer,
  // Здесь можно добавить другие reducers
});

// Создаем persistentReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Создаем store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Создаем persistor
export const persistor = persistStore(store);

// Экспортируем типы
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 