/**
 * Platform API — v0.2
 */
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import {
  handleGetIntake,
  handlePatchIntake,
  handleImportWebsite,
  handleSuggestAudience,
  handleIntakeAnalyze,
  handleGetFeasibility,
  handleGetExistingMarketing,
  handleConfirmAnalysis,
  handleGetGoals,
  handlePatchGoals,
  handleConfirmGoals,
} from './routes/intake.mjs';
import {
  handleAuthRegister,
  handleAuthLogin,
  handleAuthMe,
  handleAuthVerifyEmail,
  handleAuthResendVerification,
  handleAuthForgotPassword,
  handleAuthResetPassword,
} from './routes/auth.mjs';
import {
  handleListProjects,
  handleCreateProject,
  handleGetProject,
  handlePatchProject,
} from './routes/projects.mjs';
import { handleAddMaterial, handleDeleteMaterial } from './routes/materials.mjs';
import { handleCatalogRecommendations } from './routes/catalog.mjs';
import { handleGetAutomationPolicy, handlePutAutomationPolicy } from './routes/admin.mjs';
import { handleAutomationCallback } from './routes/internal.mjs';
import { getConfig } from './config.mjs';
import { migrate } from './db/migrate.mjs';
import { json, readJson } from './lib/http.mjs';

const { port, publicDir } = getConfig();

await migrate();

const AUTH_PAGES = new Set(['/auth', '/login', '/register', '/auth/verify', '/auth/reset', '/auth/forgot']);
const APP_PAGES = /^\/app(\/|$)/;

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const path = url.pathname.replace(/\/$/, '') || '/';
  const auth = req.headers.authorization;

  try {
    if (req.method === 'GET' && path === '/health') {
      json(res, 200, { ok: true, service: 'marketing-autopilot-api', auth: true, intake: true });
      return;
    }

    if (req.method === 'GET' && path === '/') {
      json(res, 200, {
        ok: true,
        service: 'marketing-autopilot-api',
        ui: { auth: '/auth', app: '/app' },
        health: '/health',
      });
      return;
    }

    // Static assets
    const staticMatch = path.match(/^\/(auth\.(css|js)|app\.(css|js))$/);
    if (req.method === 'GET' && staticMatch) {
      const file = staticMatch[1].startsWith('auth') ? staticMatch[0] : staticMatch[0];
      await serveStatic(res, join(publicDir, file));
      return;
    }

    if (req.method === 'GET' && AUTH_PAGES.has(path)) {
      await serveStatic(res, join(publicDir, 'auth.html'));
      return;
    }

    if (req.method === 'GET' && (path === '/app' || APP_PAGES.test(path))) {
      await serveStatic(res, join(publicDir, 'app.html'));
      return;
    }

    // Auth
    if (req.method === 'POST' && path === '/api/auth/register') {
      await handleAuthRegister(res, await readJson(req));
      return;
    }
    if (req.method === 'POST' && path === '/api/auth/login') {
      await handleAuthLogin(res, await readJson(req));
      return;
    }
    if (req.method === 'GET' && path === '/api/auth/verify-email') {
      await handleAuthVerifyEmail(res, url.searchParams.get('token'));
      return;
    }
    if (req.method === 'POST' && path === '/api/auth/resend-verification') {
      await handleAuthResendVerification(res, await readJson(req));
      return;
    }
    if (req.method === 'POST' && path === '/api/auth/forgot-password') {
      await handleAuthForgotPassword(res, await readJson(req));
      return;
    }
    if (req.method === 'POST' && path === '/api/auth/reset-password') {
      await handleAuthResetPassword(res, await readJson(req));
      return;
    }
    if (req.method === 'GET' && path === '/api/auth/me') {
      await handleAuthMe(res, auth);
      return;
    }

    // Catalog
    if (req.method === 'GET' && path === '/api/catalog/recommendations') {
      await handleCatalogRecommendations(res, url);
      return;
    }

    // Admin (platform policy — not exposed in user Intake UI)
    if (path === '/api/admin/automation-policy') {
      if (req.method === 'GET') {
        await handleGetAutomationPolicy(res, req);
        return;
      }
      if (req.method === 'PUT') {
        await handlePutAutomationPolicy(res, req, await readJson(req));
        return;
      }
    }

    if (req.method === 'POST' && path === '/api/internal/automation/callback') {
      await handleAutomationCallback(res, req, await readJson(req));
      return;
    }

    // Projects
    if (req.method === 'GET' && path === '/api/projects') {
      await handleListProjects(res, auth);
      return;
    }
    if (req.method === 'POST' && path === '/api/projects') {
      await handleCreateProject(res, auth, await readJson(req));
      return;
    }

    const projectMatch = path.match(/^\/api\/projects\/([^/]+)(\/.*)?$/);
    if (projectMatch) {
      const projectId = decodeURIComponent(projectMatch[1]);
      const sub = projectMatch[2] || '';

      if (req.method === 'GET' && sub === '') {
        await handleGetProject(res, auth, projectId);
        return;
      }
      if (req.method === 'PATCH' && sub === '') {
        await handlePatchProject(res, auth, projectId, await readJson(req));
        return;
      }
      if (req.method === 'GET' && sub === '/intake') {
        await handleGetIntake(res, auth, projectId);
        return;
      }
      if (req.method === 'PATCH' && sub === '/intake') {
        await handlePatchIntake(res, auth, projectId, await readJson(req));
        return;
      }
      if (req.method === 'POST' && sub === '/intake/import-website') {
        await handleImportWebsite(res, auth, projectId, await readJson(req));
        return;
      }
      if (req.method === 'POST' && sub === '/intake/suggest-audience') {
        await handleSuggestAudience(res, auth, projectId, await readJson(req));
        return;
      }
      if (req.method === 'POST' && sub === '/intake/analyze') {
        await handleIntakeAnalyze(res, auth, projectId, await readJson(req));
        return;
      }
      if (req.method === 'POST' && sub === '/materials') {
        await handleAddMaterial(res, auth, projectId, await readJson(req));
        return;
      }
      const matDel = sub.match(/^\/materials\/([^/]+)$/);
      if (req.method === 'DELETE' && matDel) {
        await handleDeleteMaterial(res, auth, projectId, decodeURIComponent(matDel[1]));
        return;
      }
      if (req.method === 'GET' && sub === '/analysis/feasibility') {
        await handleGetFeasibility(res, auth, projectId);
        return;
      }
      if (req.method === 'GET' && sub === '/analysis/existing-marketing') {
        await handleGetExistingMarketing(res, auth, projectId);
        return;
      }
      if (req.method === 'POST' && sub === '/analysis/confirm') {
        await handleConfirmAnalysis(res, auth, projectId);
        return;
      }
      if (req.method === 'GET' && sub === '/goals') {
        await handleGetGoals(res, auth, projectId);
        return;
      }
      if (req.method === 'PATCH' && sub === '/goals') {
        await handlePatchGoals(res, auth, projectId, await readJson(req));
        return;
      }
      if (req.method === 'POST' && sub === '/goals/confirm') {
        await handleConfirmGoals(res, auth, projectId);
        return;
      }
    }

    json(res, 404, { error: 'Not found', path });
  } catch (err) {
    const status = err.status || 500;
    json(res, status, { error: err.message });
  }
});

server.listen(port, () => {
  console.log(`Marketing Autopilot API listening on http://localhost:${port}`);
});

async function serveStatic(res, filePath) {
  if (!existsSync(filePath)) {
    json(res, 404, { error: 'Not found' });
    return;
  }
  const ext = extname(filePath);
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
  };
  const fs = await import('node:fs/promises');
  const body = await fs.readFile(filePath);
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
  res.end(body);
}

export { getConfig };
