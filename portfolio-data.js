window.PORTFOLIO_DATA = {
  version: 2,
  profile: {
    name: "邓春斌",
    intro: "2027届游戏系统策划。早稻田大学硕士在读，软件工程背景。关注玩法机制、系统循环，以及每一次选择带给玩家的体验。",
    about: "你好，我是邓春斌，一名希望把想法做成游戏的系统策划。",
    body: "拥有软件工程背景，目前在早稻田大学攻读硕士，预计2027年毕业。我用策划文档梳理规则，用 Godot 原型验证想法，也通过游戏拆解理解设计收益与体验代价，希望在清晰的逻辑与有趣的体验之间找到自己的答案。",
    education: "早稻田大学 · 硕士在读 / 2027届",
    direction: "游戏系统策划 / 玩法策划",
    email: "",
    github: "https://github.com/CallmeThirteen"
  },
  bundledFiles: [
    "demo/dontletmego_demo.html", "demo/dontletmego_demo.js", "demo/dontletmego_demo.wasm", "demo/dontletmego_demo.pck",
    "demo/dontletmego_demo.png", "demo/dontletmego_demo.icon.png", "demo/dontletmego_demo.apple-touch-icon.png",
    "demo/dontletmego_demo.audio.worklet.js", "demo/dontletmego_demo.audio.position.worklet.js"
  ],
  projects: [
    {
      id: "dont-let-me-fall-design", title: "Don’t Let Me Down", subtitle: "游戏策划案 / v0.3 / 30 PAGES", category: "design",
      description: "以书页世界为舞台的 2D 俯视角探索游戏设计。在揭开迷雾、冥想消化情绪与承担压力之间选择路线，让跨轮成长承接角色重新建立信心的过程。",
      tags: ["核心循环", "情绪与压力", "跨轮成长"], cover: "assets/design-page-v2.png", documentPreview: true, pageCount: 30,
      notes: [
        "四象限书页地图：草稿、进度、排名与考试形成探索环路，各区探索进度与最终整页揭示相衔接。",
        "冥想与情绪消化：扩大视野、主动处理情绪，也允许绕开风险，让探索与压力选择产生不同路线。",
        "压力与收益：以抑郁值作为压力预算，通过主动消化与释然币收益建立取舍。",
        "本轮结束与跨轮成长：压力满值触发导弹演出；保留已获释然币与特殊道具，采用唯一结算避免重复奖励。",
        "老师 Boss：以分阶段冥想回应评价压力，设计重点是理解与应对，而非传统攻击。",
        "特殊道具与身体去线圈化：把能力成长与角色表达结合。当前方案聚焦书页世界，其他世界保留扩展。"
      ],
      documentUrl: "", demoUrl: "", videoUrl: "",
      assets: { document: { name: "Don’t Let Me Down_详细游戏策划案_v0.3.pdf", type: "application/pdf", size: 1103831, src: "uploads/dont-let-me-down-design-v0.3.pdf" } }
    },
    {
      id: "dont-let-me-down-demo", title: "Don’t Let Me Down!", subtitle: "GODOT / WEB DEMO / 书页世界", category: "demo",
      description: "把设计变成可体验的原型。进入书页世界，在浏览器中探索地图、迷雾与冥想交互，感受核心玩法的初步呈现。原型内容以实际试玩为准。",
      tags: ["浏览器试玩", "Godot 原型", "迷雾探索"], cover: "assets/book-demo.svg",
      notes: [
        "点击“在线试玩”进入独立试玩页，再点击加载按钮启动原型，游戏不会在作品集首页自动运行。",
        "建议使用桌面浏览器和键盘操作；操作方式见游戏提示。",
        "首次需要加载约 54 MB 的游戏资源（包含中文字体），请等待进度完成。",
        "当前提供的是开发原型，与策划案 v0.3 的完整规划范围可能不同。",
        "网页导出已内置中文字体，使用键鼠体验；手机端暂未针对触控优化。"
      ],
      documentUrl: "", demoUrl: "play.html", videoUrl: "", assets: {}
    },
    {
      id: "valorant-analysis", title: "《无畏契约》核心系统拆解", subtitle: "VALORANT / 系统优缺点分析 / 22 PAGES", category: "analysis",
      description: "准备工作如何改变一场交火？从枪械、英雄技能、回合经济与地图目标的关联出发，分析设计收益和体验代价，提出面向学习反馈与团队协作的优化方向。",
      tags: ["战斗与技能", "跨回合经济", "体验优化"], cover: "assets/analysis-page.png", documentPreview: true, pageCount: 22,
      notes: [
        "战斗系统：分析停走精度、预瞄与短交火过程如何提高准备价值，以及新手的纠错与理解成本。",
        "英雄技能：从信息、遮挡、控制、位移等作用比较收益、反制成本与组合可读性。",
        "回合经济：将购买、保枪、留存装备与下一回合最低预算一起核算，说明余额相同不等于战力相同。",
        "地图与目标：比较 Ascent、Haven、Bind 的空间结构，讨论信息时效与安包后的行动压力转换。",
        "局外体验：区分技术成长、竞技评价、解锁与收集，分析任务、协作和消费目标之间的摩擦。",
        "优化方向：优先改善情境练习、购买理解与协作反馈，通过不同玩家分组检验方案，而非先大改枪械或全局经济。"
      ],
      documentUrl: "", demoUrl: "", videoUrl: "",
      assets: { document: { name: "无畏契约核心系统优缺点分析.pdf", type: "application/pdf", size: 1239087, src: "uploads/valorant-analysis.pdf" } }
    }
  ]
};
