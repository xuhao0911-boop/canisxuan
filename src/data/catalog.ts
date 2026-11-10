import source from './breeds-v2.json';
export type CoatColor = { id: string; name: string; en: string; swatches: string[]; source: string; kind: string };
export type FormProfile = { description?: string; appearance?: string; temperament?: string; coatNote?: string; care?: string; beginnerNote?: string; height?: string; weight?: string; size?: string; coat?: string; profileNote?: string };
export type BreedForm = { id: string; name: string; kind: string; source: string; profile?: FormProfile };
export type Breed = {
  id: string; name: string; en: string; aliases: string[]; origin: string; size: string; sizes?: string[]; coat: string; coats?: string[]; tags: string[];
  description: string; care: string; height: string; weight: string; energy: number | null; trainability: number | null; grooming: number | null; shedding: number | null;
  source: string; sourceDate: string; wikiUrl?: string; imageAttribution?: string; imageLicense?: string; imageSource?: string; imageLicenseUrl?: string;
  fciId: number | null; nativeName: string; group: number; groupName: string; recognition: string; standardUrl: string; fciSource: string; ckuSource: string;
  complete: boolean; artStatus: string; colors: CoatColor[]; forms: BreedForm[]; standardVarieties: string[]; profileNote?: string;
  catalogKind?: 'fci-standard' | 'other-standard' | 'regional-type'; profileLevel?: 'index' | 'intro' | 'standard' | 'detailed';
  appearance?: string; temperament?: string; coatNote?: string; beginnerNote?: string; sourceLabel?: string; referenceSources?: { label: string; url: string }[];
};
export const breeds = source as unknown as Breed[];
export const detailedCount = breeds.filter(b => b.complete).length;
export const introducedCount = breeds.filter(b => !!b.description.trim()).length;
export const breedGroups = ['全部', ...Array.from({ length: 10 }, (_, i) => String(i + 1)), '暂准', '地方与其他'];
export const groupNames: Record<string, string> = { '1': '牧羊与牧牛', '2': '宾莎、雪纳瑞与獒犬', '3': '梗犬', '4': '腊肠犬', '5': '尖嘴与原始型', '6': '嗅觉猎犬', '7': '指示猎犬', '8': '寻回、搜寻与水猎犬', '9': '伴侣与玩具犬', '10': '视觉猎犬', '暂准': '暂准认可', '地方与其他': '地方犬与其他体系' };
export function catalogLabel(breed: Breed) { return breed.fciId ? 'FCI ' + breed.fciId : breed.catalogKind === 'regional-type' ? '地方类型' : '其他体系'; }
export function sizeLabel(size: string) { return size === '多种' ? '多体型' : size ? size + '犬' : '—'; }
export const byId = Object.fromEntries(breeds.map(b => [b.id, b])) as Record<string, Breed>;
export const sizes = ['全部', '小型', '中型', '大型'];
export type Filters = { query: string; size: string; coat: string; energy: string; group: string; profile: string };
export const emptyFilters: Filters = { query: '', size: '全部', coat: '全部', energy: '全部', group: '全部', profile: '全部' };
export function searchBreeds(filters: Partial<Filters>, list = breeds) {
  const terms = filters.query?.normalize('NFKC').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean) || [];
  return list.filter(b => {
    const searchText = [b.name, b.en, b.nativeName, b.fciId, b.origin, b.temperament, ...b.aliases, ...b.tags, ...b.forms.map(form => form.name), ...b.colors.map(color => color.name + ' ' + color.en)].join(' ').normalize('NFKC').toLocaleLowerCase();
    return terms.every(term => searchText.includes(term))
    && (!filters.size || filters.size === '全部' || (b.sizes || [b.size]).includes(filters.size))
    && (!filters.coat || filters.coat === '全部' || b.coat === filters.coat || b.coats?.includes(filters.coat) || b.forms.some(f => f.profile?.coat === filters.coat))
    && (!filters.energy || filters.energy === '全部' || energyLabel(b.energy) === filters.energy)
    && (!filters.group || filters.group === '全部' || (filters.group === '暂准' ? b.recognition === '暂准认可' : filters.group === '地方与其他' ? !b.fciId : b.group === Number(filters.group)))
    && (!filters.profile || filters.profile === '全部' || !!b.description.trim());
  });
}
export function energyLabel(value: number | null) { return value === null ? '—' : value >= 4 ? '较高' : value >= 3 ? '中等' : '较低'; }
export function levelLabel(value: number | null) { return value === null ? '—' : `${value}/5`; }
