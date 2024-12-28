const REGISTRATION_COOLDOWN = 300000; // 5 minutes in milliseconds
const STORAGE_KEY = 'lastRegistrationAttempt';

export const isValidEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const canAttemptRegistration = () => {
  const lastAttempt = localStorage.getItem(STORAGE_KEY);
  if (!lastAttempt) return true;

  const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
  return timeSinceLastAttempt >= REGISTRATION_COOLDOWN;
};

export const setRegistrationAttempt = () => {
  localStorage.setItem(STORAGE_KEY, Date.now().toString());
};

export const getRemainingCooldownTime = () => {
  const lastAttempt = localStorage.getItem(STORAGE_KEY);
  if (!lastAttempt) return 0;

  const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
  const remainingTime = Math.ceil((REGISTRATION_COOLDOWN - timeSinceLastAttempt) / 1000);
  return remainingTime > 0 ? remainingTime : 0;
};