import apiClient from './client';
import { assertApiSuccess, createLocalError, handleApiError } from './errors';

/**
 * Converts the Offers form values into the body the API expects.
 *   serviceId          → "12" (select value)
 *   discountPercentage → "15" (0–100)
 *   startAt / endAt    → "2026-10-07T10:00" (datetime-local, user's local time)
 * Returns { serviceId, discountPercentage, startAt, endAt } with numbers and UTC ISO dates.
 */
export function toOfferPayload({ serviceId, discountPercentage, startAt, endAt }) {
  const id = Number(serviceId);
  const discount = Number(discountPercentage);
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (!Number.isInteger(id) || id <= 0)
    throw createLocalError('offer.serviceRequired', 'Choose a service for this offer.');
  if (!Number.isFinite(discount) || discount <= 0 || discount > 100) {
    throw createLocalError(
      'offer.invalidDiscount',
      'Discount must be more than 0 and at most 100.'
    );
  }
  if (Number.isNaN(start.getTime()))
    throw createLocalError('form.invalidStart', 'Enter a valid start date and time.');
  if (Number.isNaN(end.getTime()))
    throw createLocalError('form.invalidEnd', 'Enter a valid end date and time.');
  if (end <= start)
    throw createLocalError('form.endBeforeStart', 'The end time must be after the start time.');

  return {
    serviceId: id,
    discountPercentage: discount,
    startAt: start.toISOString(),
    endAt: end.toISOString(),
  };
}

export async function createOffer(form) {
  try {
    const response = await apiClient.post('/Workshop/offer', toOfferPayload(form));
    return assertApiSuccess(response.data, 'Failed to create offer.');
  } catch (error) {
    return handleApiError(error, 'Create offer');
  }
}
