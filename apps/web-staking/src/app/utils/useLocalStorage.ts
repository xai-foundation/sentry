export const getLocalStorageItem = (key: string) => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(key) || "";
};

export const setLocalStorageItem = (key: string, value: string) => {
  localStorage.setItem(key, value);
};
