export const getLocalStorageItem = (key: string) => {
  return localStorage.getItem(key) || "";
};

export const setLocalStorageItem = (key: string, value: string) => {
  localStorage.setItem(key, value);
};
