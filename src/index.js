import vm from 'vm';

import { Parser } from 'acorn';
import axios from 'axios';

const host = 'shinycolors.enza.fun';
const base = `https://${host}/`;

const api = axios.create({
  baseURL: base,
  headers: {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'ja,en;q=0.5',
    'Connection': 'keep-alive',
    'DNT': 1,
    'Host': host,
    'Referer': base,
    'User-Agent':
      'Mozilla/5.0 (Linux; Android 11; Pixel 5) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/86.0.4240.110 Mobile Safari/537.36',
  },
});

const parserOptions = { ecmaVersion: 'latest', preserveParens: true };

// 'Content-Type': 'application/json',
// 'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',

(async () => {
  const appJsFilePath = await api.get(base).then((response) => {
    return response.data.match(/src="(\/app-[^"]+?)"/)[1];
  });
  let functions, chunkFileNames;
  await api.get(appJsFilePath).then((response) => {
    const parsed = Parser.parse(response.data, parserOptions);
    const nodeOfFunctions = parsed.body[0].expression.argument.arguments[0];
    functions = response.data.substring(nodeOfFunctions.start, nodeOfFunctions.end);
    const nodeOfChunkFileNames =
      parsed.body[0].expression.argument.callee.body.body[4].expression.expressions[0].right.body
        .body[7].expression.expressions[6].right;
    chunkFileNames = `(e) => (${response.data.substring(
      nodeOfChunkFileNames.left.left.left.right.start,
      nodeOfChunkFileNames.end,
    )})`;
  });
  const Window = require('window');
  const window = new Window();
  window.matchMedia = () => ({ matches: false, media: null });
  window.primEnv = {
    API_ROOT: 'https://api.shinycolors.enza.fun/',
    ASSET_ROOT: '/assets/',
    TRACKING_URI: 'https://tracking.shinycolors.enza.fun/',
    ENABLE_CRYPTO: true,
    PF_URI: 'https://platform.enza.fun/',
    GAME_ID: 1,
    X_VERSION: 202,
    STATS: false,
  };
  const sandbox = new Object({ window, setTimeout });
  vm.createContext(sandbox);
  vm.runInContext(`functions = ${functions}`, sandbox);
  vm.runInContext(`chunkFileNames = ${chunkFileNames}`, sandbox);
  const resourceHashAsmJsPath = sandbox.chunkFileNames(101);
  let resourceHashAsmJsFunction;
  await api.get(resourceHashAsmJsPath).then((response) => {
    const parsed = Parser.parse(response.data, parserOptions);
    const args = parsed.body[0].expression.arguments;
    resourceHashAsmJsFunction = response.data.substring(args[1].start, args[1].end);
  });
  vm.runInContext(`Object.assign(functions, ${resourceHashAsmJsFunction})`, sandbox);

  const script = new vm.Script(`
    ((e) => {
      r = {};
      t = function (n) {
        if (r[n]) return r[n].exports;
        var o = (r[n] = { i: n, l: !1, exports: {} });
        return e[n].call(o.exports, o, o.exports, t), (o.l = !0), o.exports;
      };
    })(functions);
    ((i) => {
      encryptPath = function (e, t) {
        return i.encryptPath(e, t);
      };
      decryptResource = function (e) {
        var t = e.byteLength,
          n = i._malloc(t);
        new Uint8Array(i.HEAPU8.buffer, n, t).set(new Uint8Array(e));
        var r = decodeURIComponent(escape(i.decryptResource(n, t)));
        return i._free(n), r;
      };
    })(t(1239)());
  `);
  script.runInContext(sandbox);
  const assetMapPath = `/assets/asset-map-${sandbox.encryptPath(
    '/assets/asset-map.json',
    'asset-map',
  )}`;
  await api
    .get(assetMapPath, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'arraybuffer',
    })
    .then((response) => {
      console.log(sandbox.decryptResource(response.data));
    });
})();

// src="/app-e3334d19c4757e73d9b1.js?v=ERJ7ZpuFTreCVhu4en+Er3lrXmYAOt/F1mOEhPjAw+4="
