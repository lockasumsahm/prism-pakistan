import { BaseConnector, FeedError } from './base.ts';
import type { SourceSpec } from '../envelope.ts';
const ndmaSpec:SourceSpec={id:'ndma',name:'NDMA · Official advisory index',url:'https://ndma.gov.pk/advisories/search',endpoint:'https://ndma.gov.pk/advisories/search',tier:4,family:'ndma',temporal_kind:'report',stale_after_minutes:60,license:'Official government publication; source documents retain their rights.',methodology:'Published titles, date-only labels and document links from the first page of the official NDMA advisory index. Does not interpret PDF contents, validity periods, district applicability or absence of hazards.'};
export function parseNDMAIndex(html:string){
 const cards=[...html.matchAll(/<a\b([^>]*\bclass="adv-card[^"<>]*"[^>]*)>([\s\S]*?)<\/a>/g)];
 if(!cards.length||cards.length>50)throw new FeedError('INVALID_PAYLOAD','NDMA advisory index structure changed or returned no verifiable advisory cards');
 const clean=(s:string)=>s.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#0*39;|&apos;/g,"'").replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
 const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 const advisories=cards.map(([,attrs,body])=>{
  const href=attrs.match(/\bhref="([^"<>]+)"/)?.[1],titleHTML=body.match(/<p\b[^>]*class="adv-card__title"[^>]*>([\s\S]*?)<\/p>/)?.[1],dateHTML=body.match(/<p\b[^>]*class="adv-card__date"[^>]*>([\s\S]*?)<\/p>/)?.[1];
  if(!href||!titleHTML||!dateHTML)throw new FeedError('INVALID_PAYLOAD','NDMA advisory is missing its link, title or published date');
  const title=clean(titleHTML.replace(/<span\b[^>]*>[\s\S]*?<\/span>/g,'')),published=clean(dateHTML),match=published.match(/^(\d{2}) ([A-Z][a-z]{2}) (\d{4})$/);
  let url:URL;try{url=new URL(clean(href));}catch{throw new FeedError('INVALID_PAYLOAD','NDMA document URL is invalid');}
  if(url.protocol!=='https:'||!['ndma.gov.pk','www.ndma.gov.pk'].includes(url.hostname)||url.username||url.password||url.port||url.search||url.hash||!/^\/{1,2}(?:public\/)?storage\/advisories\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\.pdf$/.test(url.pathname))throw new FeedError('INVALID_PAYLOAD','NDMA document URL is outside the verified official advisory directory');
  if(!match||!months.includes(match[2])||!title||title.length>300)throw new FeedError('INVALID_PAYLOAD','NDMA advisory title or date is invalid');
  const date=match[3]+'-'+String(months.indexOf(match[2])+1).padStart(2,'0')+'-'+match[1];
  if(!Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date||date>new Date(Date.now()+5*3600000).toISOString().slice(0,10))throw new FeedError('INVALID_PAYLOAD','NDMA advisory published date is invalid or future dated');
  return {title,published_date:date,url:url.href};
 });
 const unique=[...new Map(advisories.map(a=>[a.url,a])).values()].sort((a,b)=>b.published_date.localeCompare(a.published_date));
 return {advisories:unique,latest_published_date:unique[0].published_date,scope:'First page of the official national advisory index; not a complete historical or district-filtered warning feed.',note:'Publication dates have no supplied time of day. Open the official PDF to verify affected areas, instructions and validity. Older documents may have expired. Index availability and an absent district name never establish safety.'};
}
export class NDMAConnector extends BaseConnector<ReturnType<typeof parseNDMAIndex>>{
 constructor(transport:typeof fetch=fetch){super(ndmaSpec,{ttl:900000,timeout:10000,retries:0,threshold:5,cooldown:60000},transport);}
 protected async load(){const response=await this.request(ndmaSpec.endpoint!,{headers:{Accept:'text/html'}});if(!/text\/html/i.test(response.headers.get('content-type')??''))throw new FeedError('INVALID_PAYLOAD','NDMA returned an unexpected content type');return {data:parseNDMAIndex(await response.text()),updated_at:null};}
}
export const ndma=new NDMAConnector();
