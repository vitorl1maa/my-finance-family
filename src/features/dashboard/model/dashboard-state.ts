export function shouldShowEmptyPiggyBankBanner(loading: boolean, sourceCount: number): boolean {
  return !loading && sourceCount === 0;
}
