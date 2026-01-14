export const getLast48HoursRange = () => {
  const now = new Date();
  const last48Hours = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  return {
    from: last48Hours.toISOString(),
    to: now.toISOString(),
  };
};