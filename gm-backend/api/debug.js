export default async function handler(req, res) {
  // Debug endpoint
  res.status(200).json({ 
    hasSecret: !!process.env.WEBHOOK_SECRET,
    secretLength: process.env.WEBHOOK_SECRET?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  });
}
