export const calculateNewTime = (currentTime: number, day: number, minutes: number) => {
  const newTotalMinutes = currentTime + minutes;
  const newCurrentTime = newTotalMinutes % (24 * 60);
  const newHour = Math.floor(newCurrentTime / 60);
  const newMinute = newCurrentTime % 60;
  const newDay = day + Math.floor(newTotalMinutes / (24 * 60));

  return { newCurrentTime, newDay, newHour, newMinute };
};

export const getTimeOfDay = (hour: number): 'morning' | 'afternoon' | 'evening' | 'night' => {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
};