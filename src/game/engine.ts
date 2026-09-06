export type Side = 1 | -1;
export type Board = number[];
export interface Position { board: Board; turn: Side; move: number | null; passed: boolean; over: boolean }
const dirs = [-1,0,1].flatMap(r => [-1,0,1].filter(c=>r||c).map(c=>[r,c]));
export function initial(): Position { const board=Array(64).fill(0); board[27]=board[36]=-1; board[28]=board[35]=1; return {board,turn:1,move:null,passed:false,over:false}; }
export function flips(b:Board, p:Side, i:number):number[] { if(i<0||i>=64||b[i]) return []; const out:number[]=[]; for(const [dr,dc] of dirs){let r=(i>>3)+dr,c=i%8+dc;const line:number[]=[];while(r>=0&&r<8&&c>=0&&c<8&&b[r*8+c]===-p){line.push(r*8+c);r+=dr;c+=dc;}if(line.length&&r>=0&&r<8&&c>=0&&c<8&&b[r*8+c]===p)out.push(...line);}return out; }
export function moves(b:Board,p:Side){const out:number[]=[];for(let i=0;i<64;i++)if(!b[i]&&flips(b,p,i).length)out.push(i);return out;}
export function apply(b:Board,p:Side,i:number){const f=flips(b,p,i);if(!f.length)throw Error('Illegal move');const n=b.slice();n[i]=p;for(const j of f)n[j]=p;return n;}
export function play(s:Position,i:number):Position{if(s.over)throw Error('Game finished');const board=apply(s.board,s.turn,i);let turn=-s.turn as Side;const passed=!moves(board,turn).length;if(passed)turn=s.turn;return{board,turn,move:i,passed,over:passed&&!moves(board,turn).length};}
export function score(b:Board){return{black:b.filter(x=>x===1).length,white:b.filter(x=>x===-1).length};}
export const coord=(i:number)=>`${'ABCDEFGH'[i%8]}${(i>>3)+1}`;
const weights=[100,-25,12,5,5,12,-25,100,-25,-45,-3,-3,-3,-3,-45,-25,12,-3,8,2,2,8,-3,12,5,-3,2,1,1,2,-3,5,5,-3,2,1,1,2,-3,5,12,-3,8,2,2,8,-3,12,-25,-45,-3,-3,-3,-3,-45,-25,100,-25,12,5,5,12,-25,100];
function evaluate(b:Board,p:Side){let positional=0,frontier=0,discs=0,empty=0;for(let i=0;i<64;i++){if(!b[i]){empty++;continue;}const v=b[i]*p;positional+=weights[i]*v;discs+=v;if(dirs.some(([r,c])=>{const y=(i>>3)+r,x=i%8+c;return y>=0&&y<8&&x>=0&&x<8&&!b[y*8+x];}))frontier-=v;}const mobility=moves(b,p).length-moves(b,-p as Side).length;return positional*3+mobility*12+frontier*5+discs*(empty<16?8:empty<40?1:-2);}
export const budgets=[0,0,40,80,140,250,450,800,1300,2000];
export function bestMove(board:Board,side:Side,level:number,budget=budgets[level-1]){const legal=moves(board,side);if(!legal.length)return{move:null,depth:0,nodes:0};if(level===1)return{move:legal[Math.floor(Math.random()*legal.length)],depth:0,nodes:0};if(level===2){const ordered=legal.map(move=>({move,value:flips(board,side,move).length})).sort((a,b)=>b.value-a.value);return{move:ordered[0].move,depth:1,nodes:legal.length};}
 const end=performance.now()+budget;let nodes=0,chosen=legal[0],completed=0; const tt=new Map<string,{depth:number,value:number,flag:number,best:number}>();const timeout=Symbol();
 function search(b:Board,p:Side,d:number,alpha:number,beta:number):number{if((++nodes&127)===0&&performance.now()>end)throw timeout;const a0=alpha,b0=beta;const key=b.map(x=>x+1).join('')+p;const cached=tt.get(key);if(cached&&cached.depth>=d){if(cached.flag===0)return cached.value;if(cached.flag===1)alpha=Math.max(alpha,cached.value);else beta=Math.min(beta,cached.value);if(alpha>=beta)return cached.value;}
 const ms=moves(b,p);if(!ms.length){if(!moves(b,-p as Side).length){const diff=b.reduce((a,x)=>a+x*p,0);return diff===0?0:Math.sign(diff)*100000+diff*100;}return-search(b,-p as Side,d,-beta,-alpha);}if(d<=0)return evaluate(b,p);
 ms.sort((a,c)=>(c===cached?.best?10000:weights[c])-(a===cached?.best?10000:weights[a]));let value=-Infinity,best=ms[0];for(const m of ms){const v=-search(apply(b,p,m),-p as Side,d-1,-beta,-alpha);if(v>value){value=v;best=m;}alpha=Math.max(alpha,v);if(alpha>=beta)break;}if(tt.size>80000)tt.clear();tt.set(key,{depth:d,value,flag:value<=a0?2:value>=b0?1:0,best});return value;
 }
 const empties=board.filter(x=>!x).length;const maxDepth=level>=8&&empties<=level+3?empties:Math.min(12,level+1);
 for(let d=1;d<=maxDepth;d++){try{let best=-Infinity,next=chosen,alpha=-Infinity;legal.sort((a,b)=>(b===chosen?1000:weights[b])-(a===chosen?1000:weights[a]));for(const m of legal){const v=-search(apply(board,side,m),-side as Side,d-1,-Infinity,-alpha);if(v>best){best=v;next=m;}alpha=Math.max(alpha,v);}chosen=next;completed=d;if(Math.abs(best)>=100000)break;}catch(e){if(e!==timeout)throw e;break;}if(performance.now()>end)break;}return{move:chosen,depth:completed,nodes};
}
