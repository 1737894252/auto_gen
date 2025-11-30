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

function drawArcText(ctx,text,cx,cy,r,start,end,fontSize,fontFamily,color,invert=false,orientation="tangent",rotateOffsetRad=0){const chars=splitChars(text);if(chars.length===0)return;const total=end-start;const step=chars.length>1?total/(chars.length-1):0;ctx.save();ctx.fillStyle=color;ctx.textBaseline="middle";ctx.font=`${fontSize}px ${fontFamily}`;for(let i=0;i<chars.length;i++){const angle=start+step*i;ctx.save();ctx.translate(cx+Math.cos(angle)*r,cy+Math.sin(angle)*r);const rot=orientation==="radial"?(angle+(invert?Math.PI:0)+rotateOffsetRad):(angle+(invert?-Math.PI/2:Math.PI/2)+rotateOffsetRad);ctx.rotate(rot);ctx.fillText(chars[i],0,0);ctx.restore()}ctx.restore()}

function drawCenterText(ctx,text,cx,cy,fontSize,fontFamily,color){ctx.save();ctx.fillStyle=color;ctx.textAlign="center";ctx.textBaseline="middle";ctx.font=`${fontSize}px ${fontFamily}`;ctx.fillText(text,cx,cy);ctx.restore()}

// 修复renderSeal函数，确保正确接收ctx参数并设置透明背景
function renderSeal(ctx, d, opts){// 确保画布有透明背景
  ctx.save();
  ctx.clearRect(0,0,d,d); // 清除画布，设置透明背景
  
  const cx=d/2,cy=d/2;const color="#e53935";
  drawCircle(ctx,cx,cy,d/2-opts.ringWidth/2,opts.ringWidth,color);
  const fontFamily=opts.fontFamily;const baseSize=opts.fontSize;
  const topText=opts.topText;const typeText=opts.type;const serialText=opts.serial;
  const toRad=a=>a*Math.PI/180;const topSpan=Math.PI*opts.topSpacing;
  const bottomSpan=Math.PI*0.72*opts.bottomSpacing;const topStart=toRad(opts.topStartDeg||240);
  const topEnd=topStart+topSpan;const topRadius=d/2-opts.ringWidth/2-opts.topOffset;
  const topRotate=toRad(opts.topRotateDeg||0);
  
  // 使用用户设置的topFontSize而不是baseSize
  drawArcText(ctx,topText,cx,cy,topRadius,topStart,topEnd,opts.topFontSize,fontFamily,color,false,"radial",topRotate);
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
  
  const cx=d/2,cy=d/2;const color="#e53935";
  drawCircle(cctx,cx,cy,d/2-opts.ringWidth/2,opts.ringWidth,color);
  const fontFamily=opts.fontFamily;const baseSize=opts.fontSize;
  const topText=opts.topText;const typeText=opts.type;const serialText=opts.serial;
  const toRad=a=>a*Math.PI/180;const topSpan=Math.PI*opts.topSpacing;
  const bottomSpan=Math.PI*0.72*opts.bottomSpacing;const topStart=toRad(opts.topStartDeg||240);
  const topEnd=topStart+topSpan;const topRadius=d/2-opts.ringWidth/2-opts.topOffset;
  const topRotate=toRad(opts.topRotateDeg||0);
  
  // 使用用户设置的topFontSize而不是baseSize
  drawArcText(cctx,topText,cx,cy,topRadius,topStart,topEnd,opts.topFontSize,fontFamily,color,false,"radial",topRotate);
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
  
  const imgRatio=bgImg.width/bgImg.height;const canvasRatio=bw/bh;let drawWidth,drawHeight,offsetX=0,offsetY=0;
  if(imgRatio>canvasRatio){drawHeight=bh;drawWidth=drawHeight*imgRatio;offsetX=(bw-drawWidth)/2;}
  else{drawWidth=bw;drawHeight=drawWidth/imgRatio;offsetY=(bh-drawHeight)/2;}
  
  bgCtx.drawImage(bgImg,offsetX,offsetY,drawWidth,drawHeight)}

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
  let currentX=0,currentY=0;
  let blendOn=false;
  function getFont(){const custom=fontCustom.value.trim();return custom||fontSelect.value||'Microsoft YaHei'}
  function positionOverlay(x,y){const maxX=stage.clientWidth-(overlay.clientWidth||0);const maxY=stage.clientHeight-(overlay.clientHeight||0);currentX=Math.max(0,Math.min(x,maxX));currentY=Math.max(0,Math.min(y,maxY));overlay.style.left=currentX+"px";overlay.style.top=currentY+"px"}
  
  // 添加拖拽功能的鼠标事件监听器
  let isDragging=false;
  let dragOffsetX=0;
  let dragOffsetY=0;
  
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
      cfg.bottomFontSize=bottomFontSize.value;
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
    if(cfg.bottomFontSize!==undefined)bottomFontSize.value=cfg.bottomFontSize;
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
      bottomFontSize:parseInt(bottomFontSize.value,10),
      fontFamily:getFont(),
      topStartDeg:parseFloat(topStartDeg.value),
      bottomStartDeg:parseFloat(bottomStartDeg.value),
      topOffset:parseFloat(topOffset.value),
      bottomOffset:parseFloat(bottomOffset.value),
      topSpacing:parseFloat(topSpacing.value),
      bottomSpacing:parseFloat(bottomSpacing.value),
      topRotateDeg:parseFloat(topRotateDeg.value)
    }
  }
  function update(){    const opts={      type:type.value,      topText:topText.value.trim()||"示例上弧文字",      serial:serial.value.trim()||"0000000000000",      diameter:parseInt(diameter.value,10),      ringWidth:parseInt(ringWidth.value,10),      fontSize:parseInt(fontSize.value,10),      // 添加上下弧字体大小      topFontSize:parseInt(topFontSize.value,10),      bottomFontSize:parseInt(bottomFontSize.value,10),      fontFamily:(fontCustom.value.trim()||fontSelect.value||'Microsoft YaHei'),      topStartDeg:parseFloat(topStartDeg.value),      bottomStartDeg:parseFloat(bottomStartDeg.value),      topOffset:parseFloat(topOffset.value),      bottomOffset:parseFloat(bottomOffset.value),      topSpacing:parseFloat(topSpacing.value),      bottomSpacing:parseFloat(bottomSpacing.value),      topRotateDeg:parseFloat(topRotateDeg.value)    };
    
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
      // 获取canvas-wrap的最大可用宽度（考虑左右布局和响应式设计）
      const canvasWrap = stage.parentElement;
      const maxAvailableWidth = canvasWrap.clientWidth;
      
      // 如果图片宽度超过最大可用宽度，等比例缩小
      let targetWidth = img.width;
      let targetHeight = img.height;
      
      if (targetWidth > maxAvailableWidth) {
        const scale = maxAvailableWidth / targetWidth;
        targetWidth = maxAvailableWidth;
        targetHeight = Math.round(img.height * scale);
      }
      
      // 设置画布尺寸为调整后的尺寸
      setBgSize(targetWidth, targetHeight);
      
      // 启用高质量图像平滑
      bgCtx.imageSmoothingEnabled = true;
      bgCtx.imageSmoothingQuality = 'high';
      
      // 绘制图片（现在画布和调整后的图片尺寸相同，所以直接绘制）
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
    
    // 绘制背景图片（直接使用原始图片，避免通过bgCanvas导致的二次压缩）
    if(bgImg) {
      const bw=bgCanvas.width;
      const bh=bgCanvas.height;
      const imgRatio=bgImg.width/bgImg.height;
      const canvasRatio=bw/bh;
      let drawWidth,drawHeight,offsetX=0,offsetY=0;
      
      if(imgRatio>canvasRatio){
        drawHeight=bh;
        drawWidth=drawHeight*imgRatio;
        offsetX=(bw-drawWidth)/2;
      }else{
        drawWidth=bw;
        drawHeight=drawWidth/imgRatio;
        offsetY=(bh-drawHeight)/2;
      }
      
      // 直接绘制原始图片，确保最高质量
      ectx.drawImage(bgImg, offsetX, offsetY, drawWidth, drawHeight);
    }
    
    const ox=parseFloat(overlay.style.left)||0;
    const oy=parseFloat(overlay.style.top)||0;
    const ow=parseInt(overlay.style.width)||parseInt(diameter.value);
    const oh=parseInt(overlay.style.height)||parseInt(diameter.value);
    
    // 直接使用renderSealToCanvas函数绘制印章，避免通过overlay.src导致的二次压缩
    const sealOpts={
      type:type.value,
      topText:topText.value.trim()||"示例上弧文字",
      serial:serial.value.trim()||"0000000000000",
      diameter:ow,
      ringWidth:parseInt(ringWidth.value,10),
      fontSize:parseInt(fontSize.value,10),
      // 使用用户设置的上下弧字体大小
      topFontSize:parseInt(topFontSize.value,10),
      bottomFontSize:parseInt(bottomFontSize.value,10),
      fontFamily:getFont(),
      topStartDeg:parseFloat(topStartDeg.value),
      bottomStartDeg:parseFloat(bottomStartDeg.value),
      topOffset:parseFloat(topOffset.value),
      bottomOffset:parseFloat(bottomOffset.value),
      topSpacing:parseFloat(topSpacing.value),
      bottomSpacing:parseFloat(bottomSpacing.value),
      topRotateDeg:parseFloat(topRotateDeg.value)
    };
    
    // 保存当前画布状态
    ectx.save();
    // 移动到印章位置
    ectx.translate(ox, oy);
    // 绘制印章
    renderSealToCanvas(ectx, ow, sealOpts);
    // 恢复画布状态
    ectx.restore();
    
    // 生成高质量的PNG图片，使用无压缩参数
    const a=document.createElement("a");
    a.href=exp.toDataURL("image/png", 1.0); // 使用最高质量参数
    a.download=`${topText.value.trim()||"示例"}-${type.value}-合成.png`;
    a.click()
  });
    window.addEventListener("resize",()=>{
      drawBackground();
      positionOverlay(currentX,currentY);
      updateCoords()});
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