import {test} from 'node:test'
import assert from 'node:assert/strict'
import {action,expireAnswer} from './buzzer.js'
const make=()=>({game:'lyrics',phase:'closed',active:0,content:[[{id:0,text:'answer'},{id:1,text:'second'}]],version:0,seconds:10,teams:[{score:0},{score:0},{score:0}],players:[],blocked:[],settled:{},winner:null})
const host=(r,a,extra={})=>action(r,true,null,{action:a,version:r.version,...extra},1000)
const buzz=(r,team,version=r.version)=>action(r,false,{team,name:`Player ${team}`},{action:'buzz',version},1000)
test('first of concurrent buzzes wins; teammate and late team cannot replace winner',()=>{
 const r=make();host(r,'open');const v=r.version;buzz(r,1,v);assert.equal(r.winner.team,1)
 assert.throws(()=>buzz(r,2,v));assert.throws(()=>buzz(r,1));assert.equal(r.winner.team,1)
})
test('wrong team locked out, another wins, undo restores score and word',()=>{
 const r=make();host(r,'open');buzz(r,0);host(r,'mark',{correct:false});host(r,'open');assert.throws(()=>buzz(r,0));buzz(r,2);host(r,'mark',{correct:true});assert.equal(r.teams[2].score,10);assert.equal(r.settled[0],true)
 host(r,'undo');assert.equal(r.teams[2].score,0);assert.equal(r.settled[0],undefined);assert.deepEqual(r.blocked,[0]);host(r,'reveal');host(r,'select',{id:1});assert.deepEqual(r.blocked,[])
})
test('server timeout locks out winning team and rejects late marking',()=>{
 const r=make();host(r,'open');buzz(r,0);expireAnswer(r,11000);assert.equal(r.phase,'closed');assert.deepEqual(r.blocked,[0]);assert.throws(()=>host(r,'mark',{correct:true}))
})
test('players cannot control host actions; all teams exhausted cannot reopen',()=>{
 const r=make();assert.throws(()=>action(r,false,{team:0},{action:'reveal',version:0}),/Host only/)
 r.blocked=[0,1,2];assert.throws(()=>host(r,'open'));host(r,'reveal');assert.equal(r.phase,'settled');assert.equal(r.teams[0].score,0)
})
test('five clues scoring uses current clue',()=>{
 const r=make();r.game='clues';r.clue=1;host(r,'clue');host(r,'open');buzz(r,0);host(r,'mark',{correct:true});assert.equal(r.teams[0].score,80)
})
test('standalone buzzer awards 100 points and supports no-score finish',()=>{
 const r=make();r.game='buzzer';r.active=null;host(r,'open');buzz(r,1);host(r,'mark',{correct:true});assert.equal(r.teams[1].score,100);host(r,'undo');assert.equal(r.teams[1].score,0);host(r,'reveal');assert.equal(r.phase,'settled')
})
