type BrowserStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function createWebAuthStorage(browserStorage?: BrowserStorage) {
  return {
    getItem: async (key: string) => browserStorage?.getItem(key) ?? null,
    setItem: async (key: string, value: string) => {
      browserStorage?.setItem(key, value);
    },
    removeItem: async (key: string) => {
      browserStorage?.removeItem(key);
    },
  };
}
