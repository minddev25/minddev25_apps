import {describe,it,expect} from 'vitest';
import {initial,moves,play,apply,flips,score,bestMove} from './engine';import type {Side} from './engine';
import {createMatch,validMatch} from './storage';
describe('Reversi rules',()=>{
 it('opens with four legal moves and flips D4 after D3',()=>{const s=initial();expect(moves(s.board,1)).toEqual([19,26,37,44]);const n=play(s,19);expect(score(n.board)).toEqual({black:4,white:1});expect(n.turn).toBe(-1);expect(s.board[19]).toBe(0);});
 it('rejects occupied and non-capturing moves',()=>{expect(()=>apply(initial().board,1,0)).toThrow();expect(flips(initial().board,1,27)).toEqual([]);});
 it('captures in every direction without wrapping edges',()=>{const b=Array(64).fill(0);const i=27;for(const [dr,dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]){b[i+dr*8+dc]=-1;b[i+2*dr*8+2*dc]=1;}expect(flips(b,1,i)).toHaveLength(8);const wrap=Array(64).fill(0);wrap[7]=-1;wrap[6]=1;expect(flips(wrap,1,8)).toEqual([]);});
 it('auto-passes and ends only when both sides cannot move across full games',()=>{let passes=0;for(let seed=1;seed<=30;seed++){let s=initial(),n=0,r=seed;while(!s.over){const ms=moves(s.board,s.turn);expect(ms.length).toBeGreaterThan(0);r=(r*1664525+1013904223)>>>0;const next=play(s,ms[r%ms.length]);expect(next.board.filter(Boolean).length).toBe(s.board.filter(Boolean).length+1);if(next.passed&&!next.over){passes++;expect(next.turn).toBe(s.turn);}s=next;expect(++n).toBeLessThanOrEqual(60);}expect(moves(s.board,1)).toHaveLength(0);expect(moves(s.board,-1)).toHaveLength(0);expect(()=>play(s,0)).toThrow();}expect(passes).toBeGreaterThan(0);});
});
describe('local AI',()=>{
 it('returns legal moves at all ten levels within budget',()=>{let s=initial();for(let j=0;j<14;j++)s=play(s,moves(s.board,s.turn)[j%moves(s.board,s.turn).length]);for(let level=1;level<=10;level++){const start=performance.now();const r=bestMove(s.board,s.turn,level,40);expect(moves(s.board,s.turn)).toContain(r.move);expect(performance.now()-start).toBeLessThan(500);}});
 it('returns null when a side must pass',()=>{expect(bestMove(Array(64).fill(1),-1,10).move).toBeNull();});
 it('solves a small endgame to the optimal disc outcome',()=>{let s=initial();while(s.board.filter(x=>!x).length>6&&!s.over)s=play(s,moves(s.board,s.turn)[0]);const solve=(b:number[],p:Side):number=>{const ms=moves(b,p);if(!ms.length)return moves(b,-p as Side).length?-solve(b,-p as Side):b.reduce((a,x)=>a+x*p,0);return Math.max(...ms.map(m=>-solve(apply(b,p,m),-p as Side)));};const r=bestMove(s.board,s.turn,10,2000);expect(-solve(apply(s.board,s.turn,r.move!),-s.turn as Side)).toBe(solve(s.board,s.turn));});
});
describe('saved game validation',()=>{it('accepts legal histories and rejects tampering',()=>{const m=createMatch();m.positions.push(play(m.positions[0],19));expect(validMatch(m)).toBe(true);m.positions[1].board[0]=1;expect(validMatch(m)).toBe(false);});});
