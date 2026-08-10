// puzzle-turno.js — O ULTIMO PLANTAO.
//
// A chave do mezanino fica dentro de um armario magnetico no posto de
// seguranca. O armario ainda recebe energia do relogio parado em 02h14, mas
// tres reles foram arrancados e espalhados pelo galpao: MAO, OLHO e VOZ.
// Depois de encontra-los, o jogador gira as placas do circuito ate a corrente
// passar pelos tres, nessa ordem, e chegar ao armario.
//
// A linha acesa e a pista. Nao existe combinacao secreta nem tentativa
// aleatoria: cada giro mostra exatamente ate onde o raciocinio esta certo.

import { VW, VH, clamp, gfx } from '../core/gfx.js';
import { input } from '../core/input.js';
import { audio } from '../core/audio.js';
import { text } from '../core/text.js';
import { PAL } from '../art/palette.js';
import { t as T } from '../i18n.js';

const COLS = 5, ROWS = 4, CELL = 32;
const SOURCE = 5;          // linha 2, coluna 1 — energia entra pela esquerda
const SINK = 14;           // linha 3, coluna 5 — sai pela direita
const NODES = { 6: 'hand', 12: 'eye', 8: 'voice' };
const REQUIRED = [6, 12, 8];

// I = reta, L = curva, T = derivacao. As pecas fora do caminho principal
// sao falsos ramais: parecem plausiveis, mas a corrente acesa entrega onde
// o circuito realmente termina.
const TYPES = [
  'L', 'I', 'L', 'T', 'L',
  'I', 'I', 'L', 'L', 'L',
  'T', 'L', 'L', 'L', 'L',
  'L', 'T', 'I', 'L', 'T',
];

// Solucao do caminho: 5→6(MAO)→7→12(OLHO)→13→8(VOZ)→9→14→armario.
// O resto pode ficar em qualquer posicao.
const START = [
  1, 0, 2, 1, 3,
  1, 1, 3, 0, 0,
  2, 3, 2, 1, 3,
  2, 0, 1, 3, 0,
];

const BASE_PORTS = {
  I: [1, 3],       // leste/oeste
  L: [0, 1],       // norte/leste
  T: [0, 1, 3],    // norte/leste/oeste
};

function ports(type, rot) {
  return BASE_PORTS[type].map(d => (d + rot) & 3);
}

function hasPort(type, rot, dir) {
  return ports(type, rot).indexOf(dir) >= 0;
}

export class ShiftPuzzle {
  constructor() {
    this.open = false;
    this.fade = 0;
    this.cursor = SOURCE;
    this.rot = START.slice();
    this.solved = false;
    this.solvedT = 0;
    this.onChange = null;
    this.onSolved = null;
    this.onClose = null;
  }

  reset() {
    this.open = false;
    this.fade = 0;
    this.cursor = SOURCE;
    this.rot = START.slice();
    this.solved = false;
    this.solvedT = 0;
  }

  start(saved) {
    this.rot = Array.isArray(saved) && saved.length === TYPES.length
      ? saved.map((n, i) => clamp(Number(n) || 0, 0, TYPES[i] === 'I' ? 1 : 3))
      : START.slice();
    this.cursor = SOURCE;
    this.solved = false;
    this.solvedT = 0;
    this.open = true;
    audio.machineStart(0.38);
  }

  close() {
    if (!this.open) return;
    this.open = false;
    audio.uiBack();
    if (this.onClose) this.onClose(this.solved);
  }

  update(dt) {
    this.fade = clamp(this.fade + (this.open ? dt * 7 : -dt * 9), 0, 1);
    if (!this.open) return;

    if (this.solved) {
      this.solvedT += dt;
      if (this.solvedT > 2.1) this.close();
      return;
    }

    let x = this.cursor % COLS, y = (this.cursor / COLS) | 0;
    let moved = false;
    if (input.pressed('menuLeft'))  { x = (x + COLS - 1) % COLS; moved = true; }
    if (input.pressed('menuRight')) { x = (x + 1) % COLS; moved = true; }
    if (input.pressed('menuUp'))    { y = (y + ROWS - 1) % ROWS; moved = true; }
    if (input.pressed('menuDown'))  { y = (y + 1) % ROWS; moved = true; }
    if (moved) {
      this.cursor = y * COLS + x;
      audio.uiMove();
    }

    let girar = input.pressed('confirm') || input.pressed('attack');
    if (input.mouse.cx !== undefined) {
      const m = gfx.toVirtual(input.mouse.cx, input.mouse.cy);
      const gx = 160, gy = 58;
      if (m.x >= gx && m.x < gx + COLS * CELL && m.y >= gy && m.y < gy + ROWS * CELL) {
        this.cursor = Math.floor((m.y - gy) / CELL) * COLS + Math.floor((m.x - gx) / CELL);
        if (input.mouse.pressed) girar = true;
      }
    }

    if (girar) {
      const max = TYPES[this.cursor] === 'I' ? 2 : 4;
      this.rot[this.cursor] = (this.rot[this.cursor] + 1) % max;
      audio.reloadClick(0.86 + this.cursor * 0.012);
      if (this.onChange) this.onChange(this.rot.slice());

      const state = this._power();
      if (state.solved) {
        this.solved = true;
        this.solvedT = 0;
        audio.machineStart(1.15);
        audio.uiConfirm();
        if (this.onSolved) this.onSolved(this.rot.slice());
      }
    } else if (input.pressed('cancel')) {
      this.close();
    }
  }

  // Busca a partir do fio de 02h14. So atravessa uma borda quando as duas
  // placas apontam uma para a outra. O armario abre apenas se a mesma rede
  // alcanca os tres reles e a saida.
  _power() {
    const seen = new Set();
    if (!hasPort(TYPES[SOURCE], this.rot[SOURCE], 3)) return { seen, solved: false };
    const queue = [SOURCE];
    seen.add(SOURCE);
    const dx = [0, 1, 0, -1], dy = [-1, 0, 1, 0];

    while (queue.length) {
      const i = queue.shift();
      const x = i % COLS, y = (i / COLS) | 0;
      for (const dir of ports(TYPES[i], this.rot[i])) {
        const nx = x + dx[dir], ny = y + dy[dir];
        if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue;
        const ni = ny * COLS + nx;
        if (!hasPort(TYPES[ni], this.rot[ni], (dir + 2) & 3) || seen.has(ni)) continue;
        seen.add(ni); queue.push(ni);
      }
    }

    const saiu = seen.has(SINK) && hasPort(TYPES[SINK], this.rot[SINK], 1);
    return { seen, solved: saiu && REQUIRED.every(i => seen.has(i)) };
  }

  draw(ctx) {
    if (this.fade <= 0) return;
    const a = this.fade;
    const panel = { x: 36, y: 18, w: 408, h: 234 };

    ctx.save();
    ctx.globalAlpha = a * 0.82;
    ctx.fillStyle = '#030406';
    ctx.fillRect(0, 0, VW, VH);
    ctx.globalAlpha = a;
    ctx.fillStyle = '#171b20';
    ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
    ctx.fillStyle = '#2d333a';
    ctx.fillRect(panel.x, panel.y, panel.w, 2);
    ctx.fillRect(panel.x, panel.y + panel.h - 2, panel.w, 2);
    ctx.fillRect(panel.x, panel.y, 2, panel.h);
    ctx.fillRect(panel.x + panel.w - 2, panel.y, 2, panel.h);
    // parafusos
    ctx.fillStyle = '#6d7278';
    for (const px of [panel.x + 7, panel.x + panel.w - 9]) {
      for (const py of [panel.y + 7, panel.y + panel.h - 9]) ctx.fillRect(px, py, 2, 2);
    }
    ctx.restore();

    text(ctx, T('puzzle_title'), VW / 2, 28, {
      size: 11, font: 'type', weight: 'bold', color: '#c7bdad',
      align: 'center', track: 3, alpha: a,
    });
    text(ctx, T('puzzle_subtitle'), VW / 2, 43, {
      size: 7, font: 'type', weight: 'bold', color: '#6f685e',
      align: 'center', track: 1, alpha: a,
    });

    const gx = 160, gy = 58;
    const power = this._power();

    // entrada e saida
    text(ctx, '02:14', gx - 20, gy + CELL + 11, {
      size: 8, font: 'type', weight: 'bold', color: '#b8a66a', align: 'right', alpha: a,
    });
    text(ctx, T('puzzle_key'), gx + COLS * CELL + 20, gy + CELL * 2 + 11, {
      size: 8, font: 'type', weight: 'bold', color: this.solved ? '#d5b34b' : '#6b6256', alpha: a,
    });
    this._wire(ctx, gx - 12, gy + CELL + 16, gx, gy + CELL + 16,
      power.seen.has(SOURCE), a);
    this._wire(ctx, gx + COLS * CELL, gy + CELL * 2 + 16,
      gx + COLS * CELL + 12, gy + CELL * 2 + 16, this.solved, a);

    for (let i = 0; i < TYPES.length; i++) {
      const x = gx + (i % COLS) * CELL;
      const y = gy + ((i / COLS) | 0) * CELL;
      this._tile(ctx, i, x, y, power.seen.has(i), a);
    }

    // legenda da ordem, gravada na chapa — a pista central do puzzle.
    const labels = [
      ['hand', 'puzzle_hand', 92], ['eye', 'puzzle_eye', 92 + 88], ['voice', 'puzzle_voice', 92 + 176],
    ];
    for (let i = 0; i < labels.length; i++) {
      const [icon, key, x] = labels[i];
      this._icon(ctx, icon, x, 205, '#b08f3f', a);
      text(ctx, `${i + 1}. ${T(key)}`, x + 13, 202, {
        size: 7, font: 'type', weight: 'bold', color: '#9a8f7f', alpha: a,
      });
    }

    text(ctx, this.solved ? T('puzzle_solved') : T('puzzle_hint'), VW / 2, 231, {
      size: 8, font: 'type', weight: 'bold',
      color: this.solved ? '#d5b34b' : '#70685e', align: 'center', alpha: a,
    });
  }

  _tile(ctx, i, x, y, powered, a) {
    const s = CELL - 4, cx = x + CELL / 2, cy = y + CELL / 2;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = '#0d1013';
    ctx.fillRect(x + 2, y + 2, s, s);
    ctx.fillStyle = '#30363d';
    ctx.fillRect(x + 3, y + 3, s - 2, 1);
    ctx.fillRect(x + 3, y + 3, 1, s - 2);
    ctx.fillStyle = powered ? '#c7a23f' : '#594b34';
    ctx.fillRect(cx - 2, cy - 2, 4, 4);
    for (const dir of ports(TYPES[i], this.rot[i])) {
      if (dir === 0) ctx.fillRect(cx - 1, y + 2, 3, cy - y - 2);
      if (dir === 1) ctx.fillRect(cx, cy - 1, x + CELL - cx - 2, 3);
      if (dir === 2) ctx.fillRect(cx - 1, cy, 3, y + CELL - cy - 2);
      if (dir === 3) ctx.fillRect(x + 2, cy - 1, cx - x - 2, 3);
    }
    if (i === this.cursor && !this.solved) {
      ctx.fillStyle = PAL.uiAccent;
      ctx.fillRect(x, y, CELL, 1); ctx.fillRect(x, y + CELL - 1, CELL, 1);
      ctx.fillRect(x, y, 1, CELL); ctx.fillRect(x + CELL - 1, y, 1, CELL);
    }
    ctx.restore();
    const icon = NODES[i];
    if (icon) this._icon(ctx, icon, cx - 4, cy - 4, powered ? '#f1d06c' : '#b08f3f', a);
  }

  _wire(ctx, x1, y1, x2, y2, on, a) {
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = on ? '#c7a23f' : '#4b4030';
    ctx.fillRect(Math.min(x1, x2), Math.min(y1, y2) - 1,
      Math.max(1, Math.abs(x2 - x1)), 3);
    ctx.restore();
  }

  _icon(ctx, type, x, y, color, a) {
    x = Math.round(x); y = Math.round(y);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = color;
    if (type === 'hand') {
      ctx.fillRect(x + 2, y + 3, 6, 5);
      for (let i = 0; i < 4; i++) ctx.fillRect(x + i * 2, y + (i & 1), 1, 4);
    } else if (type === 'eye') {
      ctx.fillRect(x, y + 3, 2, 2); ctx.fillRect(x + 2, y + 2, 5, 4);
      ctx.fillRect(x + 7, y + 3, 2, 2); ctx.fillStyle = '#171b20'; ctx.fillRect(x + 4, y + 3, 1, 2);
    } else {
      ctx.fillRect(x, y + 1, 3, 2); ctx.fillRect(x + 1, y + 3, 2, 3);
      ctx.fillRect(x + 2, y + 5, 4, 2); ctx.fillRect(x + 6, y + 4, 2, 2); ctx.fillRect(x + 7, y + 2, 2, 2);
    }
    ctx.restore();
  }
}
