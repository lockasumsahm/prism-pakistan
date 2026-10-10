let library;
function leaflet(){if(window.L)return Promise.resolve(window.L);return library??=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';script.crossOrigin='anonymous';script.onload=()=>resolve(window.L);script.onerror=()=>{library=null;reject(new Error('Map library unavailable. Check your connection.'));};document.head.append(script);});}
const label=(el,text)=>{if(el)el.textContent=text;};
export class LiveAtlas {
 constructor({element,locations,client,onPoint,onLocation,view}){Object.assign(this,{element,locations,client,onPoint,onLocation,view});this.layers=[];this.frameIndex=0;this.disposed=false;}
 async start(){
  try{const L=await leaflet();if(this.disposed||!this.element.isConnected)return;this.L=L;
   this.map=L.map(this.element,{minZoom:4,maxZoom:12,zoomControl:true,preferCanvas:true}).setView(this.view?.center??[30.5,69.3],this.view?.zoom??5);
   L.tileLayer('https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors © CARTO',maxZoom:19}).addTo(this.map);
   this.map.createPane('flood');this.map.getPane('flood').style.zIndex=450;
   L.control.scale({imperial:false}).addTo(this.map);
   for(const loc of this.locations){L.circleMarker([loc.lat,loc.lon],{radius:5,color:'#fff',weight:2,fillColor:'#1266a3',fillOpacity:1}).addTo(this.map).bindTooltip(loc.name,{direction:'top'}).on('click',()=>this.onLocation(loc.slug));}
   this.map.on('click',e=>{if(e.latlng.lat<23.5||e.latlng.lat>37.5||e.latlng.lng<60.5||e.latlng.lng>78){this.status('Choose a coordinate inside the Pakistan monitoring rectangle.');return;}this.mark(e.latlng);this.onPoint(e.latlng.lat,e.latlng.lng);});
   this.restoreControls();this.bind();this.status('Loading NASA publication dates…');
   const results=await Promise.allSettled([this.client.get('imagery'),this.client.get('radar')]);if(this.disposed)return;
   this.imagery=results[0].status==='fulfilled'?results[0].value:null;this.radar=results[1].status==='fulfilled'?results[1].value:null;
   const dates=this.imagery?.ok?this.imagery.data.layers:[];const flood=dates.find(l=>l.key==='flood');
   const date=this.root().querySelector('[data-satellite-date]');if(flood){date.max=flood.latest_date;date.value=this.view?.controls?.date||flood.latest_date;date.min='2021-03-23';}
   if(this.radar?.ok){const slider=this.root().querySelector('[data-radar-frame]');slider.max=this.radar.data.frames.length-1;slider.value=slider.max;this.frameIndex=Number(slider.max);}
   await this.update();
  }catch(e){if(!this.disposed){this.element.innerHTML='';const p=document.createElement('p');p.className='empty-state';p.textContent=e.message;this.element.append(p);this.status('Interactive map unavailable. Telemetry remains accessible.');}}
 }
 root(){return this.element.closest('.live-map-shell');}
 status(text){label(this.root()?.querySelector('[data-layer-status]'),text);}
 mark(latlng){if(!this.map)return;if(this.marker)this.map.removeLayer(this.marker);this.marker=this.L.circleMarker(latlng,{radius:9,color:'#102e44',fillColor:'#fff',fillOpacity:1,weight:3}).addTo(this.map);}
 bind(){const root=this.root();root.querySelectorAll('[data-map-toggle]').forEach(input=>input.addEventListener('change',()=>this.update()));root.querySelector('[data-satellite-date]').addEventListener('change',()=>this.update());root.querySelector('[data-map-opacity]').addEventListener('input',e=>this.layers.forEach(l=>l.setOpacity(Number(e.target.value))));root.querySelector('[data-radar-frame]').addEventListener('input',e=>{this.frameIndex=Number(e.target.value);this.updateRadar();});root.querySelector('[data-play-radar]').addEventListener('click',e=>{if(this.timer){clearInterval(this.timer);this.timer=null;e.target.textContent='▶ Play';}else{e.target.textContent='Ⅱ Pause';this.timer=setInterval(()=>{if(!this.radar?.ok)return;this.frameIndex=(this.frameIndex+1)%this.radar.data.frames.length;root.querySelector('[data-radar-frame]').value=this.frameIndex;this.updateRadar();},1200);}});root.querySelector('[data-map-reset]').addEventListener('click',()=>this.map.setView([30.5,69.3],5));}
 async update(){
  if(this.disposed||!this.map)return;const root=this.root();this.layers.forEach(l=>this.map.removeLayer(l));this.layers=[];this.radarLayer=null;
  const enabled=k=>root.querySelector(`[data-map-toggle="${k}"]`).checked;const opacity=Number(root.querySelector('[data-map-opacity]').value);const date=root.querySelector('[data-satellite-date]').value;const messages=[];
  for(const key of ['truecolor','flood']){if(!enabled(key))continue;const meta=this.imagery?.ok?this.imagery.data.layers.find(l=>l.key===key):null;if(!meta){messages.push(`NASA ${key} unavailable: ${this.imagery?.error?.code??'request failed'}`);continue;}const requested=key==='flood'?date:meta.latest_date;if(!requested)continue;
   const layer=this.L.tileLayer(`/api/tiles/${key}/${requested}/{z}/{x}/{y}.${key==='truecolor'?'jpg':'png'}`,{maxNativeZoom:meta.max_zoom,maxZoom:12,opacity,pane:key==='flood'?'flood':'tilePane',attribution:'NASA GIBS / LANCE',updateWhenIdle:true,keepBuffer:1});
   layer.on('tileerror',()=>this.status(`NASA ${key} tile unavailable for ${requested}; missing imagery does not mean no flood.`));layer.addTo(this.map);this.layers.push(layer);messages.push(`NASA ${key} · ${requested} UTC`);
  }
  if(enabled('radar')){if(this.radar?.ok){this.radarLayer=this.L.tileLayer('',{maxNativeZoom:7,maxZoom:12,opacity,pane:'flood',attribution:'RainViewer',updateWhenIdle:true,keepBuffer:1});this.radarLayer.on('tileerror',()=>this.status('Radar tile unavailable. Local coverage is not guaranteed.'));this.radarLayer.addTo(this.map);this.layers.push(this.radarLayer);this.updateRadar();messages.push('Past radar · coverage varies');}else messages.push(`Radar offline: ${this.radar?.error?.code??'request failed'}`);}
  this.status(messages.join(' · ')||'Basemap · click anywhere in Pakistan to inspect model telemetry');
 }
 updateRadar(){if(!this.radar?.ok)return;const frame=this.radar.data.frames[this.frameIndex];if(!frame)return;this.radarLayer?.setUrl(`/api/tiles/radar/${frame.time}/{z}/{x}/{y}.png`);label(this.root().querySelector('[data-radar-time]'),new Date(frame.time*1000).toLocaleString('en-PK',{timeZone:'Asia/Karachi'})+' PKT');}
 restoreControls(){const c=this.view?.controls;if(!c)return;for(const key of ['flood','truecolor','radar'])this.root().querySelector(`[data-map-toggle="${key}"]`).checked=c[key];this.root().querySelector('[data-map-opacity]').value=c.opacity;}
 getView(){const root=this.root();return this.map?{center:this.map.getCenter(),zoom:this.map.getZoom(),controls:{flood:root.querySelector('[data-map-toggle="flood"]').checked,truecolor:root.querySelector('[data-map-toggle="truecolor"]').checked,radar:root.querySelector('[data-map-toggle="radar"]').checked,date:root.querySelector('[data-satellite-date]').value,opacity:root.querySelector('[data-map-opacity]').value}}:this.view;}
 destroy(){this.disposed=true;clearInterval(this.timer);this.map?.remove();}
}
