import React, { useEffect, useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { byId, catalogLabel, sizeLabel } from '../data/catalog';
import { generatedDefaultVariants } from '../data/generated-art';
import { useAtlas } from '../state/store';
import { colors as c } from '../theme';
import { Button, Chip, DogPhoto, Empty, Fold, Icon, IconButton, Level, Screen, Section } from './ui';
import { SegmentControl } from './graphics';

export default function BreedProfile({ id }: { id: string }) {
  const breed = byId[id];
  const defaults = breed ? generatedDefaultVariants[breed.id] : undefined;
  const [color, setColor] = useState(defaults?.color || breed?.colors[0]?.id || '');
  const [form, setForm] = useState(defaults?.form || breed?.forms[0]?.id || '');
  const [section, setSection] = useState('概览');
  const [sources, setSources] = useState(false);
  const { favorites, compare, toggleFavorite, toggleCompare, visit, hydrated, notify } = useAtlas();
  useEffect(() => { if (breed && hydrated) visit(breed.id); }, [breed, hydrated, visit]);
  const open = async (url: string) => { try { await Linking.openURL(url); } catch { notify('链接暂时无法打开'); } };
  if (!breed) return <Screen><Empty title="未收录" description="返回图鉴继续浏览。" action={<Button title="返回图鉴" onPress={() => router.replace('/')} />} /></Screen>;
  const favorite = favorites.includes(id), comparing = compare.includes(id);
  const spitzFamilyVariant = breed.id === 'pomeranian' && form !== 'pomeranian';
  const scoreProfileApplies = !spitzFamilyVariant && !(breed.id === 'poodle-standard' && form !== 'standard');
  const effectiveColor = spitzFamilyVariant ? '' : color;
  const selectedForm = breed.forms.find(item => item.id === form);
  const profile = { ...breed, ...selectedForm?.profile };
  const facts = ([
    { label: '体型', value: profile.size ? sizeLabel(profile.size) : '', icon: 'paw-outline' },
    { label: '起源', value: breed.origin, icon: 'earth-outline' },
    { label: '身高', value: profile.height, icon: 'resize-outline' },
    { label: '体重', value: profile.weight, icon: 'barbell-outline' },
  ] satisfies { label: string; value: string; icon: React.ComponentProps<typeof Icon>['name'] }[]).filter(item => !!item.value);
  const sourceLinks = [
    ...(breed.fciSource ? [{ label: 'FCI 犬种条目', url: breed.fciSource }] : []),
    ...(breed.standardUrl ? [{ label: breed.fciId ? 'FCI 标准' : '犬种标准', url: breed.standardUrl }] : []),
    ...(breed.ckuSource ? [{ label: 'CKU 中文标准', url: breed.ckuSource }] : []),
    ...(breed.source && ![breed.fciSource, breed.ckuSource, breed.standardUrl].includes(breed.source) ? [{ label: breed.sourceLabel || 'AKC 犬种资料', url: breed.source }] : []),
    ...(breed.referenceSources?.filter(item => ![breed.source, breed.fciSource, breed.ckuSource, breed.standardUrl].includes(item.url)) || []),
  ];
  return <Screen contentStyle={{ paddingHorizontal: 0, paddingBottom: 34 }}>
    <View style={d.cover}>
      <View style={d.toolbar}>
        <IconButton name="chevron-back" label="返回" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={{ backgroundColor: c.soft }} />
        <View style={{ flex: 1 }} />
        <IconButton name="share-outline" label="生成图鉴分享卡" onPress={() => router.push({ pathname: '/share/[id]', params: { id: breed.id, color: effectiveColor, form } })} style={{ backgroundColor: c.soft }} />
        <IconButton name="information-circle-outline" label="资料来源" onPress={() => setSources(true)} style={{ backgroundColor: c.soft }} />
        <IconButton name={favorite ? 'heart' : 'heart-outline'} label={(favorite ? '取消收藏' : '收藏') + breed.name} active={favorite} onPress={() => toggleFavorite(id)} style={{ backgroundColor: favorite ? c.pale : c.soft }} />
      </View>
      <DogPhoto breed={breed} color={effectiveColor} form={form} style={{ width: '100%', aspectRatio: 1.48 }} />
      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 23 }}>
        <Text accessibilityRole="header" style={d.name}>{breed.name}</Text>
        <Text style={d.english}>{breed.en}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 13 }}>{[profile.size === '多种' ? '多体型' : profile.size, profile.coat === '多种' ? '多毛型' : profile.coat].filter(Boolean).map((label, i) => <View key={i} style={d.attribute}><Icon name={i ? 'leaf-outline' : 'paw-outline'} size={13} color={c.green} /><Text style={{ fontSize: 12, color: c.green }}>{label}</Text></View>)}</View>
      </View>
    </View>

    <View style={{ paddingHorizontal: 22 }}>
      <Section title="毛色" />
      {breed.colors.length > 0 && !spitzFamilyVariant ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 3 }}>
        {breed.colors.map(item => {
          const selected = color === item.id;
          return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={'毛色' + item.name} accessibilityState={{ selected }} aria-pressed={selected} onPress={() => setColor(item.id)} style={({ pressed }) => ({ minWidth: 64, maxWidth: 106, paddingHorizontal: 5, paddingVertical: 5, alignItems: 'center', opacity: pressed ? .7 : 1 })}>
            <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: selected ? c.green : 'transparent', padding: 4 }}>
              <View style={{ flex: 1, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#DCE2D8', flexDirection: 'row' }}>{(item.swatches.length ? item.swatches : ['#BAC6BC']).map((tone, i) => <View key={i} style={{ flex: 1, backgroundColor: tone }} />)}</View>
              {selected && <View style={{ position: 'absolute', right: -1, bottom: -1, width: 16, height: 16, backgroundColor: c.green, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.background }}><Icon name="checkmark" size={10} color="#FFFFFF" /></View>}
            </View>
            <Text numberOfLines={2} style={{ fontSize: 12, lineHeight: 18, textAlign: 'center', color: selected ? c.text : c.muted, fontWeight: selected ? '600' : '400', marginTop: 7 }}>{item.name}</Text>
          </Pressable>;
        })}
      </ScrollView> : <View style={d.colorNotice}><Icon name="color-palette-outline" size={20} color={c.green} /><Text style={{ flex: 1, fontSize: 13, lineHeight: 21, color: c.muted }}>代表外观，完整毛色尚未收录。</Text></View>}

      {breed.forms.length > 1 && <><Section title={breed.forms[0].kind} /><View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>{breed.forms.map(item => <Chip key={item.id} label={item.name} selected={form === item.id} onPress={() => setForm(item.id)} />)}</View></>}

      <View style={{ marginTop: 25 }}><SegmentControl value={section} items={['概览', '照护']} onChange={setSection} /></View>
      {section === '概览' ? <View accessibilityLabel="犬种概览">
        <Text style={[d.body, { marginTop: 20, marginBottom: 20 }]}>{profile.description}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 }}>{facts.map(item => <View key={item.label} style={[d.fact, item.value.length > 25 && { width: '100%' }]}><View style={d.factIcon}><Icon name={item.icon} size={18} color={c.green} /></View><View style={{ flex: 1 }}><Text style={{ fontSize: 12, color: c.muted, marginBottom: 4 }}>{item.label}</Text><Text style={{ fontSize: 14, lineHeight: 21, color: c.text, fontWeight: '500' }}>{item.value}</Text></View></View>)}</View>
        {!!profile.appearance && <Fold title="外形"><Text style={d.body}>{profile.appearance}</Text></Fold>}
        {!!profile.temperament && <Fold title="性格"><Text style={d.body}>{profile.temperament}</Text></Fold>}
        {!!profile.coatNote && <Fold title="被毛"><Text style={d.body}>{profile.coatNote}</Text></Fold>}
        {!!profile.profileNote && <Fold title="收录说明"><Text style={d.body}>{profile.profileNote}</Text></Fold>}
      </View> : <View accessibilityLabel="犬种照护">
        <Section title="日常照护" /><Text style={d.body}>{profile.care}</Text>
        {breed.complete && scoreProfileApplies ? <Fold title="养犬参考"><View style={{ backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 16 }}><Level label="运动需求" value={breed.energy} /><Level label="训练配合度" value={breed.trainability} /><Level label="梳理频率" value={breed.grooming} /><Level label="掉毛程度" value={breed.shedding} /></View><Text style={{ color: c.muted, fontSize: 12, lineHeight: 21, marginTop: 10 }}>AKC 1–5 级参考，个体表现会不同。</Text></Fold> : !!profile.beginnerNote && <Fold title="新手建议"><Text style={d.body}>{profile.beginnerNote}</Text></Fold>}
      </View>}

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 26 }}><Button title={comparing ? '移出对比' : '加入对比'} icon="git-compare-outline" secondary={comparing} onPress={() => toggleCompare(id)} style={{ flex: 1 }} />{comparing && <Button title="查看对比" secondary onPress={() => router.push('/compare')} style={{ flex: 1 }} />}</View>
      <Pressable accessibilityRole="button" accessibilityLabel={'纠错' + breed.name + '资料'} onPress={() => router.push({ pathname: '/feedback', params: { id: breed.id, color: effectiveColor, form } })} style={{ minHeight: 48, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Icon name="create-outline" size={15} color={c.muted} /><Text style={{ color: c.muted, fontSize: 12 }}>内容纠错</Text></Pressable>
    </View>

    <Modal visible={sources} transparent animationType="slide" onRequestClose={() => setSources(false)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(18,40,27,0.3)', justifyContent: 'flex-end' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="关闭来源" onPress={() => setSources(false)} style={{ flex: 1 }} />
        <View style={d.sourceSheet}>
          <View accessibilityElementsHidden style={{ width: 34, height: 4, borderRadius: 3, backgroundColor: '#CFDAD0', alignSelf: 'center', marginBottom: 14 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}><Text style={{ color: c.text, fontSize: 21, fontWeight: '600' }}>资料来源</Text><IconButton name="close" label="关闭来源面板" onPress={() => setSources(false)} /></View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={{ color: c.green, fontSize: 13, lineHeight: 22 }}>{catalogLabel(breed)}　{breed.recognition}</Text>
            <Text style={{ color: c.muted, fontSize: 12, lineHeight: 21, marginTop: 8, marginBottom: 16 }}>核对：{breed.sourceDate}{'\n'}尺寸按所选类型展示，范围与容差以原始标准为准。照护建议为编辑归纳。{breed.colors.some(item => item.source.includes('akc.org')) ? '\n毛色含 AKC 登记分类，部分不属于展赛认可色；色点为近似示意。' : ''}</Text>
            {sourceLinks.map(item => <Button key={item.url} title={item.label} secondary onPress={() => open(item.url)} style={{ marginBottom: 9 }} />)}
          </ScrollView>
        </View>
      </View>
    </Modal>
  </Screen>;
}

const d = StyleSheet.create({
  cover: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingTop: 13, paddingBottom: 2 },
  name: { color: c.text, fontSize: 28, lineHeight: 39, fontWeight: '700', letterSpacing: -.5 },
  english: { color: c.muted, fontSize: 13, lineHeight: 21, marginTop: 3 },
  attribute: { backgroundColor: c.soft, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 5 },
  colorNotice: { minHeight: 52, paddingHorizontal: 15, paddingVertical: 12, gap: 10, flexDirection: 'row', alignItems: 'center', borderRadius: 16, backgroundColor: '#FFFFFF' },
  body: { color: c.muted, fontSize: 14, lineHeight: 26 },
  fact: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 17, padding: 13, minHeight: 79, flexDirection: 'row', gap: 9, alignItems: 'flex-start' },
  factIcon: { width: 29, height: 29, borderRadius: 10, backgroundColor: c.soft, alignItems: 'center', justifyContent: 'center' },
  sourceSheet: { width: '100%', maxWidth: 480, alignSelf: 'center', maxHeight: '85%', backgroundColor: c.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 23, paddingTop: 12, paddingBottom: 30 },
});
