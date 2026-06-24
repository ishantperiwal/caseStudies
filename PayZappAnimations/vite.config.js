import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'delete-asset-api',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/delete-asset' && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const { assetPath } = JSON.parse(body);
                if (!assetPath) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'assetPath is required' }));
                  return;
                }

                // Resolve absolute path in workspace
                const publicDir = path.resolve(__dirname, 'public');
                const sourceFile = path.join(publicDir, assetPath);

                // Security bounds check
                const relative = path.relative(publicDir, sourceFile);
                if (relative.startsWith('..') || path.isAbsolute(relative)) {
                  res.statusCode = 403;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Access denied' }));
                  return;
                }

                if (fs.existsSync(sourceFile)) {
                  const deletedDir = path.join(publicDir, '.deleted');
                  if (!fs.existsSync(deletedDir)) {
                    fs.mkdirSync(deletedDir, { recursive: true });
                  }

                  const destFile = path.join(deletedDir, path.basename(sourceFile));
                  let finalDest = destFile;
                  if (fs.existsSync(destFile)) {
                    const ext = path.extname(sourceFile);
                    const base = path.basename(sourceFile, ext);
                    finalDest = path.join(deletedDir, `${base}_${Date.now()}${ext}`);
                  }

                  fs.renameSync(sourceFile, finalDest);

                  // Trigger assets scan immediately to update src/assets_manifest.json
                  console.log(`Asset moved to .deleted: ${assetPath}. Triggering scan...`);
                  execSync('npm run scan');

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, message: 'Moved asset to public/.deleted/' }));
                } else {
                  res.statusCode = 404;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'File not found' }));
                }
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
  base: './',
});
