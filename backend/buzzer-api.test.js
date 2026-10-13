// Run against a running development API: node --test buzzer-api.test.js
import {test} from 'node:test'
import assert from 'node:assert/strict'
const base=process.env.TEST_API_URL||'http://127.0.0.1:4000/buzzer'
async function api(path,body,token,status=200){
 const r=await fetch(base+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});const d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return d
}
test('live rooms: 3 teams, 12 players, private invitations, assignment, races and reconnect',async()=>{
 let host=await api('/rooms',{game:'lyrics',teams:['Red','Blue','Gold'],limit:4,seconds:5},null,201)
 const root=`/rooms/${host.code}`,token=host.token,players=[]
 for(let team=0;team<3;team++)for(let i=0;i<4;i++){
  const p=await api(root+'/join',{name:`T${team} Player${i}`,invite:host.teams[team].invite});players.push(p)
  assert.equal(p.team,team);assert.equal('answer' in p,false);assert.ok(p.teams.every(t=>!t.invite));assert.ok(p.players.every(p=>!p.token))
 }
 await api(root+'/join',{name:'Extra',invite:host.teams[0].invite},null,409)
 await api(root,null,null,403)
 const act=async(action,extra={})=>{host=await api(root,null,token);host=await api(root+'/action',{action,version:host.version,...extra},token);return host}
 await api(root+'/action',{action:'start',version:players.at(-1).version},players[0].token,403)
 await act('start');await api(root+'/join',{name:'Late'},null,409)
 const word=host.content.flat().find(w=>w.id!==undefined).id
 await act('select',{id:word});await act('open')
 const results=await Promise.all([players[0],players[4]].map(p=>fetch(base+root+'/action',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${p.token}`},body:JSON.stringify({action:'buzz',version:host.version})})))
 assert.deepEqual(results.map(r=>r.status).sort(),[200,409])
 host=await api(root,null,token);const winner=host.winner.team
 const publicView=await api(root,null,players[8].token);assert.equal('answer' in publicView,false);assert.equal(publicView.content.flat().find(w=>w.id===word).text,null)
 await act('mark',{correct:false});await act('open')
 await api(root+'/action',{action:'buzz',version:host.version},players[winner*4].token,409)
 const other=(winner+1)%3;host=await api(root+'/action',{action:'buzz',version:host.version},players[other*4].token)
 await act('mark',{correct:true});assert.equal(host.teams[other].score,10)
 const reconnect=await api(root,null,players[other*4].token);assert.equal(reconnect.team,other);assert.equal(reconnect.teams[other].score,10);assert.ok(reconnect.content.flat().find(w=>w.id===word).text)
 await act('undo');assert.equal(host.teams[other].score,0)
 await act('next');assert.equal(host.round,2)
})
test('all catalogs and manual lobby assignment are supported',async()=>{
 for(const game of ['buzzer','dialogue','clues','song']){
  let h=await api('/rooms',{game,teams:['A','B'],limit:1,seconds:10},null,201);const token=h.token,root=`/rooms/${h.code}`
  const p=await api(root+'/join',{name:'Unassigned'});assert.equal(p.team,null)
  h=await api(root,null,token);h=await api(root+'/action',{action:'assign',player:p.me,team:0,version:h.version},token)
  assert.equal((await api(root,null,p.token)).team,0)
  h=await api(root+'/action',{action:'remove',player:p.me,version:h.version},token)
  await api(root,null,p.token,403)
  assert.ok(h.content);if(game==='song'){const q=await api(root+'/join',{name:'Listener',invite:h.teams[0].invite});assert.equal(q.content,null)}
 }
})
