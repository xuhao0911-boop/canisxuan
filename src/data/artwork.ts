import { generatedBreedArt, generatedDefaultVariants, generatedVariantArt } from './generated-art';

export const illustratedBreedCount = new Set(['bichon-frise', 'border-collie', ...Object.keys(generatedBreedArt)]).size;
export const illustrationExampleCount = 6 + new Set([...Object.values(generatedBreedArt), ...Object.values(generatedVariantArt).flatMap(variants => Object.values(variants))]).size;

export const approvedArtStyle = 'C' as const;
export type ArtStyle = typeof approvedArtStyle;
export const approvedArtwork = {
  key: approvedArtStyle,
  name: '柔和立体',
  image: require('../../assets/illustration-styles/sculpted.png.webp'),
};

export function generatedArtwork(breedId: string, color?: string, form?: string): number | undefined {
  const exact = generatedVariantArt[breedId]?.[`${color || ''}--${form || ''}`];
  if (exact !== undefined) return exact;
  const defaults = generatedDefaultVariants[breedId];
  if ((color && color !== defaults?.color) || (form && form !== defaults?.form)) return undefined;
  return generatedBreedArt[breedId];
}
export const artworkCrops = [
  { x: 0, y: 0, width: 445, height: 510 },
  { x: 445, y: 0, width: 545, height: 510 },
  { x: 990, y: 0, width: 546, height: 510 },
  { x: 0, y: 512, width: 445, height: 512 },
  { x: 445, y: 512, width: 545, height: 512 },
  { x: 990, y: 512, width: 546, height: 512 },
];
export function artworkCell(breedId: string, color?: string, form?: string): number | null {
  if (breedId === 'bichon-frise') {
    if (color && color !== 'white') return null;
    if (form && !['rounded', 'pet-short'].includes(form)) return null;
    return form === 'pet-short' ? 3 : 0;
  }
  if (breedId === 'border-collie') {
    if (form && !['rough', 'smooth'].includes(form)) return null;
    const coat = color || 'black-white';
    if (form === 'smooth') return coat === 'black-white' ? 4 : null;
    if (coat === 'brown-white' || coat === 'red-white') return 2;
    if (coat === 'blue-merle' || coat === 'blue-merle-white') return 5;
    return coat === 'black-white' ? 1 : null;
  }
  return null;
}
