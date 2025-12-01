const stage=document.getElementById("stage");
const bgCanvas=document.getElementById("bgCanvas");
const bgCtx=bgCanvas.getContext("2d");
const overlay=document.getElementById("sealOverlay");
// 添加缺失的canvas变量定义
const canvas=document.createElement("canvas");
const ctx=canvas.getContext("2d");
const $=id=>document.getElementById(id);

stage.addEventListener('wheel',e=>{e.preventDefault();const diameterEl=$('diameter');if(!diameterEl)return;const cur=parseInt(diameterEl.value,10);const min=parseInt(diameterEl.min||'300',10);const max=parseInt(diameterEl.max||'800',10);const factor=e.deltaY<0?1.06:0.94;let next=Math.round(cur*factor);next=Math.max(min,Math.min(max,next));const curLeft=parseFloat(overlay.style.left||'0');const curTop=parseFloat(overlay.style.top||'0');const centerX=curLeft+(overlay.clientWidth||cur)/2;const centerY=curTop+(overlay.clientHeight||cur)/2;const newW=next;const newH=next;let newX=centerX-newW/2;let newY=centerY-newH/2;const maxX=stage.clientWidth-newW;const maxY=stage.clientHeight-newH;newX=Math.max(0,Math.min(newX,maxX));newY=Math.max(0,Math.min(newY,maxY));const once=()=>{overlay.removeEventListener('load',once);overlay.style.left=newX+'px';overlay.style.top=newY+'px'};overlay.addEventListener('load',once);diameterEl.value=String(next);const evt=new Event('input',{bubbles:true});diameterEl.dispatchEvent(evt)});

function setCanvasSize(d){canvas.width=d;canvas.height=d}

function drawStar(ctx,cx,cy,outerR,innerR,fill){const pts=[];for(let i=0;i<10;i++){const a=(Math.PI/5)*i-Math.PI/2;const r=i%2===0?outerR:innerR;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r])}ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill()}

function drawCircle(ctx,cx,cy,r,lineWidth,color){ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.lineWidth=lineWidth;ctx.strokeStyle=color;ctx.stroke()}

function splitChars(s){return Array.from(s)}

function drawArcText(ctx,text,cx,cy,r,start,end,fontSize,fontFamily,color,invert=false,orientation="tangent",rotateOffsetRad=0,fontHeight=1.0){const chars=splitChars(text);if(chars.length===0)return;const total=end-start;const step=chars.length>1?total/(chars.length-1):0;ctx.save();ctx.fillStyle=color;ctx.textBaseline="middle";ctx.font=`${fontSize}px ${fontFamily}`;for(let i=0;i<chars.length;i++){const angle=start+step*i;ctx.save();ctx.translate(cx+Math.cos(angle)*r,cy+Math.sin(angle)*r);const rot=orientation==="radial"?(angle+(invert?Math.PI:0)+rotateOffsetRad):(angle+(invert?-Math.PI/2:Math.PI/2)+rotateOffsetRad);ctx.rotate(rot);if(fontHeight!==1.0){ctx.scale(1,fontHeight);}ctx.fillText(chars[i],0,0);ctx.restore()}ctx.restore()}

function drawCenterText(ctx,text,cx,cy,fontSize,fontFamily,color){ctx.save();ctx.fillStyle=color;ctx.textAlign="center";ctx.textBaseline="middle";ctx.font=`${fontSize}px ${fontFamily}`;ctx.fillText(text,cx,cy);ctx.restore()}

// 修复renderSeal函数，确保正确接收ctx参数并设置透明背景
function renderSeal(ctx, d, opts){// 确保画布有透明背景
  ctx.save();
  ctx.clearRect(0,0,d,d); // 清除画布，设置透明背景
  
  // 添加印章整体旋转功能
  const cx=d/2,cy=d/2;const color="#e53935";
  // 应用印章整体旋转
  if (opts.rotation) {
    ctx.translate(cx, cy);
    ctx.rotate(opts.rotation * Math.PI / 180);
    ctx.translate(-cx, -cy);
  }
  drawCircle(ctx,cx,cy,d/2-opts.ringWidth/2,opts.ringWidth,color);
  const fontFamily=opts.fontFamily;const baseSize=opts.fontSize;
  const topText=opts.topText;const typeText=opts.type;const serialText=opts.serial;
  const toRad=a=>a*Math.PI/180;const topSpan=Math.PI*opts.topSpacing;
  const bottomSpan=Math.PI*0.72*opts.bottomSpacing;const topStart=toRad(opts.topStartDeg||240);
  const topEnd=topStart+topSpan;const topRadius=d/2-opts.ringWidth/2-opts.topOffset;
  const topRotate=toRad(opts.topRotateDeg||0);
  
  // 使用用户设置的topFontSize和topFontHeight
  drawArcText(ctx,topText,cx,cy,topRadius,topStart,topEnd,opts.topFontSize,fontFamily,color,false,"radial",topRotate,opts.topFontHeight||1.0);
  const starOuter=d*0.14;const starInner=d*0.052;
  drawStar(ctx,cx,cy,starOuter,starInner,color);
  const typeSize=baseSize*1.2;
  drawCenterText(ctx,typeText,cx,cy+d*0.22,typeSize,fontFamily,color);
  
  // 使用用户设置的bottomFontSize
  const serialSize=opts.bottomFontSize;
  const bottomStart=toRad(opts.bottomStartDeg||225);const bottomEnd=bottomStart-bottomSpan;
  const serialRadius=d/2-opts.ringWidth/2-opts.bottomOffset;
  drawArcText(ctx,serialText,cx,cy,serialRadius,bottomStart,bottomEnd,serialSize,fontFamily,color,true,"tangent",0);
  
  ctx.restore();
}
function renderSealToCanvas(cctx,d,opts){// 确保画布有透明背景
  cctx.save();
  cctx.clearRect(0,0,d,d); // 清除画布，设置透明背景
  
  // 添加印章整体旋转功能
  const cx=d/2,cy=d/2;const color="#e53935";
  // 应用印章整体旋转
  if (opts.rotation) {
    cctx.translate(cx, cy);
    cctx.rotate(opts.rotation * Math.PI / 180);
    cctx.translate(-cx, -cy);
  }
  drawCircle(cctx,cx,cy,d/2-opts.ringWidth/2,opts.ringWidth,color);
  const fontFamily=opts.fontFamily;const baseSize=opts.fontSize;
  const topText=opts.topText;const typeText=opts.type;const serialText=opts.serial;
  const toRad=a=>a*Math.PI/180;const topSpan=Math.PI*opts.topSpacing;
  const bottomSpan=Math.PI*0.72*opts.bottomSpacing;const topStart=toRad(opts.topStartDeg||240);
  const topEnd=topStart+topSpan;const topRadius=d/2-opts.ringWidth/2-opts.topOffset;
  const topRotate=toRad(opts.topRotateDeg||0);
  
  // 使用用户设置的topFontSize和topFontHeight
  drawArcText(cctx,topText,cx,cy,topRadius,topStart,topEnd,opts.topFontSize,fontFamily,color,false,"radial",topRotate,opts.topFontHeight||1.0);
  const starOuter=d*0.14;const starInner=d*0.052;
  drawStar(cctx,cx,cy,starOuter,starInner,color);
  const typeSize=baseSize*1.2;
  drawCenterText(cctx,typeText,cx,cy+d*0.22,typeSize,fontFamily,color);
  
  // 使用用户设置的bottomFontSize而不是baseSize*0.62
  const bottomStart=toRad(opts.bottomStartDeg||225);const bottomEnd=bottomStart-bottomSpan;
  const serialRadius=d/2-opts.ringWidth/2-opts.bottomOffset;
  drawArcText(cctx,serialText,cx,cy,serialRadius,bottomStart,bottomEnd,opts.bottomFontSize,fontFamily,color,true,"tangent",0);
  
  cctx.restore();
}
function generateSealImage(opts){const d=opts.diameter;const c=document.createElement("canvas");
  c.width=d;c.height=d;
  const cctx=c.getContext("2d");
  // 确保生成的印章图片有透明背景
  cctx.save();
  cctx.clearRect(0,0,d,d); // 清除画布，设置透明背景
  renderSealToCanvas(cctx,d,opts);
  cctx.restore();
  return c.toDataURL("image/png")}
function setBgSize(w,h){bgCanvas.width=w;bgCanvas.height=h;stage.style.width=w+"px";stage.style.height=h+"px"}
let bgImg=null;
function drawBackground(){if(!bgImg)return;const bw=bgCanvas.width;const bh=bgCanvas.height;bgCtx.clearRect(0,0,bw,bh);
  // 启用高质量图像平滑
  bgCtx.imageSmoothingEnabled = true;
  bgCtx.imageSmoothingQuality = 'high';
  
  // 直接100%显示图片，填满整个画布
  bgCtx.drawImage(bgImg,0,0,bw,bh);}

function boot(){
  const type=$("type");
  const topText=$("topText");
  const serial=$("serial");
  const diameter=$("diameter");
  const ringWidth=$("ringWidth");
  const fontSize=$("fontSize");
  const topStartDeg=$("topStartDeg");
  const bottomStartDeg=$("bottomStartDeg");
  const topOffset=$("topOffset");
  const bottomOffset=$("bottomOffset");
  const topSpacing=$("topSpacing");
  const bottomSpacing=$("bottomSpacing");
  const fontSelect=$("fontSelect");
  const fontCustom=$("fontCustom");
  const topRotateDeg=$("topRotateDeg");
  const blendToggle=$("blendToggle");
  const resetState=$("resetState");
  const bgImage=$("bgImage");
  const downloadBtn=$("download");
  // 添加上下弧字体大小控制
  const topFontSize=$("topFontSize");
  const bottomFontSize=$("bottomFontSize");
  // 添加印章旋转控制
  const sealRotation=$("sealRotation");
  // 添加操作空间开关控制
  const controlsToggle=$("controlsToggle");
  const controlsBox=$("controlsBox");
  let currentX=0,currentY=0;
  let blendOn=false;
  
  // 获取所有range-value元素
  const diameterValue=$("diameterValue");
  const ringWidthValue=$("ringWidthValue");
  const fontSizeValue=$("fontSizeValue");
  const sealRotationValue=$("sealRotationValue");
  const topStartDegValue=$("topStartDegValue");
  const topOffsetValue=$("topOffsetValue");
  const topSpacingValue=$("topSpacingValue");
  const topRotateDegValue=$("topRotateDegValue");
  const topFontSizeValue=$("topFontSizeValue");
  const bottomStartDegValue=$("bottomStartDegValue");
  const bottomOffsetValue=$("bottomOffsetValue");
  const bottomSpacingValue=$("bottomSpacingValue");
  const bottomFontSizeValue=$("bottomFontSizeValue");
  // 添加上弧字高控制
  const topFontHeight=$("topFontHeight");
  const topFontHeightValue=$("topFontHeightValue");
  function getFont(){const custom=fontCustom.value.trim();return custom||fontSelect.value||'Microsoft YaHei'}
  function positionOverlay(x,y){const maxX=stage.clientWidth-(overlay.clientWidth||0);const maxY=stage.clientHeight-(overlay.clientHeight||0);currentX=Math.max(0,Math.min(x,maxX));currentY=Math.max(0,Math.min(y,maxY));overlay.style.left=currentX+"px";overlay.style.top=currentY+"px"}
  
  // 添加拖拽功能的鼠标和触摸事件监听器
  let isDragging=false;
  let dragOffsetX=0;
  let dragOffsetY=0;
  
  // 双指缩放相关变量
  let isPinching=false;
  let lastPinchDistance=0;
  let initialPinchDiameter=0;
  let pinchCenterX=0;
  let pinchCenterY=0;
  
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
  overlay.addEventListener('mousedown',(e)=>{
    isDragging=true;
    const rect=overlay.getBoundingClientRect();
    const stageRect=stage.getBoundingClientRect();
    dragOffsetX=e.clientX-rect.left;
    dragOffsetY=e.clientY-rect.top;
    overlay.style.cursor='grabbing';
    e.preventDefault();
  });
  
  document.addEventListener('mousemove',(e)=>{
    if(!isDragging)return;
    const stageRect=stage.getBoundingClientRect();
    const x=e.clientX-stageRect.left-dragOffsetX;
    const y=e.clientY-stageRect.top-dragOffsetY;
    positionOverlay(x,y);
    updateCoords();
    saveConfig();
  });
  
  document.addEventListener('mouseup',()=>{
    if(isDragging){
      isDragging=false;
      overlay.style.cursor='grab';
    }
  });
  
  // 触摸事件
  overlay.addEventListener('touchstart',(e)=>{
    if(e.touches.length === 2) {
      // 双指触摸，开始缩放
      isPinching=true;
      lastPinchDistance=getDistance(e.touches[0], e.touches[1]);
      initialPinchDiameter=parseInt(diameter.value,10);
      
      // 计算初始中心点
      const center=getCenter(e.touches[0], e.touches[1]);
      const stageRect=stage.getBoundingClientRect();
      pinchCenterX=center.x-stageRect.left;
      pinchCenterY=center.y-stageRect.top;
      
      e.preventDefault();
    } else if(e.touches.length === 1) {
      // 单指触摸，开始拖拽
      isDragging=true;
      const touch=e.touches[0];
      const rect=overlay.getBoundingClientRect();
      const stageRect=stage.getBoundingClientRect();
      dragOffsetX=touch.clientX-rect.left;
      dragOffsetY=touch.clientY-rect.top;
      e.preventDefault();
    }
  });
  
  document.addEventListener('touchmove',(e)=>{
    if(e.touches.length === 2 && isPinching) {
      // 双指移动，进行缩放
      const currentDistance=getDistance(e.touches[0], e.touches[1]);
      const scale=currentDistance/lastPinchDistance;
      
      // 计算新的直径
      let newDiameter=initialPinchDiameter*scale;
      const minDiameter=parseInt(diameter.min,10)||100;
      const maxDiameter=parseInt(diameter.max,10)||800;
      newDiameter=Math.max(minDiameter, Math.min(maxDiameter, newDiameter));
      
      // 计算新的中心点
      const center=getCenter(e.touches[0], e.touches[1]);
      const stageRect=stage.getBoundingClientRect();
      const newCenterX=center.x-stageRect.left;
      const newCenterY=center.y-stageRect.top;
      
      // 保存当前直径，用于计算位置偏移
      const oldDiameter=parseInt(diameter.value,10);
      
      // 更新直径输入框
      diameter.value=Math.round(newDiameter);
      const evt=new Event('input',{bubbles:true});
      diameter.dispatchEvent(evt);
      
      // 调整印章位置，使其中心保持在双指中心点
      const oldHalfWidth=oldDiameter/2;
      const newHalfWidth=newDiameter/2;
      
      // 计算位置偏移：中心点变化 + 尺寸变化导致的偏移
      const deltaX=(newCenterX - pinchCenterX) + (oldHalfWidth - newHalfWidth);
      const deltaY=(newCenterY - pinchCenterY) + (oldHalfWidth - newHalfWidth);
      
      // 更新位置
      currentX += deltaX;
      currentY += deltaY;
      positionOverlay(currentX, currentY);
      updateCoords();
      saveConfig();
      
      // 更新中心点和距离
      pinchCenterX=newCenterX;
      pinchCenterY=newCenterY;
      lastPinchDistance=currentDistance;
      initialPinchDiameter=newDiameter;
      
      e.preventDefault();
    } else if(e.touches.length === 1 && isDragging) {
      // 单指移动，进行拖拽
      const touch=e.touches[0];
      const stageRect=stage.getBoundingClientRect();
      const x=touch.clientX-stageRect.left-dragOffsetX;
      const y=touch.clientY-stageRect.top-dragOffsetY;
      positionOverlay(x,y);
      updateCoords();
      saveConfig();
      e.preventDefault();
    }
  });
  
  document.addEventListener('touchend',(e)=>{
    if(e.touches.length < 2) {
      isPinching=false;
    }
    if(e.touches.length < 1) {
      isDragging=false;
    }
  });
  function updateCoords(){const fx=currentX.toFixed(2),fy=currentY.toFixed(2);$("coords").textContent=`X: ${fx}, Y: ${fy}`}
  function setBlend(active){overlay.style.mixBlendMode=active?"multiply":"normal";blendOn=active;blendToggle.classList.toggle("active",active)}
  function saveConfig(){
    try{
      const raw=localStorage.getItem('sealConfig');
      const cfg=raw?JSON.parse(raw):{};
      cfg.overlayX=currentX;
      cfg.overlayY=currentY;
      cfg.blendOn=blendOn;
      cfg.type=type.value;
      cfg.topText=topText.value;
      cfg.serial=serial.value;
      cfg.diameter=diameter.value;
      cfg.ringWidth=ringWidth.value;
      cfg.fontSize=fontSize.value;
      cfg.fontSelect=fontSelect.value;
      cfg.fontCustom=fontCustom.value;
      cfg.topStartDeg=topStartDeg.value;
      cfg.bottomStartDeg=bottomStartDeg.value;
      cfg.topOffset=topOffset.value;
      cfg.bottomOffset=bottomOffset.value;
      cfg.topSpacing=topSpacing.value;
      cfg.bottomSpacing=bottomSpacing.value;
      cfg.topRotateDeg=topRotateDeg.value;
      // 保存上下弧字体大小配置
      cfg.topFontSize=topFontSize.value;
      cfg.topFontHeight=topFontHeight.value;
      cfg.bottomFontSize=bottomFontSize.value;
      // 保存印章旋转配置
      cfg.sealRotation=sealRotation?.value || 0;
      localStorage.setItem('sealConfig',JSON.stringify(cfg))
    }catch(e){}
  }
  function loadConfig(){
    try{
      const raw=localStorage.getItem('sealConfig');
      if(!raw)return null;
      return JSON.parse(raw)
    }catch(e){
      return null
    }
  }
  function applyInputs(cfg){
    if(!cfg)return;
    if(cfg.type!==undefined)type.value=cfg.type;
    if(cfg.topText!==undefined)topText.value=cfg.topText;
    if(cfg.serial!==undefined)serial.value=cfg.serial;
    if(cfg.diameter!==undefined)diameter.value=cfg.diameter;
    if(cfg.ringWidth!==undefined)ringWidth.value=cfg.ringWidth;
    if(cfg.fontSize!==undefined)fontSize.value=cfg.fontSize;
    if(cfg.fontSelect!==undefined)fontSelect.value=cfg.fontSelect;
    if(cfg.fontCustom!==undefined)fontCustom.value=cfg.fontCustom;
    if(cfg.topStartDeg!==undefined)topStartDeg.value=cfg.topStartDeg;
    if(cfg.bottomStartDeg!==undefined)bottomStartDeg.value=cfg.bottomStartDeg;
    if(cfg.topOffset!==undefined)topOffset.value=cfg.topOffset;
    if(cfg.bottomOffset!==undefined)bottomOffset.value=cfg.bottomOffset;
    if(cfg.topSpacing!==undefined)topSpacing.value=cfg.topSpacing;
    if(cfg.bottomSpacing!==undefined)bottomSpacing.value=cfg.bottomSpacing;
    if(cfg.topRotateDeg!==undefined)topRotateDeg.value=cfg.topRotateDeg;
    if(cfg.topFontSize!==undefined)topFontSize.value=cfg.topFontSize;
    if(cfg.topFontHeight!==undefined)topFontHeight.value=cfg.topFontHeight;
    if(cfg.bottomFontSize!==undefined)bottomFontSize.value=cfg.bottomFontSize;
    // 每次打开页面都将印章旋转设置为0°
    if(sealRotation)sealRotation.value="0";
    if(cfg.overlayX!=null)currentX=parseFloat(cfg.overlayX);
    if(cfg.overlayY!=null)currentY=parseFloat(cfg.overlayY);
    if(cfg.blendOn!=null)setBlend(!!cfg.blendOn)
  }
  function buildOpts(){
    return{
      type:type.value,
      topText:topText.value.trim()||"示例上弧文字",
      serial:serial.value.trim()||"0000000000000",
      diameter:parseInt(diameter.value,10),
      ringWidth:parseInt(ringWidth.value,10),
      fontSize:parseInt(fontSize.value,10),
      // 添加上下弧字体大小
      topFontSize:parseInt(topFontSize.value,10),
      topFontHeight:parseFloat(topFontHeight.value),
      bottomFontSize:parseInt(bottomFontSize.value,10),
      fontFamily:getFont(),
      topStartDeg:parseFloat(topStartDeg.value),
      bottomStartDeg:parseFloat(bottomStartDeg.value),
      topOffset:parseFloat(topOffset.value),
      bottomOffset:parseFloat(bottomOffset.value),
      topSpacing:parseFloat(topSpacing.value),
      bottomSpacing:parseFloat(bottomSpacing.value),
      topRotateDeg:parseFloat(topRotateDeg.value),
      // 添加印章旋转角度
      rotation: parseFloat(sealRotation?.value || 0)
    }
  }
  function update(){
    const opts={
      type:type.value,
      topText:topText.value.trim()||"示例上弧文字",
      serial:serial.value.trim()||"0000000000000",
      diameter:parseInt(diameter.value,10),
      ringWidth:parseInt(ringWidth.value,10),
      fontSize:parseInt(fontSize.value,10),
      // 添加上下弧字体大小和上弧字高
      topFontSize:parseInt(topFontSize.value,10),
      topFontHeight:parseFloat(topFontHeight.value),
      bottomFontSize:parseInt(bottomFontSize.value,10),
      fontFamily:(fontCustom.value.trim()||fontSelect.value||'Microsoft YaHei'),
      topStartDeg:parseFloat(topStartDeg.value),
      bottomStartDeg:parseFloat(bottomStartDeg.value),
      topOffset:parseFloat(topOffset.value),
      bottomOffset:parseFloat(bottomOffset.value),
      topSpacing:parseFloat(topSpacing.value),
      bottomSpacing:parseFloat(bottomSpacing.value),
      topRotateDeg:parseFloat(topRotateDeg.value),
      // 添加印章旋转角度
      rotation: parseFloat(sealRotation?.value || 0)
    };
    
    // 更新所有range-value显示
    diameterValue.textContent = diameter.value;
    ringWidthValue.textContent = ringWidth.value;
    fontSizeValue.textContent = fontSize.value;
    sealRotationValue.textContent = sealRotation?.value || 0;
    topStartDegValue.textContent = topStartDeg.value;
    topOffsetValue.textContent = topOffset.value;
    topSpacingValue.textContent = parseFloat(topSpacing.value).toFixed(2);
    topRotateDegValue.textContent = topRotateDeg.value;
    topFontSizeValue.textContent = topFontSize.value;
    topFontHeightValue.textContent = parseFloat(topFontHeight.value).toFixed(1);
    bottomStartDegValue.textContent = bottomStartDeg.value;
    bottomOffsetValue.textContent = bottomOffset.value;
    bottomSpacingValue.textContent = parseFloat(bottomSpacing.value).toFixed(2);
    bottomFontSizeValue.textContent = bottomFontSize.value;
    
    // 直接在全局canvas上渲染印章，然后转换为data URL
    const d=opts.diameter;
    setCanvasSize(d);
    renderSeal(ctx, d, opts);
    const url=canvas.toDataURL("image/png");
    
    overlay.src=url;
    overlay.style.width=opts.diameter+"px";
    overlay.style.height=opts.diameter+"px";    
    // 确保overlay元素支持透明背景
    overlay.style.backgroundColor="transparent";
    overlay.style.background="transparent";

    if(!bgImg){
      setBgSize(stage.clientWidth,stage.clientWidth);
      updateCanvasSize();
    }
    if(!currentX&&!currentY){
      currentX=stage.clientWidth/2-overlay.clientWidth/2;
      currentY=stage.clientHeight/2-overlay.clientHeight/2
    }
    positionOverlay(currentX,currentY);
    updateCoords();
    updateCanvasSize();
    saveConfig()
  }
  type.addEventListener("change",update);
  topText.addEventListener("input",update);
  serial.addEventListener("input",update);
  diameter.addEventListener("input",update);
  ringWidth.addEventListener("input",update);
  fontSize.addEventListener("input",update);
  topStartDeg.addEventListener("input",update);
  bottomStartDeg.addEventListener("input",update);
  topOffset.addEventListener("input",update);
  bottomOffset.addEventListener("input",update);
  topSpacing.addEventListener("input",update);
  bottomSpacing.addEventListener("input",update);
  fontSelect.addEventListener("change",update);
  fontCustom.addEventListener("input",update);
  topRotateDeg.addEventListener("input",update);
  // 添加上下弧字体大小和上弧字高的事件监听器
  topFontSize.addEventListener("input",update);
  topFontHeight.addEventListener("input",update);
  bottomFontSize.addEventListener("input",update);
  // 添加印章旋转的事件监听器
  sealRotation?.addEventListener("input",update);
  blendToggle.addEventListener("click",()=>{
    setBlend(!blendOn);
    saveConfig();
  });
  resetState.addEventListener("click",()=>{
    // 重置所有输入控件到默认值
    type.value = "行政章";
    topText.value = "示例上弧文字";
    serial.value = "0000000000000";
    diameter.value = "400";
    ringWidth.value = "20";
    fontSize.value = "36";
    topStartDeg.value = "240";
    bottomStartDeg.value = "225";
    topOffset.value = "28";
    bottomOffset.value = "28";
    topSpacing.value = "1.2";
    bottomSpacing.value = "1.0";
    fontSelect.value = "";
    fontCustom.value = "";
    topRotateDeg.value = "0";
    topFontSize.value = "42";
    topFontHeight.value = "1.0";
    bottomFontSize.value = "26";
    // 重置印章旋转角度
    if (sealRotation) sealRotation.value = "0";
    
    // 重置位置和混合模式
    currentX = stage.clientWidth / 2 - parseInt(diameter.value, 10) / 2;
    currentY = stage.clientHeight / 2 - parseInt(diameter.value, 10) / 2;
    setBlend(false);
    
    // 应用重置后的配置
    update();
  });
  bgImage.addEventListener("change",()=>{
    const file=bgImage.files[0];
    if(!file)return;
    const ok=/\.(jpg|jpeg|png)$/i.test(file.name);
    if(!ok)return;
    if(file.size>5*1024*1024)return;
    const img=new Image();
    // 设置图片加载为高质量
    img.setAttribute('crossOrigin', 'anonymous'); // 确保跨域图片也能正常处理
    img.onload=()=>{
      bgImg=img;
      
      // 直接使用图片原始尺寸作为画布尺寸
      const targetWidth = img.width;
      const targetHeight = img.height;
      
      // 设置画布尺寸
      setBgSize(targetWidth, targetHeight);
      
      // 确保舞台元素的实际显示尺寸与画布尺寸一致
      // 移除可能的max-width限制，确保舞台能完整显示图片
      stage.style.maxWidth = 'none';
      stage.style.width = targetWidth + 'px';
      stage.style.height = targetHeight + 'px';
      
      // 启用高质量图像平滑
      bgCtx.imageSmoothingEnabled = true;
      bgCtx.imageSmoothingQuality = 'high';
      
      // 直接100%显示图片，填满整个画布
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      bgCtx.drawImage(img, 0, 0, bgCanvas.width, bgCanvas.height);
      
      update()
    };
    img.src=URL.createObjectURL(file)
  });
  downloadBtn.addEventListener("click",()=>{
    const exp=document.createElement("canvas");
    exp.width=bgCanvas.width;
    exp.height=bgCanvas.height;
    const ectx=exp.getContext("2d");
    
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
    
    // 如果启用了混合模式，在绘制印章时应用正片叠底效果
    if (blendOn) {
      ectx.globalCompositeOperation = "multiply";
    }
    
    // 直接使用当前显示的overlay图像绘制到最终画布上
    // 这样可以确保下载的印章与显示的印章完全一致
    ectx.drawImage(overlay, sealX, sealY, sealWidth, sealHeight);
    
    // 恢复默认合成模式
    ectx.globalCompositeOperation = "source-over";
    
    // 生成高质量的PNG图片，使用最高质量参数
    const a=document.createElement("a");
    a.href=exp.toDataURL("image/png", 1.0); // 使用最高质量参数
    a.download=`${topText.value.trim()||"示例"}-${type.value}-合成.png`;
    a.click()
  });
    window.addEventListener("resize",()=>{
      drawBackground();
      positionOverlay(currentX,currentY);
      updateCoords()});
    // 添加操作空间开关事件监听器
    controlsToggle.addEventListener('click',()=>{
      controlsBox.classList.toggle('open');
    });
    
    // 默认打开操作空间
    controlsBox.classList.add('open');
    
    const cfg=loadConfig();
    applyInputs(cfg);
    update()}

// 完全移除重复的init函数代码
// function init(){
//   // 所有init函数内容都被完全注释或移除
// }

// 添加缺失的updateCanvasSize函数
function updateCanvasSize(){
  const w=bgCanvas.width,h=bgCanvas.height;
  const canvasSizeEl=$("canvasSize");
  if(canvasSizeEl){
    canvasSizeEl.textContent=`画布尺寸: ${w} x ${h}`;
  }
}

// 确保boot函数中的变量在全局作用域中可用
let currentX=0,currentY=0;
let blendOn=false;

boot()