import { ChainhooksClient, CHAINHOOKS_BASE_URL } from '@hirosystems/chainhooks-client';

const client = new ChainhooksClient({
  baseUrl: CHAINHOOKS_BASE_URL.mainnet,
  apiKey: process.env.HIRO_API_KEY
});

async function registerGMChainhook() {
  try {
    const chainhook = await client.registerChainhook({
      name: 'GM Unlimited Monitor',
      chain: 'stacks',
      network: 'mainnet',
      filters: {
        contract_id: 'SP12XVTT769QRMK2TA2EETR5G57Q3W5A4HPA67S86.gm-unlimited',
        method: 'say-gm'
      },
      action: {
        http_post: {
          url: 'https://TWOJ-PROJEKT.vercel.app/api/webhook',
          authorization_header: 'Bearer moj-tajny-token-12345'
        }
      }
    });
    
    console.log('✅ Chainhook registered!');
    console.log('   UUID:', chainhook.uuid);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

registerGMChainhook();
