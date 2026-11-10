import type { Breed } from '../data/catalog';

export type MatchKey = 'size' | 'activity' | 'grooming' | 'shedding' | 'training';
export type MatchAnswers = Record<MatchKey, string>;
export const matchStorageKey = '@canisxuan/match-v1';
export const matchQuestions: { key: MatchKey; title: string; hint: string; options: { id: string; label: string; hint: string }[] }[] = [
  { key: 'size', title: '喜欢多大的狗狗？', hint: '先选你能接受的体型。', options: [
    { id: 'small', label: '小型', hint: '偏爱小个子' }, { id: 'medium', label: '中型', hint: '体型适中' }, { id: 'large', label: '大型', hint: '有空间照顾大狗狗' }, { id: 'any', label: '都可以', hint: '体型不是首要条件' },
  ] },
  { key: 'activity', title: '你喜欢怎样的活动节奏？', hint: '运动需求越高，越需要持续投入时间。', options: [
    { id: 'gentle', label: '规律散步', hint: '希望运动需求适中' }, { id: 'active', label: '散步加互动', hint: '愿意安排更多游戏和活动' }, { id: 'sporty', label: '喜欢运动', hint: '愿意投入大量户外与训练时间' },
  ] },
  { key: 'grooming', title: '愿意花多少精力打理？', hint: '包括梳毛和定期美容。', options: [
    { id: 'easy', label: '尽量省事', hint: '希望梳理需求较低' }, { id: 'regular', label: '定期打理', hint: '可以安排日常梳理' }, { id: 'frequent', label: '勤打理也可以', hint: '愿意经常梳毛或安排美容' },
  ] },
  { key: 'shedding', title: '能接受多少掉毛？', hint: '少掉毛也不代表不会引起过敏。', options: [
    { id: 'low', label: '希望少一些', hint: '更在意家里的浮毛' }, { id: 'moderate', label: '能接受', hint: '可以规律清洁' }, { id: 'any', label: '不太介意', hint: '愿意应对明显掉毛' },
  ] },
  { key: 'training', title: '你希望训练时怎样配合？', hint: '每只狗都需要耐心和持续引导。', options: [
    { id: 'cooperative', label: '希望更易配合', hint: '优先参考训练配合度较高的犬种' }, { id: 'patient', label: '愿意慢慢教', hint: '可以接受更独立的性格' },
  ] },
];

export function validMatchAnswers(value: unknown): value is MatchAnswers {
  if (!value || typeof value !== 'object') return false;
  const answers = value as Record<string, unknown>;
  return matchQuestions.every(q => q.options.some(option => option.id === answers[q.key]));
}

export function cleanMatchDraft(value: unknown): Partial<MatchAnswers> {
  if (!value || typeof value !== 'object') return {};
  const result: Partial<MatchAnswers> = {};
  for (const q of matchQuestions) { const answer = (value as Record<string, unknown>)[q.key]; if (q.options.some(option => option.id === answer)) result[q.key] = answer as string; }
  return result;
}

export type MatchResult = { breedId: string; formId?: string; name: string; size: string; reasons: string[]; considerations: string[] };

export function matchBreeds(answers: MatchAnswers, catalog: Breed[], limit = 3): MatchResult[] {
  if (!validMatchAnswers(answers)) return [];
  const size = { small: '小型', medium: '中型', large: '大型', any: '' }[answers.size];
  const activity = { gentle: 3, active: 4, sporty: 5 }[answers.activity]!;
  const grooming = { easy: 2, regular: 3, frequent: 5 }[answers.grooming]!;
  const shedding = { low: 2, moderate: 3, any: 5 }[answers.shedding]!;
  return catalog.flatMap(breed => {
    const scores = [breed.energy, breed.grooming, breed.shedding, breed.trainability];
    if (!breed.complete || !scores.every(value => typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 5)) return [];
    // Existing AKC scales apply to these original reference forms only.
    const form = breed.id === 'poodle-standard' ? breed.forms.find(f => f.id === 'standard') : breed.id === 'pomeranian' ? breed.forms.find(f => f.id === 'pomeranian') : undefined;
    const effectiveSize = form?.profile?.size || breed.size;
    if ((size && size !== effectiveSize) || breed.energy! > activity || breed.grooming! > grooming || breed.shedding! > shedding || (answers.training === 'cooperative' && breed.trainability! < 4)) return [];
    const considerations = [
      ...(breed.energy! >= 4 ? ['需要稳定的户外活动与互动'] : []),
      ...(breed.grooming! >= 4 ? ['需要频繁梳理或定期美容'] : []),
      ...(breed.shedding! >= 4 ? ['换毛时清理负担较大'] : []),
      ...(breed.trainability! <= 3 ? ['训练需要更多耐心'] : []),
    ];
    const result: MatchResult = {
      breedId: breed.id, formId: form?.id, name: form ? breed.name + ' · ' + form.name : breed.name, size: effectiveSize,
      reasons: [
        ...(size ? ['体型符合你的偏好'] : []),
        '运动需求在你选择的范围内',
        ...(grooming <= 3 ? ['梳理需求在你能接受的范围内'] : []),
        ...(shedding <= 3 ? ['掉毛程度符合你的选择'] : []),
        ...(answers.training === 'cooperative' ? ['训练配合度参考较高'] : []),
      ], considerations,
    };
    const distance = Math.abs(activity - breed.energy!) + (grooming < 5 ? breed.grooming! * .4 : 0) + (shedding < 5 ? breed.shedding! * .5 : 0) + (answers.training === 'cooperative' ? (5 - breed.trainability!) * .3 : 0);
    return [{ result, distance }];
  }).sort((a, b) => a.distance - b.distance || a.result.breedId.localeCompare(b.result.breedId)).slice(0, Math.max(0, Math.min(10, limit))).map(item => item.result);
}
