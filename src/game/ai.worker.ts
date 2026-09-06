import { bestMove } from './engine';
self.onmessage = ({data}) => { try {self.postMessage(bestMove(data.board,data.side,data.level));} catch {self.postMessage({move:null,error:true});} };
