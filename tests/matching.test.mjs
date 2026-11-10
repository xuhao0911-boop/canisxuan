import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { cleanMatchDraft, matchBreeds, matchQuestions, validMatchAnswers } from '../src/lib/matching.ts';
const breeds = JSON.parse(fs.readFileSync(new URL('../src/data/breeds-v2.json', import.meta.url), 'utf8'));
const baseline = { size: 'any', activity: 'sporty', grooming: 'frequent', shedding: 'any', training: 'patient' };
test('invalid or incomplete saved answers do not produce recommendations', () => {
    for (const value of [null, {}, { ...baseline, size: 'invented' }, { ...baseline, training: 5 }]) {
        assert.equal(validMatchAnswers(value), false);
        assert.deepEqual(matchBreeds(value, breeds), []);
    }
    assert.deepEqual(cleanMatchDraft({ ...baseline, training: 'unknown', extra: 'anything' }), { size: 'any', activity: 'sporty', grooming: 'frequent', shedding: 'any' });
});
test('all 216 preference combinations obey every requested boundary', () => {
    const walk = (index, partial) => {
        if (index < matchQuestions.length) {
            const question = matchQuestions[index];
            for (const option of question.options)
                walk(index + 1, { ...partial, [question.key]: option.id });
            return;
        }
        const answers = partial;
        const energy = { gentle: 3, active: 4, sporty: 5 }[answers.activity];
        const grooming = { easy: 2, regular: 3, frequent: 5 }[answers.grooming];
        const shedding = { low: 2, moderate: 3, any: 5 }[answers.shedding];
        const size = { small: '小型', medium: '中型', large: '大型', any: '' }[answers.size];
        const results = matchBreeds(answers, breeds);
        assert(results.length <= 3);
        assert.equal(new Set(results.map(item => item.breedId)).size, results.length);
        for (const result of results) {
            const breed = breeds.find(item => item.id === result.breedId);
            assert(breed.complete);
            assert(breed.energy <= energy);
            assert(breed.grooming <= grooming);
            assert(breed.shedding <= shedding);
            if (size)
                assert.equal(result.size, size);
            if (answers.training === 'cooperative')
                assert(breed.trainability >= 4);
            assert(result.reasons.length > 0);
        }
    };
    walk(0, {});
});
test('AKC reference scales stay on Standard Poodle and Pomeranian forms', () => {
    const family = breeds.filter(item => ['poodle-standard', 'pomeranian'].includes(item.id));
    const results = matchBreeds(baseline, family);
    assert.equal(results.find(item => item.breedId === 'poodle-standard')?.formId, 'standard');
    assert.equal(results.find(item => item.breedId === 'poodle-standard')?.size, '大型');
    assert.equal(results.find(item => item.breedId === 'pomeranian')?.formId, 'pomeranian');
    assert.equal(results.find(item => item.breedId === 'pomeranian')?.size, '小型');
});
test('zero matches are returned honestly; unknown scale values stay excluded', () => {
    assert.deepEqual(matchBreeds({ size: 'large', activity: 'gentle', grooming: 'easy', shedding: 'low', training: 'cooperative' }, breeds), []);
    const corrupted = [{ ...breeds[0], energy: null }, { ...breeds[1], complete: false }, { ...breeds[2], grooming: 99 }];
    assert.deepEqual(matchBreeds(baseline, corrupted), []);
});
test('recommendations are deterministic and never mutate the catalogue', () => {
    const before = JSON.stringify(breeds);
    assert.deepEqual(matchBreeds(baseline, breeds), matchBreeds(baseline, breeds));
    assert.equal(JSON.stringify(breeds), before);
});
