// npc.js — as pessoas do galpao.
//
// Sao duas, e nenhuma das duas responde a pergunta que importa. O Vigia
// fala de um turno que acabou ha dez anos; a Telefonista transfere ligacoes
// para cabos que nao terminam em lugar nenhum. Em nenhum momento o jogo diz
// se elas sao reais.
//
// A REGRA: ninguem pergunta o nome dele. Todos ja sabem. E ninguem comenta
// isso — nunca. (ver "AS MIGALHAS", ROTEIRO.txt)
//
// Tecnicamente sao o mesmo rig do detetive, recolorido. Nao ha um unico
// pixel de arte nova aqui: e o mesmo homem, pintado de outra cor, sentado
// numa cadeira que nao existe mais.

import { Detective } from '../art/detective.js';
import { partesDe } from '../art/creatures.js';

export const NPCS = {
  // O ZELADOR. Macacao verde desbotado e um esfregao que ele nunca larga —
  // nem sentado, nem falando com voce. Ele esta no turno dele, e o turno
  // dele acabou ha dez anos.
  vigia: {
    level: 'ch2_office', x: 508, facing: -1,
    anim: 'sitChair', arte: 'zelador',
    talk: 'vigia', prompt: 'prompt_talk',
  },
  // A TELEFONISTA. Cabelo preso, vestido de trabalho vinho, gola branca.
  operadora: {
    level: 'ch2_mezz', x: 638, facing: -1,
    anim: 'switchboard', arte: 'operadora',
    talk: 'operadora', prompt: 'prompt_talk',
  },

  // =====================================================================
  // CAPITULO 3 — a delegacia, e a casa
  //
  // Aqui NAO sao criaturas. Sao pessoas, com rosto e roupa propria. Antes
  // desta sessao elas nao existiam: eram caixas de interacao invisiveis
  // penduradas na fase, e o jogador conversava com o ar.
  // =====================================================================

  // Sentado num banco alto DENTRO da guarita. O `yOff` levanta ele do
  // piso: e o que faz a cabeca e o tronco chegarem na altura da abertura
  // do vidro, em vez de sumirem inteiros atras do balcao.
  plantonista: {
    level: 'ch3_reception', x: 310, facing: -1, yOff: -22,
    anim: 'sitChair', arte: 'plantonista',
    talk: 'plantonista', prompt: 'prompt_talk',
  },
  // 🐛 A SALA DE ESPERA ESTAVA VAZIA. O painel de senha contava, a fala
  // dizia "ele esta esperando a vez" e NAO HAVIA NINGUEM DESENHADO na
  // cadeira. E o B-57 outra vez, com outra roupa: o objeto existia, a
  // pessoa nao. Nenhum teste pegou porque todos conferiam o painel.
  //
  // E quem senta ali nao e o Credor: e A FIGURA NEGRA do Capitulo 1 — o
  // recorte de escuro com forma de gente que derrubou o David no deposito
  // e que o jogo nunca explicou. Sentada numa cadeira de plastico, com uma
  // senha de atendimento na mao, debaixo de luz fluorescente.
  //
  // `silhueta` pinta o rig inteiro de preto puro. Como a cena e
  // multiplicada pela luz, preto continua preto debaixo de qualquer
  // lampada — e e por isso que ela funciona numa recepcao acesa.
  figura: {
    level: 'ch3_reception', x: 742, facing: -1, yOff: -19,
    anim: 'sitChair', arte: null,
    silhueta: '#050507', escala: 1.14,
    prompt: 'prompt_look', talk: null,
  },
  michael: {
    level: 'ch3_plantao', x: 470, facing: -1,
    anim: 'sitChair', arte: 'michael',
    talk: 'michael', prompt: 'prompt_talk',
  },
  colega_a: {
    level: 'ch3_plantao', x: 240, facing: 1,
    anim: 'idle', arte: 'ruiz',
    talk: 'colega_a', prompt: 'prompt_talk',
  },
  colega_b: {
    level: 'ch3_plantao', x: 740, facing: -1,
    anim: 'switchboard', arte: 'elaine',
    talk: 'colega_b', prompt: 'prompt_talk',
  },
  colega_c: {
    level: 'ch3_plantao', x: 1020, facing: -1,
    anim: 'sitChair', arte: 'betinho',
    talk: 'colega_c', prompt: 'prompt_talk',
  },
  // O HOMEM VISTO DE FORA, atras das barras. Nao conversa: olhar para ele
  // so oferece a mesma coisa que a porta oferece — entrar.
  preso: {
    level: 'ch3_cell', x: 400, facing: -1,
    anim: 'sitChair', arte: 'carlos',
    talk: null, prompt: 'prompt_use', acao: 'ch3_entrar_cela',
  },
  // E o mesmo homem, DENTRO da cela, quando o David atravessa a grade. E
  // este que o interrogatorio usa.
  carlos: {
    level: 'ch3_dentro', x: 196, facing: -1,
    anim: 'sitChair', arte: 'carlos',
    talk: null, prompt: 'prompt_talk', acao: 'ch3_interrogar',
  },

  // ---- a casa, sete anos atras ----
  // As duas unicas pessoas do jogo que nao sao um sintoma.
  julie: {
    level: 'ch3_home', x: 400, facing: 1,
    anim: 'idle', arte: 'julie',
    talk: 'julie', prompt: 'prompt_talk',
  },
  // Ela nao esta na sala com a mae: esta no quarto dela, sentada no chao,
  // desenhando, com o abajur aceso e a cama intacta. Sao duas conversas em
  // dois comodos — o jogador ATRAVESSA a casa entre uma e outra, e e isso
  // que faz a casa virar uma casa em vez de um cenario com duas pessoas.
  jenna: {
    level: 'ch3_room', x: 168, facing: 1,
    anim: 'read', arte: 'jenna',
    talk: 'jenna', prompt: 'prompt_talk',
    // Ela e crianca. O rig e o mesmo; quem encolhe e isto. A cabeca fica
    // proporcionalmente maior porque o sprite dela ja e desenhado assim —
    // sem isso ela vira um adulto reduzido, que e a armadilha classica.
    escala: 0.72,
  },
};

export class Npc {
  constructor(id) {
    this.id = id;
    const c = this.cfg = NPCS[id];
    this.x = c.x;
    this.facing = c.facing;
    this.falado = false;
    this.alive = true;
    this.deadT = 0;
    const d = this.det = new Detective();
    // Peças próprias. Antes eles eram o detetive tingido — literalmente a
    // mesma pessoa, um sentado e o outro quase de quatro. Agora cada um
    // tem cabeça, tronco e roupa dele.
    d.parts = c.arte ? partesDe(c.arte) : null;
    // A figura negra não tem peça nenhuma: ela é o rig do detetive pintado
    // de uma cor só. Sem rosto, sem informação, e sem luz de contorno —
    // contorno em cima dela devolveria justamente o volume que ela não pode
    // ter.
    if (c.silhueta) { d.silhouette = c.silhueta; d.rimAlpha = 0; }
    d.rimAlpha = c.silhueta ? 0 : 0.16;
    d.reflect = 0;
    d.facing = c.facing;
    d.flipT = 1;
    if (c.escala) { d.scaleX = c.escala; d.scaleY = c.escala; }
    d.play(c.anim, { blend: 0 });
  }

  get escala() { return this.cfg.escala || 1; }

  update(dt) {
    if (!this.alive) {
      this.deadT += dt;
      this.det.update(dt);
      // O corpo não evapora; só perde um pouco da cor, como uma lembrança
      // que acabou de ser desmentida.
      this.det.alpha = Math.max(0.48, 1 - this.deadT * 0.08);
      return;
    }
    this.det.update(dt);
  }

  // `yOff` levanta a pessoa do chao. Existe para quem esta sentado em cima
  // de alguma coisa — o plantonista num banco alto atras do balcao. Sem
  // isso ele sentava no piso e sumia inteiro atras do movel.
  draw(ctx, cam, groundY) {
    this.det.draw(ctx, this.x - cam.ix, groundY + (this.cfg.yOff || 0) - cam.iy);
  }

  caixa(groundY) {
    const e = this.escala;
    return { x0: this.x - 13 * e, x1: this.x + 13 * e, y0: groundY - 67 * e, y1: groundY };
  }

  matar() {
    if (!this.alive) return false;
    this.alive = false;
    this.deadT = 0;
    this.det.play('collapse', { restart: true, blend: 0.04 });
    return true;
  }

  reviver() {
    this.alive = true;
    this.deadT = 0;
    this.det.alpha = 1;
    this.det.blood = 0;
    this.det.play(this.cfg.anim, { restart: true, blend: 0 });
  }

  // Interactable que o jogo insere na fase quando o NPC esta nela.
  //
  // `acao` existe porque o Capitulo 3 tem a propria rotina de conversa (com
  // memoria, assunto travado por deducao e insistencia). Sem isso os NPCs
  // novos caiam no `talk` do Capitulo 2 e a conversa abria sem nada disso.
  gancho() {
    const e = this.escala;
    const base = {
      x: this.x - 14 * e, y: 150, w: 28 * e, h: 64 * e,
      prompt: this.cfg.prompt,
      npc: this.id, range: 34, prio: 2,
    };
    // Acao propria, quando o NPC tem uma. E como o homem atras das barras
    // oferece ENTRAR em vez de conversa.
    if (this.cfg.acao) { base.action = this.cfg.acao; return base; }
    // Quem nao tem conversa nao abre conversa. A figura negra e olhada, e
    // ela nao responde — nem aqui, nem no Capitulo 1, nem nunca.
    if (!this.cfg.talk) { base.action = 'ch3_figura'; base.prio = 1; return base; }
    base.action = this.cfg.level && this.cfg.level.slice(0, 4) === 'ch3_' ? 'talk3' : 'talk';
    return base;
  }
}
