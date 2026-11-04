#!/usr/bin/env node
/**
 * verify-glass-board.mjs - assertion harness for a "glass tilt board" page.
 *
 * Ships with the skill "glass-tilt-board".
 *
 * Why this exists: a static screenshot cannot prove that panels tilt with the
 * pointer, that the image slices line up, or that clicking the blank strip
 * advances the picture. This drives real input through the browser and asserts
 * geometry, then writes screenshots for a human visual review.
 *
 * Requires: Node 22+ (global fetch + WebSocket) and a local Chrome or Edge.
 * No npm dependencies.
 *
 * Usage:
 *   node verify-glass-board.mjs --url "file:///D:/work/glass-board/index.html"
 *   node verify-glass-board.mjs --url ./index.html --out ./_verify
 *   node verify-glass-board.mjs --url ./index.html --viewports 1440x900,430x880
 *
 * Exit code 0 = every assertion passed, 1 = at least one failed.
 *
 * DOM contract this harness assumes (override the index selector with a flag):
 *   window.GLASS_BOARD_IMAGES  { folder, files[] } manifest of the pictures.
 *                              Panels paint through CSS background-image, so
 *                              scanning document.images would prove nothing.
 *   .board     page root
 *   .tile      one glass panel; may carry a class when it has animated in
 *   .tilt      the layer that receives the tilt; inline transform with
 *              rotateX(<deg>) / rotateY(<deg>) while tilting
 *   .slice     the image slice inside .tilt; its own transform translates by
 *              (-offsetLeft, -offsetTop) and background-size covers the mosaic
 *   .mosaic    the grid holding the tiles; carries --img, --sw and --sh
 *   .advance   the blank click zone that advances to the next picture
 *   #metaNow   a text node whose value changes when the picture changes
 *
 * Geometry is asserted against the *computed* style wherever a CSS rule could
 * silently override an inline one; the tilt direction check stays on the inline
 * transform because that is the documented contract above.
 */

import { spawn, execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ options */

function parseArgs(argv) {
  const opts = {
    viewports: ['1440x900', '1920x1080', '430x880'],
    indexSelector: '#metaNow',
    settle: 1400,
    keep: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    if (key === 'keep') { opts.keep = true; continue; }
    const value = argv[++i];
    if (value === undefined) throw new Error('missing value for --' + key);
    if (key === 'url') opts.url = value;
    else if (key === 'out') opts.out = value;
    else if (key === 'chrome') opts.chrome = value;
    else if (key === 'index-selector') opts.indexSelector = value;
    else if (key === 'settle') opts.settle = Number(value);
    else if (key === 'viewports') {
      opts.viewports = value.split(',').map((s) => s.trim()).filter(Boolean);
    } else throw new Error('unknown flag --' + key);
  }
  return opts;
}

function findBrowser(explicit) {
  const candidates = [
    explicit,
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  for (const path of candidates) if (existsSync(path)) return path;
  throw new Error('no Chrome/Edge found; pass --chrome <path>');
}

function toUrl(input) {
  if (/^[a-z]+:\/\//i.test(input)) return input;
  return pathToFileURL(resolve(input)).href;
}

/* ------------------------------------------------------------------ CDP glue */

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.seq = 0;
    this.pending = new Map();
    this.waiters = [];
    ws.addEventListener('message', (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }
      if (msg.id != null && this.pending.has(msg.id)) {
        const { resolve: done, reject: fail } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) fail(new Error(msg.error.message + ' (' + msg.error.code + ')'));
        else done(msg.result);
        return;
      }
      if (!msg.method) return;
      for (let i = this.waiters.length - 1; i >= 0; i--) {
        const w = this.waiters[i];
        if (w.method !== msg.method) continue;
        if (w.sessionId != null && msg.sessionId !== w.sessionId) continue;
        this.waiters.splice(i, 1);
        clearTimeout(w.timer);
        w.resolve(msg.params);
      }
    });
  }

  send(method, params = {}, sessionId) {
    const id = ++this.seq;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((done, fail) => {
      this.pending.set(id, { resolve: done, reject: fail });
      this.ws.send(JSON.stringify(payload));
    });
  }

  waitEvent(method, sessionId, ms = 20000) {
    return new Promise((done, fail) => {
      const waiter = {
        method, sessionId, resolve: done,
        timer: setTimeout(() => {
          const i = this.waiters.indexOf(waiter);
          if (i >= 0) this.waiters.splice(i, 1);
          fail(new Error('timeout waiting for ' + method));
        }, ms),
      };
      this.waiters.push(waiter);
    });
  }
}

async function launchBrowser(bin, profileDir) {
  const child = spawn(bin, [
    '--headless=new',
    '--remote-debugging-port=0',
    '--user-data-dir=' + profileDir,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-sync',
    '--mute-audio',
    '--allow-file-access-from-files',
    '--window-size=1440,900',
    'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  child.on('error', () => {});
  return child;
}

async function readDebugPort(profileDir, child, ms = 25000) {
  const file = join(profileDir, 'DevToolsActivePort');
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    if (child.exitCode != null) throw new Error('browser exited early (code ' + child.exitCode + ')');
    try {
      const text = await readFile(file, 'utf8');
      const port = Number(text.split('\n')[0].trim());
      if (port > 0) return port;
    } catch { /* not written yet */ }
    await sleep(120);
  }
  throw new Error('DevToolsActivePort was never written');
}

async function connect(port) {
  const version = await (await fetch('http://127.0.0.1:' + port + '/json/version')).json();
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((done, fail) => {
    ws.addEventListener('open', done, { once: true });
    ws.addEventListener('error', () => fail(new Error('cannot open CDP socket')), { once: true });
  });
  return { cdp: new Cdp(ws), ws, version };
}

/* ------------------------------------------------------------- page helpers */

function helperSource(indexSelector) {
  return `window.__gtb = {
  q: function (s) { return document.querySelector(s); },
  tiles: function () { return Array.prototype.slice.call(document.querySelectorAll('.tile')); },
  transforms: function () {
    return Array.prototype.slice.call(document.querySelectorAll('.tilt')).map(function (e) {
      return e.style.transform || '';
    });
  },
  // Same panels, but read back through the computed style. Catches a CSS rule
  // that overrides or kills the tilt while the inline transform still updates.
  computedTransforms: function () {
    return Array.prototype.slice.call(document.querySelectorAll('.tilt')).map(function (e) {
      return getComputedStyle(e).transform || '';
    });
  },
  angles: function () {
    return window.__gtb.transforms().map(function (t) {
      var x = /rotateX\\((-?[\\d.]+)deg\\)/.exec(t);
      var y = /rotateY\\((-?[\\d.]+)deg\\)/.exec(t);
      return { rx: x ? parseFloat(x[1]) : null, ry: y ? parseFloat(y[1]) : null };
    });
  },
  gap: function () {
    var m = window.__gtb.q('.mosaic');
    if (!m) return null;
    var cs = getComputedStyle(m);
    var rowGap = parseFloat(cs.rowGap);
    var colGap = parseFloat(cs.columnGap);
    return { row: isNaN(rowGap) ? 0 : rowGap, col: isNaN(colGap) ? 0 : colGap };
  },
  // Own transform of an element, decomposed into its x/y translation.
  // Read from the *computed* style, not the inline string: a CSS rule that
  // overrides the inline transform would otherwise slip through, and a
  // misaligned slice still looks plausible in a screenshot.
  sliceTranslation: function (el) {
    var m = getComputedStyle(el).transform;
    if (!m || m === 'none') return { x: 0, y: 0 };
    var nums = m.slice(m.indexOf('(') + 1, m.lastIndexOf(')')).split(',').map(parseFloat);
    if (m.indexOf('matrix3d') === 0) return { x: nums[12], y: nums[13] };
    return { x: nums[4], y: nums[5] };
  },
  stage: function () {
    var m = window.__gtb.q('.mosaic');
    if (!m) return null;
    var cs = getComputedStyle(m);
    var r = m.getBoundingClientRect();
    return {
      w: r.width,
      h: r.height,
      sw: parseFloat(cs.getPropertyValue('--sw')),
      sh: parseFloat(cs.getPropertyValue('--sh'))
    };
  },
  slices: function () {
    return window.__gtb.tiles().map(function (tile) {
      var slice = tile.querySelector('.slice');
      if (!slice) return { ok: false, why: 'no .slice' };
      var d = window.__gtb.sliceTranslation(slice);
      var cs = getComputedStyle(slice);
      var bg = cs.backgroundImage;
      return {
        ok: true,
        x: d.x,
        y: d.y,
        ox: tile.offsetLeft,
        oy: tile.offsetTop,
        w: tile.offsetWidth,
        h: tile.offsetHeight,
        bgSize: cs.backgroundSize || '',
        hasImage: !!bg && bg !== 'none'
      };
    });
  },
  opacityVisible: function () {
    return window.__gtb.tiles().filter(function (t) {
      return parseFloat(getComputedStyle(t).opacity) > 0.9;
    }).length;
  },
  // Same path rules as the page: percent-encode every segment, accept both
  // "name.png" and { file: "name.png" } manifest entries.
  imageUrls: function () {
    var encode = function (p) {
      return String(p).split('/').map(encodeURIComponent).join('/');
    };
    var cfg = window.GLASS_BOARD_IMAGES || {};
    var dir = (typeof cfg.folder === 'string' && cfg.folder) ? cfg.folder : 'images';
    var prefix = encode(dir.replace(/\\/+$/, '')) + '/';
    return (Array.isArray(cfg.files) ? cfg.files : [])
      .map(function (f) { return (typeof f === 'string') ? f : (f && f.file) || ''; })
      .filter(Boolean)
      .map(function (f) { return prefix + encode(f); });
  },
  // The panels paint the picture through CSS background-image, so this template
  // has no <img> at all and "document.images is not broken" proves nothing.
  // Preload the manifest entries instead and report the ones that never decode.
  brokenImages: function () {
    var urls = window.__gtb.imageUrls();
    if (!urls.length) {
      urls = Array.prototype.slice.call(document.images)
        .filter(function (i) { return !i.complete || i.naturalWidth === 0; })
        .map(function (i) { return i.currentSrc || i.src; });
    }
    return Promise.all(urls.map(function (u) {
      return new Promise(function (resolve) {
        var img = new Image();
        // A request that neither loads nor errors would otherwise hang the whole
        // evaluate call, so every probe gets its own deadline.
        var timer = setTimeout(function () { settle(false); }, 15000);
        var settle = function (ok) {
          clearTimeout(timer);
          img.onload = img.onerror = null;
          resolve(ok ? null : u);
        };
        img.onload = function () { settle(img.naturalWidth > 0 && img.naturalHeight > 0); };
        img.onerror = function () { settle(false); };
        img.src = u;
      });
    })).then(function (rs) { return rs.filter(Boolean); });
  },
  mosaicImage: function () {
    var m = window.__gtb.q('.mosaic');
    if (!m) return null;
    var v = getComputedStyle(m).getPropertyValue('--img').trim();
    if (v && v !== 'none') return v;
    var bg = getComputedStyle(m).backgroundImage;
    return (!bg || bg === 'none') ? null : bg;
  },
  index: function () {
    var e = window.__gtb.q(${JSON.stringify(indexSelector)});
    return e ? (e.textContent || '').trim() : null;
  },
  point: function (sel, fx, fy) {
    var e = window.__gtb.q(sel);
    if (!e) return null;
    var r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return null;
    return { x: r.left + r.width * fx, y: r.top + r.height * fy };
  },
  layout: function () {
    var sels = ['.board', '.meta', '.advance', '.hint-chip', '.pick-chip'];
    var boxes = [];
    sels.forEach(function (s) {
      var e = window.__gtb.q(s);
      if (!e) return;
      var r = e.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      boxes.push({ sel: s, left: r.left, top: r.top, right: r.right, bottom: r.bottom });
    });
    var overlaps = [];
    for (var i = 0; i < boxes.length; i++) {
      for (var j = i + 1; j < boxes.length; j++) {
        var A = window.__gtb.q(boxes[i].sel), B = window.__gtb.q(boxes[j].sel);
        if (A.contains(B) || B.contains(A)) continue;
        var a = boxes[i], b = boxes[j];
        var ov = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        var ovv = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ov > 1 && ovv > 1) {
          overlaps.push({ a: a.sel, b: b.sel, w: Math.round(ov), h: Math.round(ovv) });
        }
      }
    }
    var d = document.documentElement;
    return {
      boxes: boxes,
      overlaps: overlaps,
      vw: window.innerWidth,
      vh: window.innerHeight,
      scrollW: d.scrollWidth,
      scrollH: d.scrollHeight,
      clientW: d.clientWidth,
      clientH: d.clientHeight
    };
  }
};
'ok'`;
}

/* --------------------------------------------------------------- statistics */

const mean = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : NaN);
const sd = (list) => {
  if (list.length < 2) return 0;
  const m = mean(list);
  return Math.sqrt(mean(list.map((v) => (v - m) * (v - m))));
};
/* How many panels actually changed between two samples. Comparing means alone
   hides the case where three panels do all the work and the rest stand still. */
const countChanged = (a, b) => {
  const n = Math.min(a.length, b.length);
  let changed = 0;
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) changed++;
  return changed;
};

/* ---------------------------------------------------------- one viewport run */

async function runViewport(cdp, url, view, opts) {
  const [width, height] = view.split('x').map(Number);
  const results = [];
  const shots = [];
  const check = (name, ok, detail) => results.push({ name, ok: !!ok, detail: detail || '' });

  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const S = (method, params) => cdp.send(method, params, sessionId);

  const evaluate = async (expression) => {
    const out = await S('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (out.exceptionDetails) {
      const desc = out.exceptionDetails.exception && out.exceptionDetails.exception.description;
      throw new Error('page threw: ' + (desc || out.exceptionDetails.text));
    }
    return out.result ? out.result.value : undefined;
  };
  const val = (member) => evaluate('window.__gtb.' + member);
  const movePointer = (x, y) => S('Input.dispatchMouseEvent', {
    type: 'mouseMoved', x: Math.round(x), y: Math.round(y), buttons: 0,
  });
  const clickAt = async (x, y) => {
    await movePointer(x, y);
    await sleep(60);
    const base = { x: Math.round(x), y: Math.round(y), button: 'left', clickCount: 1 };
    await S('Input.dispatchMouseEvent', { ...base, type: 'mousePressed', buttons: 1 });
    await sleep(30);
    await S('Input.dispatchMouseEvent', { ...base, type: 'mouseReleased', buttons: 0 });
  };
  const pressKey = async (key, code, vk) => {
    await S('Input.dispatchKeyEvent', { type: 'rawKeyDown', key, code, windowsVirtualKeyCode: vk });
    await S('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk });
  };

  try {
    await S('Page.enable');
    await S('Runtime.enable');
    // --window-size is NOT the viewport; without this override the page renders
    // at 800x600 and clicks land nowhere useful.
    await S('Emulation.setDeviceMetricsOverride', {
      width, height, deviceScaleFactor: 1, mobile: false,
    });

    const loaded = cdp.waitEvent('Page.loadEventFired', sessionId, 25000);
    await S('Page.navigate', { url });
    await loaded;

    // The board builds its panels after the first image decodes.
    const deadline = Date.now() + 12000;
    let alive = 0;
    while (Date.now() < deadline) {
      alive = await evaluate('document.querySelectorAll(".tile").length');
      if (alive > 0) break;
      await sleep(150);
    }
    await evaluate(helperSource(opts.indexSelector));
    await movePointer(width / 2, height / 2);
    await sleep(opts.settle);

    /* ------------------------------------------------------------ structure */
    const tileCount = await val('tiles().length');
    check('panels exist', tileCount >= 12 && tileCount <= 49, 'tiles=' + tileCount);

    const visible = await val('opacityVisible()');
    check('panels finished entering', visible === tileCount,
      visible + '/' + tileCount + ' at opacity 1');

    const broken = await val('brokenImages()');
    check('images loaded', Array.isArray(broken) && broken.length === 0,
      (Array.isArray(broken) && broken.length) ? broken.join(' | ') : 'none broken');

    const mosaicImage = await val('mosaicImage()');
    check('mosaic has an image', !!mosaicImage, mosaicImage ? 'set' : 'empty --img / background-image');

    /* --------------------------------------------------------------- layout */
    const layout = await val('layout()');
    const outside = layout.boxes.filter((b) =>
      b.left < -2 || b.top < -2 || b.right > layout.vw + 2 || b.bottom > layout.vh + 2);
    check('UI stays inside the viewport', outside.length === 0,
      outside.length ? outside.map((b) => b.sel).join(',') : 'viewport ' + layout.vw + 'x' + layout.vh);
    check('UI regions do not overlap', layout.overlaps.length === 0,
      layout.overlaps.length
        ? layout.overlaps.map((o) => o.a + '/' + o.b + ' ' + o.w + 'x' + o.h).join(', ')
        : 'clean');
    check('no page overflow',
      layout.scrollW <= layout.clientW + 1 && layout.scrollH <= layout.clientH + 1,
      layout.scrollW + 'x' + layout.scrollH + ' vs ' + layout.clientW + 'x' + layout.clientH);

    /* ----------------------------------------------------------------- tilt */
    const sampleY = async (x) => {
      await movePointer(x, height / 2);
      await sleep(140);
      return {
        ry: (await val('angles()')).map((a) => a.ry).filter((v) => v != null),
        matrices: await val('computedTransforms()'),
      };
    };
    const leftY = await sampleY(width * 0.15);
    const midY = await sampleY(width * 0.5);
    const rightY = await sampleY(width * 0.85);
    check('pointer moves the panels', leftY.ry.length > 0 && leftY.ry.join() !== rightY.ry.join(),
      'rotateY mean ' + mean(leftY.ry).toFixed(2) + ' -> ' + mean(rightY.ry).toFixed(2));
    check('horizontal tilt follows the pointer',
      mean(leftY.ry) < mean(midY.ry) && mean(midY.ry) < mean(rightY.ry),
      mean(leftY.ry).toFixed(2) + ' < ' + mean(midY.ry).toFixed(2) +
      ' < ' + mean(rightY.ry).toFixed(2));
    check('panels are not rigidly identical', sd(midY.ry) > 0.05, 'sd=' + sd(midY.ry).toFixed(3));

    // The whole point of the board: every panel follows the pointer, not just
    // enough of them to move the average.
    const boardSize = Math.max(leftY.matrices.length, rightY.matrices.length);
    const moved = countChanged(leftY.matrices, rightY.matrices);
    check('tilt covers the whole board', boardSize > 0 && moved >= Math.ceil(boardSize * 0.9),
      moved + '/' + boardSize + ' panels changed between the left and right sample');
    // Sign anchor: a monotonic mean can still pass while the whole mapping is
    // offset into positive territory, so pin the sign at both extremes too.
    check('tilt direction follows the pointer side', mean(leftY.ry) < 0 && mean(rightY.ry) > 0,
      'left mean ' + mean(leftY.ry).toFixed(2) + ', right mean ' + mean(rightY.ry).toFixed(2));

    const sampleX = async (y) => {
      await movePointer(width / 2, y);
      await sleep(140);
      return (await val('angles()')).map((a) => a.rx).filter((v) => v != null);
    };
    const topX = await sampleX(height * 0.15);
    const botX = await sampleX(height * 0.85);
    check('vertical tilt follows the pointer', mean(topX) > mean(botX),
      mean(topX).toFixed(2) + ' > ' + mean(botX).toFixed(2));

    /* --------------------------------------------------------- slices, seams */
    const SEAM_TOL = 1.5;
    const stage = await val('stage()');
    // Keep the tiles that have no .slice at all in the picture: filtering them
    // out here would let a 30-panel board pass on the 29 panels that do have one.
    const allSlices = await val('slices()');
    const slices = allSlices.filter((s) => s.ok);
    const missingSlices = allSlices.length - slices.length;
    check('every panel has a slice', allSlices.length > 0 && missingSlices === 0,
      missingSlices
        ? missingSlices + ' of ' + allSlices.length + ' panels have no .slice'
        : allSlices.length + ' panels');

    // Computed transform, so a CSS rule overriding the inline translate is caught.
    // Written with !(... <= tol) rather than (... > tol) so a matrix we failed to
    // parse (NaN) counts as misaligned instead of silently passing.
    const ALIGN_TOL = 0.5;
    const misaligned = slices.filter((s) =>
      !(Math.abs(s.x + s.ox) <= ALIGN_TOL && Math.abs(s.y + s.oy) <= ALIGN_TOL));
    check('slices line up with their panels',
      slices.length > 0 && missingSlices === 0 && misaligned.length === 0,
      misaligned.length
        ? misaligned.length + ' off, first x=' + misaligned[0].x.toFixed(2) +
          ' ox=' + misaligned[0].ox
        : missingSlices ? missingSlices + ' panels have no .slice' : slices.length + ' aligned');

    const blank = slices.filter((s) => !s.hasImage);
    check('every slice paints the picture',
      slices.length > 0 && missingSlices === 0 && blank.length === 0,
      blank.length
        ? blank.length + ' slices have no background-image'
        : missingSlices ? missingSlices + ' panels have no .slice' : 'all ' + slices.length);

    // Every slice magnifies the *whole* picture and is then shifted into place.
    // Wrong background-size silently reassembles the mosaic into a scaled copy.
    const stageSized = !!stage && Number.isFinite(stage.sw) && Number.isFinite(stage.sh);
    const badScale = slices.filter((s) => {
      const n = String(s.bgSize).split(/\s+/).map(parseFloat);
      if (n.length < 2 || !Number.isFinite(n[0]) || !Number.isFinite(n[1])) return true;
      if (!stageSized) return true;
      return !(Math.abs(n[0] - stage.sw) <= ALIGN_TOL && Math.abs(n[1] - stage.sh) <= ALIGN_TOL);
    });
    check('slices are sized to the whole picture',
      slices.length > 0 && missingSlices === 0 && stageSized && badScale.length === 0,
      missingSlices
        ? missingSlices + ' panels have no .slice'
        : !stageSized
        ? 'could not read --sw/--sh on .mosaic'
        : badScale.length
          ? badScale.length + ' off, first ' + badScale[0].bgSize
          : 'all ' + slices.length + ' at ' + stage.sw + 'x' + stage.sh);

    const gap = await val('gap()');
    const joints = [];
    if (gap && gap.col > 0 && gap.row > 0) {
      const rows = new Map();
      const cols = new Map();
      for (const s of slices) {
        if (!rows.has(s.oy)) rows.set(s.oy, []);
        rows.get(s.oy).push(s);
        if (!cols.has(s.ox)) cols.set(s.ox, []);
        cols.get(s.ox).push(s);
      }
      for (const row of rows.values()) {
        row.sort((a, b) => a.ox - b.ox);
        for (let i = 1; i < row.length; i++) {
          joints.push({ d: row[i].ox - (row[i - 1].ox + row[i - 1].w), want: gap.col });
        }
      }
      for (const col of cols.values()) {
        col.sort((a, b) => a.oy - b.oy);
        for (let i = 1; i < col.length; i++) {
          joints.push({ d: col[i].oy - (col[i - 1].oy + col[i - 1].h), want: gap.row });
        }
      }
    }
    const offGaps = joints.filter((j) => Math.abs(j.d - j.want) > SEAM_TOL);
    check('no seams between panels', joints.length > 0 && offGaps.length === 0,
      !gap
        ? 'could not read the mosaic gap'
        : offGaps.length
          ? offGaps.length + ' off, e.g. ' + offGaps[0].d.toFixed(1) + 'px want ' + offGaps[0].want + 'px'
          : joints.length + ' joints, gap ' + gap.col + ' x ' + gap.row + 'px');

    /* ------------------------------------------------------------ interaction */
    const before = await val('index()');
    const canvasPoint = await val('point(".mosaic", 0.5, 0.5)');
    const advancePoint = await val('point(".advance", 0.85, 0.85)');

    if (canvasPoint) {
      await clickAt(canvasPoint.x, canvasPoint.y);
      await sleep(1000);
      const after = await val('index()');
      check('clicking the picture does not advance', after === before,
        '"' + before + '" -> "' + after + '"');
    } else {
      check('clicking the picture does not advance', false, 'no .mosaic box to click');
    }

    if (advancePoint) {
      await clickAt(advancePoint.x, advancePoint.y);
      await sleep(1200);
      const after = await val('index()');
      check('clicking the blank zone advances', after !== before,
        '"' + before + '" -> "' + after + '"');

      const beforeKey = await val('index()');
      await pressKey('ArrowRight', 'ArrowRight', 39);
      await sleep(1200);
      const afterKey = await val('index()');
      check('keyboard advances', afterKey !== beforeKey, '"' + beforeKey + '" -> "' + afterKey + '"');
    } else {
      check('clicking the blank zone advances', false, 'no .advance box to click');
    }

    /* ------------------------------------------------------------ screenshots */
    if (opts.out) {
      await movePointer(width * 0.78, height * 0.26);
      await sleep(260);
      const shot = await S('Page.captureScreenshot', { format: 'png' });
      const name = 'board-' + width + 'x' + height + '.png';
      await writeFile(join(opts.out, name), Buffer.from(shot.data, 'base64'));
      shots.push(name);
    }
  } finally {
    await cdp.send('Target.closeTarget', { targetId }).catch(() => {});
  }

  return { view: width + 'x' + height, width, height, results, shots };
}

/* --------------------------------------------------------------------- main */

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.url) {
    console.error('usage: node verify-glass-board.mjs --url <file|url> [--out <dir>] [--viewports WxH,...]');
    process.exit(2);
  }
  const url = toUrl(opts.url);
  const browser = findBrowser(opts.chrome);
  if (opts.out) await mkdir(opts.out, { recursive: true });

  const profileDir = await mkdtemp(join(tmpdir(), 'glass-tilt-verify-'));
  const child = await launchBrowser(browser, profileDir);
  const report = { url, browser, startedAt: new Date().toISOString(), viewports: [] };
  let ws;
  let failed = 0;

  try {
    const port = await readDebugPort(profileDir, child);
    const conn = await connect(port);
    ws = conn.ws;
    report.browserVersion = conn.version.Browser;
    console.log('browser : ' + conn.version.Browser);
    console.log('target  : ' + url);
    console.log('');
    for (const view of opts.viewports) {
      const outcome = await runViewport(conn.cdp, url, view, opts);
      report.viewports.push(outcome);
      const bad = outcome.results.filter((r) => !r.ok).length;
      failed += bad;
      console.log(view + (bad ? '  FAILED (' + bad + ')' : '  ok'));
      for (const r of outcome.results) {
        console.log('  ' + (r.ok ? 'ok  ' : 'FAIL') + ' ' + r.name +
          (r.detail ? '  [' + r.detail + ']' : ''));
      }
      if (outcome.shots.length) console.log('  shots: ' + outcome.shots.join(', '));
      console.log('');
    }
  } finally {
    try { if (ws) ws.close(); } catch { /* already gone */ }
    try {
      if (child.pid) {
        execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      }
    } catch {
      try { child.kill('SIGKILL'); } catch { /* gone */ }
    }
    if (!opts.keep) {
      await sleep(400);
      try { await rm(profileDir, { recursive: true, force: true }); }
      catch { console.log('note: could not remove temp profile ' + profileDir); }
    } else {
      console.log('temp profile kept at ' + profileDir);
    }
  }

  if (opts.out) {
    await writeFile(join(opts.out, 'report.json'), JSON.stringify(report, null, 2));
    console.log('report  : ' + join(opts.out, 'report.json'));
  }
  const total = report.viewports.reduce((n, v) => n + v.results.length, 0);
  console.log(failed
    ? failed + ' of ' + total + ' assertions failed'
    : 'all ' + total + ' assertions passed');
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error('verify-glass-board: ' + err.message);
  process.exit(2);
});
