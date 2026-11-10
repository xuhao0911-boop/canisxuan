const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const app = path.resolve(__dirname, '..');
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  if (/\.(jpg|png|jpeg)$/.test(file)) { assert(fs.existsSync(file)); return file; }
  const module = { exports: {} }; cache.set(file, module.exports);
  const localRequire = name => { let target = path.resolve(path.dirname(file), name); if (!path.extname(target)) target += '.ts'; return load(target); };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'module', 'exports', code)(localRequire, module, module.exports); return module.exports;
}
const { createPoster } = load(path.join(app, 'src/lib/poster.ts'));
const breeds = JSON.parse(fs.readFileSync(path.join(app, 'src/data/breeds-v2.json'), 'utf8'));
const jobs = JSON.parse(fs.readFileSync(path.join(app, 'design/art-jobs.json'), 'utf8'));
const crops = [{ x: 0, y: 0, width: 445, height: 510 }, { x: 445, y: 0, width: 545, height: 510 }, { x: 990, y: 0, width: 546, height: 510 }, { x: 0, y: 512, width: 445, height: 512 }, { x: 445, y: 512, width: 545, height: 512 }, { x: 990, y: 512, width: 546, height: 512 }];
test('share model matches all 679 independently recorded appearance assets', () => {
  assert.equal(jobs.length, 679);
  for (const job of jobs) {
    const breed = breeds.find(item => item.id === job.breedId);
    const model = createPoster(breed, job.colorId || undefined, job.formId || undefined);
    assert(model, job.key); assert.equal(model.asset, path.join(app, job.displayFile || job.sheet), job.key);
    if (job.sheet) assert.deepEqual(model.crop, crops[job.cell], job.key); else assert.equal(model.crop, undefined, job.key);
    if (job.formId) assert.equal(model.form, job.formId, job.key);
    if (job.colorId) assert.equal(model.color, job.colorId, job.key);
  }
});
test('all 378 defaults can generate a card without inventing unrecorded colours', () => {
  for (const breed of breeds) { const model = createPoster(breed); assert(model, breed.id); if (!breed.colors.length && !breed.forms.length) assert.equal(model.variant, '代表外观'); }
});
test('unknown appearance is rejected and reference-family profiles keep their own labels', () => {
  const bichon = breeds.find(item => item.id === 'bichon-frise');
  assert.equal(createPoster(bichon, 'fake-colour'), null); assert.equal(createPoster(bichon, undefined, 'fake-form'), null);
  const poodle = createPoster(breeds.find(item => item.id === 'poodle-standard'), 'apricot', 'toy'); assert(poodle.attributes.startsWith('小型')); assert(poodle.variant.includes('玩具型'));
  const spitz = createPoster(breeds.find(item => item.id === 'pomeranian'), undefined, 'wolfspitz'); assert.equal(spitz.color, undefined); assert(!spitz.variant.includes('橙色')); assert(spitz.asset.includes('wolfspitz'));
});
