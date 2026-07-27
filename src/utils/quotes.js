/** Quote-specific formatting and search helpers shared by quote UI surfaces. */

/**
 * Filters the compact quote records used by the Quotes page.
 * Search intentionally covers the customer, vehicle, and quoted service.
 */
export function filterQuotes(quotes, searchTerm) {
  const query = searchTerm.trim().toLocaleLowerCase();
  if (!query) return quotes;

  return quotes.filter((quote) =>
    [quote.customer?.name, quote.vehicle, quote.service].some((value) =>
      value?.toLocaleLowerCase().includes(query)
    )
  );
}

/** Formats an EGP amount consistently across quote cards and totals. */
export function formatQuoteCurrency(amount, locale = 'en-US', currency = 'EGP') {
  return `${new Intl.NumberFormat(locale).format(amount || 0)} ${currency}`;
}
