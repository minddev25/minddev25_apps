import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {copyFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
export default defineConfig({plugins:[react(),{name:'github-pages-routes',closeBundle(){const route=resolve('dist/minddev25_reversi');mkdirSync(route,{recursive:true});copyFileSync(resolve('dist/index.html'),resolve(route,'index.html'));}}],base:'/minddev25_apps/'});
