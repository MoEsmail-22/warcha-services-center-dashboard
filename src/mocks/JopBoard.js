export const mockJobs = [
  // ---- New (2 cards) ----
  {
    id: 'job-1',
    stage: 'new',
    vehicle: 'Hyundai Elantra',
    service: 'Brake check',
    customer: 'Sara K.',
    initials: 'SK',
    time: '11:00',
  },
  {
    id: 'job-2',
    stage: 'new',
    vehicle: 'Nissan Sunny',
    service: 'General check',
    customer: 'Nadia F.',
    initials: 'NF',
    time: '2:30',
  },
  // ---- Diagnosing (1 card) ----
  {
    id: 'job-3',
    stage: 'diagnosing',
    vehicle: 'Kia Sportage',
    service: 'A/C not cooling',
    customer: 'Omar T.',
    initials: 'OT',
    time: '1:00',
  },
  // ---- In Progress (2 cards) ----
  {
    id: 'job-4',
    stage: 'in_progress',
    vehicle: 'Toyota Corolla',
    service: 'Oil change',
    customer: 'Hazem M.',
    initials: 'HM',
    time: '10:30',
  },
  {
    id: 'job-5',
    stage: 'in_progress',
    vehicle: 'Chevrolet Optra',
    service: 'Suspension',
    customer: 'Mostafa R.',
    initials: 'MR',
    time: '9:00',
  },
  // ---- Ready (1 card) ----
  {
    id: 'job-6',
    stage: 'ready',
    vehicle: 'Honda Civic',
    service: 'Oil + filter',
    customer: 'Youssef H.',
    initials: 'YH',
    time: null,
    done: true,
  },
];
