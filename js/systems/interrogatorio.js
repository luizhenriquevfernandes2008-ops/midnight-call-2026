// interrogatorio.js — a cela, e a unica coisa no Capitulo 3 que se JOGA.
//
// O capitulo inteiro e andar, olhar e conversar. Esta cena e a excecao: e
// aqui que o jogador tem uma alavanca na mao, e a alavanca so tem um jeito
// de ser puxada.
//
// ----------------------------------------------------------------------
// O QUE ESTA CENA E, E O QUE ELA NAO E
// ----------------------------------------------------------------------
// NAO e um combate com barra de vida. O Carlos nao "perde". Ele nao esta
// escondendo a informacao para se proteger — ele quer contar. Ele passou
// sete anos esperando o David sentar na frente dele para poder contar.
//
// O que a barra mede nao e a resistencia dele. E o quanto o David ja
// desceu. O Carlos so entrega a coisa toda quando o homem do outro lado da
// grade estiver irreconhecivel — porque a confissao dele nao vale nada
// como prova, e ele sabe disso, e o presente que ele quer dar nao e a
// verdade: e o David virando ele.
//
// ⚠ POR ISSO A CONFISSAO E ARRANCADA NA PORRADA, E POR ISSO ELA NAO PRESTA.
// O jogador enche a barra, ouve a resposta que o jogo inteiro prometeu — e
// sai de la com uma informacao que ele mesmo contaminou. Se der para
// confiar nela, a cena perdeu o ponto.
//
// ----------------------------------------------------------------------
// OS TRES VERBOS
// ----------------------------------------------------------------------
//   PERGUNTAR ..... barato, seguro, quase nao anda. E oficio.
//   PRESSIONAR .... anda de verdade, custa sanidade. E o David escolhendo.
//   BATER ......... anda muito, custa caro, e TRAVA o Carlos por uma vez.
//                   Bater duas vezes seguidas FAZ A BARRA CAIR: ele para de
//                   falar e ri. Isso obriga a alternar, e alternar e
//                   exatamente o que um interrogador de verdade faz.
//
// E o David muda de tom sozinho conforme a barra sobe. Ninguem avisa o
// jogador disso. Ele so vai reparar que as falas que ele esta escolhendo
// ficaram impossiveis de ler em voz alta.

import { VW, VH, clamp, gfx, lerp } from '../core/gfx.js';
import { text, measure } from '../core/text.js';
import { PAL } from '../art/palette.js';
import { input } from '../core/input.js';
import { audio } from '../core/audio.js';
import { t as T, tx, INTERROGATORIO as SCRIPT } from '../i18n.js';

const VERBOS = ['perguntar', 'pressionar', 'bater'];

// Quanto cada verbo anda, e quanto custa de sanidade.
const PESO = {
  perguntar:  { min: 5,  max: 9,  sanidade: 0 },
  pressionar: { min: 13, max: 18, sanidade: 4 },
  bater:      { min: 24, max: 31, sanidade: 9 },
};

// Onde ele vaza um pedaco. A ultima e a confissao inteira.
const LIMIARES = [30, 58, 82];

export class Interrogatorio {
  constructor() { this.reset(); }

  reset() {
    this.ativo = false;
    this.pressao = 0;
    this.sel = 0;
    this.fase = 'menu';       // menu | fala | vazamento | quebra | fim
    this.t = 0;
    this.zoom = 1;
    this.usos = { perguntar: 0, pressionar: 0, bater: 0 };
    this.ultimo = null;
    this.travado = false;     // levou um soco: a proxima pergunta nao anda
    this.carlosT = 0;
    this.vazou = 0;
    this.onEnd = null;
    this.runId = -1;
    this.quebrou = false;
  }

  // ⚠ NAO zera nada. Sair da cela e voltar depois retoma de onde parou —
  // um interrogatorio nao recomeca do zero porque o interrogador foi tomar
  // agua. Quem zera e o comeco de capitulo e o carregamento de save.
  comecar(game, onEnd) {
    if (this.ativo || this.quebrou) return false;
    this.ativo = true;
    this.onEnd = onEnd || null;
    this.runId = game.runId;
    this.fase = 'fala';
    this.sel = 0;
    this._falar(game, this.pressao > 0 ? 'retomo' : 'abertura', 0);
    // Ele para do lado de fora da grade e vira para dentro. A encenacao e
    // metade da cena: dois homens frente a frente, com ferro no meio.
    const lv = game.level;
    if (lv && lv.props && lv.props.marcaInt) {
      game.player.x = lv.props.marcaInt;
      game.player.det.setFacing(1);
      game.player.facing = 1;
    }
    game.player.controllable = false;
    game.player.frozen = true;
    audio.startMusic('delegacia');
    return true;
  }

  // Uma troca do roteiro vai inteira para a CAIXA DE DIALOGO DO JOGO. Nao
  // existe caixa propria aqui: reaproveitar a de sempre da de graca a
  // maquina de escrever, o nome de quem fala, a quebra de linha e a tecla
  // de avancar — e, mais importante, faz esta cena parecer o mesmo jogo.
  _falar(game, chave, idx) {
    const arr = SCRIPT[chave] || [];
    if (!arr.length) return false;
    const e = arr[Math.min(idx, arr.length - 1)];
    const eu = T('speaker_me');
    const ele = T('speaker_carlos');
    const linhas = [];
    for (const [campo, quem] of [['d', eu], ['c', ele], ['d2', eu], ['c2', ele],
                                 ['d3', eu], ['c3', ele]]) {
      if (e[campo]) linhas.push({ name: quem, text: tx(e[campo]) });
    }
    if (!linhas.length) return false;
    game.dialogue.start(linhas);
    return true;
  }

  // ---- o tom do David, derivado da barra ----
  //
  // 0 profissional · 1 duro · 2 cruel · 3 irreconhecivel.
  // Nao existe botao para isto. E consequencia.
  get tom() {
    if (this.pressao >= 82) return 3;
    if (this.pressao >= 55) return 2;
    if (this.pressao >= 28) return 1;
    return 0;
  }

  // A ATUACAO. Nao da para ver o rosto de ninguem aqui, entao cada verbo
  // tem um corpo proprio: o David muda de pose e o outro homem responde
  // com o corpo dele. Sem isto os tres botoes seriam o mesmo botao.
  _encenar(game, verbo) {
    const p = game.player;
    const ca = game.npcs.carlos;
    if (verbo === 'perguntar') {
      p.det.play('intAsk', { restart: true, blend: 0.16 });
    } else if (verbo === 'pressionar') {
      p.det.play('intPush', { restart: true, blend: 0.1 });
      if (ca) { ca.det.play('sitFlinch', { restart: true, blend: 0.18 }); this.carlosT = 1.0; }
    } else if (verbo === 'bater') {
      p.det.play('intHit', { restart: true, blend: 0.05 });
      if (ca) { ca.det.play('sitHurt', { restart: true, blend: 0.04 }); this.carlosT = 1.2; }
    }
  }

  escolher(game, verbo) {
    const p = PESO[verbo];
    const idx = this.usos[verbo];
    this.usos[verbo]++;
    this._encenar(game, verbo);

    // Bater duas vezes seguidas: ele fecha a cara e a barra CAI.
    if (verbo === 'bater' && this.ultimo === 'bater') {
      this.pressao = clamp(this.pressao - 11, 0, 100);
      this._falar(game, 'bater_demais', 0);
      this.travado = true;
      this.ultimo = verbo;
      this.fase = 'fala';
      game.sanity.drain(p.sanidade);
      audio.punchHit ? audio.punchHit(0.9) : audio.thud(0.8);
      gfx.shake(3.2);
      return;
    }

    // Perguntar com ele travado nao anda nada: ele acabou de levar um soco.
    if (verbo === 'perguntar' && this.travado) {
      this.travado = false;
      this._falar(game, 'travado', 0);
      this.ultimo = verbo;
      this.fase = 'fala';
      return;
    }

    let ganho = p.min + Math.floor(Math.random() * (p.max - p.min + 1));
    // Verbo repetido rende menos: insistir na mesma tecla e preguica.
    if (this.ultimo === verbo) ganho = Math.round(ganho * 0.62);
    this.pressao = clamp(this.pressao + ganho, 0, 100);
    if (p.sanidade) game.sanity.drain(p.sanidade);

    if (verbo === 'bater') {
      this.travado = true;
      audio.punchHit ? audio.punchHit(1) : audio.thud(0.9);
      gfx.shake(4.2);
    } else if (verbo === 'pressionar') {
      audio.uiConfirm ? audio.uiConfirm(0.5) : null;
    }

    this.ultimo = verbo;
    this._falar(game, verbo, idx);
    this.fase = 'fala';
  }

  update(dt, game) {
    if (!this.ativo) return;
    if (game.runId !== this.runId) { this.encerrar(game, true); return; }
    this.t += dt;
    // a camera fecha nos dois e nao volta mais ate acabar
    this.zoom = lerp(this.zoom, this.quebrou ? 1.5 : 1.35, 1 - Math.exp(-2.2 * dt));

    // Depois de apanhar ele volta a sentar. Nao ha animacao de "sentar
    // machucado": o que diz que ele apanhou e ele continuar sentado igual.
    if (this.carlosT > 0) {
      this.carlosT -= dt;
      if (this.carlosT <= 0) {
        const ca = game.npcs.carlos;
        if (ca) ca.det.play('sitChair', { blend: 0.3 });
      }
    }

    // Enquanto a caixa de dialogo estiver falando, quem manda e ela.
    if (this.fase === 'fala' || this.fase === 'vazamento' || this.fase === 'quebra'
        || this.fase === 'cigarro') {
      if (game.dialogue.active) return;

      // Depois da confissao vem o CIGARRO — o degrau 4 — e so entao a cena
      // acaba. O jogo nao pergunta nada ao jogador aqui: nao tem escolha,
      // nao tem botao. Se virasse escolha, viraria vitoria.
      if (this.fase === 'quebra') {
        this.fase = 'cigarro';
        this._falar(game, 'cigarro', 0);
        if (this.onCigarro) this.onCigarro();
        return;
      }
      if (this.fase === 'cigarro') { this.encerrar(game); return; }

      // Cruzou um degrau? Ele vaza um pedaco antes de devolver o menu.
      if (this.fase === 'fala' && this.vazou < LIMIARES.length
          && this.pressao >= LIMIARES[this.vazou]) {
        const n = this.vazou++;
        this.fase = 'vazamento';
        this._falar(game, 'vaza', n);
        // "Eu to quase la, preciso sair daqui." Uma por degrau.
        game.player.say(['b3_int_quase1', 'b3_int_quase2', 'b3_int_quase3'][n], 3.0);
        game.sanity.drain(3);
        return;
      }

      if (this.pressao >= 100 && !this.quebrou) {
        this.quebrou = true;
        this.fase = 'quebra';
        this._falar(game, 'quebra', 0);
        game.flags.carlos_quebrou = true;
        audio.stopMusic(0.8);
        gfx.shake(2.0);
        return;
      }
      this.fase = 'menu';
      this.t = 0;
      return;
    }

    // ---- menu dos tres verbos ----
    if (this.fase !== 'menu') return;
    if (input.pressed('menuUp')) { this.sel = (this.sel + 2) % 3; audio.uiMove(); }
    if (input.pressed('menuDown')) { this.sel = (this.sel + 1) % 3; audio.uiMove(); }
    // Da para levantar e sair. A pressao fica onde estava.
    if (input.pressed('cancel')) { audio.uiBack ? audio.uiBack() : null; this.encerrar(game); return; }
    if (input.pressed('confirm') || input.pressed('interact') || input.pressed('attack')) {
      audio.uiConfirm();
      this.escolher(game, VERBOS[this.sel]);
    }
  }

  encerrar(game, silencioso) {
    if (!this.ativo) return;
    this.ativo = false;
    const p = game.player;
    p.controllable = true;
    p.frozen = false;
    this.zoom = 1;
    if (!silencioso && this.onEnd) this.onEnd(this.quebrou);
    this.onEnd = null;
  }

  // ---- desenho ----
  //
  // A barra fica EM CIMA, longe da caixa de fala, e nao tem numero. O
  // jogador nao precisa saber que faltam 18 por cento: precisa sentir que
  // esta perto.
  draw(ctx, game) {
    if (!this.ativo) return;

    // escurece tudo menos a faixa dos dois: a luz fechando numa poca, que e
    // o que o ROTEIRO IX.7.A.4 pedia desde que o capitulo foi escrito
    ctx.save();
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, VW, 92);
    ctx.fillRect(0, VH - 84, VW, 84);
    ctx.restore();

    // ---- a barra ----
    const bw = 208, bx = (VW - bw) / 2, by = 26;
    const k = this.pressao / 100;
    text(ctx, T('int_pressao'), bx, by - 11, {
      size: 8, font: 'ui', weight: 'bold', color: PAL.uiDim, track: 1,
    });
    ctx.fillStyle = '#0d1116';
    ctx.fillRect(bx - 1, by - 1, bw + 2, 9);
    ctx.fillStyle = '#1c232b';
    ctx.fillRect(bx, by, bw, 7);
    // A barra muda de cor com o TOM dele, nao com o numero. Verde nunca:
    // isto nao e progresso, e um homem descendo uma escada.
    const cor = ['#8a7d5a', '#b8863c', '#c2632c', '#a8382c'][this.tom];
    ctx.fillStyle = cor;
    ctx.fillRect(bx, by, Math.round(bw * k), 7);
    // os degraus, marcados por um risco fino
    ctx.fillStyle = '#39434f';
    for (const L of LIMIARES) ctx.fillRect(bx + Math.round(bw * L / 100), by - 2, 1, 11);
    if (this.travado) {
      text(ctx, T('int_calado'), bx + bw + 6, by - 1, {
        size: 8, font: 'ui', weight: 'bold', color: '#7d5a52',
      });
    }

    if (this.fase !== 'menu') return;

    // ---- os tres verbos ----
    const LX = 322;
    const ops = [
      { k: 'int_perguntar', custo: 0 },
      { k: 'int_pressionar', custo: PESO.pressionar.sanidade },
      { k: 'int_bater', custo: PESO.bater.sanidade },
    ];
    const y0 = VH - 66;
    // Painel proprio atras dos verbos. Sem ele a lista disputa leitura com
    // as pernas do personagem, e o jogador le "PERGUNTAR" em cima de um
    // homem — o que e uma piada que a cena nao pode pagar.
    // ⚠ A lista fica na DIREITA. Os dois homens ocupam o centro-esquerda da
    // tela depois que a camera fecha, e a versao anterior escrevia
    // "PERGUNTAR" em cima das pernas do personagem.
    ctx.save();
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = '#07090c';
    ctx.fillRect(LX - 20, y0 - 9, 152, 45);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#2a323c';
    ctx.fillRect(LX - 20, y0 - 9, 1, 45);
    ctx.restore();
    for (let i = 0; i < 3; i++) {
      const sel = i === this.sel;
      const y = y0 + i * 15;
      if (sel) {
        text(ctx, '>', LX - 12, y, { size: 10, font: 'ui', weight: 'bold', color: PAL.uiAccent });
      }
      const nome = T(ops[i].k);
      text(ctx, nome, LX, y, {
        size: 10, font: 'ui', weight: sel ? 'bold' : 'normal',
        color: sel ? PAL.uiAccent : PAL.uiDim, track: 0,
      });
      if (ops[i].custo) {
        const w = measure(nome, { size: 10, font: 'ui', weight: sel ? 'bold' : 'normal' }).w;
        text(ctx, T('int_custo').replace('%d', ops[i].custo), LX + w + 8, y + 1, {
          size: 8, font: 'ui', weight: 'normal', color: sel ? '#8a5a52' : '#5a4a46',
        });
      }
    }
  }

  save() {
    if (this.pressao <= 0 && !this.quebrou) return null;
    return { p: this.pressao, u: { ...this.usos }, v: this.vazou, q: this.quebrou };
  }

  load(d) {
    this.reset();
    if (!d) return;
    this.pressao = d.p || 0;
    this.usos = Object.assign({ perguntar: 0, pressionar: 0, bater: 0 }, d.u || {});
    this.vazou = d.v || 0;
    this.quebrou = !!d.q;
  }
}
