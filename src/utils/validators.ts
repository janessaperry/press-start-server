export function validateEmailFormat (email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validatePasswordFormat (password: string) {
  const regex = /^(?=.*[a-z])(?=.*\d).{8,}$/;
  return regex.test(password);
}