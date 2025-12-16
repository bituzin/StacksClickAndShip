import 'dotenv/config';
import { ChainhooksClient, CHAINHOOKS_BASE_URL } from '@hirosystems/chainhooks-client';

const client = new ChainhooksClient({
  baseUrl: CHAINHOOKS_BASE_URL.mainnet,
  apiKey: process.env.HIRO_API_KEY
});

async function checkChainhooks() {
  try {
    console.log('📋 Checking API status...');
    const status = await client.getStatus();
    console.log('✅ API Status:', status.status);
    console.log('   Server Version:', status.server_version);
    
    console.log('\n📋 Listing all chainhooks...');
    const { results, total } = await client.getChainhooks({ limit: 60 });
    console.log(`Found ${total} total chainhooks`);
    console.log(`Retrieved ${results.length} chainhooks\n`);
    
    for (const hook of results) {
      console.log('---');
      console.log('UUID:', hook.uuid);
      console.log('Name:', hook.definition?.name);
      console.log('Chain:', hook.definition?.chain);
      console.log('Network:', hook.definition?.network);
      console.log('Enabled:', hook.enabled);
      console.log('Status:', hook.status);
      if (hook.definition?.filters?.events) {
        console.log('Contract:', hook.definition.filters.events[0]?.contract_identifier);
        console.log('Method:', hook.definition.filters.events[0]?.method);
      }
      if (hook.definition?.action?.url) {
        console.log('Webhook URL:', hook.definition.action.url);
      }
    }
    
    // Try to get the specific chainhook
    console.log('\n📋 Checking specific chainhook: 4b7a6436-a6d1-410e-9f74-dc70ea9a159d');
    try {
      const specific = await client.getChainhook('4b7a6436-a6d1-410e-9f74-dc70ea9a159d');
      console.log('✅ Found:', JSON.stringify(specific, null, 2));
    } catch (e) {
      console.log('❌ Not found:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

checkChainhooks();
