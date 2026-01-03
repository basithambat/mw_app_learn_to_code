export const getLast48HoursRange = () => {
  // const now = new Date();
  // const last24Hours = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // return {
  //   from: last24Hours.toISOString(),
  //   to: now.toISOString(),
  // };

    const from = new Date();
    const oneMonthBefore = new Date();
    oneMonthBefore.setMonth(from.getMonth() - 1); // Subtract 1 month
  
    return {
      from: oneMonthBefore.toISOString(),
      to: from.toISOString(),
    };
};