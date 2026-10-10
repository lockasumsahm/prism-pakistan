import { BaseConnector, FeedError, numeric } from './base.ts';
import type { SourceSpec } from '../envelope.ts';
import { radar } from './feeds.ts';
export const nasaLayers = {
 flood: { id:'MODIS_Combined_Flood_3-Day', title:'NASA MODIS · 3-day flood composite', format:'png', matrix:'GoogleMapsCompatible_Level9', maxZoom:9 },
 truecolor: { id:'VIIRS_SNPP_CorrectedReflectance_TrueColor', title:'NASA VIIRS · true colour', format:'jpg', matrix:'GoogleMapsCompatible_Level9', maxZoom:9 },
};
const nasaSpec:SourceSpec={id:'nasa-gibs',name:'NASA GIBS Flood Imagery',url:'https://nasa-gibs.github.io/gibs-api-docs/access-basics/',endpoint:'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/wmts.cgi',tier:2,family:'modis-viirs',methodology:'NASA LANCE MODIS 3-day flood classification and VIIRS imagery. Metadata describes global publication periods, not clear-sky coverage at a coordinate. Clouds and insufficient data do not mean no flooding.',temporal_kind:'observation',stale_after_minutes:1440,license:'NASA Earthdata open imagery; acknowledge NASA GIBS/LANCE'};
export function domainLatest(xml:string):string {
 if(/<!DOCTYPE|<!ENTITY/i.test(xml))throw new FeedError('INVALID_PAYLOAD','XML entities are not permitted');
 const domain=xml.match(/<(?:\w+:)?Domain\b[^>]*>([^<]+)<\/(?:\w+:)?Domain>/)?.[1];
 if(!domain)throw new FeedError('NO_COVERAGE','NASA returned no published imagery domain');
 const dates=[...domain.matchAll(/\d{4}-\d{2}-\d{2}/g)].map(m=>m[0]).filter(d=>Number.isFinite(Date.parse(d))&&d<=new Date().toISOString().slice(0,10));
 if(!dates.length)throw new FeedError('NO_COVERAGE','No valid published imagery dates');return dates.sort().at(-1)!;
}
export class NasaImageryConnector extends BaseConnector<{layers:{key:string;title:string;latest_date:string;max_zoom:number}[];legend:{label:string;color:string}[];limitations:string}> {
 constructor(){super(nasaSpec);}
 protected async load(){
  const layers=await Promise.all(Object.entries(nasaLayers).map(async([key,l])=>{
   const end=new Date().toISOString().slice(0,10),start=new Date(Date.now()-14*86400000).toISOString().slice(0,10);
   const url=`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/wmts.cgi?SERVICE=WMTS&REQUEST=DescribeDomains&VERSION=1.0.0&LAYER=${l.id}&TILEMATRIXSET=${l.matrix}&TIME=${start}/${end}`;
   const xml=await(await this.request(url,{headers:{Accept:'application/xml'}})).text();return {key,title:l.title,latest_date:domainLatest(xml),max_zoom:l.maxZoom};
  }));return {updated_at:null,data:{layers,legend:[{label:'Surface water',color:'#32d2f5'},{label:'Recurring flood',color:'#ffff00'},{label:'Detected flood',color:'#fa1e24'},{label:'Insufficient data',color:'#afafaf'}],limitations:'Dates are published global imagery domains, not local acquisition time. Three-day composites may lag and contain cloud/shadow artifacts. Imagery cannot confirm safety, water depth, flood boundaries or population impacts.'}};
 }
}
export const nasaImagery=new NasaImageryConnector();
export class ImageryTileConnector extends BaseConnector<{bytes:Uint8Array;content_type:string}> {
 constructor(){super({...nasaSpec,id:'imagery-tiles',name:'Validated imagery tile proxy'},{ttl:300000,timeout:8000,retries:1,threshold:5,cooldown:60000});}
 protected async load(a:Record<string,unknown>){
  const z=numeric(a.z,'zoom'),x=numeric(a.x,'column'),y=numeric(a.y,'row');
  if(![z,x,y].every(Number.isInteger)||z<0||z>9||x<0||y<0||x>=2**z||y>=2**z)throw new FeedError('INVALID_TILE','Tile coordinate outside supported range');
  let url:string;
  if(a.layer==='radar'){
   const envelope=await radar.execute();if(!envelope.ok)throw new FeedError(envelope.error.code,envelope.error.message);
   const frame=envelope.data.frames.find(f=>String(f.time)===a.date);if(!frame||!/^\/v2\/radar\/[\d/]+$/.test(frame.path))throw new FeedError('INVALID_FRAME','Radar frame is not in the current upstream catalog');
   if(new URL(envelope.data.host).origin!=='https://tilecache.rainviewer.com')throw new FeedError('INVALID_HOST','Unexpected radar tile host');
   url=`https://tilecache.rainviewer.com${frame.path}/256/${z}/${x}/${y}/2/1_1.png`;
  }else{
   const layer=nasaLayers[a.layer as keyof typeof nasaLayers];if(!layer)throw new FeedError('INVALID_LAYER','Unknown satellite layer');
   if(typeof a.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(a.date)||!Number.isFinite(Date.parse(a.date))||a.date>new Date().toISOString().slice(0,10)||a.date<'2021-03-23')throw new FeedError('INVALID_DATE','Invalid satellite imagery date');
   url=`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer.id}/default/${a.date}/${layer.matrix}/${z}/${y}/${x}.${layer.format}`;
  }
  const r=await this.request(url,{headers:{Accept:'image/png,image/jpeg'}});const bytes=new Uint8Array(await r.arrayBuffer());
  const png=bytes.length>8&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v),jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  if(!png&&!jpeg)throw new FeedError('INVALID_TILE','Imagery server did not return a valid image');
  return {updated_at:null,data:{bytes,content_type:png?'image/png':'image/jpeg'}};
 }
}
export const imageryTiles=new ImageryTileConnector();

// Decode the displayed NASA PNG, not a scientific raster or inundation model.
export async function pngPixel(bytes:Uint8Array,px:number,py:number):Promise<number[]> {
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let width=0,height=0,kind=0,parts:Uint8Array[]=[],palette:Uint8Array|undefined,alpha:Uint8Array|undefined;
 for(let offset=8;offset+12<=bytes.length;){const size=view.getUint32(offset),end=offset+12+size;if(end>bytes.length)throw new FeedError('INVALID_TILE','Truncated PNG chunk');const type=new TextDecoder().decode(bytes.subarray(offset+4,offset+8)),data=bytes.subarray(offset+8,offset+8+size);
  if(type==='IHDR'){if(size!==13)throw new FeedError('INVALID_TILE','Invalid PNG header');width=view.getUint32(offset+8);height=view.getUint32(offset+12);kind=data[9];if(data[8]!==8||data[12]!==0||![2,3,6].includes(kind)||width<1||height<1||width>512||height>512)throw new FeedError('UNSUPPORTED_TILE','Only bounded non-interlaced eight-bit PNG imagery is supported');}
  if(type==='IDAT')parts.push(data);if(type==='PLTE')palette=data;if(type==='tRNS')alpha=data;offset=end;if(type==='IEND')break;
 }
 if(!width||!parts.length||px<0||py<0||px>=width||py>=height)throw new FeedError('INVALID_TILE','PNG pixel is outside the image');
 const channels=kind===6?4:kind===2?3:1,stride=width*channels,expected=(stride+1)*height;
 const reader=new Blob(parts).stream().pipeThrough(new DecompressionStream('deflate')).getReader(),inflated:Uint8Array[]= [];let length=0;
 while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>expected){await reader.cancel();throw new FeedError('INVALID_TILE','Inflated image exceeds declared size');}inflated.push(value);}
 if(length!==expected)throw new FeedError('INVALID_TILE','PNG scanline size mismatch');const raw=new Uint8Array(length);let offset=0;for(const p of inflated){raw.set(p,offset);offset+=p.length;}
 let previous=new Uint8Array(stride);
 for(let row=0;row<=py;row++){const filter=raw[row*(stride+1)],current=raw.slice(row*(stride+1)+1,(row+1)*(stride+1));if(filter>4)throw new FeedError('INVALID_TILE','Invalid PNG filter');
  for(let i=0;i<stride;i++){const left=i>=channels?current[i-channels]:0,up=previous[i],upperLeft=i>=channels?previous[i-channels]:0;let predictor=0;
   if(filter===1)predictor=left;if(filter===2)predictor=up;if(filter===3)predictor=Math.floor((left+up)/2);if(filter===4){const p=left+up-upperLeft,a=Math.abs(p-left),b=Math.abs(p-up),c=Math.abs(p-upperLeft);predictor=a<=b&&a<=c?left:b<=c?up:upperLeft;}
   current[i]=(current[i]+predictor)&255;
  }
  previous=current;
 }
 const i=px*channels;if(kind===3){const index=previous[i];if(!palette||index*3+2>=palette.length)throw new FeedError('INVALID_TILE','Missing PNG palette');return [palette[index*3],palette[index*3+1],palette[index*3+2],alpha?.[index]??255];}
 return [previous[i],previous[i+1],previous[i+2],kind===6?previous[i+3]:255];
}
export function floodPixelClass(rgba:number[]):string {
 if(rgba[3]===0)return 'NO_VISIBLE_CLASSIFICATION';const rgb=rgba.slice(0,3).join(',');return ({'50,210,245':'SURFACE_WATER','255,255,0':'RECURRING_FLOOD','250,30,36':'DETECTED_FLOOD','175,175,175':'INSUFFICIENT_DATA'} as Record<string,string>)[rgb]??'UNRECOGNISED_CLASSIFICATION';
}
export class SatellitePointConnector extends BaseConnector<{lat:number;lon:number;date:string;classification:string;rgba:number[];method:string;limitations:string}> {
 constructor(){super({...nasaSpec,id:'nasa-flood-pixel',name:'NASA MODIS displayed flood pixel',methodology:'Nearest displayed pixel in the NASA GIBS three-day MODIS flood visualization at zoom 9, decoded against the NASA colour map. Visualization sampling is not scientific raster analysis or a hazard prediction.'});}
 protected async load(a:Record<string,unknown>){
  const lat=numeric(a.lat,'latitude'),lon=numeric(a.lon,'longitude');if(lat<23.5||lat>37.5||lon<60.5||lon>78)throw new FeedError('INVALID_COORDINATES','Outside the monitoring rectangle');
  const metadata=await nasaImagery.execute();if(!metadata.ok)throw new FeedError(metadata.error.code,metadata.error.message);const date=metadata.data.layers.find(l=>l.key==='flood')!.latest_date;
  const worldX=(lon+180)/360*512*256,worldY=(1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*512*256;
  const tile=await imageryTiles.execute({layer:'flood',date,z:9,x:Math.floor(worldX/256),y:Math.floor(worldY/256)});if(!tile.ok)throw new FeedError(tile.error.code,tile.error.message);
  const rgba=await pngPixel(tile.data.bytes,Math.floor(worldX)%256,Math.floor(worldY)%256);return {updated_at:null,data:{lat,lon,date,rgba,classification:floodPixelClass(rgba),method:'Nearest displayed visualization pixel; NASA colour-map lookup',limitations:'Three-day composite, subject to clouds, shadows and processing artifacts. Transparent pixels conflate no-water and no-data classes. Not a verified flood boundary, water depth, district risk score or safe-road assessment.'}};
 }
}
export const satellitePoint=new SatellitePointConnector();
