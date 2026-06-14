/**
 * Platform API — v0.2 skeleton
 */
import { createServer } from 'node:http';
import { handleIntakeAnalyze } from './routes/intake.mjs';
import { resolveProjectRoot } from './services/workspace.mjs';

const PORT = Number(process.env.PORT || 3001);

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const path = url.pathname;

  try {
    if (req.method === 'GET' && path === '/health') {
      json(res, 200, { ok: true, service: 'marketing-autopilot-api' });
      return;
    }

    const analyzeMatch = path.match(/^\/api\/projects\/([^/]+)\/intake\/analyze$/);
    if (req.method === 'POST' && analyzeMatch) {
      const projectId = decodeURIComponent(analyzeMatch[1]);
      const body = await readJson(req);
      await handleIntakeAnalyze(res, { projectId, body });
      return;
    }

    json(res, 404, { error: 'Not found', path });
  } catch (err) {
    json(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Marketing Autopilot API listening on http://localhost:${PORT}`);
});

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

export { resolveProjectRoot };
