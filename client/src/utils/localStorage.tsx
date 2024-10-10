const getLocalValue = (key: string) =>
  localStorage.getItem(key)
    ? JSON.parse(localStorage.getItem(key) as string)
    : null;

const setLocalValue = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export { getLocalValue, setLocalValue };
