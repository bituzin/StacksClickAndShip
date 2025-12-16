export default async function handler(req, res) {
  // Log everything first for debugging
  console.log('🔔 Webhook called!');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }
  
  const authHeader = req.headers.authorization;
  const expectedAuth = `Bearer ${process.env.WEBHOOK_SECRET}`;
  
  console.log('Auth check:', authHeader === expectedAuth ? '✅ Valid' : '❌ Invalid');
  console.log('Expected:', expectedAuth);
  console.log('Received:', authHeader);
  
  // Temporarily disabled for testing
  // if (authHeader !== expectedAuth) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }
  
  try {
    const payload = req.body;
    
    // Log the entire payload structure
    console.log('Full payload:', JSON.stringify(payload, null, 2));
    
    const events = payload.apply || [];
    
    console.log(`📨 Received ${events.length} GM events`);
    
    for (const event of events) {
      console.log('☀️ GM from:', event.sender);
      console.log('   TX:', event.transaction_id);
    }
    
    res.status(200).json({ 
      success: true, 
      processed: events.length 
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
}
