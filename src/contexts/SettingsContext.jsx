/**
 * SettingsContext — provides workshop settings + preferences + update actions.
 *
 * Used by: Settings page (form + toggle preferences), Topbar (workshop name).
 *
 * Exposes:
 *   { data, loading, error, updateWorkshop, updatePreferences, togglePreference }
 */
import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import mockSettings from '@/mocks/settings.json';
import { updateProfile, updateSettings } from '@/API/Service';
import { isDemoMode } from '@/API/client';
import { useAuth } from './AuthContext';

const SettingsContext = createContext(null);

const SETTINGS_STORAGE_KEY = 'workshop_settings';

// Never show the mock workshop's name/address/phone to a real account.
const EMPTY_WORKSHOP_IDENTITY = { name: '', address: '', phone: '', secondaryPhone: '' };

/** Saved settings win; anything missing falls back to the logged-in user's data. */
function buildSettings(saved, user) {
  const workshop = { ...mockSettings.workshop, ...EMPTY_WORKSHOP_IDENTITY, ...saved?.workshop };

  return {
    ...mockSettings,
    ...saved,
    workshop: {
      ...workshop,
      name: workshop.name || user?.name || '',
      phone: workshop.phone || user?.phone || '',
      address: workshop.address || user?.address || '',
    },
    preferences: { ...mockSettings.preferences, ...saved?.preferences },
  };
}

const initialState = {
  data: null, // null because it's an object, not an array
  loading: true,
  error: null,
  ownerKey: null, // storage key of the account this data belongs to
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_SUCCESS':
      return { data: action.payload, loading: false, error: null, ownerKey: action.ownerKey };
    case 'RESET':
      return initialState;
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
  const { user, updateUser } = useAuth();
  const accountId = user?.id ?? user?.userId ?? null;
  // Each account gets its own saved settings so nothing leaks between logins.
  const storageKey = accountId != null ? `${SETTINGS_STORAGE_KEY}:${accountId}` : null;
  // Read the latest user without reloading settings on every user update (e.g. a rename).
  const userRef = useRef(user);
  userRef.current = user;

  useEffect(() => {
    if (!storageKey) {
      dispatch({ type: 'RESET' });
      return;
    }

    try {
      // The old shared key held mock data for every account; drop it.
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      const stored = localStorage.getItem(storageKey);
      dispatch({
        type: 'LOAD_SUCCESS',
        payload: buildSettings(stored ? JSON.parse(stored) : null, userRef.current),
        ownerKey: storageKey,
      });
    } catch (err) {
      dispatch({ type: 'LOAD_ERROR', payload: err.message });
    }
  }, [storageKey]);

  useEffect(() => {
    // Only write data that was loaded for the current account.
    if (state.data && state.ownerKey === storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(state.data));
    }
  }, [state.data, state.ownerKey, storageKey]);

  const updateWorkshop = (updates) => dispatch({ type: 'UPDATE_WORKSHOP', payload: updates });
  const saveWorkshopProfile = async (updates, profileData = updates) => {
    const storedUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
    const workshopId = storedUser?.workshopId || storedUser?.userId || storedUser?.id;

    if (!workshopId) throw new Error('Workshop ID is missing from the saved session.');

    const numericWorkshopId = Number(workshopId);
    const validWorkshopId = Number.isInteger(numericWorkshopId) && numericWorkshopId > 0;

    if (!validWorkshopId && !isDemoMode()) {
      throw new Error('The saved workshop ID is invalid. Sign in again and retry.');
    }

    const requestBody = {
      workshopId: validWorkshopId ? numericWorkshopId : 0,
      name: profileData.name || '',
      phone: profileData.phone || '',
      googleMapsLink: profileData.googleMapsLink || '',
      address: profileData.address || '',
      lat: Number(profileData.lat) || 0,
      lng: Number(profileData.lng) || 0,
      openingTime: profileData.openingTime || '',
      closingTime: profileData.closingTime || '',
    };

    const result = await updateProfile(
      validWorkshopId ? numericWorkshopId : workshopId,
      requestBody
    );
    dispatch({ type: 'UPDATE_WORKSHOP', payload: updates });
    // Keep the Topbar name in sync with the saved workshop name.
    if (updates.name && updates.name !== user?.name) updateUser({ name: updates.name });
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
