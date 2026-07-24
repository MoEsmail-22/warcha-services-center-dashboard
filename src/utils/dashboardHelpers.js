// Safe customer accessors
export function getCustomerInitials(customer) {
  if (typeof customer === 'string') {
    return customer
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  if (customer && typeof customer === 'object') {
    return (
      customer.initials ??
      customer.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) ??
      '?'
    );
  }
  return '?';
}

export function getGreeting(hour, t) {
  if (hour < 12) return t('greeting.morning', { defaultValue: 'Good morning' });
  if (hour < 17) return t('greeting.afternoon', { defaultValue: 'Good afternoon' });
  if (hour < 21) return t('greeting.evening', { defaultValue: 'Good evening' });
  return t('greeting.night', { defaultValue: 'Good night' });
}

export function getCustomerName(customer) {
  if (typeof customer === 'string') return customer;
  return customer?.name ?? 'Unknown';
}

export function getCustomerColor(customer) {
  if (customer && typeof customer === 'object') return customer.avatarColor ?? '#3B82F6';
  return '#3B82F6';
}
