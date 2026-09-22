export const calculateAge = (dob: Date, now: Date = new Date()): number => {
  const currentYear = now.getUTCFullYear();
  let age = currentYear - dob.getUTCFullYear();
  const birthdayThisYear = Date.UTC(currentYear, dob.getUTCMonth(), dob.getUTCDate());

  if (now.getTime() < birthdayThisYear) {
    age -= 1;
  }

  return age;
};

export const isAgeIntent = (query: string): boolean =>
  /\b(age|old)\b/.test(query) || /\bhow old are you\b/.test(query);
