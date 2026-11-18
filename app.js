/* Static GitHub Pages portfolio. Editing is local; export creates the publishable site. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone = value => structuredClone(value);
  let state = clone(window.PORTFOLIO_DATA);
  let filter = 'all';
  let selectedId = state.projects[0]?.id;
  let removed = new Set();
  let toastTimer;
  let busy = false;
  const objectUrls = new Map();
  const storage = window.PortfolioStorage;
  function releaseObjectUrls() { objectUrls.forEach(url => URL.revokeObjectURL(url)); objectUrls.clear(); }
  function beginMutation() {
    if (busy) return false;
    busy = true;
    $$('#manager-dialog button, #manager-dialog input, #manager-dialog select, #manager-dialog textarea').forEach(element => { element.disabled = true; });
    $('#manager-dialog').setAttribute('aria-busy', 'true');
    return true;
  }
  function endMutation() {
    busy = false;
    $$('#manager-dialog button, #manager-dialog input, #manager-dialog select, #manager-dialog textarea').forEach(element => { element.disabled = false; });
    $('#manager-dialog').removeAttribute('aria-busy');
  }

  function externalUrl(value) {
    if (!value) return '';
    try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
  }
  function localPath(value) {
    return typeof value === 'string' && (/^(assets|uploads|demo)\/[a-zA-Z0-9_./-]+$/.test(value) || value === 'play.html') && !value.split('/').includes('..') ? value : '';
  }
  function fileUrl(asset) {
    if (!asset) return '';
    if (asset.blob instanceof Blob) {
      if (!objectUrls.has(asset.blob)) objectUrls.set(asset.blob, URL.createObjectURL(asset.blob));
      return objectUrls.get(asset.blob);
    }
    return localPath(asset.src);
  }
  function coverUrl(project) { return fileUrl(project.assets?.cover) || localPath(project.cover); }
  function toast(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').hidden = false;
    toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500);
  }
  function resourceUrl(value) { return externalUrl(value) || localPath(value); }
  function resourceState(project, kind) { return Boolean(fileUrl(project.assets?.[kind]) || resourceUrl(project[kind + 'Url'])); }
  function valorantArt() {
    return `<div class="valorant-art"><svg viewBox="0 0 440 340" aria-hidden="true"><defs><radialGradient id="v-glow"><stop stop-color="#96644f" stop-opacity=".2"/><stop offset="1" stop-color="#1a2020" stop-opacity="0"/></radialGradient></defs><circle cx="225" cy="165" r="165" fill="url(#v-glow)"/><g fill="none" stroke="#658079" stroke-width=".7" opacity=".55"><path d="M80 94h78v-25h83v35h70v56h43v61h-63v42h-72v-37h-76v-43H80Z"/><path d="M116 115h58v31h50V99M144 183h44v-36m36 25v54m0-54h88m-38-45v45m-84 28h-46M110 94V71h35"/><circle cx="155" cy="123" r="47" stroke-dasharray="3 6"/><circle cx="286" cy="209" r="49" stroke-dasharray="3 6"/></g><path d="m147 117 57 58 60 1-52 53-65-66Zm95 45 51-51v51Z" fill="#c29078" opacity=".9"/><g fill="#a6b4a6" font-family="monospace" font-size="9"><text x="98" y="95">A</text><text x="321" y="246">B</text><text x="246" y="88">MID</text></g><path d="M70 260 145 205 177 243 287 251 332 163" fill="none" stroke="#b4a27b" stroke-width="1" stroke-dasharray="3 5"/><circle cx="70" cy="260" r="3" fill="#b4a27b"/><circle cx="332" cy="163" r="3" fill="#b4a27b"/></svg><span class="valorant-word">READ THE SYSTEM. FIND THE WHY.</span></div>`;
  }
  function renderProfile() {
    const profile = state.profile;
    $('#hero-intro').textContent = '你好，我是 ' + profile.name;
    $('#hero-description').textContent = profile.intro;
    $('#about-lead').textContent = profile.about;
    $('#about-body').textContent = profile.body;
    $('#education').textContent = profile.education;
    $('#direction').textContent = profile.direction;
    $('#footer-name').textContent = profile.name;
    document.title = profile.name + ' — 游戏策划作品集';
    const links = [];
    if (profile.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) links.push(`<div class="contact-item"><span class="contact-label">邮箱</span><a class="contact-value" href="mailto:${esc(profile.email)}">${esc(profile.email)}</a><button class="copy-contact" data-copy-contact="email" aria-label="复制邮箱地址">复制</button></div>`);
    if (profile.wechat) links.push(`<div class="contact-item"><span class="contact-label">微信</span><span class="contact-value">${esc(profile.wechat)}</span><button class="copy-contact" data-copy-contact="wechat" aria-label="复制微信号">复制</button></div>`);
    if (externalUrl(profile.github)) links.push(`<div class="contact-item"><span class="contact-label">GitHub</span><a class="contact-value" href="${esc(externalUrl(profile.github))}" target="_blank" rel="noopener noreferrer">${esc(profile.github.replace(/^https?:\/\//, ''))}</a><span aria-hidden="true">↗</span></div>`);
    const resume = resourceUrl(profile.resumeUrl);
    if (resume) links.push(`<div class="resume-actions"><a class="button primary small" href="${esc(resume)}" target="_blank" rel="noopener noreferrer">在线查看简历 <span aria-hidden="true">↗</span></a><a class="button small" href="${esc(resume)}" download="${esc(profile.name)}-个人简历.pdf">下载简历 <span aria-hidden="true">↓</span></a></div>`);
    $('#contact-links').innerHTML = (links.length ? links.join('') : '<p class="field-help">联系方式待补充</p>') + '<p class="contact-feedback" role="status" aria-live="polite"></p>';
  }
  function renderProjects() {
    const projects = state.projects.filter(project => filter === 'all' || project.category === filter);
    $('#work-count').textContent = String(projects.length).padStart(2, '0') + ' PROJECTS';
    $('[data-filter="all"] span').textContent = String(state.projects.length).padStart(2, '0');
    $('#project-grid').innerHTML = projects.map(project => {
      const index = state.projects.indexOf(project);
      const analysis = project.category === 'analysis';
      const demo = project.category === 'demo';
      const cover = coverUrl(project);
      const documentPreview = Boolean(project.documentPreview && !project.assets?.cover);
      const visual = cover ? `<img ${documentPreview ? 'class="doc-page"' : ''} src="${esc(cover)}" alt="${esc(project.title)}${documentPreview ? ' PDF首页预览' : demo ? ' 书页世界概念示意' : ' 项目封面'}" loading="lazy">` : valorantArt();
      const hasDoc = resourceState(project, 'document');
      const hasDemo = resourceState(project, 'demo');
      const primaryUrl = demo ? resourceUrl(project.demoUrl) : fileUrl(project.assets?.document) || resourceUrl(project.documentUrl);
      return `<article class="project ${analysis ? 'analysis' : demo ? 'demo' : 'featured'}">
        <button class="project-visual ${documentPreview ? 'document-preview' : ''}" data-detail="${esc(project.id)}" aria-label="查看 ${esc(project.title)} 的项目详情">${visual}<span class="project-number">${String(index + 1).padStart(2, '0')} / ${analysis ? 'CASE STUDY' : demo ? 'PLAYABLE DEMO' : 'DESIGN DOCUMENT'}</span>${cover ? `<span class="cover-label">${documentPreview ? 'PDF / ' + esc(project.pageCount || '') + ' PAGES' : demo ? 'CONCEPT / 书页世界' : 'PROJECT VISUAL'}</span><span class="cover-arrow" aria-hidden="true">↗</span>` : ''}</button>
        <div class="project-content"><div class="project-category">${analysis ? '拆解案 / GAME ANALYSIS' : demo ? '可玩原型 / PLAYABLE DEMO' : '策划案 / GAME DESIGN DOCUMENT'}</div><h3>${esc(project.title)}</h3><p class="project-subtitle">${esc(project.subtitle)}</p><p class="project-description">${esc(project.description)}</p><div class="project-tags">${(project.tags || []).map(tag => `<span>${esc(tag)}</span>`).join('')}</div>${demo ? '<p class="demo-hint">桌面浏览器 · 键鼠操作 · 首次加载约 54 MB</p>' : ''}<div class="project-footer"><div class="project-actions">${primaryUrl ? `<a class="button primary small" href="${esc(primaryUrl)}" target="_blank" rel="noopener noreferrer">${demo ? '在线试玩' : analysis ? '阅读拆解案' : '阅读策划案'} <span aria-hidden="true">↗</span></a>` : ''}<button data-detail="${esc(project.id)}">${demo ? '试玩说明' : '内容概览'} <span aria-hidden="true">→</span></button></div><div class="asset-status"><span class="${demo ? hasDemo ? 'available' : '' : hasDoc ? 'available' : ''}">${demo ? hasDemo ? '● WEB DEMO' : '○ Demo 待补充' : hasDoc ? esc(project.pageCount || '') + ' 页 · PDF' : '○ 文档待补充'}</span></div></div></div>
      </article>`;
    }).join('') || `<p class="empty-message">${filter === 'demo' ? 'Demo 资料正在整理，添加试玩链接或 Demo 文件后会显示在这里。' : '还没有此类作品，可以在作品管理中添加。'}</p>`;
  }
  function render() { renderProfile(); renderProjects(); }
  function openDetail(id) {
    const project = state.projects.find(item => item.id === id);
    if (!project) return;
    const cover = coverUrl(project);
    const resources = [
      {kind:'document', title:project.category === 'analysis' ? '完整拆解案' : '游戏策划案', note:'设计文档 / PDF 与 Office 文件', link:project.documentUrl},
      ...(project.category === 'demo' ? [{kind:'demo', title:'网页 Demo', note:'新标签页打开，建议使用桌面浏览器', link:project.demoUrl}] : []),
      ...(externalUrl(project.videoUrl) ? [{kind:'video', title:'实机演示', note:'前往演示视频', link:project.videoUrl}] : [])
    ].filter(resource => project.category !== 'demo' || resource.kind !== 'document' || resourceState(project, 'document'));
    $('#detail-content').innerHTML = `${cover && !project.documentPreview ? `<img class="detail-image" src="${esc(cover)}" alt="${esc(project.title)} 封面">` : ''}<div class="detail-body"><div class="eyebrow">${project.category === 'analysis' ? 'CASE STUDY / SYSTEM ANALYSIS' : project.category === 'demo' ? 'PLAYABLE DEMO / GODOT WEB' : 'DESIGN DOCUMENT / V0.3'}</div><h2 id="detail-title">${esc(project.title)}</h2><p class="project-subtitle">${esc(project.subtitle)}</p><p class="intro">${esc(project.description)}</p><h3>${project.category === 'analysis' ? '拆解关注点' : project.category === 'demo' ? '试玩说明' : '策划内容'}</h3><ol class="detail-notes">${(project.notes || []).map(note => `<li>${esc(note)}</li>`).join('')}</ol><h3>作品资料</h3><div class="resource-list">${resources.map(resource => {
      const asset = project.assets?.[resource.kind];
      const file = fileUrl(asset);
      const url = resourceUrl(resource.link);
      const pdf = asset?.type === 'application/pdf' || /\.pdf$/i.test(asset?.name || '');
      return `<div class="resource"><div><strong>${resource.title}</strong><span>${esc(file ? asset.name : resource.note)}</span></div><div>${file ? `<a href="${esc(file)}" ${resource.kind === 'document' && pdf ? 'target="_blank" rel="noopener"' : `download="${esc(asset.name)}"`}>${resource.kind === 'document' && pdf ? '预览 PDF ↗' : '下载文件 ↓'}</a>${resource.kind === 'document' && pdf ? ` <a href="${esc(file)}" download="${esc(asset.name)}">下载 ↓</a>` : ''}` : ''}${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${resource.kind === 'demo' ? '开始试玩' : resource.kind === 'video' ? '观看视频' : '阅读文档'} ↗</a>` : ''}${!file && !url ? '<span class="not-ready">待补充</span>' : ''}</div></div>`;
    }).join('')}</div><p class="detail-footnote">${project.documentPreview ? project.category === 'design' ? '封面标题已按游戏新名称更新，完整内容见 PDF。' : '封面取自实际 PDF 文档。' : project.category === 'demo' ? '书页插画为概念示意。原型内容以实际试玩为准。' : ''}${project.category === 'analysis' ? '个人学习研究，相关内容版权归原厂所有，非商业展示。' : ''}</p></div>`;
    $('#detail-dialog').showModal();
  }
  function projectOptions() {
    $('#edit-project').innerHTML = state.projects.map(project => `<option value="${esc(project.id)}">${esc(project.title)}</option>`).join('');
    if (state.projects.some(project => project.id === selectedId)) $('#edit-project').value = selectedId;
    else selectedId = state.projects[0]?.id;
  }
  function loadProjectForm() {
    const project = state.projects.find(item => item.id === selectedId);
    if (!project) return;
    removed = new Set();
    $('#work-error').textContent = '';
    for (const field of ['title', 'subtitle', 'description', 'category']) $('#edit-' + field).value = project[field] || '';
    $('#edit-tags').value = (project.tags || []).join(', ');
    $('#edit-notes').value = (project.notes || []).join('\n');
    for (const kind of ['document', 'demo', 'video']) $('#edit-' + kind + '-url').value = project[kind + 'Url'] || '';
    for (const kind of ['cover', 'document', 'demo']) {
      $('#upload-' + kind).value = '';
      const asset = project.assets?.[kind];
      $('#' + kind + '-current').textContent = asset ? '已保存：' + asset.name : '尚未添加文件';
      $('[data-remove="' + kind + '"]').hidden = !asset;
    }
  }
  function loadProfileForm() {
    for (const key of ['name', 'intro', 'about', 'body', 'education', 'direction', 'email', 'wechat', 'github', 'resumeUrl']) $('#profile-' + key).value = state.profile[key] || '';
    $('#profile-error').textContent = '';
  }
  async function openManager() { await ready; projectOptions(); loadProjectForm(); loadProfileForm(); $('#manager-dialog').showModal(); }
  async function persist(next) {
    if (!storage) throw new Error('本机存储模块加载失败，请刷新后重试。');
    await storage.save({profile:next.profile, projects:next.projects});
    releaseObjectUrls();
    state = next;
    render();
  }
  async function saveWork(event) {
    event.preventDefault();
    await ready;
    if (!beginMutation()) return;
    const button = $('button[type="submit"]', event.target);
    button.disabled = true;
    $('#work-error').textContent = '';
    try {
      const next = clone(state);
      const project = next.projects.find(item => item.id === selectedId);
      for (const field of ['title', 'subtitle', 'description', 'category']) project[field] = $('#edit-' + field).value.trim();
      if (!project.title || !project.description) throw new Error('请填写作品名称与介绍。');
      project.tags = $('#edit-tags').value.split(/[,，]/).map(tag => tag.trim()).filter(Boolean).slice(0, 8);
      project.notes = $('#edit-notes').value.split('\n').map(note => note.trim()).filter(Boolean);
      for (const kind of ['document', 'demo', 'video']) {
        const input = $('#edit-' + kind + '-url').value.trim();
        if (input && !resourceUrl(input)) throw new Error('请填写 https:// 链接或有效的站内 demo/、uploads/ 路径。');
        project[kind + 'Url'] = resourceUrl(input);
      }
      project.assets ||= {};
      const config = {cover:{extensions:['png','jpg','jpeg','webp'],limit:8}, document:{extensions:['pdf','docx','pptx','xlsx','md','txt'],limit:24}, demo:{extensions:['zip','7z'],limit:24}};
      for (const kind of ['cover', 'document', 'demo']) {
        if (removed.has(kind)) delete project.assets[kind];
        const file = $('#upload-' + kind).files[0];
        if (!file) continue;
        const extension = file.name.split('.').pop().toLowerCase();
        if (!config[kind].extensions.includes(extension)) throw new Error('不支持的文件类型：' + file.name);
        if (file.size > config[kind].limit * 1024 * 1024) throw new Error(file.name + ' 超过 ' + config[kind].limit + ' MB，请压缩文件或使用在线链接。');
        if (file.size === 0) throw new Error(file.name + ' 是空文件。');
        if (kind === 'cover') {
          try { const bitmap = await createImageBitmap(file); bitmap.close(); } catch { throw new Error('封面无法读取，请使用有效的 PNG、JPG 或 WebP 图片。'); }
        }
        project.assets[kind] = {name:file.name, type:file.type, size:file.size, blob:file};
      }
      await persist(next);
      projectOptions(); loadProjectForm();
      toast('已保存到当前浏览器。导出网站后可发布更新。');
    } catch (error) { $('#work-error').textContent = error.message || '保存失败，请重试。'; }
    finally { endMutation(); }
  }
  async function saveProfile(event) {
    event.preventDefault();
    await ready;
    if (!beginMutation()) return;
    const button = $('button[type="submit"]', event.target);
    button.disabled = true;
    try {
      const next = clone(state);
      for (const key of ['name', 'intro', 'about', 'body', 'education', 'direction', 'email', 'wechat', 'github', 'resumeUrl']) next.profile[key] = $('#profile-' + key).value.trim();
      if (!next.profile.name || !next.profile.intro) throw new Error('请填写署名与首页简介。');
      if (next.profile.github && !externalUrl(next.profile.github)) throw new Error('GitHub 链接必须以 https:// 或 http:// 开头。');
      if (next.profile.resumeUrl && !resourceUrl(next.profile.resumeUrl)) throw new Error('简历链接必须是 https:// 地址或 uploads/ 下的站内路径。');
      next.profile.contactVersion = 1;
      await persist(next);
      $('#profile-error').textContent = '';
      toast('个人资料已保存到当前浏览器。');
    } catch (error) { $('#profile-error').textContent = error.message; }
    finally { endMutation(); }
  }
  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = name;
    document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  async function exportSite() {
    await ready;
    if (!beginMutation()) return;
    const button = $('#export-site');
    const previous = button.innerHTML;
    button.disabled = true; button.textContent = '正在打包…';
    try {
      if (location.protocol === 'file:') throw new Error('导出需要本地预览服务。请双击“启动预览.cmd”，在打开的页面中导出。');
      const files = new Map();
      const baseFiles = ['index.html', 'styles.css', 'app.js', 'portfolio-storage.js', 'README.md', 'play.html', 'preview_server.py', '启动预览.cmd', 'assets/design-page-v2.png', 'assets/analysis-page.png', 'assets/book-demo.svg', ...(state.bundledFiles || [])];
      const resumePath = localPath(state.profile.resumeUrl);
      if (resumePath) baseFiles.push(resumePath);
      await Promise.all(baseFiles.map(async name => { const response = await fetch(name, {cache:'no-store'}); if (!response.ok) throw new Error('读取文件失败：' + name); files.set(name, await response.blob()); }));
      const published = clone(state);
      published.version = 1;
      for (const [index, project] of published.projects.entries()) {
        for (const [kind, asset] of Object.entries(project.assets || {})) {
          if (!['cover','document','demo'].includes(kind)) continue;
          const extension = asset.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
          const path = 'uploads/project-' + String(index + 1).padStart(2, '0') + '-' + kind + '.' + extension;
          let blob = asset.blob;
          if (!(blob instanceof Blob)) {
            const existing = localPath(asset.src);
            if (!existing) throw new Error('无法读取已发布文件：' + asset.name);
            const response = await fetch(existing);
            if (!response.ok) throw new Error('下载已发布文件失败：' + asset.name);
            blob = await response.blob();
          }
          files.set(path, blob);
          project.assets[kind] = {name:asset.name, type:asset.type, size:blob.size, src:path};
        }
      }
      files.set('portfolio-data.js', 'window.PORTFOLIO_DATA = ' + JSON.stringify(published, null, 2).replace(/</g, '\\u003c') + ';\n');
      files.set('.nojekyll', '');
      const zip = await storage.makeZip([...files].map(([name,data]) => ({name,data})));
      download(zip, 'Deng-Chunbin-Portfolio.zip');
      toast('网站已导出。解压后将全部文件上传到仓库根目录。');
    } catch (error) { toast(error.message || '打包失败，请重试。'); }
    finally { endMutation(); button.innerHTML = previous; }
  }

  $$('[data-manage]').forEach(button => button.addEventListener('click', openManager));
  $$('.dialog-close').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  $$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }));
  $('#project-grid').addEventListener('click', event => { const button = event.target.closest('[data-detail]'); if (button) openDetail(button.dataset.detail); });
  $('#contact-links').addEventListener('click', async event => {
    const button = event.target.closest('[data-copy-contact]');
    if (!button) return;
    const key = button.dataset.copyContact;
    if (!['email', 'wechat'].includes(key)) return;
    const feedback = $('.contact-feedback', $('#contact-links'));
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(state.profile[key]);
      feedback.dataset.state = 'success';
      feedback.textContent = key === 'wechat' ? '微信号已复制，可在微信中搜索添加。' : '邮箱地址已复制。';
    } catch {
      feedback.dataset.state = 'error';
      feedback.textContent = '暂时无法自动复制，请选中上方' + (key === 'wechat' ? '微信号' : '邮箱地址') + '手动复制。';
    }
  });
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    $$('[data-filter]').forEach(item => { const selected = item === button; item.classList.toggle('selected', selected); item.setAttribute('aria-pressed', selected); });
    renderProjects();
  }));
  $('.menu-button').addEventListener('click', () => { const open = $('#mobile-nav').hidden; $('#mobile-nav').hidden = !open; $('.menu-button').setAttribute('aria-expanded', open); });
  $$('#mobile-nav a, #mobile-nav button').forEach(item => item.addEventListener('click', () => { $('#mobile-nav').hidden = true; $('.menu-button').setAttribute('aria-expanded', false); }));
  $$('[data-manager-tab]').forEach(button => button.addEventListener('click', () => {
    $$('[data-manager-tab]').forEach(item => item.classList.toggle('selected', item === button));
    $('#work-form').hidden = button.dataset.managerTab !== 'works';
    $('#profile-form').hidden = button.dataset.managerTab !== 'profile';
  }));
  $('#edit-project').addEventListener('change', event => { selectedId = event.target.value; loadProjectForm(); });
  for (const kind of ['cover','document','demo']) {
    $('#upload-' + kind).addEventListener('change', event => { const file = event.target.files[0]; if (file) { removed.delete(kind); $('#' + kind + '-current').textContent = '待保存：' + file.name; $('[data-remove="' + kind + '"]').hidden = false; } });
    $('[data-remove="' + kind + '"]').addEventListener('click', () => { removed.add(kind); $('#upload-' + kind).value = ''; $('#' + kind + '-current').textContent = '保存后移除'; $('[data-remove="' + kind + '"]').hidden = true; });
  }
  $('#work-form').addEventListener('submit', saveWork);
  $('#profile-form').addEventListener('submit', saveProfile);
  $('#export-site').addEventListener('click', exportSite);
  $('#add-project').addEventListener('click', async () => {
    await ready;
    if (!beginMutation()) return;
    try {
      const next = clone(state);
      const id = 'work-' + crypto.randomUUID();
      next.projects.push({id, title:'新的游戏作品', subtitle:'GAME DESIGN / PROTOTYPE', category:'design', description:'在这里介绍你的设计目标与核心玩法。', tags:[], notes:[], assets:{}, cover:'assets/book-demo.svg', documentUrl:'', demoUrl:'', videoUrl:''});
      await persist(next); selectedId = id; projectOptions(); loadProjectForm(); toast('已新建作品，请编辑内容并保存。');
    } catch (error) { toast(error.message); }
    finally { endMutation(); }
  });
  $('#delete-project').addEventListener('click', async () => {
    await ready;
    if (busy) return;
    if (state.projects.length < 2) { toast('请至少保留一个作品。'); return; }
    const project = state.projects.find(item => item.id === selectedId);
    if (!confirm('删除本机草稿中的“' + project.title + '”？已发布的网站不受影响。')) return;
    if (!beginMutation()) return;
    try { const next = clone(state); next.projects = next.projects.filter(item => item.id !== selectedId); await persist(next); selectedId = next.projects[0].id; projectOptions(); loadProjectForm(); toast('已从本机草稿中删除。'); } catch (error) { toast(error.message); }
    finally { endMutation(); }
  });
  $('#reset-local').addEventListener('click', async () => {
    await ready;
    if (busy) return;
    if (!confirm('清除当前浏览器中尚未发布的资料和文件，恢复网站自带内容？请先导出需要保留的修改。')) return;
    if (!beginMutation()) return;
    try { await storage.clear(); releaseObjectUrls(); state = clone(window.PORTFOLIO_DATA); selectedId = state.projects[0]?.id; render(); projectOptions(); loadProjectForm(); loadProfileForm(); toast('已恢复网站自带内容。'); } catch (error) { toast(error.message); }
    finally { endMutation(); }
  });
  const currentYear = new Intl.DateTimeFormat('en', {year:'numeric', timeZone:'Asia/Tokyo'}).format(new Date());
  $('#year').textContent = currentYear;
  $('#edition-year').textContent = currentYear;
  render();
  const ready = (async () => {
    try {
      const draft = await storage?.load();
      if (draft && draft.profile && Array.isArray(draft.projects) && draft.projects.length) {
        const defaults = state.profile;
        state = {...state, ...draft, profile:{...defaults, ...draft.profile}};
        if (!draft.profile.contactVersion) {
          for (const key of ['email', 'wechat', 'resumeUrl']) if (!draft.profile[key]) state.profile[key] = defaults[key];
          state.profile.contactVersion = 1;
        }
        state.projects.forEach(project => {
          if (project.cover === 'assets/design-page.png') project.cover = 'assets/design-page-v2.png';
          if (/^(?:dont|don['‘’]t) let me (?:fall|down)(!)?$/i.test(project.title)) project.title = 'Don’t Let Me Down' + (project.title.endsWith('!') ? '!' : '');
          const asset = project.assets?.document;
          if (asset?.name === 'Dont Let Me Fall_详细游戏策划案_v0.3.pdf') asset.name = 'Don’t Let Me Down_详细游戏策划案_v0.3.pdf';
        });
        selectedId = state.projects[0].id; render();
      }
    } catch { toast('本机草稿暂不可用，已展示网站原始内容。'); }
  })();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) $$('.nav-links a').forEach(link => link.classList.toggle('active', link.hash === '#' + visible.target.id));
    }, {rootMargin:'-20% 0px -35% 0px',threshold:0});
    $$('#projects, #approach, #about, #contact').forEach(section => observer.observe(section));
  }
  window.addEventListener('beforeunload', releaseObjectUrls);
})();
