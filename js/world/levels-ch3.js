// levels-ch3.js — os setores do Capitulo 3, "GAVETA D".
//
// O Capitulo 2 termina no Patio de Carga, na chuva, com o Credor atras da
// grade olhando. O Capitulo 3 comeca com David subindo a escadaria da
// delegacia onde ele trabalhou — que esta ACESA e FUNCIONANDO as 02h14.
//
// A REGRA DO CAPITULO: nao ha combate. A arma fica no escaninho 214 da
// portaria. O capitulo inteiro e andar, olhar e conversar. Depois de uma
// hora de motosserra, esse e o contraste.
//
//   1 rua e recepcao ..... a arma no escaninho. O Credor esperando a vez.
//   2 plantao ............ MICHAEL. Quatro versoes da mesma noite.
//   3 a mesa dele ........ degrau 2 do cigarro. A gaveta dos cartazes.
//   4 arquivo morto ...... a GAVETA D. O corredor mais longo na volta.
//   5 sete anos atras .... flashback jogavel. Sem inimigo, sem sanidade.
//   6 a cela ............. CARLOS. DEGRAU 4. E o nome.
//
// ----------------------------------------------------------------------
// A REGRA NUMERICA DE LUZ (erro M-04, ja cometido duas vezes no projeto):
// em qualquer setor acima de 800px, lampada forte a cada ~400px E
// preenchimento fraco a cada ~200px na altura do chao. Nao e sensibilidade,
// e numero. A funcao `preencher()` no fim deste arquivo faz isso sozinha, e
// TODO setor daqui chama ela.
// ----------------------------------------------------------------------

import { VW, VH, makeBuffer, mulberry32 } from '../core/gfx.js';
import { PAL } from '../art/palette.js';
import { rect, grainRect, ditherV } from '../art/pixel.js';
import * as M from './materials.js';
import { Level } from './levels.js';

const GY = 214;

// ---------------------------------------------------------------------------
// pinceis de delegacia — so existem aqui
// ---------------------------------------------------------------------------

// Divisoria de vidro aramado com uma SALA ATRAS. E o truque de profundidade
// mais barato do capitulo: em vez de parede chapada, o jogador ve dois ou
// tres comodos ao fundo, cada um mais escuro. (ROTEIRO IX.7.B.2)
function glassPartition(g, x, y, w, h, seed, fundo = '#0e1319') {
  const rnd = mulberry32(seed);
  rect(g, x, y, w, h, fundo);
  // moveis vagos la dentro, sempre mais escuros que a frente
  let px = x + 6;
  while (px < x + w - 14) {
    const bw = 14 + Math.floor(rnd() * 22);
    const bh = 12 + Math.floor(rnd() * 26);
    rect(g, px, y + h - bh, bw, bh, rnd() > 0.5 ? '#151b22' : '#121820');
    rect(g, px, y + h - bh, bw, 1, '#1d242c');
    px += bw + 4 + Math.floor(rnd() * 10);
  }
  // vidro: malha de arame e o brilho de cima
  for (let gx = x; gx < x + w; gx += 7) rect(g, gx, y, 1, h, '#1b2229');
  for (let gy = y; gy < y + h; gy += 7) rect(g, x, gy, w, 1, '#1b2229');
  rect(g, x, y, w, 2, '#39434f');
  rect(g, x, y + h - 2, w, 2, '#252d36');
  rect(g, x, y, 2, h, '#2f3843');
  rect(g, x + w - 2, y, 2, h, '#2f3843');
  // reflexo diagonal, para o vidro nao virar buraco
  for (let i = 0; i < h; i += 2) {
    const rx = x + 8 + Math.floor(i * 0.7);
    if (rx < x + w - 3) rect(g, rx, y + i, 2, 1, '#3d4855');
  }
}

// Mesa de plantao com maquina de escrever, papel demais e um telefone.
function precinctDesk(g, x, gy, seed, comMaquina = true) {
  const rnd = mulberry32(seed);
  const w = 74, h = 30;
  const y = gy - h;
  rect(g, x, y, w, 5, '#54402a');
  rect(g, x, y, w, 1, '#6f5436');
  rect(g, x + 3, y + 5, 5, h - 5, '#3a2c1d');
  rect(g, x + w - 8, y + 5, 5, h - 5, '#3a2c1d');
  rect(g, x + 8, y + 5, w - 16, 16, '#42321f');
  for (let i = 0; i < 3; i++) rect(g, x + 12, y + 9 + i * 5, w - 24, 1, '#2b2013');
  // pilhas de papel
  for (let i = 0; i < 3; i++) {
    const px = x + 6 + Math.floor(rnd() * (w - 24));
    const ph = 3 + Math.floor(rnd() * 5);
    rect(g, px, y - ph, 15, ph, '#b6ae9a');
    rect(g, px, y - ph, 15, 1, '#d0c8b4');
    for (let l = 1; l < ph; l++) rect(g, px, y - ph + l, 15, 1, l % 2 ? '#9c9482' : '#b6ae9a');
  }
  if (comMaquina) {
    // maquina de escrever: e o som do plantao e a letra do jogo
    const mx = x + 40, my = y - 14;
    rect(g, mx, my + 6, 26, 8, '#22262b');
    rect(g, mx, my + 6, 26, 1, '#333940');
    rect(g, mx + 2, my, 22, 7, '#2b3138');
    rect(g, mx + 4, my - 4, 18, 5, '#c9c1a8');
    for (let k = 0; k < 9; k++) rect(g, mx + 3 + k * 2.4 | 0, my + 8, 1, 2, '#4a525c');
  }
  // telefone preto de disco
  rect(g, x + 10, y - 8, 16, 8, '#16181c');
  rect(g, x + 10, y - 8, 16, 1, '#282c33');
  rect(g, x + 12, y - 11, 12, 3, '#1d2026');
  rect(g, x + 15, y - 5, 6, 4, '#33383f');
}

// Arquivo de aco de corredor. Fileira inteira, para o subsolo ler como
// arquivo morto e nao como sala com um movel.
function fileRow(g, x, gy, n, seed, faltando = -1) {
  const w = 40, h = 82;
  const y = gy - h;
  const rnd = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const fx = x + i * (w + 2);
    rect(g, fx, y, w, h, '#333c46');
    rect(g, fx, y, w, 2, '#465260');
    rect(g, fx + w - 1, y, 1, h, '#1e252c');
    for (let d = 0; d < 4; d++) {
      const dy = y + 5 + d * 19;
      if (i === faltando && d === 1) { rect(g, fx + 3, dy, w - 6, 16, '#07090c'); continue; }
      rect(g, fx + 3, dy, w - 6, 16, '#3c4650');
      rect(g, fx + 3, dy, w - 6, 1, '#505c69');
      rect(g, fx + 14, dy + 6, 12, 3, '#8f959e');
      // etiqueta de letra
      rect(g, fx + 5, dy + 4, 7, 7, '#b9b0a2');
    }
    grainRect(g, fx, y, w, h, ['#232a32', '#4a5460'], 0.035, seed + i * 13);
  }
}

// Ventilador de teto. Nao e enfeite: cenario parado le como parede pintada,
// cenario que se mexe le como espaco. (ROTEIRO IX.7.B.4)
function ceilingFan(g, x, y) {
  rect(g, x - 1, y, 2, 10, '#2a3038');
  rect(g, x - 4, y + 10, 8, 3, '#39414a');
}

// Grade de cela. As barras vao ate o chao e o vao entre elas mostra o
// interior, mais escuro.
// A cela e desenhada em DUAS partes, e a divisao importa: o fundo vai na
// camada normal e as BARRAS vao numa camada de primeiro plano. Sem isso o
// homem preso aparece na frente da propria grade — e, pior, a versao
// anterior pintava o interior inteiro por cima de todo mundo.
function cellBack(g, x, y, w, h, seed) {
  rect(g, x, y, w, h, '#090c10');
  grainRect(g, x + 2, y + 4, w - 4, h - 6, ['#12171d', '#080a0e'], 0.05, seed);
}

function cellBarsOnly(g, x, y, w, h) {
  for (let bx = x + 2; bx < x + w - 2; bx += 9) {
    rect(g, bx, y, 3, h, '#3b444f');
    rect(g, bx, y, 1, h, '#525d6a');
    rect(g, bx + 2, y, 1, h, '#252c34');
  }
  rect(g, x, y, w, 4, '#454f5b');
  rect(g, x, y + h - 3, w, 3, '#333b45');
  rect(g, x, y, 4, h, '#454f5b');
  rect(g, x + w - 4, y, 4, h, '#454f5b');
}

// Escaninho de armas da portaria. Numerado, e um deles e o 214.
function weaponLockers(g, x, y, cols, rows, seed, destaque = -1) {
  const cw = 17, ch = 13;
  const rnd = mulberry32(seed);
  rect(g, x - 2, y - 2, cols * cw + 4, rows * ch + 4, '#2b333c');
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const lx = x + c * cw, ly = y + r * ch;
      const aberto = i === destaque;
      rect(g, lx, ly, cw - 1, ch - 1, aberto ? '#0a0d11' : '#3d4650');
      rect(g, lx, ly, cw - 1, 1, aberto ? '#151b21' : '#4e5964');
      if (!aberto) {
        rect(g, lx + cw - 6, ly + 5, 3, 3, '#8f959e');
        rect(g, lx + 3, ly + 4, 6, 4, '#8b8272');
      } else {
        // a arma que ja esta dentro dele
        rect(g, lx + 3, ly + 6, 9, 3, '#22262c');
        rect(g, lx + 3, ly + 5, 4, 2, '#2d3238');
      }
      if (rnd() > 0.93) rect(g, lx + 2, ly + 2, cw - 5, ch - 5, '#343d47');
    }
  }
}

// Painel de senha de atendimento. O numero sobe sozinho ao longo do
// capitulo — quem desenha o digito e o proprio jogo, por quadro.
function ticketPanel(g, x, y) {
  rect(g, x - 2, y - 2, 44, 24, '#1a1e24');
  rect(g, x - 2, y - 2, 44, 1, '#2c333c');
  rect(g, x, y, 40, 20, '#0a0d10');
  rect(g, x, y, 40, 1, '#161b21');
}

// Cadeira de espera de plastico, em fila presa por uma barra.
function waitingSeats(g, x, gy, n, seed) {
  rect(g, x, gy - 4, n * 20 + 4, 3, '#2a3038');
  for (let i = 0; i < n; i++) {
    const sx = x + 2 + i * 20;
    rect(g, sx, gy - 20, 17, 4, '#3f4a44');
    rect(g, sx, gy - 20, 17, 1, '#53605a');
    rect(g, sx + 14, gy - 34, 3, 15, '#3f4a44');
    rect(g, sx + 1, gy - 4, 2, 4, '#232930');
    rect(g, sx + 13, gy - 4, 2, 4, '#232930');
  }
  grainRect(g, x, gy - 34, n * 20 + 4, 34, ['#2a322e', '#48544e'], 0.03, seed);
}

// ---------------------------------------------------------------------------
// A REGRA NUMERICA DE LUZ
//
// Chame isto em TODO setor. Ele so acrescenta preenchimento fraco na altura
// do chao a cada `passo` pixels — as lampadas fortes continuam sendo
// colocadas a mao, onde a cena pede.
// ---------------------------------------------------------------------------

function preencher(lights, W, cor = '#8a7a60', i = 0.2, passo = 200, y = GY - 30) {
  for (let x = passo / 2; x < W; x += passo) {
    lights.push({ x: Math.round(x), y, r: 118, color: cor, i, falloff: 1.35 });
  }
  return lights;
}

// Confere a regra e devolve o que falta. Usado pelo teste de regressao: e
// mais barato do que descobrir de novo, na mao, que um setor ficou preto.
export function auditarLuz(lvl, passoForte = 400) {
  if (!lvl || lvl.width <= 800) return { ok: true, vaos: [] };
  const xs = (lvl.lightDefs || []).filter(f => f.i >= 0.35).map(f => f.x).sort((a, b) => a - b);
  const vaos = [];
  let ant = 0;
  for (const x of xs) {
    if (x - ant > passoForte) vaos.push([ant, x]);
    ant = x;
  }
  if (lvl.width - ant > passoForte) vaos.push([ant, lvl.width]);
  return { ok: vaos.length === 0, vaos };
}

function itensSoltos(lvl, defs) {
  lvl.pego = lvl.pego || {};
  lvl.itemDefs = (lvl.itemDefs || []).concat(defs);
  const antes = lvl.drawProps;
  lvl.drawProps = (ctx, cam) => {
    if (antes) antes(ctx, cam);
    for (const d of defs) {
      if (d.disabled || lvl.pego[d.id] || (d.visible && !d.visible())) continue;
      d.draw(ctx, Math.round(d.x - cam.ix), Math.round(d.y - cam.iy));
    }
  };
}

// ---------------------------------------------------------------------------
// 1 — RUA E RECEPCAO
// ---------------------------------------------------------------------------
// FUNCAO: transicao da chuva. Tirar a arma do jogador sem roubar nada dele.
// E a sala de espera, onde o Credor esta sentado com uma senha na mao.

export function buildReception() {
  const W = 1080;

  // fundo: a rua molhada continua visivel pela porta de vidro
  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.45) + 8, VH);
  {
    const b = back.x;
    rect(b, 0, 0, b.canvas.width, VH, '#070a0f');
    ditherV(b, 0, 30, b.canvas.width, 130, '#131a24', '#070a0f', 6);
    for (let i = 0; i < 5; i++) {
      M.buildingSilhouette(b, i * 150 - 20, 150, 110, 100 + i * 9, '#0d1218', 9101 + i, true);
    }
  }

  const main = makeBuffer(W, VH);
  const g = main.x;

  // parede de pedra encardida, rodape de azulejo institucional
  rect(g, 0, 0, W, VH, '#171b21');
  M.brickWall(g, 0, 20, W, GY - 20, 9111, { hi: '#4a4a44', mid: '#36362f', dk: '#232320' });
  rect(g, 0, GY - 52, W, 52, '#2b3138');
  for (let x = 0; x < W; x += 16) rect(g, x, GY - 52, 1, 52, '#232930');
  for (let y = GY - 52; y < GY; y += 16) rect(g, 0, y, W, 1, '#232930');
  rect(g, 0, GY - 54, W, 3, '#3d4650');
  rect(g, 0, 0, W, 20, '#101318');
  M.asphalt(g, 0, GY, W, VH - GY, 9121, { hi: '#3c3a36', mid: '#2c2a27', dk: '#1d1c1a' });
  rect(g, 0, GY, W, 1, '#0b0a09');

  const inter = [];
  const lights = [];

  // ---- a escadaria e a porta da rua (esquerda) ----
  for (let i = 0; i < 4; i++) rect(g, 20, GY - 4 - i * 3, 60 - i * 8, 3, '#3a3833');
  rect(g, 36, GY - 16, 3, 16, '#4a4842');   // o degrau solto
  inter.push({ x: 28, y: GY - 20, w: 40, h: 20, prompt: 'prompt_look', lines: 'c3_step', range: 26 });

  // ---- balcao da portaria ----
  //
  // A ENCENACAO E O TRUQUE INTEIRO AQUI. O balcao estava pintado na camada
  // de tras e o vidro era um retangulo preto solido: o plantonista era
  // desenhado DEPOIS da camada, entao ele flutuava na frente do movel, e
  // mesmo se estivesse atras nao daria para ver nada atraves do vidro.
  //
  // Agora: o nicho e a bancada ficam ATRAS (aqui). A frente do balcao e a
  // moldura do vidro vao para uma camada de PRIMEIRO PLANO em 1:1 (`guiche`,
  // no fim da funcao), que e desenhada depois das pessoas. Assim ele fica
  // sentado DENTRO da guarita, com as pernas escondidas pelo balcao e a
  // cabeca e o tronco aparecendo pelo vidro e pela abertura.
  const BAL = 250;
  // nicho: a parede do fundo da guarita, mais escura que a sala
  rect(g, BAL + 4, GY - 96, 112, 96, '#161c22');
  ditherV(g, BAL + 4, GY - 96, 112, 60, '#1e262e', '#12181e', 5);
  // prateleira de fichario atras dele, para o nicho nao ser um vazio
  rect(g, BAL + 10, GY - 90, 44, 5, '#2f3a44');
  for (let i = 0; i < 5; i++) rect(g, BAL + 12 + i * 8, GY - 100, 6, 10, '#5a5140');
  // a bancada em que ele trabalha, POR DENTRO
  rect(g, BAL + 6, GY - 40, 108, 4, '#54402a');
  rect(g, BAL + 6, GY - 40, 108, 1, '#6f5436');
  // papel e um telefone em cima dela
  rect(g, BAL + 16, GY - 45, 14, 5, '#b6ae9a');
  rect(g, BAL + 84, GY - 48, 16, 8, '#16181c');
  rect(g, BAL + 86, GY - 51, 12, 3, '#1d2026');
  // banco alto: e por isso que a cabeca dele chega na altura do vidro
  rect(g, BAL + 52, GY - 26, 16, 4, '#3a2c1d');
  rect(g, BAL + 55, GY - 22, 3, 22, '#2f251a');
  rect(g, BAL + 62, GY - 22, 3, 22, '#2f251a');
  lights.push({ x: BAL + 60, y: GY - 70, r: 128, color: '#e8bc80', i: 0.62, falloff: 1.0 });
  lights.push({ x: BAL + 60, y: GY - 52, r: 74, color: '#ffdca8', i: 0.4 });

  // ---- os escaninhos de arma, e o 214 ----
  const ESC = 400;
  weaponLockers(g, ESC, GY - 96, 6, 4, 9131, 13);
  inter.push({
    x: ESC, y: GY - 96, w: 104, h: 56, prompt: 'prompt_use',
    action: 'ch3_escaninho', range: 30, id: 'escaninho', prio: 1,
  });
  lights.push({ x: ESC + 50, y: GY - 100, r: 108, color: '#a89a70', i: 0.4, falloff: 1.15 });

  // ---- quadro de homenagens: a foto dele ainda esta la ----
  const QUA = 560;
  rect(g, QUA, GY - 108, 96, 54, '#2f2419');
  rect(g, QUA + 2, GY - 106, 92, 50, '#463726');
  for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) {
    rect(g, QUA + 6 + c * 18, GY - 102 + r * 24, 14, 18, '#6d6455');
    rect(g, QUA + 8 + c * 18, GY - 100 + r * 24, 10, 8, '#8f8472');
  }
  inter.push({ x: QUA, y: GY - 108, w: 96, h: 54, prompt: 'prompt_look', lines: 'c3_wall', range: 30 });

  // ---- SALA DE ESPERA: as cadeiras, o painel de senha, e o Credor ----
  const ESP = 700;
  waitingSeats(g, ESP, GY, 6, 9141);
  ticketPanel(g, ESP + 44, GY - 118);
  inter.push({ x: ESP + 40, y: GY - 122, w: 48, h: 28, prompt: 'prompt_look', action: 'ch3_senha', range: 30 });
  // a cadeira do lado da dele: da para sentar, e nao acontece nada
  inter.push({
    x: ESP + 22, y: GY - 34, w: 20, h: 34, prompt: 'prompt_use',
    action: 'ch3_sentar', range: 22, id: 'cadeira',
  });
  lights.push({ x: ESP + 60, y: 30, r: 190, color: '#b9c4b0', i: 0.62, flick: 'neon', falloff: 1.0 });
  lights.push({ x: ESP + 60, y: 30, r: 26, color: '#e6f0e0', i: 0.5 });

  // ---- porta para o plantao (direita) ----
  const ex = M.doorFrame(g, W - 90, GY, 9151);
  inter.push({
    x: ex.x, y: ex.y, w: ex.w, h: ex.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch3_plantao', tox: 70, tofacing: 1, range: 30, isDoor: true, prio: 1,
    // ⚠ SEM ENTREGAR OS PERTENCES ELE NAO PASSA. Nao e confisco de roteiro,
    // e a porta — e e a segunda vez na vida dele que ele entrega uma arma
    // naquele balcao. A regra ele conhece: foi ele que aplicou essa regra a
    // vida inteira, no mesmo lugar.
    precisa: 'arma_guardada', semChave: 'b3_rec_barrado', aviso: 'aviso_barrado',
  });
  lights.push({ x: W - 70, y: GY - 90, r: 150, color: '#c8a06a', i: 0.5, falloff: 1.1 });

  // fluorescentes ao longo do teto — a regra dos 400px, a mao
  for (let x = 120; x < W; x += 380) {
    rect(g, x - 20, 24, 40, 4, '#39414a');
    rect(g, x - 17, 28, 34, 2, '#e8f0e0');
    lights.push({ x, y: 32, r: 172, color: '#b6c2b4', i: 0.5, flick: 'neon', falloff: 1.1 });
  }
  preencher(lights, W, '#8a8a74', 0.2);

  // ---- A GUARITA, em primeiro plano 1:1 ----
  //
  // Camada propria porque ela precisa alinhar EXATAMENTE com o cenario
  // (par: 1) e ainda assim ser desenhada depois das pessoas. A coluna e o
  // teto, mais adiante, ficam noutra camada com paralaxe maior.
  const guiche = makeBuffer(W, VH);
  {
    const q = guiche.x;
    // a frente do balcao: e ela que esconde as pernas dele
    rect(q, BAL, GY - 40, 120, 40, '#43321f');
    rect(q, BAL, GY - 40, 120, 3, '#5e482c');
    rect(q, BAL, GY - 42, 120, 2, '#6f5436');
    grainRect(q, BAL, GY - 40, 120, 40, ['#33261a', '#5e482c'], 0.05, 9161);
    // vidro: so moldura, montantes e dois riscos de reflexo. O resto e
    // transparente — o jogador PRECISA ver a pessoa do outro lado.
    rect(q, BAL + 4, GY - 96, 112, 3, '#39434f');
    rect(q, BAL + 4, GY - 96, 3, 56, '#2f3843');
    rect(q, BAL + 113, GY - 96, 3, 56, '#2f3843');
    rect(q, BAL + 4, GY - 43, 112, 3, '#2b333c');
    for (const mx of [BAL + 36, BAL + 82]) rect(q, mx, GY - 96, 2, 56, '#2b333c');
    for (let i = 0; i < 34; i += 2) {
      rect(q, BAL + 10 + i, GY - 92 + i, 2, 1, '#4a5768');
      rect(q, BAL + 88 + (i >> 1), GY - 90 + i, 1, 1, '#3d4855');
    }
    // A ABERTURA. Fica em frente ao rosto dele, e e por onde a conversa
    // acontece: um recorte limpo, sem vidro nenhum na frente.
    q.clearRect(BAL + 42, GY - 62, 34, 20);
    rect(q, BAL + 42, GY - 64, 34, 2, '#6f5436');
    rect(q, BAL + 42, GY - 42, 34, 2, '#6f5436');
  }

  // PRIMEIRO PLANO: uma coluna e um cabo atravessam NA FRENTE do personagem.
  // Oclusao em primeiro plano e o maior ganho de profundidade de um
  // side-scroller, e e o que menos existia no jogo. (ROTEIRO IX.7.B.1)
  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.25) + 8, VH);
  {
    const f = fore.x;
    rect(f, 0, 0, f.canvas.width, 12, '#040507');
    rect(f, 0, VH - 8, f.canvas.width, 8, '#040507');
    for (const cx of [150, 620, 1010]) {
      rect(f, cx, 0, 16, VH, '#0a0c10');
      rect(f, cx, 0, 2, VH, '#151a20');
      rect(f, cx + 14, 0, 2, VH, '#06080b');
    }
  }

  const lvl = new Level({
    key: 'ch3_reception',
    // O corredor passa NA FRENTE deste movel: o primeiro plano entra
    // antes do jogador para o preso/plantonista continuarem atras da
    // grade e do vidro, e o David passar na frente dos dois.
    playerSobreFore: true,
    nameKey: 'loc_reception',
    width: W, groundY: GY,
    ambient: '#333d4c',
    layers: [{ c: back.c, par: 0.45 }, { c: main.c, par: 1 }],
    // A guarita vem ANTES da coluna: as duas sao primeiro plano, mas a
    // guarita anda junto com o cenario (1:1) e a coluna anda mais rapido.
    fores: [{ c: guiche.c, par: 1 }, { c: fore.c, par: 1.25 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'none',
    reflect: 0.08,
    minX: 24, maxX: W - 44,
    spawn: { x: 44, facing: 1 },
    bloom: 0.44,
    indoor: true, safe: true,
    material: 'tile',
    ambience: [{ n: 'roomtone', g: 0.11 }, { n: 'hum', g: 0.03 }],
    randomSfx: [{ fn: 'phoneRing', min: 22, max: 50, vol: 0.22 }],
    maxInimigos: 0,
    enterBarks: ['b3_rec_1', 'b3_rec_2'],
    barks: [
      { x: 420, key: 'b3_rec_3' },
      { x: 700, key: 'b3_rec_4' },
    ],
  });
  return lvl;
}

// ---------------------------------------------------------------------------
// 2 — O PLANTAO
// ---------------------------------------------------------------------------
// FUNCAO: o maior bloco de conversa do jogo ate aqui. MICHAEL.

export function buildSquadRoom() {
  const W = 1400;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.5) + 8, VH);
  {
    const b = back.x;
    rect(b, 0, 0, b.canvas.width, VH, '#0a0e13');
    // SALAS ATRAS DA PAREDE: tres comodos, cada um mais escuro
    glassPartition(b, 20, 46, 150, 110, 9201, '#101720');
    glassPartition(b, 200, 52, 130, 104, 9211, '#0d141b');
    glassPartition(b, 360, 46, 170, 110, 9221, '#0b1118');
    glassPartition(b, 560, 52, 140, 104, 9231, '#0e151c');
  }

  const main = makeBuffer(W, VH);
  const g = main.x;

  rect(g, 0, 0, W, VH, '#181c22');
  // gesso institucional, rodape verde de reparticao
  ditherV(g, 0, 22, W, 96, '#4c5348', '#343a32', 6);
  grainRect(g, 0, 22, W, 96, ['#2a2f28', '#575f52', '#1e221c'], 0.055, 9241);
  rect(g, 0, GY - 96, W, 44, '#2f3a33');
  rect(g, 0, GY - 98, W, 3, '#425046');
  M.woodPanel(g, 0, GY - 52, W, 52, 9251, { hi: '#54402a', mid: '#3d2e1e', dk: '#261c12' });
  rect(g, 0, 0, W, 22, '#0e1116');
  M.asphalt(g, 0, GY, W, VH - GY, 9261, { hi: '#403c34', mid: '#302d27', dk: '#201e1a' });
  rect(g, 0, GY, W, 1, '#0c0b09');

  const inter = [];
  const lights = [];

  // volta para a recepcao
  const ex0 = M.doorFrame(g, 30, GY, 9271);
  inter.push({
    x: ex0.x, y: ex0.y, w: ex0.w, h: ex0.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch3_reception', tox: 990, tofacing: -1, range: 30, isDoor: true, prio: 1,
  });

  // ---- as quatro mesas ----
  const MESAS = [200, 430, 700, 980];
  for (let i = 0; i < MESAS.length; i++) precinctDesk(g, MESAS[i], GY, 9281 + i * 17, i !== 2);

  // MICHAEL na mesa em frente a que era do David
  // os tres colegas — quatro versoes da mesma noite

  // ---- o relogio de parede: 02h14, e o ponteiro de segundos ANDA ----
  const REL = 620;
  rect(g, REL, 40, 30, 30, '#2a2620');
  rect(g, REL + 2, 42, 26, 26, '#cfc6b0');
  rect(g, REL + 2, 42, 26, 1, '#8b8272');
  rect(g, REL + 15, 48, 1, 8, '#241c18');      // hora, no 2
  rect(g, REL + 16, 55, 6, 1, '#241c18');      // minuto, no 14
  inter.push({ x: REL, y: 40, w: 30, h: 30, prompt: 'prompt_look', lines: 'c3_clock', range: 30 });

  // ---- quadro de casos ----
  rect(g, 800, 44, 120, 60, '#3a2b1c');
  rect(g, 802, 46, 116, 56, '#54452e');
  {
    const rnd = mulberry32(9291);
    for (let i = 0; i < 10; i++) {
      const px = 806 + Math.floor(rnd() * 100), py = 50 + Math.floor(rnd() * 44);
      rect(g, px, py, 12 + Math.floor(rnd() * 8), 9, '#a89a80');
      rect(g, px, py, 12, 1, '#c4b79b');
    }
  }
  inter.push({ x: 800, y: 44, w: 120, h: 60, prompt: 'prompt_look', lines: 'c3_cases', range: 30 });

  // ---- livro de ocorrencias ----
  rect(g, 1120, GY - 36, 46, 6, '#43321f');
  rect(g, 1128, GY - 44, 30, 8, '#b6ae9a');
  rect(g, 1128, GY - 44, 30, 1, '#d0c8b4');
  inter.push({ x: 1120, y: GY - 48, w: 46, h: 22, prompt: 'prompt_look', lines: 'c3_blotter', range: 26 });

  // ---- maquina de cafe ----
  rect(g, 1230, GY - 62, 30, 62, '#33393f');
  rect(g, 1230, GY - 62, 30, 2, '#454d55');
  rect(g, 1234, GY - 54, 22, 16, '#0e1216');
  rect(g, 1236, GY - 30, 18, 10, '#1a1f24');
  inter.push({ x: 1230, y: GY - 62, w: 30, h: 62, prompt: 'prompt_look', lines: 'c3_coffee', range: 26 });

  // ---- porta para a mesa dele, e a escada para o subsolo ----
  const ex1 = M.doorFrame(g, 1300, GY, 9301);
  inter.push({
    x: ex1.x, y: ex1.y, w: ex1.w, h: ex1.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch3_desk', tox: 60, tofacing: 1, range: 30, isDoor: true, prio: 1,
  });

  // ventiladores de teto girando
  for (const fx of [340, 760, 1180]) ceilingFan(g, fx, 22);

  // fluorescentes: a regra dos 400px
  for (let x = 160; x < W; x += 360) {
    rect(g, x - 26, 24, 52, 4, '#39414a');
    rect(g, x - 22, 28, 44, 2, '#eef4e6');
    lights.push({ x, y: 34, r: 186, color: '#c2ccb8', i: 0.58, flick: 'neon', falloff: 1.05 });
  }
  // luminaria de mesa em cada posto
  for (const mx of MESAS) lights.push({ x: mx + 40, y: GY - 56, r: 104, color: '#e8b46a', i: 0.42, falloff: 1.0 });
  // a luz que vaza das salas de tras
  lights.push({ x: 300, y: 96, r: 130, color: '#5c78a8', i: 0.2, falloff: 1.4 });
  lights.push({ x: 900, y: 96, r: 130, color: '#5c78a8', i: 0.18, falloff: 1.4 });
  preencher(lights, W, '#8a8a74', 0.2);

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.2) + 8, VH);
  {
    const f = fore.x;
    rect(f, 0, 0, f.canvas.width, 12, '#040507');
    rect(f, 0, VH - 8, f.canvas.width, 8, '#040507');
    // colunas e um armario de aco passando na frente
    for (const cx of [90, 540, 1180, 1600]) {
      rect(f, cx, 0, 18, VH, '#0a0c10');
      rect(f, cx, 0, 2, VH, '#171d24');
    }
  }

  const lvl = new Level({
    key: 'ch3_plantao',
    nameKey: 'loc_squad',
    width: W, groundY: GY,
    ambient: '#3a4453',
    layers: [{ c: back.c, par: 0.5 }, { c: main.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.2 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'none',
    reflect: 0.06,
    minX: 26, maxX: W - 44,
    spawn: { x: 70, facing: 1 },
    bloom: 0.46,
    indoor: true, safe: true,
    material: 'wood',
    ambience: [{ n: 'roomtone', g: 0.12 }, { n: 'hum', g: 0.04 }],
    randomSfx: [
      { fn: 'phoneRing', min: 14, max: 34, vol: 0.2 },
      { fn: 'writing', min: 5, max: 13, vol: 0.35 },
    ],
    maxInimigos: 0,
    enterBarks: ['b3_sq_1', 'b3_sq_2'],
    barks: [{ x: 640, key: 'b3_sq_3' }, { x: 1140, key: 'b3_sq_4' }],
  });
  return lvl;
}

// ---------------------------------------------------------------------------
// 3 — A MESA DELE
// ---------------------------------------------------------------------------
// FUNCAO: caracterizacao pura. Degrau 2 do cigarro. A gaveta dos cartazes.

export function buildOldDesk() {
  const W = 620;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.55) + 8, VH);
  {
    const b = back.x;
    rect(b, 0, 0, b.canvas.width, VH, '#0a0d12');
    glassPartition(b, 40, 50, 160, 106, 9401, '#0c1219');
    glassPartition(b, 240, 56, 140, 100, 9411, '#0a1016');
  }

  const main = makeBuffer(W, VH);
  const g = main.x;

  rect(g, 0, 0, W, VH, '#171b20');
  ditherV(g, 0, 22, W, 100, '#4a5146', '#323830', 6);
  grainRect(g, 0, 22, W, 100, ['#282d26', '#545c4f', '#1c201a'], 0.05, 9421);
  rect(g, 0, GY - 52, W, 52, '#2e3932');
  rect(g, 0, GY - 54, W, 3, '#414f45');
  rect(g, 0, 0, W, 22, '#0d1015');
  M.asphalt(g, 0, GY, W, VH - GY, 9431, { hi: '#3e3a33', mid: '#2e2b26', dk: '#1e1c19' });
  rect(g, 0, GY, W, 1, '#0b0a09');

  const inter = [];
  const lights = [];

  const ex0 = M.doorFrame(g, 30, GY, 9441);
  inter.push({
    x: ex0.x, y: ex0.y, w: ex0.w, h: ex0.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch3_plantao', tox: 1290, tofacing: -1, range: 30, isDoor: true, prio: 1,
  });

  // ---- A MESA. Poeira em tudo, menos na cadeira. ----
  const MESA = 230;
  precinctDesk(g, MESA, GY, 9451, true);
  M.chair(g, MESA + 30, GY, 0, 9461);
  inter.push({ x: MESA, y: GY - 40, w: 74, h: 40, prompt: 'prompt_look', lines: 'c3_desk', range: 30 });

  // cinzeiro CHEIO
  rect(g, MESA + 58, GY - 36, 12, 5, '#5a5248');
  rect(g, MESA + 59, GY - 37, 10, 2, '#3a352e');
  for (let i = 0; i < 5; i++) rect(g, MESA + 60 + i * 2, GY - 38, 1, 2, '#c9c1a8');
  inter.push({ x: MESA + 54, y: GY - 42, w: 20, h: 14, prompt: 'prompt_look', lines: 'c3_ashtray', range: 22 });

  // a foto, virada para baixo
  rect(g, MESA + 14, GY - 34, 16, 3, '#2a2018');
  rect(g, MESA + 15, GY - 35, 14, 2, '#6a6152');
  inter.push({
    x: MESA + 10, y: GY - 40, w: 22, h: 14, prompt: 'prompt_look',
    action: 'ch3_foto', range: 22, id: 'foto',
  });

  // a gaveta de baixo, trancada, com a chave na fechadura
  rect(g, MESA + 4, GY - 24, 26, 22, '#3a2c1d');
  rect(g, MESA + 4, GY - 24, 26, 1, '#4e3c28');
  rect(g, MESA + 14, GY - 16, 7, 2, '#8f959e');
  rect(g, MESA + 17, GY - 15, 1, 4, '#c8b070');
  inter.push({
    x: MESA + 2, y: GY - 26, w: 30, h: 26, prompt: 'prompt_use',
    action: 'ch3_gaveta', range: 24, id: 'gaveta_mesa', prio: 1,
  });

  // ---- O ARMARIO DE PAREDE, E O QUE ESTA DENTRO DELE ----
  //
  // A calibre doze que ele guardava na delegacia, e que continua no lugar
  // porque ninguem esvaziou a mesa dele. Ela e a arma do Capitulo 4, e ele
  // guarda sabendo disso.
  //
  // ⚠ O ARMARIO e pintado na camada; A ARMA, NAO. Pixel pintado na camada
  // nao some, e ela sumia do casaco para dentro e continuava encostada la
  // dentro do movel — dois doze, um deles fantasma. Por isso a arma e as
  // munições sao desenhadas por quadro, via `itensSoltos`, e o armario fica
  // VAZIO no instante em que ele pega. E o mesmo motivo da nota do
  // Capitulo 2: se as coisas continuam onde estavam depois de pegas, o
  // jogador para de acreditar que pegou.
  const ARM = 330;
  rect(g, ARM, GY - 104, 46, 62, '#3a3128');
  rect(g, ARM, GY - 104, 46, 2, '#54483a');
  rect(g, ARM + 2, GY - 102, 42, 58, '#241d17');
  rect(g, ARM + 2, GY - 46, 42, 2, '#54483a');
  inter.push({
    x: ARM, y: GY - 104, w: 46, h: 62, prompt: 'prompt_look',
    action: 'ch3_shotgun', range: 26, id: 'shotgun',
  });

  // o cracha na parede
  rect(g, 420, GY - 118, 24, 30, '#2a2620');
  rect(g, 422, GY - 116, 20, 26, '#8a8272');
  rect(g, 424, GY - 112, 16, 3, '#3a352e');
  rect(g, 424, GY - 104, 16, 10, '#b6ae9a');
  inter.push({ x: 420, y: GY - 118, w: 24, h: 30, prompt: 'prompt_look', lines: 'c3_badge', range: 26 });

  // escada para o subsolo
  const ex1 = M.doorFrame(g, W - 90, GY, 9471);
  inter.push({
    x: ex1.x, y: ex1.y, w: ex1.w, h: ex1.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch3_archive', tox: 60, tofacing: 1, range: 30, isDoor: true, prio: 1,
  });

  for (let x = 140; x < W; x += 340) {
    rect(g, x - 22, 24, 44, 4, '#39414a');
    rect(g, x - 18, 28, 36, 2, '#eef4e6');
    lights.push({ x, y: 34, r: 178, color: '#c2ccb8', i: 0.5, flick: 'neon', falloff: 1.1 });
  }
  lights.push({ x: MESA + 46, y: GY - 58, r: 122, color: '#e8b46a', i: 0.62, falloff: 0.95 });
  preencher(lights, W, '#8a8a74', 0.2);

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.2) + 8, VH);
  {
    const f = fore.x;
    rect(f, 0, 0, f.canvas.width, 12, '#040507');
    rect(f, 0, VH - 8, f.canvas.width, 8, '#040507');
    for (const cx of [110, 500]) { rect(f, cx, 0, 16, VH, '#0a0c10'); rect(f, cx, 0, 2, VH, '#161c22'); }
  }

  const lvl = new Level({
    key: 'ch3_desk',
    nameKey: 'loc_desk',
    width: W, groundY: GY,
    ambient: '#37414f',
    layers: [{ c: back.c, par: 0.55 }, { c: main.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.2 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'none',
    reflect: 0.06,
    minX: 26, maxX: W - 44,
    spawn: { x: 60, facing: 1 },
    bloom: 0.44,
    indoor: true, safe: true,
    material: 'wood',
    ambience: [{ n: 'roomtone', g: 0.1 }, { n: 'hum', g: 0.03 }],
    randomSfx: [{ fn: 'writing', min: 9, max: 22, vol: 0.28 }],
    maxInimigos: 0,
    enterBarks: ['b3_desk_1', 'b3_desk_2'],
  });
  itensSoltos(lvl, [
    {
      // os cartazes. Cinquenta. Novos. Ele fecha a gaveta sem dizer nada.
      id: 'cartazes', x: MESA + 6, y: GY - 22, visible: () => lvl.props.gavetaAberta,
      draw: (ctx, x, y) => {
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = i % 2 ? '#b9b0a2' : '#c6bdae';
          ctx.fillRect(x, y + i, 22, 1);
        }
        ctx.fillStyle = '#7a7062'; ctx.fillRect(x + 7, y, 8, 5);
      },
    },
    {
      // A CALIBRE DOZE dentro do armario: cano duplo, coronha de madeira e
      // a caixa de cartuchos ao lado. Some inteira quando ele pega.
      id: 'shotgun', x: ARM + 13, y: GY - 96,
      draw: (ctx, x, y) => {
        ctx.fillStyle = '#8f959e'; ctx.fillRect(x + 1, y, 5, 34);
        ctx.fillStyle = '#6c727a'; ctx.fillRect(x + 7, y + 2, 3, 30);
        ctx.fillStyle = '#5a4028'; ctx.fillRect(x, y + 34, 7, 16);
        ctx.fillStyle = '#7d5a38'; ctx.fillRect(x, y + 34, 7, 2);
        // a caixa de cartuchos, e os latoes aparecendo na boca dela
        ctx.fillStyle = '#43331f'; ctx.fillRect(x + 13, y + 8, 12, 8);
        ctx.fillStyle = '#c9a03a';
        for (let i = 0; i < 4; i++) ctx.fillRect(x + 15 + i * 3, y + 10, 2, 5);
      },
    },
  ]);
  return lvl;
}

// ---------------------------------------------------------------------------
// 4 — ARQUIVO MORTO (subsolo -1)
// ---------------------------------------------------------------------------
// FUNCAO: a GAVETA D. E o corredor que e mais longo na volta.
//
// E o unico setor do capitulo em que a sanidade cai.

export function buildDeadArchive() {
  const W = 1500;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.35) + 8, VH);
  {
    const b = back.x;
    rect(b, 0, 0, b.canvas.width, VH, '#05070a');
    ditherV(b, 0, 60, b.canvas.width, 120, '#0c1015', '#05070a', 5);
  }

  const main = makeBuffer(W, VH);
  const g = main.x;

  rect(g, 0, 0, W, VH, '#101318');
  M.brickWall(g, 0, 18, W, GY - 18, 9501, { hi: '#3e3e3a', mid: '#2c2c29', dk: '#1c1c1a' });
  rect(g, 0, 0, W, 18, '#090b0e');
  M.asphalt(g, 0, GY, W, VH - GY, 9511, { hi: '#343029', mid: '#27241f', dk: '#1a1815' });
  rect(g, 0, GY, W, 1, '#0a0908');

  const inter = [];
  const lights = [];

  const ex0 = M.doorFrame(g, 28, GY, 9521);
  inter.push({
    x: ex0.x, y: ex0.y, w: ex0.w, h: ex0.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch3_desk', tox: 540, tofacing: -1, range: 30, isDoor: true, prio: 1,
  });

  // fileiras de arquivo, com a gaveta que falta no meio de uma delas
  fileRow(g, 140, GY, 5, 9531);
  fileRow(g, 480, GY, 5, 9541);
  fileRow(g, 820, GY, 5, 9551, 2);
  fileRow(g, 1160, GY, 4, 9561);

  // etiquetas de prateleira
  inter.push({ x: 200, y: GY - 90, w: 60, h: 20, prompt: 'prompt_look', lines: 'c3_labels', range: 28 });
  inter.push({ x: 560, y: GY - 90, w: 60, h: 20, prompt: 'prompt_look', lines: 'c3_boxes', range: 28 });

  // ---- A GAVETA D ----
  const GAV = 900;
  inter.push({
    x: GAV, y: GY - 70, w: 40, h: 40, prompt: 'prompt_use',
    action: 'ch3_gaveta_d', range: 30, id: 'gaveta_d', prio: 1,
  });
  lights.push({ x: GAV + 16, y: GY - 96, r: 116, color: '#d8a860', i: 0.52, flick: 'bulb', falloff: 1.0 });

  // a lampada fraca do fundo
  inter.push({ x: 1300, y: GY - 110, w: 30, h: 40, prompt: 'prompt_look', lines: 'c3_bulb', range: 28 });

  // A porta da custodia, no fim do corredor.
  //
  // Ela EXISTE desde o comeco e nao e gancho de roteiro: sem ela, a cela so
  // seria alcancavel pela volta do flashback, e sair de la uma vez trancava
  // o jogador fora do Carlos — que e obrigatorio para o cigarro e para o
  // fim do capitulo. Achado jogando, nao pelo teste.
  const ex1 = M.doorFrame(g, W - 90, GY, 9571);
  inter.push({
    x: ex1.x, y: ex1.y, w: ex1.w, h: ex1.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch3_cell', tox: 60, tofacing: 1, range: 30, isDoor: true, prio: 1,
  });
  lights.push({ x: W - 70, y: GY - 92, r: 142, color: '#c89858', i: 0.44, falloff: 1.1 });

  // lampadas de emergencia: a regra dos 400px, sem excecao
  for (let x = 180; x < W; x += 380) {
    M.bareBulb(g, x, 26, 16);
    lights.push({ x, y: 44, r: 168, color: '#c89858', i: 0.5, flick: 'bulb', falloff: 1.1 });
  }
  preencher(lights, W, '#6e6250', 0.19);

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.3) + 8, VH);
  {
    const f = fore.x;
    rect(f, 0, 0, f.canvas.width, 14, '#030405');
    rect(f, 0, VH - 8, f.canvas.width, 8, '#030405');
    // as pontas das fileiras passando na frente
    for (const cx of [70, 430, 800, 1150, 1520, 1880]) {
      rect(f, cx, 0, 20, VH, '#080a0d');
      rect(f, cx, 0, 2, VH, '#121820');
      rect(f, cx + 18, 0, 2, VH, '#050709');
    }
  }

  const lvl = new Level({
    key: 'ch3_archive',
    nameKey: 'loc_dead_archive',
    width: W, groundY: GY,
    ambient: '#242c38',
    layers: [{ c: back.c, par: 0.35 }, { c: main.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.3 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'none',
    reflect: 0.05,
    minX: 24, maxX: W - 44,
    spawn: { x: 60, facing: 1 },
    bloom: 0.4,
    indoor: true,
    material: 'concrete',
    ambience: [{ n: 'hall', g: 0.1 }, { n: 'hum', g: 0.035 }],
    randomSfx: [
      { fn: 'drip', min: 6, max: 15, vol: 0.5 },
      { fn: 'metalCreak', min: 12, max: 28, vol: 0.55 },
    ],
    maxInimigos: 0,
    enterBarks: ['b3_arq_1', 'b3_arq_2'],
    barks: [{ x: 700, key: 'b3_arq_3' }],
  });
  // O CORREDOR E MAIS LONGO NA VOLTA. Sem barulho, sem susto, sem
  // comentario. So mais chao. (MIGALHA familia 5 — nunca comentada.)
  lvl.props.voltaLonga = false;
  return lvl;
}

// ---------------------------------------------------------------------------
// 5 — SETE ANOS ATRAS  (flashback jogavel)  —  A RUA
// ---------------------------------------------------------------------------
// FUNCAO: mostrar que ele era BOM. E fazer o jogador executar o gesto.
//
// Paleta menos dessaturada — ainda noite, mas com azul e verde vivos. Sem
// inimigo, sem sanidade, sem perigo. O ocio dele e outro: ele ACENDE e FUMA,
// sem hesitar. O jogador vai ver isso dezenas de vezes sem entender por que.
//
// A rua e so o caminho. O flashback ACONTECE DENTRO DA CASA — ver
// buildHome() logo abaixo. A varanda desta fase e onde ele atende, e onde
// ele esta quando ouve.

export function buildSevenYears() {
  const W = 1150;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.4) + 8, VH);
  {
    const b = back.x;
    rect(b, 0, 0, b.canvas.width, VH, '#0e1826');
    ditherV(b, 0, 20, b.canvas.width, 140, '#1d3048', '#0e1826', 6);
    for (let i = 0; i < 6; i++) {
      M.buildingSilhouette(b, i * 140 - 30, 156, 104, 88 + i * 11, '#152234', 9601 + i, true);
    }
  }

  const main = makeBuffer(W, VH);
  const g = main.x;

  rect(g, 0, 0, W, VH, '#12202e');
  M.brickWall(g, 0, 26, W, GY - 26, 9611, { hi: '#6a5442', mid: '#4e3d30', dk: '#33281f' });
  rect(g, 0, 0, W, 26, '#0b1420');
  M.asphalt(g, 0, GY, W, VH - GY, 9621, { hi: '#454a44', mid: '#343833', dk: '#232622' });
  rect(g, 0, GY, W, 1, '#0d100e');

  const inter = [];
  const lights = [];

  // ---- o carro dele, parado na frente de casa ----
  const CAR = 150;
  rect(g, CAR, GY - 34, 96, 22, '#2c3a4a');
  rect(g, CAR + 4, GY - 34, 88, 2, '#3f5266');
  rect(g, CAR + 18, GY - 48, 54, 15, '#243040');
  rect(g, CAR + 22, GY - 45, 20, 10, '#4a6480');
  rect(g, CAR + 46, GY - 45, 22, 10, '#4a6480');
  for (const wx of [CAR + 12, CAR + 70]) {
    rect(g, wx, GY - 14, 16, 14, '#14181d');
    rect(g, wx + 4, GY - 10, 8, 7, '#2e343c');
  }
  inter.push({ x: CAR, y: GY - 48, w: 96, h: 48, prompt: 'prompt_look', lines: 'c3_past_car', range: 30 });

  // ---- A CASA: janelas acesas, e a porta que ele ABRE ----
  const CASA = 500;
  M.brickWall(g, CASA, GY - 150, 340, 150, 9641, { hi: '#7a5f46', mid: '#5a4534', dk: '#3a2c21' });
  rect(g, CASA - 8, GY - 156, 356, 8, '#4a3a2c');
  rect(g, CASA - 8, GY - 158, 356, 3, '#63503c');
  for (const wx of [CASA + 26, CASA + 250]) {
    const wy = GY - 128;
    rect(g, wx, wy, 44, 38, '#22303c');
    rect(g, wx + 3, wy + 3, 38, 32, '#ffd9a0');
    rect(g, wx + 20, wy + 3, 2, 32, '#c9a870');
    rect(g, wx + 3, wy + 18, 38, 2, '#c9a870');
    lights.push({ x: wx + 22, y: wy + 18, r: 132, color: '#ffcf90', i: 0.7, falloff: 1.0 });
  }

  // A PORTA DA FRENTE. Ele entra por aqui — e e a coisa mais importante
  // desta fase. Antes ela era enfeite e o flashback inteiro acontecia na
  // calcada, olhando uma fachada.
  const PORTA = CASA + 148;
  rect(g, PORTA - 4, GY - 80, 42, 80, '#33261a');
  rect(g, PORTA, GY - 76, 34, 76, '#43331f');
  rect(g, PORTA + 26, GY - 44, 3, 3, '#c8b070');
  rect(g, PORTA, GY - 3, 34, 3, '#ffd9a0');
  lights.push({ x: PORTA + 17, y: GY - 40, r: 108, color: '#ffcf90', i: 0.56, falloff: 1.1 });
  inter.push({
    x: PORTA - 4, y: GY - 80, w: 42, h: 80, prompt: 'prompt_open',
    action: 'goto', to: 'ch3_home', tox: 70, tofacing: 1, range: 32, isDoor: true, prio: 1,
  });

  // ---- A VARANDA: e aqui que ele atende, e e aqui que ele ouve ----
  const VAR = CASA + 210;
  rect(g, VAR, GY - 8, 110, 8, '#4a3a2c');
  rect(g, VAR, GY - 10, 110, 2, '#63503c');
  rect(g, VAR + 6, GY - 42, 3, 34, '#3a2c21');
  rect(g, VAR + 96, GY - 42, 3, 34, '#3a2c21');
  rect(g, VAR + 6, GY - 44, 96, 3, '#4a3a2c');
  // um banco e um cinzeiro de varanda: e o lugar dele
  rect(g, VAR + 30, GY - 24, 40, 5, '#54402a');
  rect(g, VAR + 33, GY - 19, 4, 19, '#3a2c1d');
  rect(g, VAR + 63, GY - 19, 4, 19, '#3a2c1d');
  inter.push({ x: VAR + 26, y: GY - 30, w: 50, h: 30, prompt: 'prompt_look', lines: 'c3_past_porch', range: 26 });

  // O PONTO ONDE ELE ATENDE. Nao ha objeto: o telefone e o dele, esta no
  // bolso, e toca. O interagivel so aparece quando toca.
  inter.push({
    x: VAR + 40, y: GY - 60, w: 30, h: 60, prompt: 'prompt_use',
    action: 'ch3_atender', range: 30, id: 'atender', prio: 2, disabled: true,
  });

  for (let x = 200; x < W; x += 380) {
    M.streetLampPost(g, x, GY, 92);
    lights.push({ x, y: GY - 92, r: 186, color: '#e0c088', i: 0.62, falloff: 1.0 });
    lights.push({ x, y: GY - 92, r: 24, color: '#fff0c8', i: 0.6 });
  }
  preencher(lights, W, '#9a8a68', 0.22);

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.15) + 8, VH);
  {
    const f = fore.x;
    rect(f, 0, 0, f.canvas.width, 10, '#050708');
    rect(f, 0, VH - 8, f.canvas.width, 8, '#050708');
    for (const cx of [90, 780]) { rect(f, cx, 0, 12, VH, '#0a0e0c'); rect(f, cx, 0, 2, VH, '#161d18'); }
  }

  const lvl = new Level({
    key: 'ch3_past',
    nameKey: 'loc_seven_years',
    width: W, groundY: GY,
    // Ambiente MUITO mais claro que o resto do jogo. Ele nao esta na cabeca
    // dele aqui — isso aconteceu de verdade.
    ambient: '#5a6a80',
    layers: [{ c: back.c, par: 0.4 }, { c: main.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.15 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'none',
    reflect: 0.1,
    minX: 26, maxX: W - 44,
    spawn: { x: 70, facing: 1 },
    bloom: 0.55,
    indoor: false,
    material: 'concrete',
    ambience: [{ n: 'wind', g: 0.02 }, { n: 'roomtone', g: 0.05 }],
    randomSfx: [],
    maxInimigos: 0,
    flashback: true,
    enterBarks: ['b3_past_1', 'b3_past_2'],
    barks: [{ x: 380, key: 'b3_past_3' }],
  });
  lvl.props.varandaX = VAR + 55;
  lvl.props.portaX = PORTA + 17;
  // Onde a casa queima. O fogo nao e desenhado pela fase — a fase so diz
  // onde ficam as bocas dele: as duas janelas, a porta e a linha do
  // telhado. Quem anima e `Fogo`, em chapter3.js.
  lvl.props.fogo = {
    casa: { x: CASA - 8, y: GY - 156, w: 356, h: 156 },
    janelas: [
      { x: CASA + 26, y: GY - 128, w: 44, h: 38 },
      { x: CASA + 250, y: GY - 128, w: 44, h: 38 },
    ],
    porta: { x: PORTA, y: GY - 76, w: 34, h: 76 },
    telhado: { x: CASA - 8, y: GY - 158, w: 356, h: 10 },
  };
  return lvl;
}

// ---------------------------------------------------------------------------
// 5b — A CASA, POR DENTRO
// ---------------------------------------------------------------------------
// A unica sala quente do jogo inteiro, e a unica em que existe outra pessoa
// que nao e um sintoma. Sala de estar e um pedaco de cozinha: televisao
// ligada, luz de abajur, mesa posta, e o cheiro de que alguem esperou.
//
// REGRA: nada de estranho aqui. Nenhuma migalha, nenhum relogio parado,
// nenhum numero que nao fecha. Se esta sala tiver UM detalhe errado, o
// jogador passa os doze minutos procurando o truque em vez de estar ali.

export function buildHome() {
  const W = 820;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.5) + 8, VH);
  {
    const b = back.x;
    rect(b, 0, 0, b.canvas.width, VH, '#241a12');
    ditherV(b, 0, 30, b.canvas.width, 130, '#3a2a1c', '#241a12', 6);
  }

  const main = makeBuffer(W, VH);
  const g = main.x;

  // papel de parede quente e um rodape de madeira. Nada industrial.
  rect(g, 0, 0, W, VH, '#4a3524');
  ditherV(g, 0, 20, W, GY - 60, '#7a5c3c', '#54402a', 6);
  grainRect(g, 0, 20, W, GY - 60, ['#8a6a44', '#4a3524', '#63492e'], 0.05, 9801);
  // faixa de papel de parede listrado
  for (let x = 0; x < W; x += 12) rect(g, x, 20, 2, GY - 78, '#63492e');
  M.woodPanel(g, 0, GY - 44, W, 44, 9811, { hi: '#6f5436', mid: '#54402a', dk: '#33261a' });
  rect(g, 0, GY - 46, W, 3, '#7d6142');
  rect(g, 0, 0, W, 20, '#2a1e14');
  // assoalho de tabua
  M.woodPanel(g, 0, GY, W, VH - GY, 9821, { hi: '#7a5c3c', mid: '#5a422a', dk: '#3a2a1c' });
  rect(g, 0, GY, W, 1, '#221812');

  const inter = [];
  const lights = [];

  // ---- a porta de volta para a rua ----
  const ex0 = M.doorFrame(g, 34, GY, 9831);
  inter.push({
    x: ex0.x, y: ex0.y, w: ex0.w, h: ex0.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch3_past', tox: 660, tofacing: 1, range: 30, isDoor: true, prio: 1,
  });

  // ---- a televisao ligada, sem ninguem olhando ----
  const TV = 210;
  rect(g, TV, GY - 46, 46, 40, '#3a3128');
  rect(g, TV + 3, GY - 43, 40, 30, '#0e1418');
  rect(g, TV + 5, GY - 41, 36, 26, '#5c7a8a');
  rect(g, TV + 5, GY - 34, 36, 2, '#8ba8b8');
  rect(g, TV + 5, GY - 26, 36, 1, '#7d99a8');
  rect(g, TV + 8, GY - 6, 6, 6, '#2a231c');
  rect(g, TV + 32, GY - 6, 6, 6, '#2a231c');
  lights.push({ x: TV + 23, y: GY - 28, r: 118, color: '#7fa5c8', i: 0.4, flick: 'neon', falloff: 1.15 });
  inter.push({ x: TV, y: GY - 46, w: 46, h: 46, prompt: 'prompt_look', lines: 'c3_home_tv', range: 26 });

  // ---- o sofa ----
  const SOFA = 290;
  rect(g, SOFA, GY - 30, 96, 24, '#5c4a58');
  rect(g, SOFA, GY - 30, 96, 2, '#756070');
  rect(g, SOFA - 6, GY - 40, 10, 34, '#4e3e4a');
  rect(g, SOFA + 92, GY - 40, 10, 34, '#4e3e4a');
  rect(g, SOFA + 4, GY - 40, 84, 12, '#6b5666');
  rect(g, SOFA + 6, GY - 6, 6, 6, '#33261a');
  rect(g, SOFA + 82, GY - 6, 6, 6, '#33261a');

  // ---- a mesa posta, com um prato a mais ----
  const MESA = 620;
  rect(g, MESA, GY - 34, 110, 6, '#6f5436');
  rect(g, MESA, GY - 34, 110, 1, '#8a6844');
  rect(g, MESA + 6, GY - 28, 6, 28, '#4a3524');
  rect(g, MESA + 98, GY - 28, 6, 28, '#4a3524');
  for (const px of [MESA + 16, MESA + 48, MESA + 80]) {
    rect(g, px, GY - 38, 18, 4, '#c9c1a8');
    rect(g, px + 2, GY - 37, 14, 2, '#a89f88');
  }
  inter.push({ x: MESA, y: GY - 42, w: 110, h: 42, prompt: 'prompt_look', lines: 'c3_home_table', range: 30 });

  // ---- o abajur: a luz mais quente do jogo inteiro ----
  const ABJ = 460;
  rect(g, ABJ, GY - 40, 4, 40, '#4a3524');
  rect(g, ABJ - 10, GY - 54, 24, 14, '#c9a06a');
  rect(g, ABJ - 8, GY - 52, 20, 10, '#ffdca8');
  lights.push({ x: ABJ + 2, y: GY - 48, r: 168, color: '#ffcf90', i: 0.86, falloff: 0.9 });
  lights.push({ x: ABJ + 2, y: GY - 48, r: 26, color: '#fff2d8', i: 0.7 });

  // ---- porta-retratos na parede. Sem truque nenhum. ----
  for (let i = 0; i < 3; i++) {
    const px = 360 + i * 40;
    rect(g, px, GY - 116, 26, 22, '#3a2a1c');
    rect(g, px + 2, GY - 114, 22, 18, '#8a7d6b');
    rect(g, px + 6, GY - 110, 6, 8, '#a89a86');
    rect(g, px + 14, GY - 110, 6, 8, '#a89a86');
  }
  inter.push({ x: 360, y: GY - 116, w: 106, h: 24, prompt: 'prompt_look', lines: 'c3_home_photos', range: 28 });

  // ---- o corredor para o resto da casa, e a porta do quarto dela ----
  //
  // A menina NAO fica na sala com a mae. Ela devia estar dormindo ha duas
  // horas e esta no quarto, acordada, com a luz do abajur acesa por baixo
  // da porta. Fazer o jogador ANDAR ate la e o que separa "duas conversas
  // seguidas" de "duas pessoas em dois lugares da propria casa".
  rect(g, 720, GY - 96, 46, 96, '#2a1e14');
  ditherV(g, 722, GY - 94, 42, 92, '#3f2e1e', '#1a120c', 5);
  lights.push({ x: 743, y: GY - 60, r: 92, color: '#e8b46a', i: 0.34, falloff: 1.3 });
  const QRT = 730;
  rect(g, QRT - 4, GY - 82, 42, 82, '#3a2a1c');
  rect(g, QRT, GY - 78, 34, 78, '#4e3a24');
  rect(g, QRT + 26, GY - 44, 3, 3, '#c8b070');
  // a fresta de luz por baixo da porta: e ela que diz que tem alguem
  // acordado ali dentro, antes de qualquer fala
  rect(g, QRT, GY - 3, 34, 3, '#ffd9a0');
  lights.push({ x: QRT + 17, y: GY - 2, r: 54, color: '#ffcf90', i: 0.42, falloff: 1.2 });
  inter.push({
    x: QRT - 4, y: GY - 82, w: 42, h: 82, prompt: 'prompt_open',
    action: 'goto', to: 'ch3_room', tox: 70, tofacing: 1, range: 30, isDoor: true, prio: 1,
  });

  // luz de teto quente, e a regra de preenchimento
  for (let x = 160; x < W; x += 300) {
    lights.push({ x, y: 40, r: 176, color: '#e8bc80', i: 0.5, falloff: 1.05 });
  }
  preencher(lights, W, '#b08a5c', 0.26);

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.2) + 8, VH);
  {
    const f = fore.x;
    rect(f, 0, 0, f.canvas.width, 10, '#0a0705');
    rect(f, 0, VH - 8, f.canvas.width, 8, '#0a0705');
    // o batente do corredor passando na frente
    rect(f, 300, 0, 14, VH, '#120c08');
    rect(f, 300, 0, 2, VH, '#1e150e');
  }

  const lvl = new Level({
    key: 'ch3_home',
    nameKey: 'loc_home',
    width: W, groundY: GY,
    // A sala mais clara do jogo. De longe.
    ambient: '#6a5a48',
    layers: [{ c: back.c, par: 0.5 }, { c: main.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.2 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'none',
    reflect: 0.06,
    minX: 26, maxX: W - 44,
    spawn: { x: 70, facing: 1 },
    bloom: 0.6,
    indoor: true, safe: true,
    material: 'wood',
    ambience: [{ n: 'roomtone', g: 0.08 }],
    randomSfx: [],
    maxInimigos: 0,
    flashback: true,
    enterBarks: ['b3_home_1', 'b3_home_2'],
  });
  return lvl;
}


// ---------------------------------------------------------------------------
// 5c — O QUARTO DELA
// ---------------------------------------------------------------------------
// Ela devia estar dormindo ha duas horas. Esta sentada no chao do proprio
// quarto, desenhando, com o abajur ligado e a cama intacta.
//
// A REGRA DA CASA VALE AQUI COM MAIS FORCA AINDA: nada de estranho, nenhuma
// migalha, nenhum numero que nao fecha. Este e o unico comodo do jogo
// inteiro em que nao ha o que investigar — e o jogador tem que sentir isso
// como descanso, nao como armadilha. Se houver UM detalhe errado aqui, ele
// passa a cena procurando o truque em vez de estar presente.
//
// O quarto e pequeno de proposito: 560px. Depois de uma hora de galpao e de
// corredor de arquivo, um comodo em que da para ver as duas paredes ao
// mesmo tempo e a coisa mais reconfortante que este jogo tem.

export function buildKidsRoom() {
  const W = 560;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.5) + 8, VH);
  {
    const b = back.x;
    rect(b, 0, 0, b.canvas.width, VH, '#2a2036');
    ditherV(b, 0, 30, b.canvas.width, 130, '#3d3050', '#2a2036', 6);
  }

  const main = makeBuffer(W, VH);
  const g = main.x;

  // parede lilas desbotado com barrado de estrelas pintado a mao. Quente,
  // e a unica parede do jogo que nao e tijolo, chapa ou concreto.
  rect(g, 0, 0, W, VH, '#5a4a6a');
  ditherV(g, 0, 20, W, GY - 60, '#7d6a90', '#54456a', 6);
  grainRect(g, 0, 20, W, GY - 60, ['#8d7aa0', '#5a4a6a', '#6b5a7d'], 0.045, 9901);
  for (let x = 6; x < W; x += 34) {
    rect(g, x, GY - 104, 3, 1, '#c9b0d8');
    rect(g, x + 1, GY - 105, 1, 3, '#c9b0d8');
    rect(g, x + 17, GY - 96, 2, 1, '#a892bd');
  }
  M.woodPanel(g, 0, GY - 40, W, 40, 9911, { hi: '#6f5436', mid: '#54402a', dk: '#33261a' });
  rect(g, 0, GY - 42, W, 3, '#7d6142');
  rect(g, 0, 0, W, 20, '#2f2440');
  M.woodPanel(g, 0, GY, W, VH - GY, 9921, { hi: '#7a5c3c', mid: '#5a422a', dk: '#3a2a1c' });
  rect(g, 0, GY, W, 1, '#221812');

  const inter = [];
  const lights = [];

  // ---- a porta de volta para o corredor ----
  const ex0 = M.doorFrame(g, 34, GY, 9931);
  inter.push({
    x: ex0.x, y: ex0.y, w: ex0.w, h: ex0.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch3_home', tox: 700, tofacing: -1, range: 30, isDoor: true, prio: 1,
  });

  // ---- a cama, feita, sem ninguem nela ----
  const CAMA = 330;
  rect(g, CAMA, GY - 34, 150, 22, '#6f5436');
  rect(g, CAMA, GY - 34, 150, 2, '#8a6844');
  rect(g, CAMA + 4, GY - 30, 142, 14, '#c2b9d2');      // colcha clara
  rect(g, CAMA + 4, GY - 30, 142, 2, '#ddd4e8');
  rect(g, CAMA + 108, GY - 36, 36, 10, '#e8e0ec');     // travesseiro
  rect(g, CAMA - 6, GY - 52, 8, 52, '#54402a');        // cabeceira
  rect(g, CAMA + 146, GY - 44, 8, 44, '#54402a');
  rect(g, CAMA + 2, GY - 12, 6, 12, '#3a2c1d');
  rect(g, CAMA + 140, GY - 12, 6, 12, '#3a2c1d');
  inter.push({ x: CAMA, y: GY - 52, w: 154, h: 52, prompt: 'prompt_look', lines: 'c3_room_bed', range: 30 });

  // ---- o abajur em cima da comoda: a luz do comodo ----
  const COM = 210;
  rect(g, COM, GY - 44, 62, 44, '#6f5436');
  rect(g, COM, GY - 44, 62, 2, '#8a6844');
  for (let i = 0; i < 2; i++) {
    rect(g, COM + 5, GY - 36 + i * 16, 52, 12, '#5a422a');
    rect(g, COM + 26, GY - 32 + i * 16, 10, 3, '#a88a5c');
  }
  rect(g, COM + 44, GY - 58, 4, 14, '#4a3524');
  rect(g, COM + 36, GY - 70, 20, 12, '#d8a8c0');
  rect(g, COM + 38, GY - 68, 16, 8, '#ffe0c8');
  lights.push({ x: COM + 46, y: GY - 64, r: 172, color: '#ffcf9a', i: 0.9, falloff: 0.88 });
  lights.push({ x: COM + 46, y: GY - 64, r: 26, color: '#fff4e0', i: 0.72 });
  inter.push({ x: COM, y: GY - 70, w: 62, h: 70, prompt: 'prompt_look', lines: 'c3_room_lamp', range: 26 });

  // ---- o chao onde ela desenha: papel espalhado e lapis de cor ----
  const DES = 120;
  for (let i = 0; i < 5; i++) {
    const px = DES + i * 13 + (i % 2) * 4;
    rect(g, px, GY - 5, 11, 5, '#d8d0bc');
    rect(g, px, GY - 5, 11, 1, '#efe8d6');
  }
  for (const [px, cor] of [[DES + 6, '#a8382c'], [DES + 20, '#3d6a8a'], [DES + 34, '#c9a03a'],
                           [DES + 48, '#4a7d4a'], [DES + 60, '#7a4a8a']]) {
    rect(g, px, GY - 2, 7, 2, cor);
  }
  inter.push({ x: DES - 4, y: GY - 12, w: 84, h: 12, prompt: 'prompt_look', lines: 'c3_room_draw', range: 26 });

  // ---- a janela do quarto: a rua la fora, e nada acontecendo nela ----
  const JAN = 452;
  rect(g, JAN, GY - 128, 56, 46, '#3a2c40');
  rect(g, JAN + 3, GY - 125, 50, 40, '#2a3a4e');
  rect(g, JAN + 27, GY - 125, 2, 40, '#4a3a52');
  rect(g, JAN + 3, GY - 107, 50, 2, '#4a3a52');
  rect(g, JAN - 6, GY - 132, 68, 5, '#54402a');
  lights.push({ x: JAN + 28, y: GY - 104, r: 78, color: '#6a86a8', i: 0.24, falloff: 1.3 });
  inter.push({ x: JAN, y: GY - 132, w: 56, h: 50, prompt: 'prompt_look', lines: 'c3_room_window', range: 28 });

  // ---- as coisas dela na prateleira, e o bicho de pelucia caido ----
  rect(g, 96, GY - 96, 92, 5, '#6f5436');
  for (const [px, w2, h2, cor] of [[102, 10, 14, '#a8382c'], [116, 8, 12, '#3d6a8a'],
                                   [128, 12, 16, '#c9a03a'], [146, 9, 13, '#4a7d4a'],
                                   [158, 11, 15, '#7a4a8a']]) {
    rect(g, px, GY - 96 - h2, w2, h2, cor);
    rect(g, px, GY - 96 - h2, w2, 1, '#e0d8c8');
  }
  inter.push({ x: 96, y: GY - 116, w: 92, h: 24, prompt: 'prompt_look', lines: 'c3_room_shelf', range: 26 });
  rect(g, 296, GY - 12, 14, 12, '#b07a4a');
  rect(g, 298, GY - 16, 10, 6, '#b07a4a');
  rect(g, 300, GY - 15, 2, 2, '#2a1e14');
  rect(g, 305, GY - 15, 2, 2, '#2a1e14');
  inter.push({ x: 292, y: GY - 20, w: 24, h: 20, prompt: 'prompt_look', lines: 'c3_room_bear', range: 24 });

  // luz de teto fraca e a regra de preenchimento
  lights.push({ x: 280, y: 42, r: 168, color: '#e8bc90', i: 0.42, falloff: 1.05 });
  preencher(lights, W, '#b08a6c', 0.24);

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.2) + 8, VH);
  {
    const f = fore.x;
    rect(f, 0, 0, f.canvas.width, 10, '#0a0705');
    rect(f, 0, VH - 8, f.canvas.width, 8, '#0a0705');
    // o batente da porta passando na frente, igual ao resto do capitulo
    rect(f, 240, 0, 12, VH, '#120c10');
    rect(f, 240, 0, 2, VH, '#1e1518');
  }

  const lvl = new Level({
    key: 'ch3_room',
    nameKey: 'loc_room',
    width: W, groundY: GY,
    ambient: '#6a5a52',
    layers: [{ c: back.c, par: 0.5 }, { c: main.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.2 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'none',
    reflect: 0.05,
    minX: 26, maxX: W - 44,
    spawn: { x: 70, facing: 1 },
    bloom: 0.6,
    indoor: true, safe: true,
    material: 'wood',
    ambience: [{ n: 'roomtone', g: 0.07 }],
    randomSfx: [],
    maxInimigos: 0,
    flashback: true,
    enterBarks: ['b3_room_1', 'b3_room_2'],
  });
  return lvl;
}

// ---------------------------------------------------------------------------
// 6 — A CELA
// ---------------------------------------------------------------------------
// FUNCAO: o degrau 4. E o nome.

export function buildCell() {
  const W = 700;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.5) + 8, VH);
  {
    const b = back.x;
    rect(b, 0, 0, b.canvas.width, VH, '#06080b');
    ditherV(b, 0, 50, b.canvas.width, 120, '#0d1116', '#06080b', 5);
  }

  const main = makeBuffer(W, VH);
  const g = main.x;

  rect(g, 0, 0, W, VH, '#12151a');
  M.brickWall(g, 0, 16, W, GY - 16, 9701, { hi: '#3c3c38', mid: '#2b2b28', dk: '#1b1b19' });
  rect(g, 0, 0, W, 16, '#080a0d');
  M.asphalt(g, 0, GY, W, VH - GY, 9711, { hi: '#333029', mid: '#26241f', dk: '#191815' });
  rect(g, 0, GY, W, 1, '#0a0908');

  const inter = [];
  const lights = [];

  const ex0 = M.doorFrame(g, 30, GY, 9721);
  inter.push({
    x: ex0.x, y: ex0.y, w: ex0.w, h: ex0.h, prompt: 'prompt_open',
    action: 'goto', to: 'ch3_archive', tox: 1440, tofacing: -1, range: 30, isDoor: true, prio: 1,
  });

  // ---- A CELA ----
  //
  // ⚠ A GRADE NAO E DESENHADA AQUI. Ela vai para uma camada de primeiro
  // plano em paralaxe 1:1, mais abaixo, porque as pessoas sao desenhadas
  // DEPOIS das camadas de fundo — e com a grade no fundo o Carlos aparecia
  // na frente das barras, do lado de fora da propria cela. E o mesmo erro
  // de encenacao do plantonista na guarita (sessao 20b), e ele fica
  // impossivel de ignorar agora que a camera fecha em cima dos dois.
  const CEL = 320;
  cellBack(g, CEL, GY - 118, 200, 118, 9731);
  // banco de concreto e a mesa de metal parafusada no chao, la dentro
  rect(g, CEL + 20, GY - 34, 60, 6, '#2a2c30');
  rect(g, CEL + 20, GY - 34, 60, 1, '#3a3d42');
  rect(g, CEL + 120, GY - 40, 44, 4, '#31353b');
  rect(g, CEL + 138, GY - 36, 6, 36, '#262a2f');
  // o cinzeiro em cima da mesa, com dois cigarros
  rect(g, CEL + 132, GY - 45, 12, 5, '#4a4640');
  // a porta da cela: destrancada. Nunca esteve trancada.
  // A PORTA DA CELA. Ela nunca esteve trancada — e agora isso deixa de ser
  // so uma frase: da para ENTRAR. Atravessar essa grade e o gesto que abre
  // o interrogatorio, e e o jogador que executa.
  inter.push({
    x: CEL + 168, y: GY - 118, w: 34, h: 118, prompt: 'prompt_use',
    action: 'ch3_entrar_cela', range: 30, id: 'porta_cela', prio: 2,
  });
  lights.push({ x: CEL + 100, y: GY - 132, r: 148, color: '#d8a850', i: 0.66, flick: 'bulb', falloff: 0.95 });
  lights.push({ x: CEL + 100, y: GY - 132, r: 22, color: '#ffe0a0', i: 0.6 });

  // ---- o livro de visitas ----
  const LIV = 596;
  rect(g, LIV, GY - 44, 40, 5, '#43321f');
  rect(g, LIV + 6, GY - 52, 28, 9, '#b6ae9a');
  rect(g, LIV + 6, GY - 52, 28, 1, '#d0c8b4');
  for (let i = 0; i < 4; i++) rect(g, LIV + 9, GY - 49 + i * 2, 22, 1, '#6a6252');
  inter.push({
    x: LIV, y: GY - 56, w: 40, h: 24, prompt: 'prompt_look',
    action: 'ch3_livro', range: 26, id: 'livro_visitas',
  });

  for (let x = 130; x < W; x += 340) {
    M.bareBulb(g, x, 22, 14);
    lights.push({ x, y: 38, r: 162, color: '#c89858', i: 0.48, flick: 'bulb', falloff: 1.1 });
  }
  preencher(lights, W, '#7a6a52', 0.2);

  // A GRADE, em primeiro plano 1:1. Alinha exatamente com o cenario e ainda
  // assim e desenhada depois das pessoas: e isso que poe o Carlos DENTRO
  // da cela em vez de na frente dela.
  const grade = makeBuffer(W, VH);
  cellBarsOnly(grade.x, CEL, GY - 118, 200, 118);

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.2) + 8, VH);
  {
    const f = fore.x;
    rect(f, 0, 0, f.canvas.width, 12, '#040506');
    rect(f, 0, VH - 8, f.canvas.width, 8, '#040506');
    rect(f, 120, 0, 16, VH, '#080a0c');
    rect(f, 120, 0, 2, VH, '#141a20');
  }

  const lvl = new Level({
    key: 'ch3_cell',
    // O corredor passa NA FRENTE deste movel: o primeiro plano entra
    // antes do jogador para o preso/plantonista continuarem atras da
    // grade e do vidro, e o David passar na frente dos dois.
    playerSobreFore: true,
    nameKey: 'loc_cell',
    width: W, groundY: GY,
    ambient: '#2a3040',
    layers: [{ c: back.c, par: 0.5 }, { c: main.c, par: 1 }],
    fores: [{ c: grade.c, par: 1 }, { c: fore.c, par: 1.2 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'none',
    reflect: 0.05,
    minX: 24, maxX: W - 44,
    spawn: { x: 60, facing: 1 },
    bloom: 0.42,
    indoor: true,
    material: 'concrete',
    ambience: [{ n: 'roomtone', g: 0.09 }, { n: 'hall', g: 0.05 }],
    randomSfx: [{ fn: 'drip', min: 7, max: 17, vol: 0.55 }],
    maxInimigos: 0,
    enterBarks: ['b3_cell_1', 'b3_cell_2'],
  });
  lvl.props.cigarrosNoCinzeiro = false;
  // Onde o David para para interrogar: do lado de FORA das barras. Sem uma
  // marca, ele ficava em pe dentro da propria cela — o que, com a camera
  // fechando nos dois, e a diferenca entre uma cena e um erro.
  lvl.props.marcaInt = CEL - 30;
  return lvl;
}

// ---------------------------------------------------------------------------
// 6b — DENTRO DA CELA
// ---------------------------------------------------------------------------
// O jogo inteiro se passa em corredores de 700 a 1700 pixels. Esta sala tem
// 300, e e a menor do jogo por muita distancia.
//
// Nao e economia: e a cena. Quando o David atravessa a grade, a delegacia
// SAI DA TELA — some o corredor, some a profundidade, some a saida. Sobra
// concreto, uma lampada e outro homem. E dai em diante nao existe mais para
// onde a camera fugir.
//
// A grade fica ATRAS dele, do lado esquerdo, em primeiro plano: o jogador ve
// as barras entre a camera e o proprio personagem, e e assim que ele entende
// que quem entrou na jaula foi o David.

export function buildInsideCell() {
  const W = 300;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.5) + 8, VH);
  {
    const b = back.x;
    rect(b, 0, 0, b.canvas.width, VH, '#05070a');
  }

  const main = makeBuffer(W, VH);
  const g = main.x;

  rect(g, 0, 0, W, VH, '#151a20');
  M.brickWall(g, 0, 10, W, GY - 10, 9801, { hi: '#41413c', mid: '#2f2f2b', dk: '#1d1d1b' });
  rect(g, 0, 0, W, 10, '#080a0d');
  M.asphalt(g, 0, GY, W, VH - GY, 9811, { hi: '#37342c', mid: '#292620', dk: '#1b1a16' });
  rect(g, 0, GY, W, 1, '#0a0908');

  // manchas de umidade e as marcas de quem passou a noite aqui
  grainRect(g, 0, 40, W, GY - 40, ['#4a4a44', '#22221f'], 0.03, 9821);
  for (let i = 0; i < 5; i++) rect(g, 214 + (i % 2) * 3, 96 + i * 6, 9, 1, '#5a5a52');

  const inter = [];
  const lights = [];

  // ---- o banco de concreto, e a mesa parafusada ----
  rect(g, 150, GY - 40, 96, 8, '#3a3d42');
  rect(g, 150, GY - 40, 96, 2, '#4c5057');
  rect(g, 158, GY - 32, 9, 32, '#2e3136');
  rect(g, 230, GY - 32, 9, 32, '#2e3136');
  rect(g, 60, GY - 44, 54, 5, '#31353b');
  rect(g, 60, GY - 44, 54, 1, '#454a51');
  rect(g, 84, GY - 39, 7, 39, '#262a2f');
  // o cinzeiro, que so ganha dois cigarros no fim
  rect(g, 72, GY - 49, 14, 5, '#4a4640');
  rect(g, 73, GY - 50, 12, 1, '#33302b');

  // ---- a grade, ATRAS dele, do lado da porta ----
  // (desenhada na camada de primeiro plano, mais abaixo)

  // ---- a lampada: uma so, amarela, e ela e o teto inteiro ----
  //
  // ⚠ A primeira versao tinha raio 168 pendurada em y=30. O chao esta em
  // 214: a luz morria 40 pixels antes de chegar nos dois homens, e a cena
  // inteira ficava preta com duas manchas dentro. E o B-23 pela quinta vez.
  // Aqui a lampada CHEGA NO CHAO, e ainda ha uma poca propria na altura em
  // que a conversa acontece.
  M.bareBulb(g, 150, 12, 16);
  lights.push({ x: 150, y: 30, r: 250, color: '#e0b45c', i: 0.95, flick: 'bulb', falloff: 0.82 });
  lights.push({ x: 150, y: 30, r: 26, color: '#fff0c0', i: 0.7 });
  // a poca em cima dos dois, na altura do peito
  lights.push({ x: 174, y: GY - 40, r: 176, color: '#d8a860', i: 0.62, falloff: 0.95 });
  // e a grade pega um contraluz frio, para ela existir no quadro
  lights.push({ x: 18, y: GY - 62, r: 132, color: '#7d90a8', i: 0.44, falloff: 1.1 });
  preencher(lights, W, '#8a7a58', 0.26);

  // ---- a saida: de volta para o corredor ----
  // ⚠ A caixa da saida tem que ficar ao ALCANCE de onde o jogador consegue
  // parar. Com `minX` em 74 e a porta centrada em 23, ele encostava na
  // parede e o prompt nunca aparecia: dava para entrar na cela e nao dava
  // para sair dela a pe.
  inter.push({
    x: 30, y: GY - 100, w: 48, h: 100, prompt: 'prompt_open',
    action: 'goto', to: 'ch3_cell', tox: 300, tofacing: -1, range: 44, isDoor: true, prio: 1,
    id: 'sair_cela',
  });

  const grade = makeBuffer(W, VH);
  {
    const q = grade.x;
    // as barras vistas de DENTRO: mais proximas, mais grossas, e passando
    // na frente do proprio personagem do jogador
    for (let bx = 0; bx < 64; bx += 11) {
      rect(q, bx, GY - 150, 4, 150, '#3d4650');
      rect(q, bx, GY - 150, 1, 150, '#5a6674');
      rect(q, bx + 3, GY - 150, 1, 150, '#252d36');
    }
    rect(q, 0, GY - 150, 64, 5, '#4f5a67');
    rect(q, 0, GY - 6, 64, 6, '#3d4650');
  }

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.2) + 8, VH);
  {
    const f = fore.x;
    rect(f, 0, 0, f.canvas.width, 10, '#030405');
    rect(f, 0, VH - 6, f.canvas.width, 6, '#030405');
  }

  const lvl = new Level({
    key: 'ch3_dentro',
    nameKey: 'loc_inside',
    width: W, groundY: GY,
    ambient: '#22242c',
    layers: [{ c: back.c, par: 0.5 }, { c: main.c, par: 1 }],
    fores: [{ c: grade.c, par: 1 }, { c: fore.c, par: 1.2 }],
    lightDefs: lights,
    interactables: inter,
    weather: 'none',
    reflect: 0.04,
    minX: 74, maxX: W - 40,
    spawn: { x: 100, facing: 1 },
    bloom: 0.4,
    indoor: true,
    material: 'concrete',
    ambience: [{ n: 'roomtone', g: 0.12 }],
    randomSfx: [],
    maxInimigos: 0,
    enterBarks: [],
  });
  lvl.props.cigarrosNoCinzeiro = false;
  // Onde ele para, de frente para o homem sentado. ⚠ A distancia entre os
  // dois e a coisa mais importante desta sala: a 88 pixels o soco acertava
  // o AR, e um soco que nao alcanca ninguem nao e um soco, e um gesto. A
  // 46 o braco esticado chega no outro homem, que e o comprimento real de
  // um braco na escala do jogo.
  lvl.props.marcaInt = 150;
  return lvl;
}

// ---------------------------------------------------------------------------

export function buildChapter3() {
  return {
    ch3_reception: buildReception(),
    ch3_plantao: buildSquadRoom(),
    ch3_desk: buildOldDesk(),
    ch3_archive: buildDeadArchive(),
    ch3_past: buildSevenYears(),
    ch3_home: buildHome(),
    ch3_room: buildKidsRoom(),
    ch3_cell: buildCell(),
    ch3_dentro: buildInsideCell(),
  };
}
