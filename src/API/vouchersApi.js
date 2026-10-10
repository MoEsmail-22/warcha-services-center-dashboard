import apiClient from './client';
import { assertApiSuccess, handleApiError } from './errors';

/**
 * Marks a customer's loyalty voucher as used at this workshop.
 * PATCH /Workshop/vouchers/{code}/use — no body; the workshop comes from the login token.
 */
export async function redeemVoucher(code) {
  try {
    const response = await apiClient.patch(
      `/Workshop/vouchers/${encodeURIComponent(code.trim())}/use`
    );
    return assertApiSuccess(response.data, 'Failed to redeem the voucher.');
  } catch (error) {
    return handleApiError(error, 'Redeem voucher');
  }
}
