import { createServer } from 'node:http';
import worker from '../dist/server/index.js';
const port=Number(process.env.PORT??4173);
const server=createServer(async(req,res)=>{try{const origin=`http://127.0.0.1:${port}`;const init={method:req.method,headers:req.headers};if(!['GET','HEAD'].includes(req.method)){init.body=req;init.duplex='half';}const response=await worker.fetch(new Request(new URL(req.url,origin),init));res.writeHead(response.status,Object.fromEntries(response.headers));if(response.body)for await(const chunk of response.body)res.write(chunk);res.end();}catch{res.writeHead(500,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'INTERNAL_ERROR'}));}});
server.on('error',error=>{console.error(`Preview could not start: ${error.code}. Run npm run dev in your own terminal if this environment restricts local ports.`);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`PRISM local preview: http://127.0.0.1:${port}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
