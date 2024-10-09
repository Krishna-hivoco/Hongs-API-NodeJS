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
