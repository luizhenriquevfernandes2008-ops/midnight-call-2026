// levels-chase.js — o segundo ato compacto da fuga do Capitulo 2.
//
// Sao corredores de servico que existiam atras da Doca 3. Eles nao tentam
// transformar o galpao num mapa novo: cada setor tem uma unica ideia forte
// e devolve o jogador rapidamente ao eixo da fuga.

import { VW, VH, makeBuffer, mulberry32 } from '../core/gfx.js';
import { rect } from '../art/pixel.js';
import { Level } from './levels.js';

const GY = 214;

function shell(width, seed, color = '#20262d') {
  const b = makeBuffer(width, VH), g = b.x, rnd = mulberry32(seed);
  rect(g, 0, 0, width, VH, '#07090c');
  rect(g, 0, 34, width, GY - 34, color);
  rect(g, 0, 34, width, 3, '#343c45');
  for (let x = 0; x < width; x += 64) {
    rect(g, x, 38, 3, GY - 38, '#12161b');
    rect(g, x + 3, 38, 1, GY - 38, '#3b4249');
  }
  for (let i = 0; i < width / 5; i++) {
    const x = (rnd() * width) | 0, y = 55 + ((rnd() * 135) | 0);
    rect(g, x, y, 1 + ((rnd() * 3) | 0), 1, rnd() > 0.45 ? '#15191d' : '#3b332d');
  }
  rect(g, 0, GY, width, VH - GY, '#16191d');
  rect(g, 0, GY, width, 2, '#4c535b');
  for (let x = 0; x < width; x += 18) rect(g, x, GY + 7, 9, 1, '#252a30');
  return b;
}

function gate(g, x, y, w = 62, h = 92, open = false) {
  rect(g, x, y - h, w, h, open ? '#080a0d' : '#252b31');
  rect(g, x, y - h, 4, h, '#535c65'); rect(g, x + w - 4, y - h, 4, h, '#535c65');
  for (let yy = y - h + 8; yy < y - 5; yy += 10) rect(g, x + 4, yy, w - 8, 2, '#58616a');
}

function door(g, x, y, w = 38, h = 72) {
  rect(g, x, y - h, w, h, '#181c21');
  rect(g, x, y - h, 3, h, '#59616a'); rect(g, x + w - 3, y - h, 3, h, '#32383f');
  rect(g, x + 7, y - h + 8, w - 14, h - 16, '#2a3037');
  rect(g, x + w - 11, y - 36, 3, 3, '#b48f55');
}

function fore(width) {
  const f = makeBuffer(Math.ceil(VW + (width - VW) * 1.12) + 8, VH);
  rect(f.x, 0, 0, f.c.width, 10, '#020304');
  rect(f.x, 0, VH - 7, f.c.width, 7, '#020304');
  return f;
}

export function buildServiceRoute() {
  const W = 1500, main = shell(W, 7101, '#252b31'), g = main.x;
  gate(g, 12, GY, 72, 96, true);
  // Porta destruivel e estante de sacrificio.
  door(g, 420, GY, 48, 78);
  for (let i = 0; i < 4; i++) {
    rect(g, 600, GY - 18 - i * 17, 94, 5, '#4c555e');
    rect(g, 606, GY - 14 - i * 17, 82, 11, '#5b4029');
  }
  // O armario de suprimentos fica longe da estante para a interacao urgente
  // nunca competir com "pegar" no mesmo ponto.
  rect(g, 842, GY - 38, 70, 38, '#313941');
  rect(g, 848, GY - 31, 58, 22, '#15191d');
  rect(g, 854, GY - 25, 12, 5, '#b39155');
  rect(g, 642, 61, 4, 23, '#6a251f');
  rect(g, 636, 58, 16, 6, '#a73b2d');
  // Guarda-corpo: aqui acontece o quase-tombo e o rasgo do casaco.
  rect(g, 930, GY - 34, 300, 4, '#555e67');
  for (let x = 938; x < 1220; x += 30) rect(g, x, GY - 34, 3, 34, '#3f474f');
  gate(g, 1320, GY, 66, 86, true);
  door(g, 1410, GY, 44, 76);

  const lights = [];
  for (const x of [170, 540, 910, 1280]) {
    rect(g, x - 8, 48, 16, 5, '#4a5159'); rect(g, x - 5, 53, 10, 2, '#d0a263');
    lights.push({ x, y: 56, r: 176, color: '#c18455', i: 0.55, falloff: 1.2, flick: x === 910 ? 'bulb' : null });
  }
  return new Level({
    key: 'ch2_service', nameKey: 'loc_service', width: W, groundY: GY,
    ambient: '#252c38', layers: [{ c: main.c, par: 1 }], fores: [{ c: fore(W).c, par: 1.12 }],
    lightDefs: lights, interactables: [
      { id: 'service_rack', x: 592, y: GY - 84, w: 112, h: 84, action: 'chase_sacrifice', prompt: 'prompt_drop_now', range: 60, prio: 9 },
      { id: 'escape_cache', x: 838, y: GY - 42, w: 78, h: 42, action: 'take_escape_cache', prompt: 'prompt_take', range: 34, prio: 3 },
      { id: 'route_short', x: 1316, y: GY - 88, w: 74, h: 88, action: 'chase_route_short', prompt: 'prompt_short_route', range: 40, prio: 4 },
      { id: 'route_long', x: 1406, y: GY - 78, w: 52, h: 78, action: 'chase_route_long', prompt: 'prompt_long_route', range: 38, prio: 4 },
    ],
    minX: 34, maxX: W - 34, spawn: { x: 96, facing: 1 }, reflect: 0.05, bloom: 0.45,
    indoor: true, material: 'metal', ambience: [{ n: 'hall', g: 0.08 }, { n: 'wind', g: 0.02 }],
    randomSfx: [{ fn: 'metalCreak', min: 8, max: 17, vol: 0.8 }], maxInimigos: 0,
  });
}

export function buildLongRoute() {
  const W = 980, main = shell(W, 7201, '#20262c'), g = main.x;
  door(g, 30, GY, 42, 74); door(g, 906, GY, 42, 74);
  for (let x = 180; x < 820; x += 160) {
    rect(g, x, GY - 54, 74, 54, '#252c33');
    rect(g, x + 6, GY - 46, 62, 4, '#505963');
    rect(g, x + 8, GY - 32, 58, 3, '#3f474f');
  }
  const lights = [220, 510, 800].map((x, i) => ({ x, y: 62, r: 152, color: '#ad784f', i: 0.46, falloff: 1.25, flick: i === 1 ? 'bulb' : null }));
  return new Level({
    key: 'ch2_service_long', nameKey: 'loc_service_long', width: W, groundY: GY,
    ambient: '#222a35', layers: [{ c: main.c, par: 1 }], fores: [{ c: fore(W).c, par: 1.12 }],
    lightDefs: lights, interactables: [
      { id: 'long_back', x: 26, y: GY - 76, w: 50, h: 76, action: 'goto', to: 'ch2_service', tox: 1360, tofacing: -1, prompt: 'prompt_open', range: 30, isDoor: true },
      { id: 'long_exit', x: 900, y: GY - 76, w: 54, h: 76, action: 'goto', to: 'ch2_escape_cold', tox: 78, tofacing: 1, prompt: 'prompt_open', range: 32, isDoor: true },
    ],
    minX: 34, maxX: W - 34, spawn: { x: 74, facing: 1 }, reflect: 0.04, bloom: 0.38,
    indoor: true, material: 'concrete', ambience: [{ n: 'hall', g: 0.07 }], maxInimigos: 0,
  });
}

export function buildEscapeFreezer() {
  const W = 1220, main = shell(W, 7301, '#171d24'), g = main.x;
  door(g, 28, GY, 44, 76); gate(g, 1132, GY, 62, 88, true);
  // Fileiras de carcaças cobertas: legiveis apenas quando a lampada falha.
  rect(g, 120, 28, 950, 4, '#59616a');
  for (let x = 165; x < 1080; x += 95) {
    rect(g, x, 32, 2, 42, '#69717a');
    rect(g, x - 14, 72, 28, 70, '#26303a');
    rect(g, x - 11, 75, 22, 62, '#435363');
    rect(g, x - 5, 137, 4, 15, '#2a3138'); rect(g, x + 3, 137, 4, 15, '#2a3138');
  }
  const lights = [135, 420, 705, 990].map((x, i) => ({
    x, y: 49, r: 145, color: '#7fa6d2', i: 0.22, falloff: 1.35,
    flick: 'bulb', fault: i * 0.17,
  }));
  return new Level({
    key: 'ch2_escape_cold', nameKey: 'loc_escape_cold', width: W, groundY: GY,
    ambient: '#10151d', layers: [{ c: main.c, par: 1 }], fores: [{ c: fore(W).c, par: 1.14 }],
    lightDefs: lights, interactables: [
      { id: 'escape_cold_exit', x: 1126, y: GY - 90, w: 70, h: 90, action: 'goto', to: 'ch2_chainbay', tox: 82, tofacing: 1, prompt: 'prompt_open', range: 38, isDoor: true },
    ],
    minX: 34, maxX: W - 34, spawn: { x: 78, facing: 1 }, reflect: 0.12, bloom: 0.28,
    indoor: true, material: 'ice', frio: true, escapeFreezer: true,
    ambience: [{ n: 'freezer', g: 0.09 }], maxInimigos: 0,
  });
}

export function buildChainBay() {
  const W = 1050, main = shell(W, 7401, '#22282e'), g = main.x;
  gate(g, 24, GY, 70, 94, true); gate(g, 942, GY, 76, 102, true);
  for (const x of [250, 390, 560, 720, 860]) {
    rect(g, x, 8, 3, 92 + (x % 37), '#555d65');
    for (let y = 12; y < 90 + (x % 37); y += 5) rect(g, x + ((y / 5) % 2), y, 2, 2, '#737b84');
  }
  rect(g, 700, GY - 45, 140, 8, '#343b42');
  rect(g, 720, GY - 37, 6, 37, '#252b31'); rect(g, 812, GY - 37, 6, 37, '#252b31');
  const lights = [180, 510, 880].map((x, i) => ({ x, y: 54, r: 178, color: i === 2 ? '#7898c2' : '#b77c50', i: 0.52, falloff: 1.2, flick: i === 1 ? 'bulb' : null }));
  return new Level({
    key: 'ch2_chainbay', nameKey: 'loc_chainbay', width: W, groundY: GY,
    ambient: '#242d3a', layers: [{ c: main.c, par: 1 }], fores: [{ c: fore(W).c, par: 1.13 }],
    lightDefs: lights, interactables: [
      { id: 'saida', x: 936, y: GY - 106, w: 86, h: 106, action: 'sair', prompt: 'prompt_open', range: 48, prio: 4 },
    ],
    minX: 34, maxX: W - 34, spawn: { x: 82, facing: 1 }, reflect: 0.08, bloom: 0.48,
    indoor: true, material: 'metal', ambience: [{ n: 'hall', g: 0.06 }, { n: 'rain', g: 0.035 }], maxInimigos: 0,
  });
}

export function buildRainYard() {
  const W = 820, main = makeBuffer(W, VH), g = main.x, rnd = mulberry32(7601);
  rect(g, 0, 0, W, VH, '#070b12');
  // Fachada do galpao. O portao da esquerda e a mesma saida da baia.
  rect(g, 0, 42, 176, GY - 42, '#20262d');
  rect(g, 0, 42, 176, 4, '#4b535c');
  rect(g, 15, 92, 120, GY - 92, '#06080b');
  rect(g, 135, 42, 8, GY - 42, '#515a63');
  // Cerca e silhueta industrial ao fundo.
  rect(g, 195, 122, W - 195, 3, '#3b4652');
  for (let x = 205; x < W; x += 24) rect(g, x, 122, 2, 92, '#25303b');
  for (let x = 206; x < W; x += 12) {
    rect(g, x, 130 + ((x / 12) % 2) * 5, 1, 78, '#35414d');
  }
  rect(g, 0, GY, W, VH - GY, '#111820');
  rect(g, 0, GY, W, 2, '#50606c');
  for (let i = 0; i < 75; i++) {
    const x = (rnd() * W) | 0, y = GY + 7 + ((rnd() * 42) | 0);
    rect(g, x, y, 3 + ((rnd() * 11) | 0), 1, rnd() > .45 ? '#273846' : '#1d2a35');
  }
  // Um refletor frio recorta o asfalto molhado sem clarear o portao.
  rect(g, 520, 41, 7, 58, '#333c45');
  rect(g, 505, 94, 36, 6, '#69737c');

  const front = makeBuffer(W, VH), fg = front.x;
  rect(fg, 7, 82, 8, GY - 82, '#3e474f');
  rect(fg, 135, 82, 8, GY - 82, '#3e474f');
  rect(fg, 7, 78, 136, 7, '#5d666f');
  // As ripas do portao sao dinamicas: o Credor vai levanta-las na cena.

  return new Level({
    key: 'ch2_yard', nameKey: 'loc_yard', width: W, groundY: GY,
    ambient: '#182332', layers: [{ c: main.c, par: 1 }], fores: [{ c: front.c, par: 1 }],
    lightDefs: [
      { x: 92, y: 116, r: 146, color: '#b06f4d', i: 0.34, falloff: 1.4, flick: 'bulb' },
      { x: 522, y: 101, r: 250, color: '#779fc7', i: 0.48, falloff: 1.25 },
    ],
    interactables: [], minX: 34, maxX: W - 34, spawn: { x: 126, facing: 1 },
    reflect: 0.22, bloom: 0.52, indoor: false, material: 'wet', weather: 'rain', rainIntensity: 1.35,
    ambience: [{ n: 'rain', g: 0.16 }, { n: 'wind', g: 0.06 }], maxInimigos: 0,
  });
}

export function buildCombatLab() {
  const W = 1320, main = shell(W, 7501, '#242a30'), g = main.x;
  rect(g, 0, GY, 430, 4, '#565e66');
  rect(g, 430, GY, 430, 4, '#665d52');
  rect(g, 860, GY, 460, 4, '#6b8297');
  for (const x of [300, 660, 1010]) {
    rect(g, x, GY - 70, 8, 70, '#4d555d'); rect(g, x - 28, GY - 70, 64, 5, '#646d76');
  }
  const lights = [180, 500, 820, 1140].map(x => ({ x, y: 52, r: 190, color: '#d29a62', i: 0.66, falloff: 1.15 }));
  const lv = new Level({
    key: 'ch2_combatlab', nameKey: 'loc_combatlab', width: W, groundY: GY,
    ambient: '#303947', layers: [{ c: main.c, par: 1 }], fores: [{ c: fore(W).c, par: 1.1 }],
    lightDefs: lights, interactables: [
      { id: 'combatlab_reset', x: 54, y: GY - 46, w: 34, h: 46, action: 'combatlab_reset', prompt: 'prompt_reset', range: 30, prio: 5 },
    ],
    minX: 34, maxX: W - 34, spawn: { x: 120, facing: 1 }, reflect: 0.04, bloom: 0.5,
    indoor: true, material: 'metal', ambience: [{ n: 'hall', g: 0.08 }], maxInimigos: 0,
  });
  lv.materialAt = x => x < 430 ? 'metal' : x < 860 ? 'concrete' : 'ice';
  return lv;
}

export function buildChaseExtension() {
  return {
    ch2_service: buildServiceRoute(),
    ch2_service_long: buildLongRoute(),
    ch2_escape_cold: buildEscapeFreezer(),
    ch2_chainbay: buildChainBay(),
    ch2_yard: buildRainYard(),
    ch2_combatlab: buildCombatLab(),
  };
}
