// inventory.js — o inventario E O SOBRETUDO dele.
//
// A tela mostra o casaco aberto, visto por dentro, como se ele estivesse
// segurando as abas. Os bolsos sao os espacos. Cada item ocupa um formato,
// o espaco e limitado, e o jogador organiza como quiser.
//
// DUAS REGRAS QUE VALEM MAIS QUE O SISTEMA:
//
//  1. Abrir NAO pausa o jogo. E enquanto esta aberto, o casaco tapa parte
//     da tela — voce fica cego para o que esta atras dele. Mexer na mochila
//     no meio do galpao tem que custar alguma coisa.
//
//  2. O porrete nao cabe em bolso nenhum. Ele fica na MAO ou fica para
//     tras. E isso que transforma achar a pistola numa decisao de verdade.

import { VW, VH, gfx, clamp } from '../core/gfx.js';
import { text } from '../core/text.js';
import { PAL } from '../art/palette.js';
import { input } from '../core/input.js';
import { audio } from '../core/audio.js';
import { t as T } from '../i18n.js';

const CELL = 13;

// zonas do casaco: bolso interno esquerdo, direito, peito e cinto
const ZONES = [
  { id: 'pl', w: 4, h: 5, x: 0, y: 0, label: 'inv_pocket_l' },
  { id: 'pr', w: 4, h: 5, x: 0, y: 0, label: 'inv_pocket_r' },
  { id: 'ch', w: 3, h: 2, x: 0, y: 0, label: 'inv_chest' },
  { id: 'bt', w: 6, h: 2, x: 0, y: 0, label: 'inv_belt' },
  { id: 'ev', w: 1, h: 3, x: 0, y: 0, label: 'inv_case' },
];

// Formato de cada item, e como ele e desenhado. Nada aqui e sprite: sao
// quatro ou cinco retangulos, que a esta escala e mais legivel do que
// pixel art detalhada dentro de uma celula de 13px.
export const ITEMS = {
  ammo:    { w: 2, h: 2, name: 'it_ammo',    desc: 'it_ammo_d',    color: '#5d4a2c', edge: '#8a6a38' },
  cigs:    { w: 1, h: 1, name: 'it_cigs',    desc: 'it_cigs_d',    color: '#8d3128', edge: '#c0c0b4' },
  lighter: { w: 1, h: 1, name: 'it_lighter', desc: 'it_lighter_d', color: '#4a4a52', edge: '#b09258' },
  gun:     { w: 2, h: 1, name: 'it_gun',     desc: 'it_gun_d',     color: '#3f444b', edge: '#727880' },
  map:     { w: 2, h: 1, name: 'it_map',     desc: 'it_map_d',     color: '#8f8770', edge: '#5e5848' },
  note:    { w: 1, h: 1, name: 'it_note',    desc: 'it_note_d',    color: '#b3ac97', edge: '#8b1a14' },
  medkit:  { w: 2, h: 2, name: 'it_medkit',  desc: 'it_medkit_d',  color: '#aaa799', edge: '#8b211b', usable: true },
  sedative:{ w: 1, h: 2, name: 'it_sedative',desc: 'it_sedative_d',color: '#688ca0', edge: '#d8d2c2', usable: true },
  // A CALIBRE DOZE da mesa dele. 4x1 — ela nao cabe em bolso nenhum a nao
  // ser o cinto, e ocupa o cinto inteiro. Carregar ela custa espaco, e e
  // pra custar: e uma arma de cano longo dentro de um sobretudo.
  shotgun: { w: 4, h: 1, name: 'it_shotgun', desc: 'it_shotgun_d', color: '#4a3a26', edge: '#8f959e' },
  relay_hand: { w: 1, h: 1, name: 'it_relay_hand', desc: 'it_relay_hand_d', color: '#7c6232', edge: '#d0b368', quest: true },
  relay_eye:  { w: 1, h: 1, name: 'it_relay_eye',  desc: 'it_relay_eye_d',  color: '#6c5730', edge: '#caa95f', quest: true },
  relay_voice:{ w: 1, h: 1, name: 'it_relay_voice',desc: 'it_relay_voice_d',color: '#72572e', edge: '#d3ad5d', quest: true },
};

export class Inventory {
  constructor() {
    this.items = [];        // { key, zone, cx, cy, rot }
    this.hand = null;       // 'club' — o que nao cabe em bolso nenhum
    this.clubHp = 1;        // 1 = inteira, 0 = quebrou
    this.open = false;
    this.fade = 0;
    this.drag = null;
    this.hover = null;
    this.toast = 0;
    this.toastKey = null;
    this.onUse = null;
    this.inspect = null;
    this.upgrade = false;
    this.sanityState = 0;
    this._layout();
  }

  reset() {
    this.items.length = 0;
    this.hand = null;
    this.clubHp = 1;
    this.open = false;
    this.fade = 0;
    this.drag = null;
    this.inspect = null;
    this.upgrade = false;
    this.sanityState = 0;
    this.toast = 0;
  }

  // Posicao das zonas na tela. Calculada uma vez; o casaco nao se mexe.
  _layout() {
    // Cada bolso fica dentro da aba do casaco a que ele pertence, e o cinto
    // atravessa o meio la embaixo — porque cinto atravessa o meio. Na
    // primeira versao o cinto cortava o vao central e a tela parecia um
    // painel flutuando, nao um casaco aberto.
    const cx = VW / 2;
    const z = this._z = {};
    for (const Z of ZONES) z[Z.id] = Object.assign({}, Z);
    z.pl.x = Math.round(cx - 110); z.pl.y = 58;
    z.ch.x = Math.round(cx - 110); z.ch.y = 143;
    z.pr.x = Math.round(cx + 58);  z.pr.y = 58;
    z.bt.x = Math.round(cx - 39);  z.bt.y = 181;
    // Tres encaixes no forro central reservados a evidencias do puzzle.
    z.ev.x = Math.round(cx - CELL / 2); z.ev.y = 105;
  }

  has(key) { return this.items.some(i => i.key === key); }
  count(key) { return this.items.filter(i => i.key === key).length; }

  // Procura o primeiro lugar onde o item cabe, testando tambem de lado.
  // Se nao couber em canto nenhum, devolve false e quem chamou avisa o
  // jogador — ficar sem espaco e uma resposta valida, nao um erro.
  add(key) {
    const d = ITEMS[key];
    if (!d) return false;
    const destinos = d.quest ? [this._z.ev] : [this._z.bt, this._z.pl, this._z.pr, this._z.ch];
    for (const Z of destinos) {
      for (let rot = 0; rot < 2; rot++) {
        const w = rot ? d.h : d.w, h = rot ? d.w : d.h;
        if (w > Z.w || h > Z.h) continue;
        for (let y = 0; y <= Z.h - h; y++) {
          for (let x = 0; x <= Z.w - w; x++) {
            if (this._livre(Z.id, x, y, w, h, null)) {
              this.items.push({ key, zone: Z.id, cx: x, cy: y, rot });
              this.toast = 2.6; this.toastKey = key;
              audio.leather(0.5);
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  remove(key) {
    const i = this.items.findIndex(it => it.key === key);
    if (i < 0) return false;
    this.items.splice(i, 1);
    return true;
  }

  _size(it) {
    const d = ITEMS[it.key];
    return it.rot ? { w: d.h, h: d.w } : { w: d.w, h: d.h };
  }

  _livre(zone, x, y, w, h, ignorar) {
    for (const it of this.items) {
      if (it === ignorar || it.zone !== zone) continue;
      const s = this._size(it);
      if (x < it.cx + s.w && x + w > it.cx && y < it.cy + s.h && y + h > it.cy) return false;
    }
    return true;
  }

  toggle() {
    this.open = !this.open;
    this.drag = null;
    audio.leather(this.open ? 0.8 : 0.5);
    return this.open;
  }

  update(dt) {
    this.fade = clamp(this.fade + (this.open ? dt * 8 : -dt * 9), 0, 1);
    if (this.toast > 0) this.toast -= dt;
    if (!this.open) { this.drag = null; return; }

    // O cursor continua ativo tambem durante a inspecao. Antes as
    // coordenadas paravam no instante em que o objeto abria, portanto havia
    // um texto "E USAR", mas nenhum botao que o mouse pudesse realmente usar.
    if (input.mouse.cx === undefined) {
      const r = gfx.out ? gfx.out.getBoundingClientRect() : null;
      if (r) { input.mouse.cx = r.left + r.width / 2; input.mouse.cy = r.top + r.height / 2; }
    }
    const m = gfx.toVirtual(input.mouse.cx || 0, input.mouse.cy || 0);
    this.mx = clamp(m.x, 0, VW); this.my = clamp(m.y, 0, VH);

    if (this.inspect) {
      const turn = 1.9 * dt;
      if (input.isDown('left')) this.inspect.ry -= turn;
      if (input.isDown('right')) this.inspect.ry += turn;
      if (input.isDown('up')) this.inspect.rx -= turn;
      if (input.isDown('down')) this.inspect.rx += turn;
      if (input.mouse.down) {
        this.inspect.ry += input.mouse.dx * 0.014;
        this.inspect.rx += input.mouse.dy * 0.014;
      }
      this.inspect.rx = clamp(this.inspect.rx, -Math.PI, Math.PI);
      const bx = VW / 2 - 34, by = VH - 38, bw = 68, bh = 15;
      const clicouUsar = input.mouse.pressed
        && this.mx >= bx && this.mx <= bx + bw && this.my >= by && this.my <= by + bh;
      if ((input.pressed('interact') || clicouUsar) && this.onUse) {
        const key = this.inspect.item.key;
        this.onUse(key);
        if (!this.items.includes(this.inspect.item)) this.inspect = null;
      }
      if (input.mouse.rightPressed || input.pressed('cancel')) { this.inspect = null; audio.uiBack(); }
      return;
    }

    this.hover = this._itemEm(this.mx, this.my);

    if (this.hover && input.mouse.rightPressed) {
      this.inspect = { item: this.hover, rx: -0.34, ry: 0.42 };
      this.drag = null;
      audio.uiConfirm();
      return;
    }

    if (input.mouse.pressed && !this.drag && this.hover) {
      this.drag = this.hover;
      this.dragDX = m.x - this._telaX(this.drag);
      this.dragDY = m.y - this._telaY(this.drag);
      audio.uiMove();
    }
    // Usar o item com o cursor em cima dele. E assim que o jogador tenta
    // fumar — e e assim que ele descobre, tentativa apos tentativa, que a
    // recusa esta mudando.
    if (this.hover && !this.drag && input.pressed('interact') && this.onUse) {
      this.onUse(this.hover.key);
    }
    if (this.drag && input.pressedFrame.has('KeyR')) {
      const d = ITEMS[this.drag.key];
      if (d.w !== d.h) { this.drag.rot = this.drag.rot ? 0 : 1; audio.uiMove(); }
    }
    if (this.drag && !input.mouse.down) this._soltar(m.x, m.y);
  }

  _soltar(mx, my) {
    const it = this.drag;
    this.drag = null;
    const s = this._size(it);
    // solta pelo canto superior esquerdo do item, nao pelo cursor: pegar
    // pelo meio e soltar pelo meio e o que a mao espera
    const px = mx - this.dragDX, py = my - this.dragDY;
    for (const Z of Object.values(this._z)) {
      if (!!ITEMS[it.key].quest !== (Z.id === 'ev')) continue;
      const gx = Math.round((px - Z.x) / CELL);
      const gy = Math.round((py - Z.y) / CELL);
      if (gx < 0 || gy < 0 || gx + s.w > Z.w || gy + s.h > Z.h) continue;
      if (!this._livre(Z.id, gx, gy, s.w, s.h, it)) continue;
      it.zone = Z.id; it.cx = gx; it.cy = gy;
      audio.leather(0.4);
      return;
    }
    audio.uiBack();   // nao coube: volta para onde estava
  }

  _telaX(it) { return this._z[it.zone].x + it.cx * CELL; }
  _telaY(it) { return this._z[it.zone].y + it.cy * CELL; }

  _itemEm(x, y) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i], s = this._size(it);
      const ix = this._telaX(it), iy = this._telaY(it);
      if (x >= ix && x < ix + s.w * CELL && y >= iy && y < iy + s.h * CELL) return it;
    }
    return null;
  }

  _desc(d) {
    if (this.sanityState >= 2) {
      const alt = T(d.desc + '_low');
      if (alt.charAt(0) !== '[') return alt;
    }
    return T(d.desc);
  }

  // Aviso curto no canto quando alguma coisa entra no casaco.
  drawToast(ctx) {
    if (this.toast <= 0 || this.open) return;
    const a = clamp(Math.min(this.toast, 2.6 - this.toast + 2.0), 0, 1) * 0.9;
    const d = ITEMS[this.toastKey];
    if (!d) return;
    text(ctx, T('inv_got') + '  ' + T(d.name), VW - 14, VH - 56, {
      size: 8, font: 'ui', weight: 'bold', align: 'right', track: 1,
      color: PAL.uiDim, alpha: a, shadow: true,
    });
  }

  draw(ctx) {
    if (this.fade <= 0) return;
    const a = this.fade;

    // O casaco tapa a tela. Nao e um painel flutuando: e pano na sua frente.
    ctx.save();
    ctx.globalAlpha = a * 0.55;
    ctx.fillStyle = '#05040a';
    ctx.fillRect(0, 0, VW, VH);
    ctx.restore();

    const cx = VW / 2;
    ctx.save();
    ctx.globalAlpha = a;
    // forro do casaco — duas abas grandes, uma de cada lado
    // Forro do casaco, MUITO mais escuro do que o casaco por fora: e o
    // avesso do pano, e nao pode competir com os itens em cima dele.
    for (const s of [-1, 1]) {
      const x0 = cx + s * 12;
      const px = Math.min(x0, x0 + s * 128);
      ctx.fillStyle = '#2b1d12';
      ctx.fillRect(px, 44, 128, 190);
      ctx.fillStyle = '#332315';
      ctx.fillRect(px, 44, 128, 3);
      // costura da lapela, virada para dentro
      ctx.fillStyle = '#5c4128';
      ctx.fillRect(x0 - (s < 0 ? 3 : 0), 44, 3, 190);
    }
    // vao do meio: o corpo dele por tras do casaco
    ctx.fillStyle = '#120c08';
    ctx.fillRect(cx - 12, 44, 24, 190);
    ctx.fillStyle = PAL.tieDk;
    ctx.fillRect(cx - 3, 48, 6, 34);
    ctx.restore();

    text(ctx, T('inv_title'), cx, 30, {
      size: 11, font: 'serif', color: PAL.uiText, align: 'center', track: 3, alpha: a, shadow: true,
    });

    for (const Z of Object.values(this._z)) this._drawZona(ctx, Z, a);
    for (const it of this.items) if (it !== this.drag) this._drawItem(ctx, it, a, this._telaX(it), this._telaY(it));

    // a mao: o que nao cabe em bolso nenhum
    this._drawMao(ctx, a);

    if (this.drag) {
      this._drawItem(ctx, this.drag, a * 0.9, this.mx - this.dragDX, this.my - this.dragDY, true);
    } else if (this.hover) {
      const d = ITEMS[this.hover.key];
      text(ctx, T(d.name), cx, VH - 40, {
        size: 9, font: 'ui', weight: 'bold', color: PAL.uiAccent, align: 'center', track: 1, alpha: a,
      });
      text(ctx, this._desc(d), cx, VH - 28, {
        size: 8, font: 'ui', color: PAL.uiDim, align: 'center', alpha: a,
      });
    }

    text(ctx, T('inv_hint'), cx, VH - 14, {
      size: 7, font: 'ui', weight: 'normal', color: '#8b8174',
      align: 'center', track: 1, alpha: a, shadow: true,
    });

    // O CURSOR. A pagina esconde o ponteiro do sistema (`cursor: none`, para
    // o jogo nao ter uma seta branca de escritorio no meio do terror), e o
    // resultado era um inventario de arrastar em que ninguem via o que
    // estava arrastando. Este e desenhado dentro do jogo, no mesmo pixel
    // que todo o resto.
    if (this.inspect) this._drawInspect(ctx, a);
    if (this.mx !== undefined) this._cursor(ctx, this.mx, this.my, a);
  }

  _cursor(ctx, x, y, a) {
    x = Math.round(x); y = Math.round(y);
    ctx.save();
    ctx.globalAlpha = a;
    // sombra dura por baixo, para o cursor nunca sumir num fundo claro
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 8; i++) ctx.fillRect(x + 1, y + 1 + i, Math.max(1, 6 - i), 1);
    ctx.fillStyle = this.drag ? PAL.uiAccent : '#e8e0d2';
    for (let i = 0; i < 8; i++) ctx.fillRect(x, y + i, Math.max(1, 6 - i), 1);
    ctx.fillStyle = '#3a332c';
    ctx.fillRect(x, y, 1, 8);
    ctx.restore();
  }

  _drawZona(ctx, Z, a) {
    ctx.save();
    ctx.globalAlpha = a;
    const w = Z.w * CELL, h = Z.h * CELL;
    ctx.fillStyle = '#1d130c';
    ctx.fillRect(Z.x - 2, Z.y - 2, w + 4, h + 4);
    ctx.fillStyle = '#120c07';
    ctx.fillRect(Z.x, Z.y, w, h);
    // costura pontilhada em volta do bolso
    ctx.fillStyle = '#5a4028';
    for (let x = 0; x < w + 4; x += 3) {
      ctx.fillRect(Z.x - 2 + x, Z.y - 2, 2, 1);
      ctx.fillRect(Z.x - 2 + x, Z.y + h + 1, 2, 1);
    }
    for (let y = 0; y < h + 4; y += 3) {
      ctx.fillRect(Z.x - 2, Z.y - 2 + y, 1, 2);
      ctx.fillRect(Z.x + w + 1, Z.y - 2 + y, 1, 2);
    }
    // grade
    ctx.globalAlpha = a * 0.35;
    ctx.fillStyle = '#2e2118';
    for (let i = 1; i < Z.w; i++) ctx.fillRect(Z.x + i * CELL, Z.y, 1, h);
    for (let j = 1; j < Z.h; j++) ctx.fillRect(Z.x, Z.y + j * CELL, w, 1);
    ctx.restore();
    text(ctx, T(Z.label), Z.x, Z.y - 10, {
      size: 6, font: 'ui', color: PAL.uiFaint, track: 1, alpha: a * 0.85,
    });
  }

  _drawItem(ctx, it, a, x, y, levantado) {
    const d = ITEMS[it.key], s = this._size(it);
    const w = s.w * CELL, h = s.h * CELL;
    x = Math.round(x); y = Math.round(y);
    ctx.save();
    ctx.globalAlpha = a;
    if (levantado) {
      ctx.globalAlpha = a * 0.45; ctx.fillStyle = '#000';
      ctx.fillRect(x + 3, y + 4, w - 2, h - 2); ctx.globalAlpha = a;
    }
    this._drawItemShape(ctx, it.key, x + 1, y + 1, w - 2, h - 2);
    ctx.restore();
  }

  // Silhuetas próprias. Antes todos os itens eram o mesmo retangulo com
  // uma marca no meio; agora a forma ja identifica o objeto sem o nome.
  _drawItemShape(ctx, key, x, y, w, h, colors = null) {
    const d = ITEMS[key];
    const base = colors?.base || d.color, edge = colors?.edge || d.edge;
    const dark = colors?.dark || '#171419';
    const X = n => Math.round(x + w * n), Y = n => Math.round(y + h * n);
    const W = n => Math.max(1, Math.round(w * n)), H = n => Math.max(1, Math.round(h * n));

    if (key === 'gun') {
      ctx.fillStyle = dark; ctx.fillRect(X(.08), Y(.27), W(.78), H(.25));
      ctx.fillStyle = base; ctx.fillRect(X(.08), Y(.18), W(.72), H(.25));
      ctx.fillStyle = edge; ctx.fillRect(X(.11), Y(.18), W(.65), 1);
      ctx.fillStyle = '#25282d'; ctx.fillRect(X(.43), Y(.42), W(.18), H(.43));
      ctx.fillStyle = edge; ctx.fillRect(X(.45), Y(.45), W(.11), H(.29));
      ctx.fillStyle = dark; ctx.fillRect(X(.31), Y(.43), W(.14), H(.18));
      ctx.fillStyle = '#0b0b0d'; ctx.fillRect(X(.80), Y(.22), W(.08), H(.18));
      return;
    }
    // A CALIBRE DOZE. Ela e 4x1, entao a silhueta e quase toda cano: o que
    // diz "espingarda" e a proporcao, o guarda-mato embaixo e a coronha de
    // madeira na ponta de tras. Sem a coronha ela vira um cano de ferro.
    if (key === 'shotgun') {
      // cano duplo, com a linha de cima mais clara
      ctx.fillStyle = '#5c626b'; ctx.fillRect(X(.30), Y(.30), W(.66), H(.17));
      ctx.fillStyle = '#8f959e'; ctx.fillRect(X(.30), Y(.30), W(.66), H(.07));
      ctx.fillStyle = '#3d4147'; ctx.fillRect(X(.30), Y(.47), W(.66), H(.09));
      ctx.fillStyle = '#0b0b0d'; ctx.fillRect(X(.94), Y(.31), W(.04), H(.24));
      // bloco da culatra
      ctx.fillStyle = '#454b53'; ctx.fillRect(X(.20), Y(.26), W(.14), H(.36));
      ctx.fillStyle = edge; ctx.fillRect(X(.20), Y(.26), W(.14), 1);
      // guarda-mato e gatilho
      ctx.fillStyle = '#2b2f34'; ctx.fillRect(X(.21), Y(.62), W(.11), H(.16));
      ctx.fillStyle = '#0d0e10'; ctx.fillRect(X(.24), Y(.62), W(.04), H(.11));
      // coronha de madeira
      ctx.fillStyle = base; ctx.fillRect(X(.02), Y(.30), W(.19), H(.40));
      ctx.fillStyle = '#6b4f2f'; ctx.fillRect(X(.02), Y(.30), W(.19), H(.10));
      ctx.fillStyle = '#33261a'; ctx.fillRect(X(.02), Y(.64), W(.19), H(.06));
      ctx.fillStyle = dark; ctx.fillRect(X(.02), Y(.30), 1, H(.40));
      return;
    }
    if (key === 'map') {
      ctx.fillStyle = '#bdb59b'; ctx.fillRect(X(.05), Y(.06), W(.90), H(.86));
      ctx.fillStyle = '#8c836d'; ctx.fillRect(X(.34), Y(.06), 1, H(.86)); ctx.fillRect(X(.66), Y(.06), 1, H(.86));
      ctx.fillStyle = '#6d765d';
      ctx.fillRect(X(.12), Y(.25), W(.27), 1); ctx.fillRect(X(.38), Y(.25), 1, H(.35));
      ctx.fillRect(X(.38), Y(.58), W(.34), 1); ctx.fillRect(X(.70), Y(.43), 1, H(.18));
      ctx.fillStyle = '#7a201a'; ctx.fillRect(X(.74), Y(.67), 2, 2);
      return;
    }
    if (key === 'ammo') {
      ctx.fillStyle = '#49351e'; ctx.fillRect(X(.08), Y(.12), W(.84), H(.76));
      ctx.fillStyle = edge; ctx.fillRect(X(.08), Y(.12), W(.84), H(.12));
      for (let row = 0; row < 2; row++) for (let col = 0; col < 3; col++) {
        const bx = X(.18 + col * .23), by = Y(.34 + row * .28);
        ctx.fillStyle = '#c7a45c'; ctx.fillRect(bx, by, W(.08), H(.18));
        ctx.fillStyle = '#eee0a2'; ctx.fillRect(bx, by, W(.08), 1);
      }
      return;
    }
    if (key === 'cigs') {
      ctx.fillStyle = '#e0ddd1'; ctx.fillRect(X(.14), Y(.08), W(.72), H(.84));
      ctx.fillStyle = base; ctx.fillRect(X(.14), Y(.48), W(.72), H(.44));
      ctx.fillStyle = edge; ctx.fillRect(X(.22), Y(.16), W(.56), H(.10));
      return;
    }
    if (key === 'lighter') {
      ctx.fillStyle = '#22262b'; ctx.fillRect(X(.25), Y(.22), W(.50), H(.68));
      ctx.fillStyle = edge; ctx.fillRect(X(.25), Y(.22), W(.50), H(.16));
      ctx.fillStyle = '#c7a35b'; ctx.fillRect(X(.60), Y(.08), W(.18), H(.18));
      ctx.fillStyle = '#7a7162'; ctx.fillRect(X(.18), Y(.12), W(.32), H(.16));
      return;
    }
    if (key === 'note') {
      ctx.fillStyle = '#d0c7ad'; ctx.fillRect(X(.08), Y(.08), W(.84), H(.84));
      ctx.fillStyle = '#8f8672'; for (let i = 0; i < 3; i++) ctx.fillRect(X(.18), Y(.28 + i * .17), W(.52), 1);
      ctx.fillStyle = '#7b201a'; ctx.fillRect(X(.70), Y(.68), W(.12), H(.12));
      return;
    }
    if (key === 'medkit') {
      ctx.fillStyle = '#b9b6aa'; ctx.fillRect(X(.08), Y(.20), W(.84), H(.68));
      ctx.fillStyle = '#3f3c38'; ctx.fillRect(X(.34), Y(.08), W(.32), H(.15));
      ctx.fillStyle = '#8b211b'; ctx.fillRect(X(.43), Y(.32), W(.14), H(.42)); ctx.fillRect(X(.28), Y(.46), W(.44), H(.14));
      return;
    }
    if (key === 'sedative') {
      ctx.fillStyle = '#d8d2c2'; ctx.fillRect(X(.22), Y(.20), W(.56), H(.68));
      ctx.fillStyle = '#39444b'; ctx.fillRect(X(.18), Y(.08), W(.64), H(.18));
      ctx.fillStyle = base; ctx.fillRect(X(.18), Y(.44), W(.64), H(.22));
      ctx.fillStyle = '#eef4ef'; ctx.fillRect(X(.38), Y(.50), W(.24), 1);
      return;
    }
    if (key.startsWith('relay_')) {
      ctx.fillStyle = dark; ctx.fillRect(X(.12), Y(.12), W(.76), H(.76));
      ctx.fillStyle = base; ctx.fillRect(X(.20), Y(.20), W(.60), H(.60));
      ctx.fillStyle = edge; ctx.fillRect(X(.30), Y(.30), W(.40), H(.40));
      ctx.fillStyle = '#342817';
      if (key === 'relay_hand') {
        ctx.fillRect(X(.46), Y(.40), W(.12), H(.30));
        ctx.fillRect(X(.32), Y(.36), W(.10), H(.22)); ctx.fillRect(X(.60), Y(.34), W(.09), H(.22));
      } else if (key === 'relay_eye') {
        ctx.fillRect(X(.28), Y(.48), W(.44), H(.10)); ctx.fillRect(X(.46), Y(.40), W(.10), H(.26));
      } else {
        ctx.fillRect(X(.34), Y(.42), W(.12), H(.24));
        ctx.fillRect(X(.52), Y(.36), W(.08), H(.34)); ctx.fillRect(X(.66), Y(.28), W(.07), H(.48));
      }
      return;
    }
    ctx.fillStyle = base; ctx.fillRect(X(.08), Y(.08), W(.84), H(.84));
    ctx.fillStyle = edge; ctx.fillRect(X(.08), Y(.08), W(.84), 1);
  }

  // Inspeção em volume: o item é extrudado em várias camadas e as duas
  // rotações mudam profundidade, face visível e inclinação. Continua com o
  // pixel duro do resto do jogo, mas pode ser girado em qualquer direção.
  _drawInspect(ctx, a) {
    const I = this.inspect; if (!I) return;
    const d = ITEMS[I.item.key];
    const cx = VW / 2, cy = VH / 2 - 3;
    const sx = Math.cos(I.ry), depth = Math.sin(I.ry);
    const sy = Math.cos(I.rx), lift = Math.sin(I.rx);
    const naturalW = d.w > d.h ? 88 : (d.w === d.h ? 62 : 48);
    const naturalH = d.h > d.w ? 78 : (d.w === d.h ? 62 : 46);
    const w = Math.max(12, naturalW * Math.abs(sx));
    const h = Math.max(12, naturalH * Math.abs(sy));
    const ox = depth * 15, oy = lift * 14;

    ctx.save();
    ctx.globalAlpha = a * 0.96;
    ctx.fillStyle = 'rgba(4,3,6,0.92)'; ctx.fillRect(52, 38, VW - 104, VH - 76);
    ctx.fillStyle = '#171218'; ctx.fillRect(55, 41, VW - 110, VH - 82);
    // sombra no fundo
    ctx.globalAlpha = a * 0.35; ctx.fillStyle = '#000';
    ctx.fillRect(Math.round(cx - w / 2 + 9), Math.round(cy - h / 2 + 13), Math.round(w), Math.round(h));
    // Profundidade da silhueta, nao de um tijolo generico.
    ctx.globalAlpha = a;
    const layers = 9;
    for (let i = layers; i >= 0; i--) {
      const k = i / layers;
      this._drawItemShape(ctx, I.item.key,
        Math.round(cx - w / 2 + ox * k), Math.round(cy - h / 2 + oy * k),
        Math.round(w), Math.round(h), i === 0 ? null : {
          base: i < 3 ? d.edge : '#282329', edge: '#171419', dark: '#0b090c',
        });
    }
    ctx.restore();

    text(ctx, T(d.name), cx, 50, { size: 10, font: 'ui', weight: 'bold', color: PAL.uiText, align: 'center', track: 1, alpha: a });
    text(ctx, this._desc(d), cx, VH - 68, { size: 8, font: 'ui', color: PAL.uiDim, align: 'center', alpha: a });
    text(ctx, T('inv_inspect_hint'), cx, VH - 54, { size: 7, font: 'ui', color: PAL.uiFaint, align: 'center', track: 1, alpha: a });
    if (d.usable || I.item.key === 'cigs' || I.item.key === 'lighter' || I.item.key === 'map') {
      const bx = cx - 34, by = VH - 38, bw = 68, bh = 15;
      const hover = this.mx >= bx && this.mx <= bx + bw && this.my >= by && this.my <= by + bh;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = hover ? '#b7a365' : '#29231f'; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = hover ? '#efe8d8' : '#827454';
      ctx.fillRect(bx, by, bw, 1); ctx.fillRect(bx, by + bh - 1, bw, 1);
      ctx.restore();
      text(ctx, T('inv_use_button'), cx, by + 4, { size: 8, font: 'ui', weight: 'bold', color: hover ? '#17120e' : PAL.uiAccent, align: 'center', track: 1, alpha: a });
    }
  }

  // O porrete. Fica de fora dos bolsos de proposito, e a barra embaixo dele
  // e o quanto de madeira ainda sobrou.
  _drawMao(ctx, a) {
    const x = 26, y = 110;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = '#120c07';
    ctx.fillRect(x - 2, y - 2, CELL + 4, CELL * 4 + 4);
    ctx.fillStyle = '#5a4028';
    ctx.fillRect(x - 2, y - 2, CELL + 4, 1);
    ctx.fillRect(x - 2, y + CELL * 4 + 1, CELL + 4, 1);
    if (this.hand === 'club') {
      ctx.fillStyle = PAL.wood;
      ctx.fillRect(x + 3, y + 2, 7, CELL * 4 - 6);
      ctx.fillStyle = PAL.woodHi;
      ctx.fillRect(x + 4, y + 2, 2, CELL * 4 - 6);
      ctx.fillStyle = '#8f959e';
      ctx.fillRect(x + 6, y + CELL * 4 - 6, 1, 4);
      // quanto de ripa ainda sobrou
      ctx.fillStyle = '#2a2320';
      ctx.fillRect(x, y + CELL * 4 + 5, CELL, 2);
      ctx.fillStyle = this.clubHp > 0.35 ? '#7a5a30' : PAL.uiAccent;
      ctx.fillRect(x, y + CELL * 4 + 5, Math.round(CELL * clamp(this.clubHp, 0, 1)), 2);
    }
    ctx.restore();
    text(ctx, this.hand === 'club' ? T('it_club') : '—', x + CELL / 2, y - 12, {
      size: 7, font: 'ui', color: this.hand ? PAL.uiDim : PAL.uiFaint,
      align: 'center', track: 1, alpha: a,
    });
  }

  save() {
    return { items: this.items.map(i => ({ k: i.key, z: i.zone, x: i.cx, y: i.cy, r: i.rot })),
             hand: this.hand, hp: this.clubHp, upgrade: this.upgrade };
  }

  load(d) {
    this.reset();
    if (!d) return;
    for (const i of (d.items || [])) {
      if (ITEMS[i.k]) this.items.push({ key: i.k, zone: i.z, cx: i.x, cy: i.y, rot: i.r });
    }
    this.hand = d.hand || null;
    this.clubHp = typeof d.hp === 'number' ? d.hp : 1;
    this.upgrade = !!d.upgrade;
  }
}
