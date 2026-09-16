# 🍎 宝贝启蒙乐园 (Toddler Joy Learning)

> 一款专为 **3岁半学龄前幼儿** 打造的单端多维启蒙应用。  
> 涵盖 **英语磨耳朵、经典诗词诵读、成语寓言故事、中华传统文化**，支持纯正发音播报、3秒极简跟读录音与自我声音即时回放、星星收集成就机制，并支持无缝打包为 **Android APK** 安装包全屏沉浸运行。

---

## ✨ 核心亮点与儿童交互设计

- 👶 **零文字负担，大触控大字体**：高对比度插画与大尺寸 Emoji，全语音播报引导，3岁半孩子无需家长实时协助也能独立自主探索。
- 🎙️ **3秒跟读录音与即时自回放**：超大果冻质感麦克风，3秒倒计时录制，录完**自动播放宝宝自己稚嫩的声音**，极大满足孩子的好奇心与开口成就感。
- ⭐ **游戏化微目标与勋章宝箱**：
  - 每次录音触发彩带撒花特效（Confetti）并奖励一颗跳动金星；
  - 每日完成微目标（默认 3 颗星）触发全屏大金奖杯动画（🏆）；
  - 累计星星可在“贴纸宝箱（🎁）”中解锁 8 只专属萌宠贴纸。
- 🌙 **15分钟温和护眼关怀**：单次达到 15 分钟触发宁静星空与小熊打哈欠睡大觉动效（🐻💤），伴随轻柔提示，温和守护宝宝视力。
- 👨‍👧 **长按3秒防误触家长抽屉**：
  - **手动添加知识卡片**：支持输入汉字/单词，一键智能补齐拼音和儿童微释义；
  - **录制爸爸妈妈原声**：支持家长现场录制示范音，让宝宝听着爸爸亲切的声音学习；
  - **题库扩容**：预置扩展包，一键下载导入更多英语动物词汇与经典古诗；
  - **存储管理与缓存专清**：实时显示存储占用（MB），提供**“一键清理练习录音”**（释放90%空间，保留卡片与打卡数据）、重置今日进度与出厂恢复。
- 📱 **纯前端离线优先 + Android APK 打包**：数据均持久化在本地浏览器（IndexedDB），无网也能秒开；支持一键打包 Android APK，支持全屏沉浸与防止锁屏。

---

## 📂 项目目录结构

```text
apple-english/
├── PRD.md                  # 详细产品需求与技术规格文档 (PRD & Tech Spec)
├── README.md               # 本项目指引文档
├── REMIND.md               # 开发者备忘与维护指引
├── index.html              # 移动端/平板 H5 全屏友好模板
├── capacitor.config.ts     # Capacitor 移动端 Android 打包配置
├── android/                # 原生 Android Studio 工程目录
│   └── app/src/main/
│       └── AndroidManifest.xml # 已配置录音、防息屏等原生权限
├── src/
│   ├── main.ts             # 应用主入口
│   ├── style.css           # 全局样式（Tailwind v4、果冻按键、水波纹动效）
│   ├── types/              # TypeScript 数据模型规范 (Card, UserProgress等)
│   ├── data/
│   │   └── seedData.ts     # 首批 25 张内置冷启动精选卡片与 8 个贴纸
│   ├── services/
│   │   ├── db.ts           # 基于 Dexie.js 的本地持久化存储与缓存管理
│   │   ├── audio.ts        # TTS语音播报、Web Audio合成音效与3秒录音机
│   │   └── apiService.ts   # 免费外部词典 API 连接器与汉字转拼音服务
│   └── components/
│       ├── NavBar.vue      # 顶部状态栏（星星进度、贴纸宝箱、长按3秒家长锁）
│       ├── CategoryTabs.vue# 英语/诗词/成语/文化四大分类切换
│       ├── CardViewer.vue  # 核心卡片互动区（发音、3秒录音、回放、大翻页）
│       ├── StickerModal.vue# 萌宠贴纸勋章画册弹窗
│       ├── RewardModal.vue # 每日目标达成全屏大奖杯庆祝弹窗
│       ├── BedtimeModal.vue# 15分钟温和护眼睡眠防沉迷锁屏
│       └── ParentDrawer.vue# 家长管理中心（添加卡片、扩容、专清录音缓存）
```

---

## 🚀 快速上手与本地运行

### 1. 环境准备
- **Node.js** >= 18.0.0
- **pnpm** (推荐) 或 **npm**

### 2. 安装依赖
```bash
pnpm install
```

### 3. 启动本地开发服务 (H5 预览)
```bash
pnpm dev
```
启动成功后，终端将输出：
- 本地地址：`http://localhost:3000/`
- 局域网地址：`http://192.168.x.x:3000/` （同一 Wi-Fi 下的 iPad / 手机浏览器可直接扫码打开全屏体验）

### 4. 生产环境打包构建
```bash
pnpm build
```
编译产物将生成在 `dist/` 目录中。

---

## 📱 打包 Android APK 指引

本项目已通过 **Capacitor** 完成原生 Android 封装配置。

### 方式一：通过 Android Studio 打包（推荐，可视化操作）

1. **同步最新前端构建到原生工程**：
   ```bash
   pnpm build && pnpm cap:sync
   ```

2. **在 Android Studio 中打开原生工程**：
   ```bash
   pnpm cap:open
   ```

3. **生成 APK**：
   - 等待 Android Studio 的 Gradle 同步完成；
   - 点击顶部菜单栏：**Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**；
   - 编译完成后，点击右下角的 **locate**，即可在 `android/app/build/outputs/apk/debug/` 目录下找到 `app-debug.apk`，传输到手机/平板直接安装即可。

### 方式二：命令行直接编译 APK（需配置 Android SDK）

```bash
# 构建前端并同步
pnpm build && pnpm cap:sync

# 进入 android 目录使用 gradlew 编译
cd android
./gradlew assembleDebug
```
生成的 APK 位于：`android/app/build/outputs/apk/debug/app-debug.apk`。

---

## 💡 家长使用与运维技巧

1. **如何打开家长设置？**
   - 在屏幕右上角找到小锁/小齿轮图标 🔒，**手指按住不要松开持续 3 秒**，外圈圆环转满一圈后自动打开（防宝宝误触设计）。
2. **宝宝录音录多了占用设备存储怎么办？**
   - 进入家长设置 -> 切换到 **【缓存清理】** 选项卡 -> 点击 **【清理宝宝练习录音】**，即可秒级清空所有录音切片，腾出 90% 存储空间，同时保留所有的学习打卡记录和卡片。
3. **如何录制爸爸/妈妈自己的声音给宝贝？**
   - 进入家长设置 -> 【添加卡片】 -> 输入词汇 -> 点击【录制爸爸原声 (5s)】 -> 点击保存。宝宝在主界面点小喇叭时即可听到家长的亲切声音。

---

## 🛠️ 技术选型栈

| 领域 | 选型 | 优势 |
| :--- | :--- | :--- |
| **前端核心** | Vue 3 (`<script setup>`) + TypeScript + Vite | 极致轻量、启动秒开、低配置平板丝滑流畅 |
| **样式与动画** | Tailwind CSS v4 + Canvas Confetti | 响应式弹性排版、儿童专属大圆角果冻动效 |
| **本地持久化** | Dexie.js (IndexedDB 封装) | 离线存储音频 Blob 与卡片实体，零外部数据库依赖 |
| **音频采集与音效** | Web Audio API + MediaRecorder + Web Speech API | 免外部音效素材、原生物理振荡合成按键与星星声效 |
| **移动端打包** | Capacitor 8 | 纯原生 WebView 桥接、权限稳定、沉浸式全屏防退出 |
| **辅助工具** | pinyin-pro + Free Dictionary API | 自动带声调拼音生成、纯正英美真人发音获取 |

---

## 📄 许可与致谢

- 遵循 **MIT License** 开源。
- 感谢开源词典 `Free Dictionary API` 与拼音库 `pinyin-pro` 为低幼启蒙教育提供支持。
