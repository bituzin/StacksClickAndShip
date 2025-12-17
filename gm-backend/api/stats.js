import { callReadOnlyFunction } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const GMOK_CONTRACT_ADDRESS = 'SP12XVTT769QRMK2TA2EETR5G57Q3W5A4HPA67S86';
const GMOK_CONTRACT_NAME = 'gm-unlimited';

// In-memory cache (działa w ramach jednej instancji Vercel)
let statsCache = null;
let lastUpdate = 0;
const CACHE_TTL = 30000; // 30 sekund

export default async function handler(req, res) {
  // CORS headers - muszą być na początku
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const now = Date.now();
    
    // Zwróć cache jeśli jest świeży
    if (statsCache && (now - lastUpdate) < CACHE_TTL) {
      return res.status(200).json({
        ...statsCache,
        cached: true,
        age: Math.floor((now - lastUpdate) / 1000)
      });
    }
    
    // Pobierz świeże dane z blockchain
    const network = new StacksMainnet();
    const senderAddress = 'SP000000000000000000002Q6VF78';
    
    // Pobierz statystyki
    const statsRes = await callReadOnlyFunction({
      contractAddress: GMOK_CONTRACT_ADDRESS,
      contractName: GMOK_CONTRACT_NAME,
      functionName: 'get-stats',
      functionArgs: [],
      network,
      senderAddress,
    });
    
    const stats = statsRes?.value?.data;
    
    // Parsuj dane
    const totalGm = stats?.['total-gms']?.value 
      ? (typeof stats['total-gms'].value === 'bigint' 
          ? Number(stats['total-gms'].value) 
          : Number(stats['total-gms'].value))
      : 0;
      
    const todayGm = stats?.['today-gms']?.value
      ? (typeof stats['today-gms'].value === 'bigint'
          ? Number(stats['today-gms'].value)
          : Number(stats['today-gms'].value))
      : 0;
    
    // Zaktualizuj cache
    statsCache = {
      totalGm,
      todayGm,
      lastUpdated: new Date().toISOString()
    };
    lastUpdate = now;
    
    res.status(200).json({
      ...statsCache,
      cached: false
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stats',
      message: error.message 
    });
  }
}
