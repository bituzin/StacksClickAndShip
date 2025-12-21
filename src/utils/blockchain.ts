// Pomocnicze funkcje blockchain

export async function fetchCurrentBlock(): Promise<number> {
  try {
    const res = await fetch('https://api.mainnet.hiro.so/v2/info');
    const data = await res.json();
    console.log('📍 Block heights - burn:', data.burn_block_height, 'stacks:', data.stacks_tip_height);
    return data.burn_block_height; // MUSI być burn_block_height bo kontrakt używa tego!
  } catch {
    return 0;
  }
}

export function parseValue(value: any): number {
  if (typeof value === 'bigint') {
    return Number(value);
  } else if (typeof value === 'string') {
    return Number(value.replace(/n$/, ''));
  } else if (typeof value === 'number') {
    return value;
  }
  return 0;
}
