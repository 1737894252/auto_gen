const stage = document.getElementById("stage");
const bgCanvas = document.getElementById("bgCanvas");
const bgCtx = bgCanvas.getContext("2d");
const overlay = document.getElementById("sealOverlay");
// 添加缺失的canvas变量定义
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
const $ = id => document.getElementById(id);

// 噪点生成相关逻辑
const noiseCanvas = document.createElement('canvas');
const noiseCtx = noiseCanvas.getContext('2d');
let noiseGenerated = false;

function initNoise() {
  if (noiseGenerated) return;
  const size = 300; // 固定为300，与画布尺寸匹配
  noiseCanvas.width = size;
  noiseCanvas.height = size;

  const ctx = noiseCtx;
  ctx.clearRect(0, 0, size, size);

  // 1. 生成大块斑驳 (Low frequency noise)
  const scale = 20;
  const sw = Math.ceil(size / scale);
  const sh = Math.ceil(size / scale);

  const tempC = document.createElement('canvas');
  tempC.width = sw;
  tempC.height = sh;
  const tempCtx = tempC.getContext('2d');

  const idata = tempCtx.createImageData(sw, sh);
  const buf = idata.data; // Uint8ClampedArray [r,g,b,a, r,g,b,a...]
  for (let i = 0; i < buf.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    buf[i] = v;   // R
    buf[i + 1] = v; // G
    buf[i + 2] = v; // B
    buf[i + 3] = 255; // A
  }
  tempCtx.putImageData(idata, 0, 0);

  // 拉伸绘制到主噪声画布
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(tempC, 0, 0, size, size);
  ctx.restore();

  // 2. 混合高频噪点 (High frequency noise)
  const grainC = document.createElement('canvas');
  grainC.width = size;
  grainC.height = size;
  const grainCtx = grainC.getContext('2d');
  const gData = grainCtx.createImageData(size, size);
  const gBuf = gData.data;
  for (let i = 0; i < gBuf.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    gBuf[i] = v;
    gBuf[i + 1] = v;
    gBuf[i + 2] = v;
    gBuf[i + 3] = 255;
  }
  grainCtx.putImageData(gData, 0, 0);

  ctx.globalCompositeOperation = "overlay";
  ctx.drawImage(grainC, 0, 0);

  // 3. 阈值处理 (Thresholding)
  const finalData = ctx.getImageData(0, 0, size, size);
  const fBuf = finalData.data;
  for (let i = 0; i < fBuf.length; i += 4) {
    // 取蓝色通道作为灰度值
    let v = fBuf[i + 2];

    // 增加对比度
    v = (v - 100) * 3;
    v = Math.max(0, Math.min(255, v));

    // 设置为黑色，Alpha根据灰度决定
    fBuf[i] = 0;   // R
    fBuf[i + 1] = 0; // G
    fBuf[i + 2] = 0; // B
    fBuf[i + 3] = v; // A
  }
  ctx.putImageData(finalData, 0, 0);
  ctx.globalCompositeOperation = "source-over"; // reset

  noiseGenerated = true;
}

function applyRoughness(ctx, d, roughness) {
  if (!roughness || roughness <= 0) return;
  // 确保噪点已生成
  if (!noiseGenerated) initNoise();

  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.globalAlpha = Math.min(0.95, (roughness / 100) * 1.2);

  // 从大纹理中截取对应大小的区域
  // 使用 d, d 作为源和目标尺寸，保证纹理比例一致
  ctx.drawImage(noiseCanvas, 0, 0, d, d, 0, 0, d, d);

  if (roughness > 50) {
    ctx.globalAlpha = (roughness - 50) / 100 * 0.5;
    const offset = d * 0.2;
    ctx.translate(offset, offset);
    ctx.rotate(1);
    // 旋转层也使用截取的方式，确保不越界
    ctx.drawImage(noiseCanvas, 0, 0, d, d, -d / 2, -d / 2, d * 1.5, d * 1.5);
  }

  ctx.restore();
}

stage.addEventListener('wheel', e => { e.preventDefault(); const diameterEl = $('diameter'); if (!diameterEl) return; const cur = parseInt(diameterEl.value, 10); const min = parseInt(diameterEl.min || '300', 10); const max = parseInt(diameterEl.max || '800', 10); const factor = e.deltaY < 0 ? 1.06 : 0.94; let next = Math.round(cur * factor); next = Math.max(min, Math.min(max, next)); const curLeft = parseFloat(overlay.style.left || '0'); const curTop = parseFloat(overlay.style.top || '0'); const centerX = curLeft + (overlay.clientWidth || cur) / 2; const centerY = curTop + (overlay.clientHeight || cur) / 2; const newW = next; const newH = next; let newX = centerX - newW / 2; let newY = centerY - newH / 2; const maxX = stage.clientWidth - newW; const maxY = stage.clientHeight - newH; newX = Math.max(0, Math.min(newX, maxX)); newY = Math.max(0, Math.min(newY, maxY)); const once = () => { overlay.removeEventListener('load', once); overlay.style.left = newX + 'px'; overlay.style.top = newY + 'px' }; overlay.addEventListener('load', once); diameterEl.value = String(next); const evt = new Event('input', { bubbles: true }); diameterEl.dispatchEvent(evt) });

function setCanvasSize(d) { canvas.width = d; canvas.height = d }

function drawStar(ctx, cx, cy, outerR, innerR, fill) { const pts = []; for (let i = 0; i < 10; i++) { const a = (Math.PI / 5) * i - Math.PI / 2; const r = i % 2 === 0 ? outerR : innerR; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]) } ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++)ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); ctx.fillStyle = fill; ctx.fill() }

function drawCircle(ctx, cx, cy, r, lineWidth, color) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.lineWidth = lineWidth; ctx.strokeStyle = color; ctx.stroke() }

function splitChars(s) { return Array.from(s) }

function drawArcText(ctx, text, cx, cy, r, start, end, fontSize, fontFamily, color, invert = false, orientation = "tangent", rotateOffsetRad = 0, fontHeight = 1.0) { const chars = splitChars(text); if (chars.length === 0) return; const total = end - start; const step = chars.length > 1 ? total / (chars.length - 1) : 0; ctx.save(); ctx.fillStyle = color; ctx.textBaseline = "middle"; ctx.font = `${fontSize}px 'SimSunWoff2', sans-serif`; for (let i = 0; i < chars.length; i++) { const angle = start + step * i; ctx.save(); ctx.translate(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r); const rot = orientation === "radial" ? (angle + (invert ? Math.PI : 0) + rotateOffsetRad) : (angle + (invert ? -Math.PI / 2 : Math.PI / 2) + rotateOffsetRad); ctx.rotate(rot); if (fontHeight !== 1.0) { ctx.scale(1, fontHeight); } ctx.fillText(chars[i], 0, 0); ctx.restore() } ctx.restore() }

function drawCenterText(ctx, text, cx, cy, fontSize, fontFamily, color) { ctx.save(); ctx.fillStyle = color; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = `${fontSize}px 'SimSunWoff2', sans-serif`; ctx.fillText(text, cx, cy); ctx.restore() }

// 修复renderSeal函数，确保正确接收ctx参数并设置透明背景
function renderSeal(ctx, d, opts) {// 确保画布有透明背景
  ctx.save();
  ctx.clearRect(0, 0, d, d); // 清除画布，设置透明背景

  // 添加印章整体旋转功能
  const cx = d / 2, cy = d / 2; const color = "#e53935";
  // 应用印章整体旋转
  if (opts.rotation) {
    ctx.translate(cx, cy);
    ctx.rotate(opts.rotation * Math.PI / 180);
    ctx.translate(-cx, -cy);
  }
  drawCircle(ctx, cx, cy, d / 2 - opts.ringWidth / 2, opts.ringWidth, color);
  const fontFamily = opts.fontFamily; const baseSize = opts.fontSize;
  const topText = opts.topText; const typeText = opts.type; const serialText = opts.serial;
  const toRad = a => a * Math.PI / 180; const topSpan = Math.PI * opts.topSpacing;
  const bottomSpan = Math.PI * 0.72 * opts.bottomSpacing; const topStart = toRad(opts.topStartDeg || 240);
  const topEnd = topStart + topSpan; const topRadius = d / 2 - opts.ringWidth / 2 - opts.topOffset;
  const topRotate = toRad(opts.topRotateDeg || 0);

  // 使用用户设置的topFontSize和topFontHeight
  drawArcText(ctx, topText, cx, cy, topRadius, topStart, topEnd, opts.topFontSize, fontFamily, color, false, "radial", topRotate, opts.topFontHeight || 1.0);
  const starOuter = d * 0.14; const starInner = d * 0.052;
  drawStar(ctx, cx, cy, starOuter, starInner, color);
  const typeSize = baseSize * 1.2;
  drawCenterText(ctx, typeText, cx, cy + d * 0.22, typeSize, fontFamily, color);

  // 使用用户设置的bottomFontSize
  const serialSize = opts.bottomFontSize;
  const bottomStart = toRad(opts.bottomStartDeg || 225); const bottomEnd = bottomStart - bottomSpan;
  const serialRadius = d / 2 - opts.ringWidth / 2 - opts.bottomOffset;
  drawArcText(ctx, serialText, cx, cy, serialRadius, bottomStart, bottomEnd, serialSize, fontFamily, color, true, "tangent", 0);

  // 应用做旧效果
  applyRoughness(ctx, d, opts.roughness);

  ctx.restore();
}
function renderSealToCanvas(cctx, d, opts) {// 确保画布有透明背景
  cctx.save();
  cctx.clearRect(0, 0, d, d); // 清除画布，设置透明背景

  // 添加印章整体旋转功能
  const cx = d / 2, cy = d / 2; const color = "#e53935";
  // 应用印章整体旋转
  if (opts.rotation) {
    cctx.translate(cx, cy);
    cctx.rotate(opts.rotation * Math.PI / 180);
    cctx.translate(-cx, -cy);
  }
  drawCircle(cctx, cx, cy, d / 2 - opts.ringWidth / 2, opts.ringWidth, color);
  const fontFamily = opts.fontFamily; const baseSize = opts.fontSize;
  const topText = opts.topText; const typeText = opts.type; const serialText = opts.serial;
  const toRad = a => a * Math.PI / 180; const topSpan = Math.PI * opts.topSpacing;
  const bottomSpan = Math.PI * 0.72 * opts.bottomSpacing; const topStart = toRad(opts.topStartDeg || 240);
  const topEnd = topStart + topSpan; const topRadius = d / 2 - opts.ringWidth / 2 - opts.topOffset;
  const topRotate = toRad(opts.topRotateDeg || 0);

  // 使用用户设置的topFontSize和topFontHeight
  drawArcText(cctx, topText, cx, cy, topRadius, topStart, topEnd, opts.topFontSize, fontFamily, color, false, "radial", topRotate, opts.topFontHeight || 1.0);
  const starOuter = d * 0.14; const starInner = d * 0.052;
  drawStar(cctx, cx, cy, starOuter, starInner, color);
  const typeSize = baseSize * 1.2;
  drawCenterText(cctx, typeText, cx, cy + d * 0.22, typeSize, fontFamily, color);

  // 使用用户设置的bottomFontSize而不是baseSize*0.62
  const bottomStart = toRad(opts.bottomStartDeg || 225); const bottomEnd = bottomStart - bottomSpan;
  const serialRadius = d / 2 - opts.ringWidth / 2 - opts.bottomOffset;
  drawArcText(cctx, serialText, cx, cy, serialRadius, bottomStart, bottomEnd, opts.bottomFontSize, fontFamily, color, true, "tangent", 0);

  // 应用做旧效果
  applyRoughness(cctx, d, opts.roughness);

  cctx.restore();
}
function generateSealImage(opts) {
  const d = opts.diameter; const c = document.createElement("canvas");
  c.width = d; c.height = d;
  const cctx = c.getContext("2d");
  // 确保生成的印章图片有透明背景
  cctx.save();
  cctx.clearRect(0, 0, d, d); // 清除画布，设置透明背景
  renderSealToCanvas(cctx, d, opts);
  cctx.restore();
  return c.toDataURL("image/png")
}
function setBgSize(w, h) { bgCanvas.width = w; bgCanvas.height = h; }
let bgImg = null;
function drawBackground() {
  if (!bgImg) return; const bw = bgCanvas.width; const bh = bgCanvas.height; bgCtx.clearRect(0, 0, bw, bh);
  // 启用高质量图像平滑
  bgCtx.imageSmoothingEnabled = true;
  bgCtx.imageSmoothingQuality = 'high';

  // 直接100%显示图片，填满整个画布
  bgCtx.drawImage(bgImg, 0, 0, bw, bh);
}

// 全局函数：处理数字输入框的加减按钮点击事件
function changeValue(id, operation) {
  const input = document.getElementById(id);
  if (!input) return;
  
  const min = parseFloat(input.min) || 0;
  const max = parseFloat(input.max) || 100;
  const step = parseFloat(input.step) || 1;
  let currentValue = parseFloat(input.value) || 0;
  
  // 计算新值：加按钮就+step，减按钮就-step
  let delta = operation === '+' ? step : -step;
  let newValue = currentValue + delta;
  
  // 确保新值在最小值和最大值之间
  newValue = Math.max(min, Math.min(max, newValue));
  
  // 更新输入框的值
  input.value = newValue;
  
  // 触发input事件，以便update函数能够更新印章显示
  const evt = new Event('input', { bubbles: true });
  input.dispatchEvent(evt);
}

function boot() {
  const type = $("type");
  const topText = $("topText");
  const serial = $("serial");
  const diameter = $("diameter");
  const ringWidth = $("ringWidth");
  const fontSize = $("fontSize");
  const topStartDeg = $("topStartDeg");
  const bottomStartDeg = $("bottomStartDeg");
  const topOffset = $("topOffset");
  const bottomOffset = $("bottomOffset");
  const topSpacing = $("topSpacing");
  const bottomSpacing = $("bottomSpacing");
  
  const topRotateDeg = $("topRotateDeg");
  const bgImage = $("bgImage");
  const downloadBtn = $("download");
  // 新增分步流程按钮
  const designCompleteBtn = $("designComplete");
  const uploadWrapper = $("uploadWrapper");
  const saveBtn = $("saveBtn");
  // 添加上下弧字体大小控制
  const topFontSize = $("topFontSize");
  const bottomFontSize = $("bottomFontSize");
  // 添加印章旋转控制
  const sealRotation = $("sealRotation");
  // 添加做旧程度控制
  const roughness = $("roughness");
  // 添加操作空间开关控制
  const controlsToggle = $("controlsToggle");
  const controlsBox = $("controlsBox");
  let currentX = 0, currentY = 0;

  // 添加上弧字高控制
  const topFontHeight = $("topFontHeight");

  function getResponsiveDefaults() {
    return {
      diameter: "200",
      ringWidth: "7",
      fontSize: "20",
      sealRotation: "0",
      roughness: "0",

      topStartDeg: "168",
      topOffset: "20",
      topSpacing: "1.06",
      topRotateDeg: "98",
      topFontSize: "22",
      topFontHeight: "1.5",

      bottomStartDeg: "126",
      bottomOffset: "13",
      bottomSpacing: "0.54",
      bottomFontSize: "16",

      type: "居民委员会",
      topText: "赣州市南昌县琴城镇新建社区",
      serial: "3610231000004",
      
    };
  }

  function getFont() {
    // 只返回woff2格式的宋体字体
    return 'SimSunWoff2';
  }
  function positionOverlay(x, y) { const maxX = stage.clientWidth - (overlay.clientWidth || 0); const maxY = stage.clientHeight - (overlay.clientHeight || 0); currentX = Math.max(0, Math.min(x, maxX)); currentY = Math.max(0, Math.min(y, maxY)); overlay.style.left = currentX + "px"; overlay.style.top = currentY + "px" }

  // 添加拖拽功能的鼠标和触摸事件监听器
  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  // 双指缩放相关变量
  let isPinching = false;
  let lastPinchDistance = 0;
  let initialPinchDiameter = 0;
  let pinchCenterX = 0;
  let pinchCenterY = 0;

  // 计算两点之间的距离
  function getDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // 计算两点之间的中心点
  function getCenter(touch1, touch2) {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  }

  // 鼠标事件
  overlay.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = overlay.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    overlay.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const stageRect = stage.getBoundingClientRect();
    const x = e.clientX - stageRect.left - dragOffsetX;
    const y = e.clientY - stageRect.top - dragOffsetY;
    positionOverlay(x, y);
    updateCoords();
    saveConfig();
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      overlay.style.cursor = 'grab';
    }
  });

  // 触摸事件
  overlay.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      // 双指触摸，开始缩放
      isPinching = true;
      lastPinchDistance = getDistance(e.touches[0], e.touches[1]);
      initialPinchDiameter = parseInt(diameter.value, 10);

      // 计算初始中心点
      const center = getCenter(e.touches[0], e.touches[1]);
      const stageRect = stage.getBoundingClientRect();
      pinchCenterX = center.x - stageRect.left;
      pinchCenterY = center.y - stageRect.top;

      e.preventDefault();
    } else if (e.touches.length === 1) {
      // 单指触摸，开始拖拽
      isDragging = true;
      const touch = e.touches[0];
      const rect = overlay.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      dragOffsetX = touch.clientX - rect.left;
      dragOffsetY = touch.clientY - rect.top;
      e.preventDefault();
    }
  });

  document.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && isPinching) {
      // 双指移动，进行缩放
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / lastPinchDistance;

      // 计算新的直径
      let newDiameter = initialPinchDiameter * scale;
      const minDiameter = parseInt(diameter.min, 10) || 100;
      const maxDiameter = parseInt(diameter.max, 10) || 800;
      newDiameter = Math.max(minDiameter, Math.min(maxDiameter, newDiameter));

      // 计算新的中心点
      const center = getCenter(e.touches[0], e.touches[1]);
      const stageRect = stage.getBoundingClientRect();
      const newCenterX = center.x - stageRect.left;
      const newCenterY = center.y - stageRect.top;

      // 保存当前直径，用于计算位置偏移
      const oldDiameter = parseInt(diameter.value, 10);

      // 更新直径输入框
      diameter.value = Math.round(newDiameter);
      const evt = new Event('input', { bubbles: true });
      diameter.dispatchEvent(evt);

      // 调整印章位置，使其中心保持在双指中心点
      const oldHalfWidth = oldDiameter / 2;
      const newHalfWidth = newDiameter / 2;

      // 计算位置偏移：中心点变化 + 尺寸变化导致的偏移
      const deltaX = (newCenterX - pinchCenterX) + (oldHalfWidth - newHalfWidth);
      const deltaY = (newCenterY - pinchCenterY) + (oldHalfWidth - newHalfWidth);

      // 更新位置
      currentX += deltaX;
      currentY += deltaY;
      positionOverlay(currentX, currentY);
      updateCoords();
      saveConfig();

      // 更新中心点和距离
      pinchCenterX = newCenterX;
      pinchCenterY = newCenterY;
      lastPinchDistance = currentDistance;
      initialPinchDiameter = newDiameter;

      e.preventDefault();
    } else if (e.touches.length === 1 && isDragging) {
      // 单指移动，进行拖拽
      const touch = e.touches[0];
      const stageRect = stage.getBoundingClientRect();
      const x = touch.clientX - stageRect.left - dragOffsetX;
      const y = touch.clientY - stageRect.top - dragOffsetY;
      positionOverlay(x, y);
      updateCoords();
      saveConfig();
      e.preventDefault();
    }
  });

  document.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      isPinching = false;
    }
    if (e.touches.length < 1) {
      isDragging = false;
    }
  });
  function updateCoords() { const fx = currentX.toFixed(2), fy = currentY.toFixed(2); $("coords").textContent = `X: ${fx}, Y: ${fy}` }
  function loadConfig() {
    try {
      const config = localStorage.getItem("sealConfig");
      return config ? JSON.parse(config) : null;
    } catch (e) {
      console.error("加载配置失败:", e);
      return null;
    }
  }
  function captureConfig() {
    return {
      type: type.value,
      topText: topText.value,
      serial: serial.value,
      diameter: diameter.value,
      ringWidth: ringWidth.value,
      fontSize: fontSize.value,
      
      sealRotation: sealRotation?.value || 0,
      roughness: roughness.value,
      topStartDeg: topStartDeg.value,
      topOffset: topOffset.value,
      topSpacing: topSpacing.value,
      topRotateDeg: topRotateDeg.value,
      topFontSize: topFontSize.value,
      topFontHeight: topFontHeight.value,
      bottomStartDeg: bottomStartDeg.value,
      bottomOffset: bottomOffset.value,
      bottomSpacing: bottomSpacing.value,
      bottomFontSize: bottomFontSize.value,
      overlayX: currentX,
      overlayY: currentY
    };
  }
  function saveConfig() {
    try {
      const config = captureConfig();
      localStorage.setItem("sealConfig", JSON.stringify(config));
    } catch (e) {
      console.error("保存配置失败:", e);
    }
  }
  function applyInputs(cfg) {
    if (!cfg) return;
    if (cfg.type !== undefined) type.value = cfg.type;
    if (cfg.topText !== undefined) topText.value = cfg.topText;
    if (cfg.serial !== undefined) serial.value = cfg.serial;
    if (cfg.diameter !== undefined) diameter.value = cfg.diameter;
    if (cfg.ringWidth !== undefined) ringWidth.value = cfg.ringWidth;
    if (cfg.fontSize !== undefined) fontSize.value = cfg.fontSize;
    
    if (cfg.topStartDeg !== undefined) topStartDeg.value = cfg.topStartDeg;
    if (cfg.bottomStartDeg !== undefined) bottomStartDeg.value = cfg.bottomStartDeg;
    if (cfg.topOffset !== undefined) topOffset.value = cfg.topOffset;
    if (cfg.bottomOffset !== undefined) bottomOffset.value = cfg.bottomOffset;
    if (cfg.topSpacing !== undefined) topSpacing.value = cfg.topSpacing;
    if (cfg.bottomSpacing !== undefined) bottomSpacing.value = cfg.bottomSpacing;
    if (cfg.topRotateDeg !== undefined) topRotateDeg.value = cfg.topRotateDeg;
    if (cfg.topFontSize !== undefined) topFontSize.value = cfg.topFontSize;
    if (cfg.topFontHeight !== undefined) topFontHeight.value = cfg.topFontHeight;
    if (cfg.bottomFontSize !== undefined) bottomFontSize.value = cfg.bottomFontSize;
    // 使用保存的印章旋转角度
    if (sealRotation && cfg.sealRotation !== undefined) sealRotation.value = cfg.sealRotation;
    if (cfg.overlayX != null) currentX = parseFloat(cfg.overlayX);
    if (cfg.overlayY != null) currentY = parseFloat(cfg.overlayY);
  }
  function buildOpts() {
    return {
      type: type.value,
      topText: topText.value.trim() || "赣州市南昌县琴城镇新建社区",
      serial: serial.value.trim() || "3610231000004",
      diameter: parseInt(diameter.value, 10),
      ringWidth: parseInt(ringWidth.value, 10),
      fontSize: parseInt(fontSize.value, 10),
      // 添加上下弧字体大小
      topFontSize: parseInt(topFontSize.value, 10),
      topFontHeight: parseFloat(topFontHeight.value),
      bottomFontSize: parseInt(bottomFontSize.value, 10),
      fontFamily: getFont(),
      topStartDeg: parseFloat(topStartDeg.value),
      bottomStartDeg: parseFloat(bottomStartDeg.value),
      topOffset: parseFloat(topOffset.value),
      bottomOffset: parseFloat(bottomOffset.value),
      topSpacing: parseFloat(topSpacing.value),
      bottomSpacing: parseFloat(bottomSpacing.value),
      topRotateDeg: parseFloat(topRotateDeg.value),
      // 添加印章旋转角度
      rotation: parseFloat(sealRotation?.value || 0)
    }
  }
  function update() {
    const opts = {
      type: type.value,
      topText: topText.value.trim() || "赣州市南昌县琴城镇新建社区",
      serial: serial.value.trim() || "3610231000004",
      diameter: parseInt(diameter.value, 10),
      ringWidth: parseInt(ringWidth.value, 10),
      fontSize: parseInt(fontSize.value, 10),
      // 添加上下弧字体大小和上弧字高
      topFontSize: parseInt(topFontSize.value, 10),
      topFontHeight: parseFloat(topFontHeight.value),
      bottomFontSize: parseInt(bottomFontSize.value, 10),
      fontFamily: getFont(),
      topStartDeg: parseFloat(topStartDeg.value),
      bottomStartDeg: parseFloat(bottomStartDeg.value),
      topOffset: parseFloat(topOffset.value),
      bottomOffset: parseFloat(bottomOffset.value),
      topSpacing: parseFloat(topSpacing.value),
      bottomSpacing: parseFloat(bottomSpacing.value),
      topRotateDeg: parseFloat(topRotateDeg.value),
      // 添加印章旋转角度
      rotation: parseFloat(sealRotation?.value || 0),
      // 添加做旧程度
      roughness: parseInt(roughness.value, 10)
    };

    // 直接在全局canvas上渲染印章，然后转换为data URL
    const d = opts.diameter;
    setCanvasSize(d);
    renderSeal(ctx, d, opts);
    const url = canvas.toDataURL("image/png");

    overlay.src = url;
    overlay.style.width = opts.diameter + "px";
    overlay.style.height = opts.diameter + "px";
    // 确保overlay元素支持透明背景
    overlay.style.backgroundColor = "transparent";
    overlay.style.background = "transparent";

    if (!bgImg) {
      setBgSize(300, 300);
      updateCanvasSize();
    }
    if (!currentX && !currentY) {
      currentX = stage.clientWidth / 2 - overlay.clientWidth / 2;
      currentY = stage.clientHeight / 2 - overlay.clientHeight / 2
    }
    positionOverlay(currentX, currentY);
    updateCoords();
    updateCanvasSize();
    saveConfig()
  }
  type.addEventListener("change", update);
  topText.addEventListener("input", update);
  serial.addEventListener("input", update);
  diameter.addEventListener("input", update);
  ringWidth.addEventListener("input", update);
  fontSize.addEventListener("input", update);
  topStartDeg.addEventListener("input", update);
  bottomStartDeg.addEventListener("input", update);
  topOffset.addEventListener("input", update);
  bottomOffset.addEventListener("input", update);
  topSpacing.addEventListener("input", update);
  bottomSpacing.addEventListener("input", update);
  
  topRotateDeg.addEventListener("input", update);
  // 添加上下弧字体大小和上弧字高的事件监听器
  topFontSize.addEventListener("input", update);
  topFontHeight.addEventListener("input", update);
  bottomFontSize.addEventListener("input", update);
  // 添加印章旋转的事件监听器
  sealRotation?.addEventListener("input", update);
  roughness.addEventListener("input", update);
  // 分步流程逻辑

  // 设计完成按钮点击事件 - 直接下载印章
  designCompleteBtn.addEventListener("click", () => {
    // 1. 首先保存当前配置，确保用户设置不会丢失
    saveConfig();

    // 2. 创建一个画布，尺寸与印章直径相同
    const exp = document.createElement("canvas");
    const sealSize = parseInt(diameter.value, 10);
    exp.width = sealSize;
    exp.height = sealSize;
    const ectx = exp.getContext("2d");

    // 3. 启用高质量图像平滑
    ectx.imageSmoothingEnabled = true;
    ectx.imageSmoothingQuality = 'high';

    // 4. 重构opts对象，用于渲染高分辨率印章
    const opts = {
      type: type.value,
      topText: topText.value.trim() || "赣州市南昌县琴城镇新建社区",
      serial: serial.value.trim() || "3610231000004",
      diameter: sealSize,
      ringWidth: parseInt(ringWidth.value, 10),
      fontSize: parseInt(fontSize.value, 10),
      topFontSize: parseInt(topFontSize.value, 10),
      topFontHeight: parseFloat(topFontHeight.value),
      bottomFontSize: parseInt(bottomFontSize.value, 10),
      fontFamily: getFont(),
      topStartDeg: parseFloat(topStartDeg.value),
      bottomStartDeg: parseFloat(bottomStartDeg.value),
      topOffset: parseFloat(topOffset.value),
      bottomOffset: parseFloat(bottomOffset.value),
      topSpacing: parseFloat(topSpacing.value),
      bottomSpacing: parseFloat(bottomSpacing.value),
      topRotateDeg: parseFloat(topRotateDeg.value),
      rotation: parseFloat(sealRotation?.value || 0),
      roughness: parseInt(roughness.value, 10)
    };

    // 5. 直接渲染印章到画布
    renderSealToCanvas(ectx, sealSize, opts);

    // 6. 生成高质量的PNG图片，使用最高质量参数
    const a = document.createElement("a");
    a.href = exp.toDataURL("image/png", 1.0); // 使用最高质量参数
    a.download = `${topText.value.trim() || "示例"}-${type.value}-印章.png`;
    a.click();
  });

  // 2. 上传图片事件 - 显示保存按钮
  bgImage.addEventListener("change", () => {
    const file = bgImage.files[0];
    if (!file) return;
    const ok = /\.(jpg|jpeg|png)$/i.test(file.name);
    if (!ok) return;
    if (file.size > 5 * 1024 * 1024) return;
    const img = new Image();
    // 设置图片加载为高质量
    img.setAttribute('crossOrigin', 'anonymous'); // 确保跨域图片也能正常处理
    img.onload = () => {
      bgImg = img;

      // 固定画布尺寸为300*300
      const targetWidth = 300;
      const targetHeight = 300;

      // 设置画布尺寸
      setBgSize(targetWidth, targetHeight);

      // 响应式处理：确保舞台适应容器宽度，同时保持图片长宽比
      stage.style.maxWidth = '100%';
      stage.style.width = '100%';
      stage.style.height = 'auto';
      stage.style.aspectRatio = `${targetWidth} / ${targetHeight}`;

      // 启用高质量图像平滑
      bgCtx.imageSmoothingEnabled = true;
      bgCtx.imageSmoothingQuality = 'high';

      // 绘制图片，确保填满300*300画布
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      bgCtx.drawImage(img, 0, 0, targetWidth, targetHeight);

      update();

      // 显示保存按钮
      saveBtn.style.display = 'inline-block';
      // 提示用户调整印章位置
      alert('图片已上传，请调整印章在图片上的位置，然后点击保存并下载');
    };
    img.src = URL.createObjectURL(file)
  });

  // 3. 保存并下载按钮点击事件
  saveBtn.addEventListener("click", () => {
    // 1. 首先保存当前配置，确保用户设置不会丢失
    saveConfig();

    const exp = document.createElement("canvas");
    exp.width = bgCanvas.width;
    exp.height = bgCanvas.height;
    const ectx = exp.getContext("2d");

    // 启用高质量图像平滑
    ectx.imageSmoothingEnabled = true;
    ectx.imageSmoothingQuality = 'high';

    // 首先复制背景画布的内容，确保与显示完全一致
    ectx.drawImage(bgCanvas, 0, 0);

    // 计算舞台元素的缩放比例
    const scaleX = bgCanvas.width / stage.clientWidth;
    const scaleY = bgCanvas.height / stage.clientHeight;

    // 计算印章在最终画布上的位置和尺寸
    const sealX = currentX * scaleX;
    const sealY = currentY * scaleY;
    const sealWidth = overlay.clientWidth * scaleX;
    const sealHeight = overlay.clientHeight * scaleY;

    

    // 重构opts对象，用于重新渲染高分辨率印章
    const opts = {
      type: type.value,
      topText: topText.value.trim() || "赣州市南昌县琴城镇新建社区",
      serial: serial.value.trim() || "3610231000004",
      diameter: parseInt(diameter.value, 10),
      ringWidth: parseInt(ringWidth.value, 10),
      fontSize: parseInt(fontSize.value, 10),
      topFontSize: parseInt(topFontSize.value, 10),
      topFontHeight: parseFloat(topFontHeight.value),
      bottomFontSize: parseInt(bottomFontSize.value, 10),
      fontFamily: getFont(),
      topStartDeg: parseFloat(topStartDeg.value),
      bottomStartDeg: parseFloat(bottomStartDeg.value),
      topOffset: parseFloat(topOffset.value),
      bottomOffset: parseFloat(bottomOffset.value),
      topSpacing: parseFloat(topSpacing.value),
      bottomSpacing: parseFloat(bottomSpacing.value),
      topRotateDeg: parseFloat(topRotateDeg.value),
      rotation: parseFloat(sealRotation?.value || 0),
      roughness: parseInt(roughness.value, 10)
    };

    // 创建临时高分辨率画布渲染印章
    const tempCanvas = document.createElement("canvas");
    // 使用计算出的最终尺寸作为画布尺寸，确保清晰度
    const targetSize = Math.max(sealWidth, sealHeight);
    tempCanvas.width = targetSize;
    tempCanvas.height = targetSize;
    const tempCtx = tempCanvas.getContext("2d");

    // 计算缩放比例
    const ratio = targetSize / opts.diameter;

    // 缩放上下文以匹配目标尺寸
    tempCtx.scale(ratio, ratio);

    // 渲染印章到临时画布
    renderSealToCanvas(tempCtx, opts.diameter, opts);

    // 将高分辨率印章绘制到最终画布上
    ectx.drawImage(tempCanvas, sealX, sealY, sealWidth, sealHeight);

    // 生成高质量的PNG图片，使用最高质量参数
    const a = document.createElement("a");
    a.href = exp.toDataURL("image/png", 1.0); // 使用最高质量参数
    a.download = `${topText.value.trim() || "示例"}-${type.value}-合成.png`;
    a.click();

    // 重置流程，允许重新设计
    setTimeout(() => {
      // 恢复初始按钮状态
      designCompleteBtn.style.display = 'inline-block';
      uploadWrapper.style.display = 'none';
      saveBtn.style.display = 'none';
    }, 1000);
  });

  // 隐藏不需要的上传和保存按钮
  uploadWrapper.style.display = 'none';
  saveBtn.style.display = 'none';

  // 保留原有的下载按钮事件，确保兼容性
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      // 直接触发设计完成按钮的点击事件，实现下载功能
      designCompleteBtn.click();
    });
  }
  window.addEventListener("resize", () => {
    // 固定画布尺寸为300*300
    if (!bgImg) {
      setBgSize(300, 300);
      updateCanvasSize();
    }
    drawBackground();
    positionOverlay(currentX, currentY);
    updateCoords()
  });
  // 添加操作空间开关事件监听器
  if (controlsToggle && controlsBox) {
    controlsToggle.addEventListener('click', () => {
      // 切换display状态而不是class
      const isHidden = controlsBox.style.display === 'none';
      controlsBox.style.display = isHidden ? 'block' : 'none';
      // 如果打开了控制面板，关闭历史记录面板，避免遮挡
      if (isHidden && historyPanel) {
        historyPanel.style.display = 'none';
      }
    });

    // 默认打开操作空间，但在移动端（宽度小于1200px）默认关闭
    if (window.innerWidth >= 1200) {
      controlsBox.style.display = 'block';
    } else {
      controlsBox.style.display = 'none';
    }
  }

  // --- 历史记录功能实现 ---
  const historyPanel = $("historyPanel");
  const historyList = $("historyList");
  const closeHistoryBtn = $("closeHistoryBtn");

  // 显示生成历史按钮

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem("sealHistory") || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveHistoryItem(item) {
    const history = getHistory();
    history.unshift(item); // Add to top
    // Limit to 20 items
    if (history.length > 20) history.pop();
    localStorage.setItem("sealHistory", JSON.stringify(history));
  }

  function deleteHistoryItem(index) {
    const history = getHistory();
    history.splice(index, 1);
    localStorage.setItem("sealHistory", JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    if (!historyList) return;
    const history = getHistory();
    historyList.innerHTML = "";
    if (history.length === 0) {
      historyList.innerHTML = '<div style="text-align:center;color:#999;padding:20px;font-size:14px;">暂无历史记录</div>';
      return;
    }

    history.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "history-item";
      div.innerHTML = `
        <img src="${item.image}" alt="Seal">
        <div class="history-info">
          <div class="history-desc">${item.config.topText || '未命名'}</div>
          <div class="history-time">${item.timestamp}</div>
        </div>
        <div class="history-delete" title="删除">×</div>
      `;

      div.querySelector(".history-delete").addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm("确定删除这条记录吗？")) {
          deleteHistoryItem(index);
        }
      });

      div.addEventListener("click", () => {
        if (confirm("确定要恢复这个印章配置吗？当前未保存的修改将丢失。")) {
          applyInputs(item.config);
          update();
          // 移动端恢复配置后，如果控制面板关闭，则自动打开以便查看参数
          if (window.innerWidth < 1200 && controlsBox && controlsBox.style.display === 'none') {
            controlsBox.style.display = 'block';
            historyPanel.style.display = 'none'; // Close history to show controls
          }
        }
      });

      historyList.appendChild(div);
    });
  }



  if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener("click", () => {
      if (historyPanel) historyPanel.style.display = "none";
    });
  }


  // 这里暂时只在生成时打开，或者添加一个“查看历史”按钮？
  // 用户需求是“点击生成...放到历史记录里”，所以目前的逻辑符合。
  // 为了方便用户查看，可以添加一个额外的“查看历史”按钮，或者让“生成到历史”按钮兼具打开功能（如果不生成）
  // 但为了简单，先保持这样。用户生成后会自动打开列表。

  // 初始渲染
  renderHistory();

  // 重置localStorage，清除可能包含旧属性的配置
  localStorage.removeItem('sealConfig');
  
  cfg = getResponsiveDefaults();
  // 默认启用混合模式
  cfg.blendOn = true;
  applyInputs(cfg);
  update();
  // 页面加载完成后，保存当前配置（确保默认值也被保存）
  saveConfig();
}

// 完全移除重复的init函数代码
// function init(){
//   // 所有init函数内容都被完全注释或移除
// }

// 添加缺失的updateCanvasSize函数
function updateCanvasSize() {
  const w = bgCanvas.width, h = bgCanvas.height;
  const canvasSizeEl = $("canvasSize");
  if (canvasSizeEl) {
    canvasSizeEl.textContent = `画布尺寸: ${w} x ${h}`;
  }
}

// 将SimSunWoff2字体缓存到本地，避免重复下载
function cacheFontLocally() {
  // 字体缓存的键名
  const fontCacheKey = 'simsun_woff2_cache';
  
  // 检查浏览器是否支持document.fonts API和localStorage
  if ('fonts' in document && 'localStorage' in window) {
    try {
      // 检查localStorage中是否已有缓存的字体
      const cachedFont = localStorage.getItem(fontCacheKey);
      
      if (cachedFont) {
        console.log('发现本地缓存的SimSunWoff2字体，从缓存加载');
        // 从缓存创建FontFace对象
        const fontFace = new FontFace('SimSunWoff2', `url(${cachedFont})`);
        
        // 加载缓存的字体
        fontFace.load().then(() => {
          document.fonts.add(fontFace);
          console.log('缓存的SimSunWoff2字体加载成功，开始渲染印章');
          boot();
        }).catch((error) => {
          console.warn('缓存的SimSunWoff2字体加载失败，重新下载:', error);
          // 缓存的字体加载失败，重新下载
          downloadAndCacheFont();
        });
      } else {
        console.log('未发现本地缓存的SimSunWoff2字体，开始下载并缓存');
        // 没有缓存，下载字体并缓存
        downloadAndCacheFont();
      }
    } catch (error) {
      console.warn('使用localStorage缓存字体时出错，直接下载:', error);
      // 缓存操作出错，直接下载字体
      downloadAndCacheFont();
    }
  } else {
    console.warn('浏览器不支持document.fonts API或localStorage，直接加载字体');
    // 浏览器不支持必要的API，直接渲染
    boot();
  }
  
  // 下载字体并缓存到localStorage的函数
  function downloadAndCacheFont() {
    // 下载字体文件
    fetch('simsun.woff2')
      .then(response => {
        if (!response.ok) {
          throw new Error(`字体下载失败，状态码: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        // 将字体文件转换为data URL
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      })
      .then(dataUrl => {
        // 缓存字体到localStorage
        localStorage.setItem(fontCacheKey, dataUrl);
        console.log('SimSunWoff2字体下载成功并缓存到本地');
        
        // 创建FontFace对象并加载
        const fontFace = new FontFace('SimSunWoff2', `url(${dataUrl})`);
        return fontFace.load();
      })
      .then(fontFace => {
        // 字体加载成功，添加到文档中
        document.fonts.add(fontFace);
        console.log('SimSunWoff2字体加载成功，开始渲染印章');
        // 开始渲染印章
        boot();
      })
      .catch((error) => {
        // 字体下载或缓存失败，使用备选方案
        console.warn('SimSunWoff2字体下载或缓存失败，使用备选方案渲染:', error);
        // 仍然继续渲染，浏览器会使用备选字体
        boot();
      });
  }
}

// 开始加载字体并渲染
cacheFontLocally();