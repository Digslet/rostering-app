export const queryKeys = {
  roster: {
    all: ['roster'] as const,
    byLocation: (locationId: string, startDate: string) => [...queryKeys.roster.all, 'location', locationId, { startDate }] as const,
  },
  employees: {
    all: ['employees'] as const,
    detail: (id: string) => [...queryKeys.employees.all, id] as const,
  }
};