# 📌 宝贝启蒙乐园 (Toddler Joy Learning) 快速指引与开发备忘 (REMIND.md)

本文件汇总了日常开发、真机调试、APK 打包以及常见操作的关键备忘（Cheat Sheet）。

---

## ⚡ 常用命令速查

| 场景 | 终端命令 | 说明 |
| :--- | :--- | :--- |
| **本地启动 (H5)** | `pnpm dev` | 启动本地服务，默认端口 3000，局域网内手机/iPad 可直接访问 |
| **代码检查与编译** | `pnpm build` | 执行 TypeScript 语法检查与 Vite 生产编译，产出 `dist/` |
| **本地构建预览** | `pnpm preview` | 在本地预览生产打包后的网页效果 |
| **同步到 Android** | `pnpm cap:sync` | 将最新的 `dist` 网页代码同步到 `android/` 原生工程 |
| **打开 Android Studio** | `pnpm cap:open` | 快速在 Android Studio 中打开当前原生工程 |
| **命令行编译 APK** | `cd android && ./gradlew assembleDebug` | 无需打开 IDE，直接打出可安装的 debug APK |

---

## 📱 Android APK 打包与安装指引

1. **第一步：编译并同步代码**
   ```bash
   pnpm build && pnpm cap:sync
   ```
2. **第二步：生成 APK 文件**
   - **方式 A（推荐）：Android Studio 可视化生成**
     - 运行 `pnpm cap:open` 打开 Android Studio；
     - 点击顶部菜单 **Build -> Build Bundle(s) / APK(s) -> Build APK(s)**；
     - 打包成功后右下角点击 **locate** 即可获取安装包。
   - **方式 B：命令行直出**
     ```bash
     cd android && ./gradlew assembleDebug
     ```
3. **第三步：安装包位置**
   - APK 文件位于：
     ```text
     android/app/build/outputs/apk/debug/app-debug.apk
     ```
   - 可直接通过微信传输、网盘或 USB 数据线安装到 Android 平板或手机上。

---

## 🔑 核心功能使用备忘

### 1. 家长管理中心（防误触设计）
- **唤出方式**：在界面右上角找到小锁图标 🔒，**手指按住屏幕持续 3 秒**。
- **为什么需要长按？** 3岁半宝宝只会短按点击，长按3秒可完全防止宝宝在玩耍时误入设置界面。

### 2. 缓存清理与存储控制（解决录音占用问题）
- **位置**：长按进入家长设置 -> 点击 **【缓存清理】** 选项卡。
- **三大清理功能**：
  - 🧹 **清理宝宝练习录音**：仅删除录音音频切片（释放 90% 空间），**不会清空**卡片和学习星星。
  - 🔄 **重置今日进度**：清空今日收集的星星，奖杯状态复位。
  - ⚠️ **恢复出厂设置**：清空全部 IndexedDB 本地数据，重新载入系统预置的初始卡片库。

### 3. 爸爸原声示范录制
- **位置**：家长设置 -> 【添加卡片】 -> 输入标题 -> 点击【录制爸爸原声 (5s)】 -> 点击保存。
- **效果**：宝宝在卡片上点击小喇叭，听到的不是机器声音，而是爸爸亲口说的示范音！

### 4. 护眼定时提醒
- 默认设置为 **15 分钟**。
- 达到时间后界面自动变为深色星空，小熊打哈欠睡觉（🐻💤），提醒宝宝让眼睛休息。
- 家长需在右下角长按 3 秒方可解锁。

---

## 🛠️ 项目文档导航

- 📘 [PRD.md](file:///Users/cool/work/self-project/apple-english/PRD.md) - 完整的产品需求与技术规格文档（含数据字典、交互状态机、冷启动卡片明细）
- 📗 [README.md](file:///Users/cool/work/self-project/apple-english/README.md) - 项目全貌介绍与技术架构说明
