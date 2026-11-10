import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAppServer } from './server/app.mjs';
const app = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.DOG_ATLAS_PORT || 4178);
const server = createAppServer({ root: path.join(app, 'dist'), dataDirectory: process.env.CANISXUAN_DATA_DIR || path.join(app, '.canisxuan-data'), catalog: JSON.parse(fs.readFileSync(path.join(app, 'src/data/breeds-v2.json'), 'utf8')), allowedOrigin: process.env.CANISXUAN_ALLOWED_ORIGIN });
server.listen(port, '127.0.0.1', () => console.log('CanisXuan: http://127.0.0.1:' + port));
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? '端口已被占用，请打开已有预览，或修改 DOG_ATLAS_PORT。' : error.message); process.exitCode = 1; });
