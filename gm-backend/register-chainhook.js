import 'dotenv/config';
import { ChainhooksClient, CHAINHOOKS_BASE_URL } from '@hirosystems/chainhooks-client';

const client = new ChainhooksClient({
  baseUrl: CHAINHOOKS_BASE_URL.mainnet,
  apiKey: process.env.HIRO_API_KEY
});

async function registerGMChainhook() {
  try {
    // First, delete old chainhooks
    const { results } = await client.getChainhooks();
    for (const hook of results) {
      console.log(`🗑️ Deleting old chainhook: ${hook.uuid}`);
      await client.deleteChainhook(hook.uuid);
    }
    
    const chainhook = await client.registerChainhook({
      name: 'GM Unlimited Monitor',
      version: 1,
      chain: 'stacks',
      network: 'mainnet',
      filters: {
        events: [{
          type: 'contract_call',
          contract_identifier: 'SP12XVTT769QRMK2TA2EETR5G57Q3W5A4HPA67S86.gm-unlimited',
          method: 'say-gm'
        }]
      },
      action: {
        type: 'http_post',
        url: 'https://gm-backend-nine.vercel.app/api/webhook'
      }
    });
    
    console.log('✅ Chainhook registered!');
    console.log('   UUID:', chainhook.uuid);
    
    // Enable the chainhook
    console.log('🔄 Enabling chainhook...');
    await client.enableChainhook(chainhook.uuid, true);
    console.log('✅ Chainhook enabled!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

registerGMChainhook();
