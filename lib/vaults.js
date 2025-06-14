export const VAULTS = [
  {
    name: "yvWETH",
    address: "0xccc0fc2e34428120f985b460b487eb79e3c6fa57",
    decimals: 18,
    underlying: "WETH",
    tvl: 1234.56, // Mock value
    apy: 0.13 // 13%
  },
  {
    name: "yvAUSD",
    address: "0xAe4b2FCf45566893Ee5009BA36792D5078e4AD60",
    decimals: 18,
    underlying: "AUSD",
    tvl: 9876.54, // Mock value
    apy: 0.089 // 8.9%
  }
];

export async function fetchVaultsTVL() {
  return new Promise(resolve => setTimeout(() => resolve(VAULTS), 500));
}
