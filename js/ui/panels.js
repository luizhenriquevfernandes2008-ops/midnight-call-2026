// panels.js — pecas de interface usadas pelo menu principal E pela pausa:
// a escolha de arquivo de save e o painel de opcoes.
//
// Uma implementacao so nos dois lugares. Se o desenho da caixa mudar, muda
// nos dois de graca.

import { VW, VH, clamp, lerp, rgba } from '../core/gfx.js';
import { text, measure } from '../core/text.js';
import { PAL } from '../art/palette.js';
import { input } from '../core/input.js';
import { audio } from '../core/audio.js';
import { save, SLOTS, formatPlaytime, formatDate } from '../core/save.js';
import { t as T, getLang, setLang, LANGS } from '../i18n.js';
import { clearTextCache } from '../core/text.js';
import { cycleDifficulty, difficulty } from '../systems/difficulty.js';

export function panelBox(ctx, x, y, w, h, alpha = 1, accent = false) {
  ctx.save();
  ctx.globalAlpha = alpha * 0.93;
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, rgba('#151013', 0.96));
  g.addColorStop(1, rgba('#070608', 0.98));
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = accent ? PAL.uiAccent : PAL.uiBoxEdge;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillRect(x + w - 1, y, 1, h);
  ctx.restore();
}

export function screenDim(ctx, a) {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = '#040305';
  ctx.fillRect(0, 0, VW, VH);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// escolha de arquivo
// ---------------------------------------------------------------------------

const ROW_H = 40, ROW_X = 46, ROW_W = VW - 92, ROW_Y0 = 70, ROW_GAP = 5;
const VISIBLE_SLOTS = 4;

export class SlotPicker {
  constructor() {
    this.open = false;
    this.mode = 'load';
    this.sel = 0;
    this.confirm = null;   // 'over' | 'erase'
    this.confirmSel = 1;
    this.thumbs = Array(SLOTS).fill(null);
    this.anim = 0;
    this.flash = 0;
  }

  show(mode, onPick, onCancel) {
    this.open = true;
    this.mode = mode;
    this.onPick = onPick;
    this.onCancel = onCancel;
    this.data = save.list();
    this.confirm = null;
    this.anim = 0;
    if (mode === 'load') {
      const r = save.mostRecent();
      this.sel = r >= 0 ? r : 0;
    }
    this._loadThumbs();
  }

  _loadThumbs() {
    for (let i = 0; i < SLOTS; i++) {
      this.thumbs[i] = null;
      const d = this.data[i];
      if (d && d.thumb) {
        const im = new Image();
        im.onload = () => { this.thumbs[i] = im; };
        im.src = d.thumb;
      }
    }
  }

  close() { this.open = false; }

  update(dt) {
    if (!this.open) return;
    this.anim = Math.min(1, this.anim + dt * 7);
    if (this.flash > 0) this.flash -= dt;

    if (this.confirm) {
      if (input.pressed('menuLeft') || input.pressed('menuRight')) {
        this.confirmSel = this.confirmSel ? 0 : 1; audio.uiMove();
      }
      if (input.pressed('confirm')) {
        audio.uiConfirm();
        const yes = this.confirmSel === 0;
        const kind = this.confirm;
        this.confirm = null;
        if (yes && kind === 'erase') {
          save.erase(this.sel);
          this.data = save.list();
          this._loadThumbs();
        } else if (yes && kind === 'over') {
          this._pick();
        }
      } else if (input.pressed('cancel')) {
        this.confirm = null; audio.uiBack();
      }
      return;
    }

    if (input.pressed('menuDown')) { this.sel = (this.sel + 1) % SLOTS; audio.uiMove(); }
    if (input.pressed('menuUp')) { this.sel = (this.sel + SLOTS - 1) % SLOTS; audio.uiMove(); }

    if (input.pressedFrame.has('Delete') && this.data[this.sel]) {
      this.confirm = 'erase'; this.confirmSel = 1; audio.uiMove();
      return;
    }

    if (input.pressed('confirm')) {
      const d = this.data[this.sel];
      if (this.mode === 'load') {
        if (d) { audio.uiConfirm(); this._pick(); }
        else audio.uiBack();
      } else {
        if (d) { this.confirm = 'over'; this.confirmSel = 1; audio.uiMove(); }
        else { audio.uiConfirm(); this._pick(); }
      }
    } else if (input.pressed('cancel')) {
      audio.uiBack();
      this.open = false;
      if (this.onCancel) this.onCancel();
    }
  }

  _pick() {
    const i = this.sel;
    if (this.onPick) this.onPick(i, () => {
      // callback de "salvou" — atualiza a lista sem fechar
      this.data = save.list();
      this._loadThumbs();
      this.flash = 1.4;
    });
    if (this.mode === 'load') this.open = false;
  }

  draw(ctx) {
    if (!this.open) return;
    const a = this.anim;
    screenDim(ctx, 0.90 * a);
    text(ctx, T(this.mode === 'save' ? 'slots_title_save' : 'slots_title_load'), VW / 2, 42, {
      size: 15, font: 'serif', color: PAL.uiText, align: 'center', track: 2, shadow: true, alpha: a,
    });

    const first = clamp(this.sel - Math.floor(VISIBLE_SLOTS / 2), 0, SLOTS - VISIBLE_SLOTS);
    const last = Math.min(SLOTS, first + VISIBLE_SLOTS);
    for (let i = first; i < last; i++) {
      const y = ROW_Y0 + (i - first) * (ROW_H + ROW_GAP);
      const on = i === this.sel;
      const ox = on ? 3 : 0;
      panelBox(ctx, ROW_X + ox, y, ROW_W, ROW_H, a, on);

      // miniatura
      const tw = 56, th = 31;
      const tx = ROW_X + ox + 6, ty = y + (ROW_H - th) / 2;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#000';
      ctx.fillRect(tx, ty, tw, th);
      if (this.thumbs[i]) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.thumbs[i], tx, ty, tw, th);
      }
      ctx.fillStyle = on ? PAL.uiAccent : '#241d1c';
      ctx.fillRect(tx, ty, tw, 1);
      ctx.fillRect(tx, ty + th - 1, tw, 1);
      ctx.restore();

      const lx = tx + tw + 10;
      const d = this.data[i];
      text(ctx, `${T('slot')} ${i + 1}`, lx, y + 5, {
        size: 8, font: 'ui', weight: 'bold', color: on ? PAL.uiText : PAL.uiDim, track: 2, alpha: a,
      });

      if (d) {
        text(ctx, d.locationName || '—', lx, y + 17, {
          size: 9, font: 'serif', color: on ? '#e0d8c8' : '#8d8478', alpha: a,
        });
        text(ctx, `${T('playtime')} ${formatPlaytime(d.playtime || 0)}`, lx, y + 29, {
          size: 7, font: 'ui', color: PAL.uiFaint, track: 1, alpha: a,
        });
        text(ctx, formatDate(d.savedAt, getLang()), ROW_X + ox + ROW_W - 8, y + 29, {
          size: 7, font: 'ui', color: PAL.uiFaint, align: 'right', track: 1, alpha: a,
        });
      } else {
        text(ctx, T('slot_empty'), lx, y + 18, {
          size: 9, font: 'serif', color: '#4a423a', alpha: a,
        });
      }
    }

    text(ctx, `${first + 1}–${last} / ${SLOTS}`, VW / 2, VH - 31, {
      size: 7, font: 'ui', color: PAL.uiDim, align: 'center', track: 2, alpha: a,
    });

    let hint = T('menu_hint');
    if (this.data[this.sel]) hint += '      ' + T('slot_erase');
    text(ctx, hint, VW / 2, VH - 16, {
      size: 8, font: 'ui', color: PAL.uiFaint, align: 'center', track: 2, alpha: a,
    });

    if (this.flash > 0) {
      text(ctx, T('saved'), VW / 2, 58, {
        size: 10, font: 'ui', weight: 'bold', color: PAL.uiAccent, align: 'center',
        track: 3, alpha: clamp(this.flash, 0, 1),
      });
    }

    if (this.confirm) this._drawConfirm(ctx);
  }

  _drawConfirm(ctx) {
    screenDim(ctx, 0.6);
    const w = 260, h = 62, x = (VW - w) / 2, y = (VH - h) / 2;
    panelBox(ctx, x, y, w, h, 1, true);
    text(ctx, T(this.confirm === 'erase' ? 'slot_erase_ask' : 'slot_overwrite'), VW / 2, y + 14, {
      size: 10, font: 'ui', color: PAL.uiText, align: 'center',
    });
    const opts = [T('yes'), T('no')];
    for (let i = 0; i < 2; i++) {
      const ox = VW / 2 + (i === 0 ? -52 : 22);
      const on = this.confirmSel === i;
      text(ctx, opts[i], ox, y + 38, {
        size: 11, font: 'ui', weight: 'bold', track: 2,
        color: on ? PAL.uiAccent : PAL.uiDim,
      });
      if (on) { ctx.fillStyle = PAL.uiAccent; ctx.fillRect(ox - 9, y + 42, 5, 1); }
    }
  }
}

// ---------------------------------------------------------------------------
// opcoes
// ---------------------------------------------------------------------------

// ---- TELA CHEIA ----
//
// ⚠ Ela NAO e uma preferencia guardada, e nao pode ser. Tela cheia e um
// estado real da janela — nao da para restaurar sozinho ao abrir o jogo.
// Guardar "tela cheia: ligada" no arquivo de opcoes criaria uma
// configuracao que mente: apareceria ligada com o jogo em janela. Entao a
// linha PERGUNTA a cada quadro e mostra a verdade, sem opiniao propria.
//
// ---------------------------------------------------------------------
// 🐛 E A API DO NAVEGADOR NAO BASTA. Foi assim que isto nasceu quebrado.
// ---------------------------------------------------------------------
// `requestFullscreen()` dentro de um WebView EMBUTIDO — que e o caso do
// .exe da demo — nao devolve erro, nao rejeita a promessa, e NAO ACONTECE
// NADA. Testado com clique de verdade: `fullscreenElement` continua nulo e
// a janela nao muda de tamanho.
//
// O motivo e que num WebView embutido a pagina nao manda na janela. Ela
// avisa o programa hospedeiro de que quer tela cheia, e e o HOSPEDEIRO que
// tem que esticar a janela. Se ninguem do lado de fora escuta, o pedido
// morre em silencio — que e o pior tipo de falha, porque parece que o
// codigo nao rodou.
//
// Por isso existe um GANCHO OPCIONAL. Quem hospeda o jogo pode publicar:
//
//     window.__telaCheia = { ativa(), alternar() }
//
// Se o gancho existir, ele manda. Se nao existir — jogo aberto no
// navegador, no servidor de dev, no JOGO_OFFLINE.html — cai na API padrao,
// que ali funciona.
//
// ⚠ A REGRA DO PROJETO CONTINUA: o jogo NAO sabe que existe um .exe. Ele
// so pergunta se alguem esta oferecendo tela cheia. Quem implementa o
// gancho e o lancador da demo, que e de fora do jogo — do mesmo jeito que
// a musica da casa e um mp3 opcional que, se nao existir, ninguem sente
// falta.
function hospedeiro() {
  if (typeof window === 'undefined') return null;
  const h = window.__telaCheia;
  return (h && typeof h.alternar === 'function' && typeof h.ativa === 'function') ? h : null;
}

export function telaCheiaAtiva() {
  const h = hospedeiro();
  if (h) { try { return !!h.ativa(); } catch (e) { return false; } }
  if (typeof document === 'undefined') return false;
  // Os prefixos existem por causa do Safari, que ainda pede `webkit`.
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

export function alternarTelaCheia() {
  const h = hospedeiro();
  if (h) { try { h.alternar(); } catch (e) { /* o hospedeiro que se explique */ } return; }
  if (typeof document === 'undefined') return;
  try {
    if (telaCheiaAtiva()) {
      const sair = document.exitFullscreen || document.webkitExitFullscreen;
      if (sair) sair.call(document);
    } else {
      const el = document.documentElement;
      const entrar = el.requestFullscreen || el.webkitRequestFullscreen;
      // `navigationUI: 'hide'` some com a barra que alguns navegadores
      // deixam por cima; onde nao existir, o argumento e ignorado.
      if (entrar) entrar.call(el, { navigationUI: 'hide' });
    }
  } catch (e) {
    // Pode ser negada por politica do navegador ou por a janela nao ter
    // foco. Nao ha o que fazer, e nao ha por que derrubar o menu: a linha
    // continua mostrando DESLIGADO, que e a verdade.
  }
}

export class OptionsPanel {
  constructor(settings, onChange) {
    this.s = settings;
    this.onChange = onChange;
    this.open = false;
    this.sel = 0;
    this.anim = 0;
    this.rows = [
      { key: 'opt_lang', type: 'lang' },
      { key: 'opt_difficulty', type: 'difficulty', f: 'difficulty' },
      { key: 'opt_master', type: 'range', f: 'master' },
      { key: 'opt_music', type: 'range', f: 'music' },
      { key: 'opt_sfx', type: 'range', f: 'sfx' },
      { key: 'opt_voice', type: 'range', f: 'voice' },
      { key: 'opt_subs', type: 'bool', f: 'subs' },
      // Sem `f`: nao ha campo em `settings` para guardar. Ver o comentario
      // grande acima — esta linha reflete a janela, nao uma preferencia.
      { key: 'opt_fullscreen', type: 'fullscreen' },
      { key: 'opt_scan', type: 'range', f: 'scanlines', max: 0.18 },
      { key: 'opt_grain', type: 'range', f: 'grain', max: 0.06 },
      { key: 'opt_shake', type: 'bool', f: 'shake' },
      { key: 'opt_pixel', type: 'bool', f: 'pixelPerfect' },
    ];
  }

  show(onClose) { this.open = true; this.onClose = onClose; this.anim = 0; this.sel = 0; }

  update(dt) {
    if (!this.open) return;
    this.anim = Math.min(1, this.anim + dt * 7);
    const n = this.rows.length;
    if (input.pressed('menuDown')) { this.sel = (this.sel + 1) % n; audio.uiMove(); }
    if (input.pressed('menuUp')) { this.sel = (this.sel + n - 1) % n; audio.uiMove(); }

    const r = this.rows[this.sel];
    const dir = (input.pressed('menuRight') ? 1 : 0) - (input.pressed('menuLeft') ? 1 : 0);
    if (dir !== 0) {
      if (r.type === 'range') {
        const max = r.max === undefined ? 1 : r.max;
        this.s[r.f] = clamp(+(this.s[r.f] + dir * max / 10).toFixed(3), 0, max);
      } else if (r.type === 'bool') {
        this.s[r.f] = !this.s[r.f];
      } else if (r.type === 'lang') {
        const i = LANGS.indexOf(getLang());
        setLang(LANGS[(i + dir + LANGS.length) % LANGS.length]);
        this.s.lang = getLang();
        clearTextCache();
      } else if (r.type === 'difficulty') {
        this.s.difficulty = cycleDifficulty(this.s.difficulty || 'hard', dir);
      } else if (r.type === 'fullscreen') {
        alternarTelaCheia();
      }
      audio.uiMove();
      if (this.onChange) this.onChange();
    }

    // ⚠ A tela cheia entra JUNTO com o `bool` no confirmar, mas NAO no
    // `this.s[r.f] = !this.s[r.f]` — ela nao tem campo em `settings`, e essa
    // linha escreveria `settings[undefined]`. Por isso os dois ramos.
    const alternavel = r.type === 'bool' || r.type === 'fullscreen';
    if (input.pressed('cancel') || (input.pressed('confirm') && alternavel)) {
      if (input.pressed('confirm')) {
        if (r.type === 'fullscreen') alternarTelaCheia();
        else this.s[r.f] = !this.s[r.f];
        if (this.onChange) this.onChange();
        audio.uiConfirm();
      } else {
        audio.uiBack();
        this.open = false;
        if (this.onClose) this.onClose();
      }
    }
  }

  draw(ctx) {
    if (!this.open) return;
    const a = this.anim;
    screenDim(ctx, 0.90 * a);
    text(ctx, T('opt_title'), VW / 2, 26, {
      size: 15, font: 'serif', color: PAL.uiText, align: 'center', track: 2, shadow: true, alpha: a,
    });

    // ⚠ A ALTURA DA CAIXA SEGUE O NUMERO DE LINHAS, e a tela tem 270px. Com
    // 16px por linha a lista passou a bater na descricao do rodape assim que
    // a tela cheia entrou — a caixa terminava DEPOIS do texto que deveria
    // ficar embaixo dela. Agora o passo diminui sozinho quando a lista
    // cresce, e o rodape e calculado a partir do fim da caixa em vez de ser
    // um numero escrito na mao. Assim a proxima opcao nova nao quebra nada.
    const x = 88, w = 304;
    const y0 = 43;
    const rh = this.rows.length > 11 ? 15 : 16;
    const alturaCaixa = this.rows.length * rh + 16;
    const fimDaCaixa = y0 - 8 + alturaCaixa;
    panelBox(ctx, x - 14, y0 - 8, w + 28, alturaCaixa, a);

    for (let i = 0; i < this.rows.length; i++) {
      const r = this.rows[i];
      const y = y0 + i * rh;
      const on = i === this.sel;
      if (on) {
        ctx.save();
        ctx.globalAlpha = a * 0.22;
        ctx.fillStyle = PAL.uiAccent;
        ctx.fillRect(x - 10, y - 2, w + 20, rh - 2);
        ctx.restore();
        ctx.fillStyle = PAL.uiAccent;
        ctx.fillRect(x - 10, y - 2, 2, rh - 2);
      }
      text(ctx, T(r.key), x, y, {
        size: 9, font: 'ui', weight: on ? 'bold' : 'normal',
        color: on ? PAL.uiText : PAL.uiDim, track: 1, alpha: a,
      });

      const vx = x + w - 4;
      if (r.type === 'lang') {
        text(ctx, getLang() === 'pt' ? 'PORTUGUES' : 'ENGLISH', vx, y, {
          size: 9, font: 'ui', weight: 'bold', color: on ? PAL.uiAccent : PAL.uiDim,
          align: 'right', track: 1, alpha: a,
        });
      } else if (r.type === 'difficulty') {
        const d = difficulty(this.s.difficulty);
        text(ctx, T(d.name), vx, y, {
          size: 9, font: 'ui', weight: 'bold', color: d.recommended ? PAL.uiAccent : (on ? PAL.uiText : PAL.uiDim),
          align: 'right', track: 1, alpha: a,
        });
      } else if (r.type === 'bool' || r.type === 'fullscreen') {
        // A tela cheia le a JANELA, nao o arquivo de opcoes: se o jogador
        // sair por Esc ou F11, a linha acompanha sozinha.
        const ligado = r.type === 'fullscreen' ? telaCheiaAtiva() : !!this.s[r.f];
        text(ctx, ligado ? T('on') : T('off'), vx, y, {
          size: 9, font: 'ui', weight: 'bold',
          color: ligado ? (on ? PAL.uiAccent : PAL.uiText) : PAL.uiFaint,
          align: 'right', track: 1, alpha: a,
        });
      } else {
        const max = r.max === undefined ? 1 : r.max;
        const k = clamp(this.s[r.f] / max, 0, 1);
        const bw = 78, bx = vx - bw;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = '#241d1c';
        ctx.fillRect(bx, y + 3, bw, 4);
        ctx.fillStyle = on ? PAL.uiAccent : '#5c534a';
        ctx.fillRect(bx, y + 3, Math.round(bw * k), 4);
        ctx.restore();
      }
    }

    const selected = this.rows[this.sel];
    const yRodape = fimDaCaixa + 8;
    if (selected && selected.type === 'difficulty') {
      const d = difficulty(this.s.difficulty);
      text(ctx, T(d.desc), VW / 2, yRodape, {
        size: 7, font: 'ui', color: d.recommended ? '#c6a267' : PAL.uiDim,
        align: 'center', alpha: a, shadow: true,
      });
    } else if (selected && selected.type === 'fullscreen') {
      // A dica aparece com a linha selecionada, ligada ou desligada: ela
      // ensina o atalho, nao avisa de um efeito colateral.
      text(ctx, T('opt_fs_hint'), VW / 2, yRodape, {
        size: 7, font: 'ui', color: PAL.uiDim,
        align: 'center', alpha: a, shadow: true,
      });
    }

    text(ctx, T('menu_hint'), VW / 2, VH - 16, {
      size: 8, font: 'ui', color: PAL.uiFaint, align: 'center', track: 2, alpha: a,
    });
  }
}

// ---------------------------------------------------------------------------
// SELETOR DE CAPITULO
//
// Jogar o Capitulo 2 inteiro toda vez que se quer olhar dois minutos do
// Capitulo 3 e uma hora de trabalho por vez. Os tres primeiros ja nascem
// liberados: nao ha nada a destravar, e travar conteudo num jogo que ainda
// esta sendo feito so atrapalha quem esta fazendo.
//
// Escolher um capitulo NAO apaga nenhum arquivo salvo. Ele monta um estado
// novo em memoria e entra — os dez saves continuam onde estavam.
// ---------------------------------------------------------------------------

export const CHAPTERS = [
  { n: 1, nome: 'chap1_name', desc: 'chap1_desc' },
  { n: 2, nome: 'chap2_name', desc: 'chap2_desc' },
  { n: 3, nome: 'chap3_name', desc: 'chap3_desc' },
];

export class ChapterPicker {
  constructor() {
    this.open = false;
    this.sel = 0;
    this.fade = 0;
    this.onPick = null;
    this.onCancel = null;
  }

  show(onPick, onCancel) {
    this.open = true;
    this.sel = 0;
    this.onPick = onPick;
    this.onCancel = onCancel || null;
    audio.uiConfirm();
  }

  update() {
    if (!this.open) return;
    const n = CHAPTERS.length;
    if (input.pressed('menuUp')) { this.sel = (this.sel + n - 1) % n; audio.uiMove(); }
    if (input.pressed('menuDown')) { this.sel = (this.sel + 1) % n; audio.uiMove(); }
    if (input.pressed('confirm')) {
      const c = CHAPTERS[this.sel];
      this.open = false;
      audio.uiConfirm();
      if (this.onPick) this.onPick(c.n);
    } else if (input.pressed('cancel')) {
      this.open = false;
      audio.uiBack();
      if (this.onCancel) this.onCancel();
    }
  }

  draw(ctx) {
    this.fade = clamp(this.fade + (this.open ? 0.14 : -0.16), 0, 1);
    if (this.fade <= 0) return;
    const a = this.fade;

    screenDim(ctx, a * 0.9);

    const w = VW - 96, x = 48;
    const rowH = 34, y0 = 66;
    const h = CHAPTERS.length * (rowH + 5) + 34;
    panelBox(ctx, x, y0 - 26, w, h, a, true);

    text(ctx, T('chapsel_title'), VW / 2, y0 - 18, {
      size: 10, font: 'ui', weight: 'bold', color: PAL.uiAccent,
      align: 'center', track: 3, alpha: a,
    });

    for (let i = 0; i < CHAPTERS.length; i++) {
      const c = CHAPTERS[i];
      const sel = i === this.sel;
      const ry = y0 + i * (rowH + 5);
      ctx.save();
      ctx.globalAlpha = a * (sel ? 0.5 : 0.22);
      ctx.fillStyle = sel ? '#2a1c18' : '#0e0c10';
      ctx.fillRect(x + 8, ry, w - 16, rowH);
      ctx.globalAlpha = a;
      ctx.fillStyle = sel ? PAL.uiAccent : PAL.uiBoxEdge;
      ctx.fillRect(x + 8, ry, sel ? 3 : 1, rowH);
      ctx.restore();

      text(ctx, `${c.n}`, x + 22, ry + 8, {
        size: 14, font: 'serif', color: sel ? PAL.uiAccent : PAL.uiFaint,
        align: 'center', alpha: a,
      });
      text(ctx, T(c.nome), x + 40, ry + 5, {
        size: 11, font: 'serif', color: sel ? PAL.uiText : PAL.uiDim,
        track: 1, alpha: a,
      });
      text(ctx, T(c.desc), x + 40, ry + 20, {
        size: 7, font: 'ui', color: PAL.uiFaint, track: 0, alpha: a * 0.9,
      });
    }

    text(ctx, T('chapsel_warn'), VW / 2, VH - 28, {
      size: 7, font: 'ui', color: PAL.uiFaint, align: 'center', track: 1, alpha: a * 0.8,
    });
    text(ctx, T('chapsel_hint'), VW / 2, VH - 16, {
      size: 8, font: 'ui', color: PAL.uiFaint, align: 'center', track: 2, alpha: a,
    });
  }
}
