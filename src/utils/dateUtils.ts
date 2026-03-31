export function getReleaseDateOffset (date: Date, monthOffset: number) {
  const dateCopy = new Date(date);
  return new Date(dateCopy.setMonth(dateCopy.getMonth() + monthOffset))
}