cd..export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }
  
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const payload = req.body;
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
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
