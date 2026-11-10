import { breeds, byId } from '../data/catalog';
import dogLabels from './dog-labels.json';
import { Prediction } from './html';
const links: Record<string, string> = {
  'chihuahua': 'chihuahua', 'maltese dog': 'maltese', 'pekinese': 'pekingese', 'shih-tzu': 'shih-tzu',
  'blenheim spaniel': 'cavalier-king-charles-spaniel', 'papillon': 'papillon', 'beagle': 'beagle',
  'yorkshire terrier': 'yorkshire-terrier', 'miniature schnauzer': 'miniature-schnauzer',
  'golden retriever': 'golden-retriever', 'labrador retriever': 'labrador-retriever',
  'german shepherd': 'german-shepherd-dog', 'border collie': 'border-collie', 'shetland sheepdog': 'shetland-sheepdog',
  'malamute': 'alaskan-malamute', 'siberian husky': 'siberian-husky', 'samoyed': 'samoyed', 'pomeranian': 'pomeranian',
  'pembroke': 'pembroke-welsh-corgi', 'french bulldog': 'french-bulldog', 'pug': 'pug',
  'bernese mountain dog': 'bernese-mountain-dog', 'dalmatian': 'dalmatian', 'standard poodle': 'poodle-standard',
};
export function dogPredictions(predictions: Prediction[]) {
  const candidates = predictions.filter(p => dogLabels.some(label => label.toLowerCase() === p.className.toLowerCase()));
  const topIsDog = predictions.length > 0 && candidates.some(c => c.className === predictions[0].className);
  if (!topIsDog || !candidates.length || candidates[0].probability < 0.18 || candidates.reduce((total, p) => total + p.probability, 0) < 0.35) return [];
  return candidates.filter(p => p.probability >= 0.03).slice(0, 3).map(p => {
    const words = p.className.toLowerCase().split(',').map(w => w.trim());
    const normalize = (text: string) => text.toLowerCase().replace(/\bdog\b/g, '').replace(/[^a-z0-9]/g, '');
    const directId = words.map(w => links[w]).find(Boolean);
    const match = directId ? undefined : breeds.find(b => [b.en, ...b.aliases].some(name => words.some(word => normalize(name) === normalize(word))));
    const id = directId || match?.id;
    return { ...p, breed: id ? byId[id] : null, name: id ? byId[id].name : p.className.split(',')[0] };
  });
}
