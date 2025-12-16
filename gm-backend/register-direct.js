import 'dotenv/config';
import { fetch } from 'undici';

async function registerWithDirectAPI() {
  try {
    // First delete all existing hooks
    const listRes = await fetch('https://api.mainnet.hiro.so/v1/ext', {
      headers: { 'x-api-key': process.env.HIRO_API_KEY }
    });
    const hooks = await listRes.json();
    
    for (const hook of hooks.results || []) {
      console.log(`🗑️ Deleting: ${hook.uuid}`);
      await fetch(`https://api.mainnet.hiro.so/v1/ext/${hook.uuid}`, {
        method: 'DELETE',
        headers: { 'x-api-key': process.env.HIRO_API_KEY }
      });
    }
    
    // Register new chainhook with direct API
    const payload = {
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
    };
    
    console.log('📤 Registering:', JSON.stringify(payload, null, 2));
    
    const res = await fetch('https://api.mainnet.hiro.so/v1/ext', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.HIRO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const text = await res.text();
    console.log('Response status:', res.status);
    console.log('Response:', text);
    
    if (res.ok) {
      const result = JSON.parse(text);
      console.log('✅ UUID:', result.uuid);
      
      // Enable it
      const enableRes = await fetch(`https://api.mainnet.hiro.so/v1/ext/${result.uuid}/enable`, {
        method: 'POST',
        headers: { 'x-api-key': process.env.HIRO_API_KEY }
      });
      console.log('Enable status:', enableRes.status);
      console.log('✅ Enabled!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

registerWithDirectAPI();
