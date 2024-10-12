const apiKey = process.env.REACT_APP_HELIUS_API_KEY;

export const HELIUS_RPC_URL = `https://rpc.helius.xyz/?api-key=${apiKey}`;
export const VALIDATORS_PER_PAGE = 16;
export const TOTAL_VALIDATORS = 50;

// Add this line for debugging
console.log('HELIUS_RPC_URL:', HELIUS_RPC_URL);






