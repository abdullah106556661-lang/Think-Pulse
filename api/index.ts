import app from '../server';

export default function handler(req: any, res: any) {
  try {
    const forwarded = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'] || req.headers['x-real-origin-path'];
    if (typeof forwarded === 'string' && forwarded.length > 0 && req.url !== forwarded) {
      req.url = forwarded;
    } else if (req.query && req.query.__v_path) {
      const vPath = String(req.query.__v_path);
      delete req.query.__v_path;
      if (vPath.startsWith('site/') || vPath.startsWith('app/') || vPath.startsWith('deployed/') || vPath === 'robots.txt' || vPath === 'sitemap.xml') {
        req.url = `/${vPath}`;
      } else {
        req.url = `/api/${vPath.replace(/^\/+/, '')}`;
      }
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

