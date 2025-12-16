export default async function handler(req, res) {
  console.log('🔔 WEBHOOK HIT! Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  res.status(200).json({ 
    ok: true,
    timestamp: new Date().toISOString(),
    body: req.body
  });
}
