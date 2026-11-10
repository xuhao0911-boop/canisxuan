import React from 'react';
import { Linking, Text, View } from 'react-native';
import { router } from 'expo-router';
import { breeds } from '../data/catalog';
import { colors as c } from '../theme';
import { BrandMark } from './graphics';
import { Button, Icon, IconButton, Screen } from './ui';

export default function AboutPanel() {
  const withColors = breeds.filter(breed => breed.colors.length > 0).length;
  return <Screen>
    <View style={{ alignItems: 'flex-end', paddingTop: 15 }}><IconButton name="close" label="关闭关于" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} /></View>
    <View style={{ alignItems: 'center', paddingTop: 7, paddingBottom: 30 }}><BrandMark size={59} /><Text style={{ fontSize: 30, color: c.text, fontWeight: '700', letterSpacing: -.8, marginTop: 20 }}>CanisXuan</Text><Text style={{ fontSize: 12, color: c.muted, marginTop: 8 }}>0.8</Text></View>
    <View style={{ flexDirection: 'row', gap: 12 }}>{[[breeds.length, '图鉴条目'], [withColors, '含毛色记录']].map(([number, label]) => <View key={label} style={{ flex: 1, backgroundColor: '#FFFFFF', padding: 19, borderRadius: 22 }}><Text style={{ color: c.green, fontSize: 29, fontWeight: '600' }}>{number}</Text><Text style={{ color: c.muted, fontSize: 12, marginTop: 7 }}>{label}</Text></View>)}</View>
    <Text style={{ color: c.muted, fontSize: 13, lineHeight: 23, marginTop: 14, marginBottom: 20 }}>其他条目暂为代表外观，毛色仍待补充。</Text>
    {[
      { icon: 'book-outline' as const, title: '资料', text: '参考 FCI、CKU、AKC、UKC 及地方犬研究，详情页可查看来源。' },
      { icon: 'heart-outline' as const, title: '本地记录', text: '无需注册。收藏、对比和选犬偏好保存在本设备。' },
      { icon: 'shield-checkmark-outline' as const, title: '照片隐私', text: '模型随 App 提供，照片在设备内识别，无需外网。结果仅供外观参考。' },
      { icon: 'chatbubble-outline' as const, title: '内容反馈', text: '主动提交的纠错说明、参考链接及犬种外观信息用于核对资料。删除本机记录仅移除设备副本。' },
    ].map(item => <View key={item.title} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 18, borderTopWidth: 1, borderTopColor: c.border }}><View style={{ width: 35, height: 35, borderRadius: 12, backgroundColor: c.pale, alignItems: 'center', justifyContent: 'center' }}><Icon name={item.icon} size={18} color={c.green} /></View><View style={{ flex: 1 }}><Text style={{ color: c.text, fontSize: 15, fontWeight: '600', marginBottom: 5 }}>{item.title}</Text><Text style={{ color: c.muted, fontSize: 13, lineHeight: 23 }}>{item.text}</Text></View></View>)}
    <Button title="FCI 犬种目录" secondary onPress={() => { void Linking.openURL('https://www.fci.be/en/nomenclature/').catch(() => {}); }} style={{ marginTop: 7 }} />
    <Button title="我的反馈" secondary onPress={() => router.push({ pathname: '/feedback', params: { history: '1' } })} style={{ marginTop: 10 }} />
  </Screen>;
}
