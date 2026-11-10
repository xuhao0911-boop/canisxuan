# CanisXuan 0.8

手机优先的 Expo / React Native 犬类图鉴，无需注册。沿用 C「柔和立体」插画、森林绿白色界面和居中简洁卡片。

## 本版功能

- 选犬助手：5 个偏好问题，基于已有来源的 30 份 AKC 量表筛选候选，给出理由和需要考虑的事项。无符合条件时直接提示，不生成匹配百分比，不把量表套用到其他贵宾／狐狸犬分型。偏好保存在设备。
- 图鉴分享卡：在详情右上角进入，保留当前毛色与形态。浏览器导出 1080×1440 PNG；原生端通过系统分享面板发送图片。推荐结果也能生成卡片。
- 内容纠错：详情底部提交，支持分类与参考链接。收到服务端回执才标记已提交；断网时保留待提交记录，可重试。从关于页查看我的反馈。
- 接收服务：本机启动器同时提供静态预览和纠错 API，数据持久保存在 .canisxuan-data/，不会通过网站公开。

## 内容范围

378 个条目：364 条唯一 FCI 标准、14 个地方／其他体系入口。已有 679 个可选外观均有配图。本版未新增犬图或补录毛色；32 个条目有毛色记录、346 个仍未收录。

## 启动

使用 Node 24。双击“启动预览.cmd”，会检查已有服务，必要时在后台启动，等页面就绪后再打开浏览器。预览：http://127.0.0.1:4178/?v=0.8。首次使用先运行 `npm ci` 与 `npm run export:web`；生成预览后只需 Node 即可启动。

这是本机预览；电脑重启或服务停止后，再次双击启动入口即可恢复。启动错误保存在 .canisxuan-runtime/。开发前运行 npm ci，也可以通过 npm run serve 在终端启动服务。

开发：npx expo start --lan。生成 Web：npm run export:web。原生开发包需包含 expo-sharing 与 react-native-view-shot；本项目不包含签名 APK／IPA。

## 接收与处理纠错

默认服务只监听 127.0.0.1，适合本机预览。CANISXUAN_DATA_DIR 可指定持久目录；请备份该目录并在版本打包时排除。浏览器与接收接口使用同源地址。

原生端需设置 EXPO_PUBLIC_FEEDBACK_URL 为正式的 HTTPS 接收接口完整地址；未连接接收服务时，纠错会保留在设备并显示待提交。正式部署应接入你的域名、HTTPS、持久存储与运维服务，当前没有发布到公网。

查看：npm run feedback:list。
处理完成：node tools/feedback.mjs resolve 反馈ID。
导出：node tools/feedback.mjs export 导出文件.json。

纠错在人工核对前不会直接修改图鉴。用户删除本机副本不会删除接收端的记录。

## 检查

npm run typecheck
npm run lint
npm test
npm run export:web

本版记录：design/verification-v8.json。原插画清单：design/generated-art-v6.json。运行包仅含优化图片，PNG 原稿保留于工作区。

## 仓库中的图片

已包含压缩后的完整配图和离线识别模型。图片不缩小，绘图原稿保留在本地；路径与原稿校验见 ASSET-MANIFEST.json。导出后的 dist/ 不纳入源码仓库，请先运行 npm run export:web。
