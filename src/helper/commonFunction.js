export const timeAndDateFormate = () => {
  const date = new Date().toISOString();
  const dateObject = new Date(date);
  const optionsDate = { year: "numeric", month: "2-digit", day: "2-digit" };
  const optionsTime = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  };
  const formattedDate = dateObject.toLocaleDateString("en-US", optionsDate);
  const formattedTime = dateObject.toLocaleTimeString("en-US", optionsTime);
  return { formattedTime, formattedDate };
};

export function selectedDateRange(period) {
  let currentPeriodStart, previousPeriodStart;

  // Calculate the start dates based on the period
  switch (period) {
    case "7d":
      currentPeriodStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      break;
    case "14d":
      currentPeriodStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      previousPeriodStart = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
      break;
    case "1m":
      currentPeriodStart = new Date(
        new Date().setMonth(new Date().getMonth() - 1)
      );
      previousPeriodStart = new Date(
        new Date().setMonth(new Date().getMonth() - 2)
      );
      break;
    case "3m":
      currentPeriodStart = new Date(
        new Date().setMonth(new Date().getMonth() - 3)
      );
      previousPeriodStart = new Date(
        new Date().setMonth(new Date().getMonth() - 6)
      );
      break;
    default:
      throw new Error("Invalid period specified");
  }

  const currentPeriodEnd = new Date(); // Current end date is now
  const previousPeriodEnd = currentPeriodStart; // End of previous period is the start of the current

  // Convert JavaScript dates to SQL date strings (YYYY-MM-DD format)
  const currentPeriodStartStr = currentPeriodStart.toISOString().split("T")[0];
  const currentPeriodEndStr = currentPeriodEnd.toISOString().split("T")[0];
  const previousPeriodStartStr = previousPeriodStart
    .toISOString()
    .split("T")[0];
  const previousPeriodEndStr = previousPeriodEnd.toISOString().split("T")[0];
  return {
    period,
    currentPeriodStartStr,
    currentPeriodStart,
    previousPeriodEnd,
    currentPeriodEndStr,
    previousPeriodStartStr,
    previousPeriodEndStr,
  };
}
