# 数据与第三方内容

FCI、CKU、AKC、UKC、地方标准及原始研究的资料链接保留在当前数据及来源面板。整理标准目录、名称和事实字段；介绍采用自行撰写的中文概述，地方类型和其他体系分别标注。

当前插画通过内置 imagegen 工具生成，不使用第三方犬种照片。用户已选定 C「柔和立体」作为正式风格，保留比熊与边牧六个示例，并加入独立犬种与毛色插画。实际资产、提示词和数量见 design/generated-art-v6.json；原始探索提示词见 design/style-prompts.json。原始PNG保留，运行时使用优化JPEG副本。未绘组合在界面标为待绘。

照片识别随项目提供 TensorFlow.js 4.22.0 与公开 MobileNet V1 1.0 224 权重，运行时不请求外网。完整 Apache-2.0 许可见 licenses/tensorflow-Apache-2.0.txt；来源与权重校验见 design/recognition-model.json。TensorFlow.js 及 ImageNet 类别表适用 Apache License 2.0：

- https://github.com/tensorflow/tfjs/blob/master/LICENSE
- https://github.com/tensorflow/tfjs-models/blob/master/LICENSE
- https://github.com/tensorflow/tfjs-models/blob/master/mobilenet/src/imagenet_classes.ts

其他软件库的许可见各依赖包。
