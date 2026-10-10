export const pageMetadata: Record<string, {title:string;description:string}> = {
 '/':{title:'Pakistan Climate Intelligence',description:'Traceable climate forecasts and environmental monitoring for Pakistan. Source provenance, reference-location coverage and explicit missing data.'},
 '/forecast':{title:'Detailed District Forecast',description:'Inspect seven-day hourly rainfall, temperature, humidity, wind and gust forecasts with provenance, missing-data coverage and downloadable reports.'},
 '/map':{title:'Live Atlas',description:'Explore NASA flood composites, satellite imagery, past radar and point model evidence across the Pakistan monitoring rectangle. Missing pixels do not establish safety.'},
 '/dashboard':{title:'Forecast Analytics',description:'Compare rainfall, temperature and modelled river discharge across registered Pakistan reference locations.'},
 '/officer':{title:'Evidence Officer',description:'Request seven-section evidence briefings with units, timestamps, source ledgers and missing-input notices.'},
 '/briefings':{title:'Daily Evidence Briefings',description:'National, regional, family and agricultural briefings grounded in traceable connector evidence.'},
 '/watch':{title:'My Climate Watch',description:'Save Pakistan reference locations in a private browser watchlist.'},
 '/widget':{title:'Mobile Climate Widget',description:'Read your last retrieved climate briefing offline with explicit historical cache labels.'},
 '/sources':{title:'Data Sources & Provenance',description:'Inspect upstream providers, evidence tiers, licences, timestamps, latency and exact failure diagnostics.'},
 '/ops':{title:'Operations & Source Health',description:'Inspect live connector availability, request latency, circuit breakers and recovery state.'},
 '/methodology':{title:'Scientific Methodology',description:'Understand modelled data, independent evidence, geographic coverage and PRISM scientific limitations.'},
 '/api':{title:'Public API Documentation',description:'Read PRISM JSON API and MCP contracts, provenance semantics and example requests.'},
 '/privacy':{title:'Privacy Policy',description:'How PRISM handles browser-local preferences, cached evidence and third-party requests.'},
 '/terms':{title:'Terms of Use',description:'PRISM data licences, public information terms and independent platform limitations.'},
 '/changelog':{title:'Release Notes',description:'Changes to PRISM interfaces, telemetry, verification and scientific integrity.'},
 '/contact':{title:'Contact & Official Resources',description:'Official Pakistan disaster and weather resources and PRISM contact availability.'},
 '/alerts':{title:'Alert Delivery Status',description:'Current availability of official warnings and automated notification delivery.'},
 '/auth':{title:'Account Availability',description:'Current PRISM account and identity-provider availability.'},
 '/reset-password':{title:'Account Recovery Status',description:'Current availability of PRISM cloud account recovery.'},
 '/settings.connectors':{title:'Connector Configuration',description:'Server-side credential requirements and source integration status.'},
 '/settings.developer':{title:'Developer Tools',description:'Public evidence API and MCP developer integration status.'}
};
function htmlEscape(value:string){return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));}
export function renderPage(shell:string,path:string,origin:string){
 const entry=pageMetadata[path]??{title:path.split('/').filter(Boolean).map(s=>s.replaceAll('-',' ')).join(' · '),description:'Reference-location evidence and source diagnostics. Risk remains unassessed without calibrated inputs.'};
 const title=htmlEscape(entry.title+' · PRISM'),description=htmlEscape(entry.description),canonical=htmlEscape(origin+path);
 return shell.replace(/<title>.*?<\/title>/,'<title>'+title+'</title>').replace(/<meta name="description"[^>]*>/,'<meta name="description" content="'+description+'">').replace('</head>','<link rel="canonical" href="'+canonical+'"><meta property="og:type" content="website"><meta property="og:title" content="'+title+'"><meta property="og:description" content="'+description+'"><meta property="og:url" content="'+canonical+'"><meta name="twitter:card" content="summary"></head>');
}
