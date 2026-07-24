import { createContext, useContext, useEffect, useReducer } from 'react';
import mockReviews from '@/mocks/reviews.json';

const ReviewsContext = createContext(null);

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

    case 'REPLY_REVIEW':
      return {
        ...state,
        data: state.data.map((review) =>
          review.id === action.payload.id
            ? {
                ...review,
                reply: action.payload.text,
                replyTimestamp: new Date().toISOString(),
              }
            : review
        ),
      };

    case 'EDIT_REPLY':
      return {
        ...state,
        data: state.data.map((review) =>
          review.id === action.payload.id ? { ...review, reply: action.payload.text } : review
        ),
      };

    case 'DELETE_REVIEW':
      return {
        ...state,
        data: state.data.filter((review) => review.id !== action.payload),
      };

    default:
      return state;
  }
}

export function ReviewsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        dispatch({ type: 'LOAD_SUCCESS', payload: mockReviews });
      } catch (error) {
        dispatch({ type: 'LOAD_ERROR', payload: error.message });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const replyReview = (id, text) => dispatch({ type: 'REPLY_REVIEW', payload: { id, text } });

  const editReply = (id, text) => dispatch({ type: 'EDIT_REPLY', payload: { id, text } });

  const deleteReview = (id) => dispatch({ type: 'DELETE_REVIEW', payload: id });

  return (
    <ReviewsContext.Provider
      value={{
        ...state,
        replyReview,
        editReply,
        deleteReview,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);

  if (!context) {
    throw new Error('useReviews must be used inside a <ReviewsProvider>');
  }

  return context;
}
