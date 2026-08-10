// journal.js — o caderno.
//
// Referencia: Red Dead Redemption 2 e The Last of Us. Ele anota SOZINHO; o
// jogador nunca digita. Escrever restaura um pouco de sanidade, porque
// escrever e organizar a cabeca — e essa e a unica forma de se recuperar
// ate o cigarro destravar, la no Capitulo 3.
//
// A ideia que sustenta o jogo inteiro esta aqui: conforme a sanidade cai,
// aparecem paginas que ELE NAO ESCREVEU. Letra diferente, mais firme,
// dizendo coisas que ele nao sabia. Elas nao sao comentadas por ninguem.

import { VW, VH, clamp } from '../core/gfx.js';
import { text, wrap } from '../core/text.js';
import { PAL } from '../art/palette.js';
import { input } from '../core/input.js';
import { audio } from '../core/audio.js';
import { t as T, tx, JOURNAL, findDeduction } from '../i18n.js';

const CAT_KEY = {
  clue: 'jr_cat_clue', people: 'jr_cat_people',
  place: 'jr_cat_place', self: 'jr_cat_self', other: 'jr_cat_other',
  document: 'jr_cat_document', deduc: 'jr_cat_deduc',
};

export class Journal {
  constructor() {
    this.pages = [];        // chaves na ordem em que foram anotadas
    this.docs = [];         // documentos encontrados, sem interpretação
    this.tab = 'notes';
    this.open = false;
    this.idx = 0;
    this.fade = 0;
    // aviso de "anotado" que aparece no canto sem abrir o caderno
    this.toast = 0;
    this.toastKey = null;
    // animacao de escrita a mao da pagina que esta sendo lida
    this.write = 1;
    this.writeT = 0;
    // ---- deducao ----
    // `marked` e a pagina que ele esta segurando com o dedo. `deduced` sao
    // as combinacoes que ja fecharam, para nao renderem sanidade duas vezes.
    // `flash` e a resposta curta ("fecha" / "nao fecha") logo abaixo do texto.
    this.marked = null;
    this.deduced = [];
    this.flash = 0;
    this.flashOk = false;
    this.onDeduce = null;
    // as duas bancadas da aba PROVAS, e o botao
    this.slotA = null;
    this.slotB = null;
    this.mx = 0; this.my = 0;
    this.btnHover = false;
  }

  reset() {
    this.pages.length = 0;
    this.docs.length = 0;
    this.tab = 'notes';
    this.open = false;
    this.idx = 0;
    this.fade = 0;
    this.toast = 0;
    this.marked = null;
    this.deduced.length = 0;
    this.flash = 0;
    this.slotA = null;
    this.slotB = null;
  }

  has(key) { return this.pages.indexOf(key) >= 0; }
  hasDocument(key) { return this.docs.indexOf(key) >= 0; }

  // As tres abas. PROVAS nao e uma lista diferente: e a mesma lista de
  // anotacoes, vista de outro jeito — duas bancadas e um botao. Conclusao
  // ja tirada nao volta para a bancada, senao vira insumo de si mesma.
  _list() {
    if (this.tab === 'docs') return this.docs;
    if (this.tab === 'evid') return this.provas();
    return this.pages;
  }

  provas() {
    return this.pages.filter(k => {
      const e = JOURNAL[k];
      return e && e.cat !== 'deduc';
    });
  }

  // Devolve true se a pagina e nova. Quem chama decide se devolve sanidade —
  // as paginas alheias NAO devolvem nada, pelo contrario.
  add(key) {
    if (!JOURNAL[key] || this.has(key)) return false;
    this.pages.push(key);
    this.toast = 3.2;
    this.toastKey = key;
    audio.writing(0.9);
    return true;
  }

  addDocument(key) {
    if (!JOURNAL[key] || this.hasDocument(key)) return false;
    this.docs.push(key);
    this.toast = 3.2;
    this.toastKey = key;
    audio.pageTurn(0.75);
    return true;
  }

  replaceDocument(oldKey, newKey) {
    if (!JOURNAL[newKey]) return false;
    const i = this.docs.indexOf(oldKey);
    if (i >= 0) this.docs.splice(i, 1, newKey);
    else if (!this.hasDocument(newKey)) this.docs.push(newKey);
    this.toast = 3.2;
    this.toastKey = newKey;
    this.idx = Math.max(0, this.docs.indexOf(newKey));
    audio.pageTurn(0.95);
    return true;
  }

  // -------------------------------------------------------------------
  // O VERBO DE DEDUCAO
  //
  // Ele segura uma pagina com o dedo e encosta noutra. Se as duas falam da
  // mesma coisa, ele escreve uma terceira. O jogo nao diz quais combinam e
  // nao marca nada na tela: ou o jogador percebe, ou nao percebe. Errar
  // custa uma linha seca e mais nada.
  // -------------------------------------------------------------------

  hasDeduced(id) { return this.deduced.indexOf(id) >= 0; }

  // Poe a prova sob o cursor na primeira bancada livre. Repetir tira de la.
  _porNaBancada() {
    const lista = this.provas();
    const key = lista[this.idx];
    if (!key) return;
    if (this.slotA === key) { this.slotA = null; audio.uiBack(); return; }
    if (this.slotB === key) { this.slotB = null; audio.uiBack(); return; }
    if (!this.slotA) { this.slotA = key; audio.uiMove(); return; }
    if (!this.slotB) { this.slotB = key; audio.uiMove(); return; }
    // as duas cheias: a nova empurra a mais antiga para fora
    this.slotA = this.slotB; this.slotB = key; audio.uiMove();
  }

  // O BOTAO. Antes isto era `X` numa pagina e `X` noutra, sem nada na tela
  // dizendo que dava para fazer — e ninguem ia descobrir sozinho.
  juntar() {
    if (!this.slotA || !this.slotB) {
      this.flash = 1.4; this.flashOk = false;
      audio.uiBack();
      return false;
    }
    const ded = findDeduction(this.slotA, this.slotB);
    if (!ded || this.hasDeduced(ded.id)) {
      this.flash = 1.8; this.flashOk = false;
      audio.uiBack();
      return false;
    }
    this.deduced.push(ded.id);
    this.slotA = null; this.slotB = null;
    this.flash = 2.4; this.flashOk = true;
    if (this.add(ded.page)) {
      this.tab = 'notes';
      this.idx = this.pages.indexOf(ded.page);
      this._startWrite();
    }
    audio.pageTurn(1.05);
    if (this.onDeduce) this.onDeduce(ded);
    return true;
  }

  // Atalho antigo, mantido: na aba de anotacoes o `X` continua segurando
  // uma pagina com o dedo. Quem preferir a bancada usa a aba PROVAS.
  _marcar() {
    if (this.tab === 'evid') { this._porNaBancada(); return; }
    if (this.tab !== 'notes') return;              // documento nao e raciocinio dele
    const key = this.pages[this.idx];
    if (!key) return;
    const e = JOURNAL[key];
    if (e && e.cat === 'deduc') return;            // conclusao nao vira insumo

    if (this.marked === key) { this.marked = null; audio.uiBack(); return; }
    if (!this.marked) { this.marked = key; audio.uiMove(); return; }

    const ded = findDeduction(this.marked, key);
    if (!ded || this.hasDeduced(ded.id)) {
      this.flash = 1.8; this.flashOk = false;
      audio.uiBack();
      return;
    }

    this.deduced.push(ded.id);
    this.marked = null;
    this.flash = 2.4; this.flashOk = true;
    if (this.add(ded.page)) {
      this.idx = this.pages.indexOf(ded.page);
      this._startWrite();
    }
    audio.pageTurn(1.05);
    if (this.onDeduce) this.onDeduce(ded);
  }

  toggle() {
    if (!this.pages.length && !this.docs.length) return false;
    this.open = !this.open;
    this.marked = null;
    this.flash = 0;
    if (this.open) {
      if (!this._list().length) this.tab = this.tab === 'notes' ? 'docs' : 'notes';
      this.idx = Math.max(0, this._list().length - 1);   // abre na ultima anotacao
      this._startWrite();
      audio.pageTurn(0.8);
    } else audio.uiBack();
    return true;
  }

  _startWrite() {
    const k = this._list()[this.idx];
    const e = JOURNAL[k];
    this.write = 0;
    this.writeT = 0;
    this.total = e ? tx(e).length : 0;
  }

  update(dt) {
    this.fade = clamp(this.fade + (this.open ? dt * 7 : -dt * 8), 0, 1);
    if (this.toast > 0) this.toast -= dt;
    if (!this.open) return;

    if (this.write < 1) {
      this.write = Math.min(1, this.write + dt * (1 / Math.max(0.6, this.total / 34)));
      this.writeT += dt;
      if (this.writeT > 0.07) { this.writeT = 0; audio.writing(0.5); }
    }

    if (this.flash > 0) this.flash -= dt;

    // Z cicla as tres abas: ANOTACOES -> PROVAS -> DOCUMENTOS.
    if (input.pressedFrame.has('KeyZ')) {
      const ordem = ['notes', 'evid', 'docs'];
      let i = ordem.indexOf(this.tab);
      for (let k = 0; k < 3; k++) {
        i = (i + 1) % 3;
        const alvo = ordem[i];
        const n = alvo === 'docs' ? this.docs.length
          : alvo === 'evid' ? this.provas().length : this.pages.length;
        if (n) { this.tab = alvo; break; }
      }
      this.idx = Math.max(0, Math.min(this.idx, this._list().length - 1));
      this._startWrite(); audio.pageTurn(0.85);
      this.marked = null;
    }

    if (input.pressedFrame.has('KeyX')) this._marcar();

    // ---- a bancada de provas ----
    if (this.tab === 'evid') {
      this.mx = input.mouse.x; this.my = input.mouse.y;
      const b = this._botao();
      this.btnHover = this.mx >= b.x && this.mx <= b.x + b.w
        && this.my >= b.y && this.my <= b.y + b.h;
      if (input.mouse.pressed && this.btnHover) this.juntar();
      // Enter tambem junta: quem joga de teclado nao pode ficar de fora.
      if (input.pressed('confirm')) this.juntar();
    }

    const n = this._list().length;
    if (!n) return;
    if (input.pressed('menuLeft') || input.pressed('menuUp')) {
      this.idx = (this.idx + n - 1) % n; this._startWrite(); audio.pageTurn(0.7);
    } else if (input.pressed('menuRight') || input.pressed('menuDown')) {
      this.idx = (this.idx + 1) % n; this._startWrite(); audio.pageTurn(0.7);
    }
  }

  // Aviso discreto no canto. Nao para o jogo, nao pede nada.
  drawToast(ctx) {
    if (this.toast <= 0) return;
    const a = clamp(Math.min(this.toast, 3.2 - this.toast + 2.6), 0, 1) * 0.9;
    const e = JOURNAL[this.toastKey];
    const alheia = e && e.alheia;
    const deduc = e && e.cat === 'deduc';
    text(ctx, T(deduc ? 'jr_ded_new' : 'jr_new'), VW - 14, VH - 44, {
      size: 8, font: 'ui', weight: 'bold', align: 'right', track: 2,
      color: (alheia || deduc) ? PAL.uiAccent : PAL.uiDim, alpha: a, shadow: true,
    });
    text(ctx, 'Q', VW - 14, VH - 34, {
      size: 8, font: 'ui', weight: 'bold', align: 'right', track: 1,
      color: PAL.uiFaint, alpha: a, shadow: true,
    });
  }

  // A caixa do botao JUNTAR, em coordenadas de tela. Fica aqui porque o
  // update precisa dela para o clique e o draw precisa dela para pintar.
  _botao() {
    const w = 282, h = 176;
    const x = Math.round((VW - w) / 2), y = Math.round((VH - h) / 2) + 2;
    return { x: x + w - 84, y: y + h - 26, w: 70, h: 16 };
  }

  // ---- A ABA PROVAS ----
  //
  // Duas bancadas e um botao. A mecanica e a mesma de antes, mas agora ela
  // esta NA TELA: o jogador ve os dois espacos vazios e entende sozinho que
  // e para pôr duas coisas ali.
  _drawProvas(ctx, a) {
    const w = 282, h = 176;
    const x = Math.round((VW - w) / 2), y = Math.round((VH - h) / 2) + 2;

    text(ctx, T('jr_tab_evid'), x + 28, y + 10, {
      size: 8, font: 'ui', weight: 'bold', color: '#5c503c', track: 2, alpha: a,
    });
    ctx.save();
    ctx.globalAlpha = a * 0.5;
    ctx.fillStyle = '#8b8069';
    ctx.fillRect(x + 28, y + 24, w - 40, 1);
    ctx.restore();

    // as duas bancadas
    const slots = [this.slotA, this.slotB];
    for (let i = 0; i < 2; i++) {
      const sx = x + 26 + i * 120, sy = y + 34, sw = 108, sh = 46;
      ctx.save();
      ctx.globalAlpha = a * 0.6;
      ctx.fillStyle = slots[i] ? '#b3aa90' : '#bdb49a';
      ctx.fillRect(sx, sy, sw, sh);
      ctx.globalAlpha = a;
      ctx.fillStyle = slots[i] ? '#8a5a2a' : '#9a917a';
      ctx.fillRect(sx, sy, sw, 1);
      ctx.fillRect(sx, sy + sh - 1, sw, 1);
      ctx.fillRect(sx, sy, 1, sh);
      ctx.fillRect(sx + sw - 1, sy, 1, sh);
      ctx.restore();
      if (slots[i]) {
        const e = JOURNAL[slots[i]];
        text(ctx, T(CAT_KEY[e.cat] || 'jr_cat_clue'), sx + 5, sy + 4, {
          size: 7, font: 'ui', weight: 'bold', color: '#8a5a2a', track: 1, alpha: a,
        });
        const linhas = wrap(tx(e), sw - 12, { size: 7, font: 'ui' }).slice(0, 4);
        for (let l = 0; l < linhas.length; l++) {
          text(ctx, linhas[l], sx + 5, sy + 15 + l * 8, {
            size: 7, font: 'ui', color: '#3a322a', alpha: a,
          });
        }
      } else {
        text(ctx, T('jr_slot_empty'), sx + sw / 2, sy + sh / 2 - 4, {
          size: 7, font: 'ui', color: '#8d846f', align: 'center', track: 1, alpha: a * 0.9,
        });
      }
    }

    // a lista de provas, com a que esta sob o cursor destacada
    const lista = this.provas();
    const topo = Math.max(0, Math.min(this.idx - 2, lista.length - 5));
    for (let i = 0; i < Math.min(5, lista.length); i++) {
      const k = lista[topo + i];
      if (!k) break;
      const e = JOURNAL[k];
      const sel = topo + i === this.idx;
      const naBancada = k === this.slotA || k === this.slotB;
      const ly = y + 90 + i * 11;
      if (sel) {
        text(ctx, '>', x + 22, ly, {
          size: 8, font: 'ui', weight: 'bold', color: '#8a5a2a', alpha: a,
        });
      }
      const rotulo = `${T(CAT_KEY[e.cat] || 'jr_cat_clue')}  ${tx(e).slice(0, 46)}...`;
      text(ctx, rotulo, x + 32, ly, {
        size: 7, font: 'ui', weight: sel ? 'bold' : 'normal',
        color: naBancada ? '#8a5a2a' : (sel ? '#2e2620' : '#5a5145'), alpha: a,
      });
    }

    // O BOTAO
    const b = this._botao();
    const pronto = !!(this.slotA && this.slotB);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = pronto ? (this.btnHover ? '#8a5a2a' : '#6d4720') : '#8d846f';
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = pronto ? '#b0793c' : '#9a917a';
    ctx.fillRect(b.x, b.y, b.w, 1);
    ctx.restore();
    text(ctx, T('jr_btn_join'), b.x + b.w / 2, b.y + 4, {
      size: 8, font: 'ui', weight: 'bold', align: 'center', track: 1,
      color: pronto ? '#f0e4d0' : '#c9c1a8', alpha: a,
    });

    if (this.flash > 0) {
      const fa = clamp(this.flash, 0, 1) * a;
      text(ctx, this.flashOk ? T('jr_ded_ok') : T('jr_ded_no'), x + 30, y + h - 22, {
        size: 9, font: 'ui', weight: 'bold', track: 1, alpha: fa,
        color: this.flashOk ? '#7a4a12' : '#7d7466',
      });
    }

    text(ctx, T('jr_hint_evid'), VW / 2, y + h + 12, {
      size: 7, font: 'ui', color: '#5a5249', align: 'center', track: 1, alpha: a, shadow: true,
    });
  }

  draw(ctx) {
    if (this.fade <= 0) return;
    const a = this.fade;
    const list = this._list();
    const key = list[this.idx];
    const e = JOURNAL[key];
    // A aba PROVAS desenha a bancada, nao uma pagina — mas o caderno em
    // volta e o mesmo, entao ela entra depois do papel, mais abaixo.
    if (!e && this.tab !== 'evid') return;

    // fundo: a tela nao apaga, so escurece. O jogo continua atras.
    ctx.save();
    ctx.globalAlpha = a * 0.72;
    ctx.fillStyle = '#05040a';
    ctx.fillRect(0, 0, VW, VH);
    ctx.restore();

    const w = 282, h = 176;
    const x = Math.round((VW - w) / 2), y = Math.round((VH - h) / 2) + 2;

    ctx.save();
    ctx.globalAlpha = a;
    // capa de couro aparecendo nas bordas
    ctx.fillStyle = '#2a1c12';
    ctx.fillRect(x - 5, y - 5, w + 10, h + 10);
    ctx.fillStyle = '#3a2718';
    ctx.fillRect(x - 5, y - 5, w + 10, 2);
    // papel encardido
    ctx.fillStyle = '#c9c1a8';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#bdb49a';
    ctx.fillRect(x, y + h - 6, w, 6);
    // Uma pagina por vez. Antes o texto atravessava a dobra central do
    // caderno e parecia uma massa de letras sobrepostas.
    ctx.globalAlpha = a * 0.35;
    ctx.fillStyle = '#9a917a';
    for (let ly = y + 38; ly < y + h - 10; ly += 12) ctx.fillRect(x + 25, ly, w - 36, 1);
    ctx.globalAlpha = a * 0.42;
    ctx.fillStyle = '#985f55';
    ctx.fillRect(x + 21, y + 29, 1, h - 39);
    ctx.restore();

    if (this.tab === 'evid') { this._drawProvas(ctx, a); return; }
    if (!e) return;

    // A pagina que ele esta segurando com o dedo: dobra de canto marcada e
    // uma faixa quente na borda. Nada de icone — e um caderno.
    if (this.marked && this.marked === key) {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#8a5a2a';
      ctx.fillRect(x, y, 3, h);
      ctx.fillStyle = '#b0793c';
      ctx.fillRect(x + w - 10, y, 10, 8);
      ctx.restore();
    }

    // cabecalho: categoria e numero da pagina
    text(ctx, this.tab === 'docs' ? T('jr_tab_docs') : T('jr_tab_notes'), x + 28, y + 10, {
      size: 8, font: 'ui', weight: 'bold', color: e.alheia ? '#7a2018' : '#5c503c',
      track: 2, alpha: a,
    });
    text(ctx, `${T(CAT_KEY[e.cat] || 'jr_cat_clue')}   ${T('jr_page')} ${this.idx + 1}/${list.length}`, x + w - 12, y + 10, {
      size: 8, font: 'ui', color: '#6d6250', align: 'right', track: 1, alpha: a,
    });
    ctx.save();
    ctx.globalAlpha = a * 0.5;
    ctx.fillStyle = '#8b8069';
    ctx.fillRect(x + 28, y + 24, w - 40, 1);
    ctx.restore();

    // O texto aparece letra por letra, como mao escrevendo. Pagina alheia
    // sai em vermelho seco e em caixa alta — a letra e outra, e o jogo nunca
    // diz de quem e.
    const corpo = tx(e);
    const mostrado = corpo.slice(0, Math.ceil(corpo.length * this.write));
    // O corpo usa a fonte de interface: o visual datilografado permanece nos
    // titulos, mas as anotacoes longas ganham formas mais limpas e espacadas.
    const corpoEstilo = { size: 9, font: 'ui', weight: 'normal' };
    const linhas = wrap(mostrado, w - 48, corpoEstilo);
    for (let i = 0; i < linhas.length; i++) {
      text(ctx, linhas[i], x + 30, y + 37 + i * 12, {
        ...corpoEstilo,
        color: e.alheia ? '#7e211a' : '#2e2620', alpha: a,
      });
    }

    // Resposta curta da tentativa. "Fecha." sai na cor do caderno; "não
    // fecha" sai apagado. Nenhuma das duas explica nada.
    if (this.flash > 0) {
      const fa = clamp(this.flash, 0, 1) * a;
      text(ctx, this.flashOk ? T('jr_ded_ok') : T('jr_ded_no'), x + 30, y + h - 20, {
        size: 9, font: 'ui', weight: 'bold', track: 1, alpha: fa,
        color: this.flashOk ? '#7a4a12' : '#7d7466',
      });
    }

    // Enquanto ele segura uma pagina, o rodape muda e diz o que fazer.
    const seg = this.marked && this.tab === 'notes';
    if (seg) {
      const me = JOURNAL[this.marked];
      text(ctx, `${T('jr_mark')}: ${T(CAT_KEY[me && me.cat] || 'jr_cat_clue')}`, x + w - 12, y + h - 20, {
        size: 7, font: 'ui', weight: 'bold', color: '#8a5a2a', align: 'right', track: 1, alpha: a,
      });
    }
    text(ctx, seg ? T('jr_mark_hint') : T(this.tab === 'notes' ? 'jr_hint_ded' : 'jr_hint'), VW / 2, y + h + 12, {
      size: 7, font: 'ui', color: '#5a5249', align: 'center', track: 1, alpha: a, shadow: true,
    });
  }

  save() {
    return { pages: this.pages.slice(), docs: this.docs.slice(), deduced: this.deduced.slice() };
  }
  load(arr) {
    this.reset();
    if (!arr) return;
    // 🐛 As chaves aqui NAO sao estilo. Sem elas, o `else` grudava no `if
    // (JOURNAL[k])` de dentro do `for`, e nao no `if (Array.isArray)` de
    // fora — entao um save no formato de objeto (o formato atual) caia no
    // ramo do array, nao entrava no `for`, e o caderno voltava VAZIO.
    if (Array.isArray(arr)) {
      // Saves antigos eram apenas um array de páginas.
      for (const k of arr) if (JOURNAL[k]) this.pages.push(k);
    } else {
      for (const k of (arr.pages || [])) if (JOURNAL[k]) this.pages.push(k);
      for (const k of (arr.docs || [])) if (JOURNAL[k]) this.docs.push(k);
      for (const id of (arr.deduced || [])) this.deduced.push(id);
    }
  }
}
