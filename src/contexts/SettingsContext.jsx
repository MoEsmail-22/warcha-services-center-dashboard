/**
 * SettingsContext — provides workshop settings + preferences + update actions.
 *
 * Used by: Settings page (form + toggle preferences), Topbar (workshop name).
 *
 * Exposes:
 *   { data, loading, error, updateWorkshop, updatePreferences, togglePreference }
 */
import { createContext, useContext, useReducer, useEffect } from 'react';
import mockSettings from '@/mocks/settings.json';
import { updateProfile, updateSettings } from '@/API/Service';

const SettingsContext = createContext(null);

const initialState = {
  data: null, // null because it's an object, not an array
  loading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_SUCCESS':
      return { data: action.payload, loading: false, error: null };
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_WORKSHOP':
      return {
        ...state,
        data: { ...state.data, workshop: { ...state.data.workshop, ...action.payload } },
      };
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        data: {
          ...state.data,
          preferences: { ...state.data.preferences, ...action.payload },
        },
      };
    case 'TOGGLE_PREFERENCE':
      return {
        ...state,
        data: {
          ...state.data,
          preferences: {
            ...state.data.preferences,
            [action.payload]: !state.data.preferences[action.payload],
          },
        },
      };
    default:
      return state;
  }
}

export function SettingsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem('workshop_settings');
        const savedSettings = stored ? JSON.parse(stored) : null;
        dispatch({
          type: 'LOAD_SUCCESS',
          payload: savedSettings
            ? {
                ...mockSettings,
                ...savedSettings,
                workshop: { ...mockSettings.workshop, ...savedSettings.workshop },
                preferences: { ...mockSettings.preferences, ...savedSettings.preferences },
              }
            : mockSettings,
        });
      } catch (err) {
        dispatch({ type: 'LOAD_ERROR', payload: err.message });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state.data) localStorage.setItem('workshop_settings', JSON.stringify(state.data));
  }, [state.data]);

  const updateWorkshop = (updates) => dispatch({ type: 'UPDATE_WORKSHOP', payload: updates });
  const saveWorkshopProfile = async (updates, profileData = updates) => {
    const storedUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
    const workshopId = storedUser?.userId || storedUser?.id;

    if (!workshopId) throw new Error('Workshop ID is missing from the saved session.');

    const result = await updateProfile(workshopId, profileData);
    dispatch({ type: 'UPDATE_WORKSHOP', payload: updates });
    return result;
  };
  const savePreferences = async (preferences) => {
    const storedUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
    const workshopId = storedUser?.userId || storedUser?.id;
    const previousPreferences = state.data.preferences;

    if (!workshopId) throw new Error('Workshop ID is missing from the saved session.');

    const settingsData = {
      workshopId,
      acceptOnlineBookings: Boolean(preferences.acceptOnlineBookings),
      showPricesToCustomers: Boolean(preferences.showPrices),
      autoSendUpdates: Boolean(preferences.autoSendServiceUpdates),
      emailDailySummary: Boolean(preferences.emailDailySummary),
    };

    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
    try {
      return await updateSettings(workshopId, settingsData);
    } catch (error) {
      dispatch({ type: 'UPDATE_PREFERENCES', payload: previousPreferences });
      throw error;
    }
  };

  const updatePreferences = (updates) => savePreferences({ ...state.data.preferences, ...updates });
  const togglePreference = (key) =>
    savePreferences({
      ...state.data.preferences,
      [key]: !state.data.preferences[key],
    });

  const value = {
    ...state,
    updateWorkshop,
    saveWorkshopProfile,
    savePreferences,
    updatePreferences,
    togglePreference,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside a <SettingsProvider>');
  return ctx;
}
