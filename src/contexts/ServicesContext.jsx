/**
 * ServicesContext — provides services + pricing data + CRUD actions.
 *
 * Used by: Services & Pricing page (table), Quotes page (line items selection).
 *
 * Each service has bilingual names (en/ar) — the page picks the right one
 * based on the current language.
 *
 * Exposes:
 *   { data, loading, error, addService, updateService, toggleStatus, deleteService, duplicateService }
 */
import { createContext, useContext, useEffect, useReducer } from 'react';
import { createService, editService, getServices, removeService } from '@/API/Service';

const ServicesContext = createContext(null);

const initialState = {
  data: [],
  loading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_SUCCESS':
      return { data: action.payload, loading: false, error: null };

    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.payload };

    case 'ADD_SERVICE':
      return { ...state, data: [action.payload, ...state.data] };

    case 'UPDATE_SERVICE':
      return {
        ...state,
        data: state.data.map((service) =>
          service.id === action.payload.id ? { ...service, ...action.payload } : service
        ),
      };

    case 'TOGGLE_STATUS':
      return {
        ...state,
        data: state.data.map((service) =>
          service.id === action.payload
            ? {
                ...service,
                status: service.status === 'active' ? 'inactive' : 'active',
                visible: service.status !== 'active',
              }
            : service
        ),
      };

    case 'DELETE_SERVICE':
      return {
        ...state,
        data: state.data.filter((service) => service.id !== action.payload),
      };

    case 'DUPLICATE_SERVICE': {
      const original = state.data.find((service) => service.id === action.payload);
      if (!original) return state;

      const copy = {
        ...original,
        id: `S-${Date.now()}`,
        name: { ...original.name },
        description: { ...original.description },
      };

      return { ...state, data: [copy, ...state.data] };
    }

    default:
      return state;
  }
}

export function ServicesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let cancelled = false;

    getServices()
      .then((result) => {
        if (cancelled) return;
        const services = Array.isArray(result) ? result : result?.data || result?.services || [];
        dispatch({ type: 'LOAD_SUCCESS', payload: services });
      })
      .catch((error) => {
        if (!cancelled) dispatch({ type: 'LOAD_ERROR', payload: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const toApiService = ({
    nameEn,
    nameAr,
    descriptionEn,
    descriptionAr,
    category,
    minPricing,
    maxPricing,
    durationMinutes,
  }) => ({
    name: { en: nameEn.trim(), ar: nameAr.trim() },
    description: { en: descriptionEn.trim(), ar: descriptionAr.trim() },
    category,
    durationMinutes: Number(durationMinutes),
    price: { from: Number(minPricing), to: Number(maxPricing) },
  });

  const addService = async (form) => {
    const result = await createService(toApiService(form));
    const created = result?.data || result?.service || result;
    dispatch({ type: 'ADD_SERVICE', payload: created });
    return created;
  };

  const updateService = async (id, updates) => {
    const result = await editService(id, updates);
    const updated = result?.data || result?.service || result;
    dispatch({ type: 'UPDATE_SERVICE', payload: { id, ...updated } });
    return updated;
  };

  const toggleStatus = async (id) => {
    const service = state.data.find((item) => item.id === id);
    if (!service) return;

    const status = service.status === 'active' ? 'inactive' : 'active';
    const result = await editService(id, { status, visible: status === 'active' });
    const updated = result?.data || result?.service || { status, visible: status === 'active' };
    dispatch({ type: 'UPDATE_SERVICE', payload: { id, ...updated } });
    return updated;
  };

  const deleteService = async (id) => {
    await removeService(id);
    dispatch({ type: 'DELETE_SERVICE', payload: id });
  };

  const duplicateService = (id) => dispatch({ type: 'DUPLICATE_SERVICE', payload: id });

  return (
    <ServicesContext.Provider
      value={{
        ...state,
        addService,
        updateService,
        toggleStatus,
        deleteService,
        duplicateService,
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServicesContext);

  if (!context) {
    throw new Error('useServices must be used inside a <ServicesProvider>');
  }

  return context;
}
