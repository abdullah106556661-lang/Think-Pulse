import app from '../server';

export default function handler(req: any, res: any) {
  try {
    const forwarded = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
    if (typeof forwarded === 'string' && forwarded.startsWith('/api') && req.url !== forwarded) {
      req.url = forwarded;
    }
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Handler Crash Error]:', err);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({
        error: err?.message || 'Server error occurred during request processing.',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
