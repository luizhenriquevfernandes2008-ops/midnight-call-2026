// chapter3.js — o que so existe no Capitulo 3, "GAVETA D".
//
// O capitulo nao tem combate: a arma fica no escaninho 214 da portaria. Ele
// e andar, olhar e conversar. Entao o que mora aqui nao e mecanica de luta,
// e as quatro coisas que o capitulo precisa e que nenhum outro precisa:
//
//   1. A ESCADA DO CIGARRO, degraus 2, 3 e 4.
//   2. O PAINEL DE SENHA — o Credor esperando a vez, sem perseguir ninguem.
//   3. O MODO FLASHBACK — sete anos atras, quando ele ainda era inteiro.
//   4. O FIM: o plantonista pede o nome dela, e o jogo para.

import { VW, VH, clamp } from '../core/gfx.js';
import { text } from '../core/text.js';
import { PAL } from '../art/palette.js';
import { input } from '../core/input.js';
import { audio } from '../core/audio.js';
import { t as T } from '../i18n.js';

// ---------------------------------------------------------------------------
// 1 — A ESCADA DO CIGARRO
//
// O cigarro e item desde o Capitulo 2 e o jogador carrega ele por HORAS sem
// conseguir usar. Cada tentativa e uma recusa, e a recusa VAI MUDANDO. Isso
// transforma um item de inventario numa barra de progresso emocional: o
// jogador testa de vez em quando so para ver se mudou, e e assim que ele
// percebe que o personagem esta cedendo.
//
// Degrau 1 (recusa seca) vive no Capitulo 2 e continua onde estava. Aqui
// entram o 2, o 3, o 4 e o 5.
// ---------------------------------------------------------------------------

export const CIG = {
  // degrau -> as falas daquele degrau, em ciclo
  1: ['cig_no_1', 'cig_no_2', 'cig_no_3', 'cig_no_4'],
  2: ['cig_d2_a', 'cig_d2_b', 'cig_d2_c', 'cig_d2_d'],
  3: ['cig_d3_a', 'cig_d3_b'],
  5: ['cig_d5'],
};

// Em que degrau ele esta. O degrau 4 nao e "usar o cigarro": e o momento na
// cela em que ele acende sem decidir. Depois dele o cigarro vira consumivel.
export function degrauDoCigarro(game) {
  if (game.flags.cig_livre) {
    // Degrau 5: sanidade baixa depois de liberado. Fuma um atras do outro.
    return game.sanity && game.sanity.state >= 2 ? 5 : 4;
  }
  if (game.flags.cig_d3) return 3;
  if (game.flags.cig_d2) return 2;
  return 1;
}

// Chamado quando o jogador usa o maco dentro do casaco.
// Devolve true se consumiu (so a partir do degrau 4).
export function usarCigarro(game) {
  const d = degrauDoCigarro(game);
  const p = game.player;

  if (d >= 4) {
    // Liberado: e consumivel, e devolve sanidade. O jogador vai sentir que
    // ganhou alguma coisa, e vai levar um tempo para perceber que o
    // personagem PERDEU.
    if (game.sanity.value >= 100 && d === 4) { p.say('b2_heal_full', 0, true); return false; }
    game.sanity.restore(22);
    audio.lighterFlick();
    audio.flameWhoosh ? audio.flameWhoosh(0.5) : null;
    if (d === 5) p.say(CIG[5][0], 2.2, true);
    game.cigTentativas = (game.cigTentativas || 0) + 1;
    return true;
  }

  const falas = CIG[d];
  p.say(falas[(game.cigTentativas || 0) % falas.length], d === 3 ? 3.0 : 2.4, true);
  game.cigTentativas = (game.cigTentativas || 0) + 1;
  return false;
}

// O degrau 4 propriamente dito. Nao ha escolha, nao ha prompt, nao ha
// botao: ele acende um para o homem da cela falar — tecnica de
// interrogatorio, oficio, ele fez isso mil vezes — e depois acende um para
// ele, no automatico. So DEPOIS ele olha para a propria mao.
export function liberarCigarro(game) {
  if (game.flags.cig_livre) return false;
  game.flags.cig_livre = true;
  game.flags.cig_d2 = true;
  game.flags.cig_d3 = true;
  audio.lighterFlick();
  const p = game.player;
  p.say('b3_cell_cig', 2.2, true);
  p.say('b3_cell_cig2', 2.6);
  game.anotar('j3_cig');
  return true;
}

// ---------------------------------------------------------------------------
// 2 — O PAINEL DE SENHA
//
// O Credor volta, e NAO persegue. Fica sentado na sala de espera com a
// motosserra desligada no colo e uma senha na mao. O numero no painel sobe a
// cada setor novo que o jogador visita. O jogador vai VOLTAR la so para
// olhar — e medo que o jogador procura sozinho e o melhor tipo.
//
// Ele nunca fala. O Credor nao tem voz e nao pode ganhar uma agora.
// ---------------------------------------------------------------------------

const SENHA_INICIAL = 207;
const SENHA_FINAL = 214;

export class TicketBoard {
  constructor() { this.reset(); }

  reset() {
    this.numero = SENHA_INICIAL;
    this.setores = [];
    this.chamado = false;
    this.pulso = 0;
  }

  // Cada setor NOVO empurra a senha um passo. Revisitar nao conta: senao o
  // jogador andando de um lado para o outro chamava a senha em um minuto.
  visitou(key) {
    if (this.chamado) return false;
    if (this.setores.indexOf(key) >= 0) return false;
    this.setores.push(key);
    if (this.numero < SENHA_FINAL - 1) { this.numero++; return true; }
    return false;
  }

  // A senha dele so e chamada no fim, quando o jogador sai. E ai a cadeira
  // esta vazia.
  chamar() {
    if (this.chamado) return false;
    this.chamado = true;
    this.numero = SENHA_FINAL;
    this.pulso = 2.6;
    audio.blip(0.6);
    return true;
  }

  update(dt) { if (this.pulso > 0) this.pulso -= dt; }

  // Desenhado por quadro porque o numero muda. O painel em si e pintado na
  // camada da fase; aqui so entra o digito.
  draw(ctx, cam, x, y) {
    const sx = Math.round(x - cam.ix), sy = Math.round(y - cam.iy);
    if (sx < -60 || sx > VW + 60) return;
    const pisca = this.pulso > 0 && (Math.sin(this.pulso * 22) > 0);
    text(ctx, String(this.numero), sx + 20, sy + 4, {
      size: 13, font: 'ui', weight: 'bold', align: 'center', track: 2,
      color: pisca ? '#e86048' : '#c8783a',
    });
  }

  save() { return { n: this.numero, s: this.setores.slice(), c: this.chamado }; }
  load(d) {
    this.reset();
    if (!d) return;
    this.numero = d.n || SENHA_INICIAL;
    this.setores = (d.s || []).slice();
    this.chamado = !!d.c;
  }
}

// ---------------------------------------------------------------------------
// 3 — O MODO FLASHBACK
//
// Sete anos atras. Sem inimigo, sem sanidade, sem perigo nenhum. Nao tem
// tensao porque nao PODE ter: o jogador ja sabe que ele sobrevive. O que tem
// e uma noite boa, jogada por inteiro.
//
// O que muda: paleta menos dessaturada (a propria fase declara `ambient` mais
// claro), sem sobretudo rasgado, sem sangue — e o OCIO. Parado, ele tira o
// cigarro, ACENDE, FUMA e guarda o maco. Sem hesitar. Sem "hoje nao".
//
// O jogador vai ver isso dezenas de vezes ao longo de doze minutos e vai
// achar que e so uma versao antiga do personagem. E a preparacao inteira da
// cena da cela.
// ---------------------------------------------------------------------------

export function entrarFlashback(game) {
  const p = game.player;
  game.flags.flashback = true;
  // guarda o presente para devolver depois
  game._presente = {
    idleMode: p.idleMode,
    hasGun: p.hasGun,
    club: p.club,
    hp: p.hp,
    blood: p.det.blood,
    coatTorn: p.det.coatTorn,
    injury: p.det.injury,
    sanity: game.sanity.enabled,
  };
  p.idleMode = 'smokeFree';     // ele acende e fuma. Sem hesitar.
  p.hasGun = false;             // o distintivo esta no cinto, a arma nao sai
  p.club = false;
  p.segurarPorrete(false);
  p.hp = 100;
  p.det.blood = 0;
  p.det.coatTorn = false;       // o rasgo e do futuro. Aqui o casaco e novo.
  p.det.injury = 0;
  game.sanity.enabled = false;  // nao existe sanidade aqui. Ele estava bem.
  game.director.ligado = false;
}

export function sairFlashback(game) {
  const p = game.player;
  const s = game._presente;
  game.flags.flashback = false;
  if (!s) return;
  p.idleMode = s.idleMode;
  p.hasGun = s.hasGun;
  p.club = s.club;
  p.hp = s.hp;
  p.det.blood = s.blood;
  p.det.coatTorn = s.coatTorn;
  p.det.injury = s.injury;
  game.sanity.enabled = s.sanity;
  game._presente = null;
}

// ---------------------------------------------------------------------------
// 4 — O FIM DO CAPITULO: O NOME
//
// Nao tem inimigo, nao tem musica, nao tem tempo correndo. So um homem atras
// de um vidro esperando uma palavra.
//
// As duas saidas sao finais validos. Dizer nao "vence" nada: o plantonista
// escreve, agradece, deseja boa noite, e NADA acontece. E isso que devasta.
// ---------------------------------------------------------------------------

export class NamePrompt {
  constructor() {
    this.ativo = false;
    this.sel = 0;
    this.t = 0;
    this.fase = 'pergunta';
    this.onEnd = null;
  }

  comecar(onEnd) {
    this.ativo = true;
    this.sel = 0;
    this.t = 0;
    this.fase = 'pergunta';
    this.onEnd = onEnd || null;
    this.falas = [];
  }

  update(dt, game) {
    if (!this.ativo) return;
    this.t += dt;

    if (this.fase === 'pergunta') {
      if (this.t < 0.8) return;
      if (input.pressed('menuUp') || input.pressed('menuDown')) {
        this.sel = this.sel ? 0 : 1; audio.uiMove();
      }
      if (input.pressed('confirm') || input.pressed('attack')) {
        audio.uiConfirm();
        this.fase = 'resposta';
        this.t = 0;
        const p = game.player;
        if (this.sel === 0) {
          // ELE DIZ. Pela primeira vez em sete anos.
          game.flags.disse_o_nome = true;
          p.say('ch3_said', 2.0, true);
          p.say('ch3_said_2', 2.6);
          p.say('ch3_clerk_ok', 3.0);
        } else {
          // ELE NAO DIZ. E ninguem perguntou o nome DELE. De novo.
          game.flags.disse_o_nome = false;
          p.say('ch3_not_said', 2.4, true);
          p.say('ch3_clerk_no', 3.4);
        }
      }
      return;
    }

    // A pausa depois da resposta e longa de proposito. Nada acontece.
    if (this.t > 7.5) {
      this.ativo = false;
      if (this.onEnd) this.onEnd();
    }
  }

  draw(ctx) {
    if (!this.ativo) return;
    const a = clamp(this.t * 2, 0, 1);

    if (this.fase !== 'pergunta') return;
    if (this.t < 0.4) return;

    // A pergunta em cima, as duas saidas embaixo. Sem caixa de dialogo, sem
    // cronometro, sem nada piscando. O jogo esta esperando.
    text(ctx, T('ch3_ask_name'), VW / 2, VH - 78, {
      size: 10, font: 'ui', weight: 'bold', align: 'center', color: PAL.uiText,
      alpha: a, shadow: true, track: 0,
    });

    const ops = [T('ch3_say'), T('ch3_dont')];
    for (let i = 0; i < 2; i++) {
      const sel = i === this.sel;
      const y = VH - 54 + i * 15;
      if (sel) {
        text(ctx, '>', VW / 2 - 68, y, {
          size: 10, font: 'ui', weight: 'bold', color: PAL.uiAccent, alpha: a,
        });
      }
      text(ctx, ops[i], VW / 2, y, {
        size: 10, font: 'ui', weight: sel ? 'bold' : 'normal', align: 'center',
        color: sel ? PAL.uiAccent : PAL.uiDim, alpha: a, track: 0,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// O CORREDOR MAIS LONGO NA VOLTA
//
// MIGALHA familia 5. Na ida o arquivo tem um tamanho; na volta tem mais. Sem
// barulho, sem susto, sem comentario. So mais chao.
//
// REGRA DE OURO: David NUNCA comenta uma migalha diretamente. A fala que
// existe aqui e a mais neutra possivel, e so dispara uma vez.
// ---------------------------------------------------------------------------

export function esticarCorredor(lvl, game) {
  if (!lvl || lvl.key !== 'ch3_archive') return false;
  if (lvl.props.voltaLonga) return false;
  if (!game.flags.viu_gaveta_d) return false;
  lvl.props.voltaLonga = true;
  lvl.maxX = Math.min(lvl.width - 44, lvl.maxX + 220);
  return true;
}
