export const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export const validatePasswordFormat = (password: string) => {
  const regex = /^(?=.*[a-z])(?=.*\d).{8,}$/;
  return regex.test(password);
}