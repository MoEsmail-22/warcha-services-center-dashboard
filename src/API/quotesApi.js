import apiClient from './client';
import { assertApiSuccess, handleApiError } from './errors';
import { logError, logResponse } from './devLog';

/** All quotes this workshop has sent. */
export async function getQuotes() {
  try {
    const response = await apiClient.get('/Workshop/quotes');
    logResponse('Quotes API', 'GET quotes', response);
    return assertApiSuccess(response.data, 'Failed to load quotes.');
  } catch (error) {
    logError('Quotes API', 'GET quotes', error);
    return handleApiError(error, 'Load quotes');
  }
}

/**
 * Sends a quote for a booking. The booking ID goes in the URL and in the body:
 *   POST /Workshop/bookings/{bookingId}/quotes
 *   { bookingId, items: [{ description, price }], note }
 */
export async function createQuote(bookingId, { items, note }) {
  try {
    const response = await apiClient.post(`/Workshop/bookings/${bookingId}/quotes`, {
      bookingId: Number(bookingId),
      items: items.map((item) => ({
        description: item.description.trim(),
        price: Number(item.price),
      })),
      note: note?.trim() || null,
    });
    logResponse('Quotes API', `POST quote for booking ${bookingId}`, response);
    return assertApiSuccess(response.data, 'Failed to send the quote.');
  } catch (error) {
    logError('Quotes API', `POST quote for booking ${bookingId}`, error);
    return handleApiError(error, 'Send quote');
  }
}
