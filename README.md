# 邓春斌 · 游戏策划作品集

天蓝色、粉红色与白色的个人作品集，无需安装前端依赖，适配 GitHub Pages。

## 当前展示的三项作品

1. **Don’t Let Me Down 策划案**：30 页 PDF，v0.3。介绍书页探索、冥想与情绪消化、压力预算、跨轮成长及老师 Boss。
2. **Don’t Let Me Down! Demo**：Godot 网页原型，点击“在线试玩”进入 `play.html`，再主动加载游戏。包含全部 WebAssembly、PCK、JS 与音频工作线程资源。
3. **《无畏契约》核心系统拆解**：22 页 PDF，分析战斗、技能、回合经济、地图目标与局外体验。

两份 PDF 已复制到 `uploads/` 下的英文路径，支持浏览器阅读与下载。网站卡片封面中的文档页来自实际 PDF；Demo 书页插画为概念示意。

## 本地预览

双击 `启动预览.cmd`，访问 `http://127.0.0.1:4173`。需要本机已有 Python。关闭终端窗口可停止预览。

也可在项目目录执行：

```powershell
python preview_server.py
```

`preview_server.py` 明确设置 `.js` 和 `.wasm` 的 MIME 类型，避免 Windows 默认 MIME 设置影响 Godot 音频模块。不要使用 `file://` 双击方式测试网页游戏或导出功能。

## 发布到 GitHub Pages

目标仓库：[CallmeThirteen.github.io](https://github.com/CallmeThirteen/CallmeThirteen.github.io)。

将网站包解压，把文件直接放到仓库根目录。至少保留：

```text
index.html
styles.css
app.js
portfolio-data.js
portfolio-storage.js
play.html
.nojekyll
assets/
uploads/
demo/                  # 保持整个目录及文件名不变
```

`demo/dontletmego_demo.wasm` 约 38 MB，超过 GitHub 网页上传的 25 MiB 单文件限制。请通过 Git 命令行或 GitHub Desktop 提交整个网站；不要只上传 HTML，也不要把 ZIP 本身当网页提交。[GitHub 官方文件上传说明](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)。

仓库 **Settings → Pages** 若使用分支发布，选择存放文件的分支及 **/ (root)**；已有配置时保留并更新它对应的目录。等待 Pages 部署成功后，通过设置页确认发布地址。预期主页为 `https://callmethirteen.github.io/`，在部署完成前不能据此认为网站已上线。

本地目录中的 `archive/`、`.qa/`、`简历/` 和旧概念封面没有被加入网站发布包。两份原始 PDF 保持不变，发布使用 `uploads/` 中的副本。

## 后续编辑

联系区域已加入公开邮箱、微信号（支持复制）及个人简历的在线查看与下载。简历原文件位于 `uploads/deng-chunbin-resume.pdf`；`resume.html` 使用由原件生成的 `assets/resume-preview.png` 提供跨浏览器预览，PDF 原件保持不变。完整网站导出会包含这三项。在“个人资料”中可以修改邮箱、微信和简历地址。

右上角“作品管理”可编辑公开署名与简介、项目介绍、封面、文档、Demo 文件或链接。点击“保存到本机”，再“导出网站 .zip”，即可下载包含已保存内容和全部 Godot 资源的网站包。

**作品管理只编辑当前浏览器的草稿，不会直接改动 GitHub 仓库或线上网站。** 清理浏览器数据会清除未导出的修改。导出包解压并提交到仓库后，访客才能看到更新。公开访客在自己的浏览器中编辑不会修改你的站点。

大体积新 Demo 建议使用实际试玩链接；直接上传的 ZIP/7Z 只提供下载，不会自动解压为网页游戏。

## Demo 当前状态

- 已接入完整 Godot Web 导出，单线程版本，无需跨域隔离头即可在本地加载。
- 首次加载约 54 MB，建议使用桌面浏览器与键鼠。
- 已接入用户重新导出的中文字体版本，包含 Noto Sans SC 字体和自定义 Theme。当前入口为 `demo/dontletmego_demo.html`，必须连同同前缀的全部 9 个文件一起发布。
- 推送前先提交新资源；仅把文件放进暂存区不会上传到 GitHub。重新导出后，试玩入口和 `portfolio-data.js` 的 `bundledFiles` 清单也必须同步指向实际文件名，包含大小写。
- 原型与策划 v0.3 的完整规划范围可能不同。网站展示名称统一为 Don’t Let Me Down；源文档和游戏内容保留原文件。

## 页脚声明

本页所有案例仅作个人学习研究用途；《无畏契约》相关内容版权归原厂所有，非商业展示。

© 2026 邓春斌 · 使用 AI 辅助开发
