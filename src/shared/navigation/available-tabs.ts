export const hiddenTabNames = ["goals"] as const;

export function isVisibleTab(tabName: string): boolean {
  return !hiddenTabNames.includes(tabName as (typeof hiddenTabNames)[number]);
}

export function unavailableTabRedirect(tabName: string): "/" | null {
  return isVisibleTab(tabName) ? null : "/";
}
