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
        dispatch({ type: 'LOAD_SUCCESS', payload: mockSettings });
      } catch (err) {
        dispatch({ type: 'LOAD_ERROR', payload: err.message });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const updateWorkshop = (updates) => dispatch({ type: 'UPDATE_WORKSHOP', payload: updates });
  const updatePreferences = (updates) => dispatch({ type: 'UPDATE_PREFERENCES', payload: updates });
  const togglePreference = (key) => dispatch({ type: 'TOGGLE_PREFERENCE', payload: key });

  const value = {
    ...state,
    updateWorkshop,
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
