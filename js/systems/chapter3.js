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

import { VW, VH, clamp, gfx } from '../core/gfx.js';
import { text } from '../core/text.js';
import { PAL } from '../art/palette.js';
import { input } from '../core/input.js';
import { audio } from '../core/audio.js';
import { partesDe } from '../art/creatures.js';
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
    parts: p.det.parts,
  };
  p.idleMode = 'smokeFree';     // ele acende e fuma. Sem hesitar.
  p.hasGun = false;             // o distintivo esta no cinto, a arma nao sai
  p.club = false;
  p.segurarPorrete(false);
  p.hp = 100;
  p.det.blood = 0;
  p.det.coatTorn = false;       // o rasgo e do futuro
  p.det.injury = 0;
  // A ROUPA. Ele nao pode estar de sobretudo marrom aqui: o sobretudo e o
  // que ele veste ha sete anos sem tirar, e essa e justamente a distancia
  // entre este homem e o outro. Camisa, gravata e colete de quem acabou o
  // turno — e o corpo inteiro muda de silhueta junto, porque a aba do
  // casaco sai de cena.
  p.det.parts = partesDe('david_passado');
  game.sanity.enabled = false;  // nao existe sanidade aqui. Ele estava bem.
  game.director.ligado = false;
}

export function sairFlashback(game) {
  const p = game.player;
  const s = game._presente;
  game.flags.flashback = false;
  // Mesmo sem estado guardado (carregar um save no meio do passado, por
  // exemplo) a roupa TEM que voltar: David de colete no presente seria um
  // personagem que o jogo nao tem.
  if (!s) { p.det.parts = null; return; }
  p.idleMode = s.idleMode;
  p.hasGun = s.hasGun;
  p.club = s.club;
  p.hp = s.hp;
  p.det.blood = s.blood;
  p.det.coatTorn = s.coatTorn;
  p.det.injury = s.injury;
  game.sanity.enabled = s.sanity;
  p.det.parts = s.parts || null;   // o sobretudo volta com o presente
  game._presente = null;
}

// ---------------------------------------------------------------------------
// 3b — O FOGO
//
// Depois dos gritos, a casa comeca a queimar.
//
// Isso nao e efeito: e a resposta a duas perguntas que o jogo carregava sem
// resposta desde o Capitulo 1.
//
//   POR QUE ELE NAO FUMA. Ele estava com um cigarro aceso na mao, de costas,
//   quando a casa dele pegou fogo. Nao importa que o cigarro nao tenha
//   causado nada — ele nunca mais conseguiu acender um sem estar acendendo
//   AQUELE. O "hoje nao..." e isto, e o jogador so entende aqui.
//
//   POR QUE ELE ACHA QUE ELA ESTA VIVA. Ele nunca viu o corpo da filha.
//   Depois do fogo nao havia o que ver. Sete anos de cartaz novo saem
//   inteiros deste buraco: nao ha luto possivel sem um corpo, e ele nunca
//   teve um.
//
// ⚠ REGRA MANTIDA: nada de dentro da casa e mostrado. A camera fica na
// varanda, com ele, de fora. O fogo e uma parede de luz entre o jogador e o
// que aconteceu — e continua sendo o jogador que imagina o resto.
//
// A cena e encenada, nao jogada: David corre para a porta, bate, e o
// estouro do ar joga ele para tras. Dar o controle ao jogador aqui seria
// prometer que da para salvar alguem.
// ---------------------------------------------------------------------------

// ⚠ O FIM MUDOU na sessao 23. Antes ele batia na porta e o estouro do ar
// jogava ele para tras — ou seja, o jogo decidia por ele que nao dava. Agora
// ele CHUTA a porta, ela cede, ele cai, se levanta e ENTRA. A cena acaba com
// ele atravessando a soleira.
//
// A diferenca nao e de encenacao, e de personagem: um homem que foi jogado
// para tras e uma vitima do incendio. Um homem que arrombou a propria porta
// e entrou e alguem que passou sete anos sabendo que entrou — e que mesmo
// assim nao adiantou nada. A segunda versao dele e a que sobra no Capitulo 3.
//
// E continua sem mostrar nada de dentro: a tela apaga na soleira.
const FASES = [
  ['brasa', 2.0],     // clarao crescendo atras das janelas, ainda sem chama
  ['estouro', 1.4],   // o vidro cede e a chama sai
  ['porta', 2.6],     // ele corre ate a porta
  ['chute', 1.5],     // e chuta
  ['queda', 1.6],     // a porta cede e ele cai junto com ela
  ['entra', 2.0],     // ele levanta e atravessa a soleira, e SOME
  ['fim', 1.6],       // so a casa queimando. E aqui que a tela apaga.
];

export class Fogo {
  constructor() { this.reset(); }

  reset() {
    this.ativo = false;
    this.t = 0;
    this.fase = 'brasa';
    this.faseT = 0;
    this.idx = 0;
    this.k = 0;            // 0 a 1: o tamanho do fogo
    this.crackT = 0;
    this.portaAberta = false;   // depois do chute ela deixa de existir
    this.chutou = false;
    this._chuteT = 0;
    // Onde ele para para chutar. Decidido UMA vez, olhando onde ele estava
    // quando o fogo comecou — ver o bloco grande la embaixo, no `update`.
    this.parada = null;   // a marca no chao
    this.lado = 1;        // -1 = ele veio pela esquerda, 1 = pela direita
    this.dir = -1;        // para onde ele olha, chuta, cai e entra
    this.onEnd = null;
    this.onEntrou = null;
    this.runId = -1;
  }

  // `onEntrou` dispara no instante em que ele ATRAVESSA a soleira, e nao no
  // fim da cena. A diferenca importa: e quem escurece a tela, e ele precisa
  // fazer isso ENQUANTO a casa ainda esta queimando. Se a tela so comecasse
  // a apagar depois de a cena terminar, o fogo ja teria parado de ser
  // desenhado e o jogador veria a casa intacta de novo.
  comecar(game, onEnd, onEntrou) {
    if (this.ativo) return false;
    this.reset();
    this.ativo = true;
    this.onEnd = onEnd || null;
    this.onEntrou = onEntrou || null;
    this.runId = game.runId;
    audio.startLoop('fogo', { gain: 0.02, fade: 1.8 });
    return true;
  }

  parar() {
    if (!this.ativo) return;
    this.ativo = false;
    audio.stopLoop('fogo', 1.4);
  }

  update(dt, game) {
    if (!this.ativo) return;
    // Sair para o menu, carregar um save ou trocar de capitulo no meio da
    // cena nao pode deixar uma casa pegando fogo em outra partida. (B-56)
    if (game.runId !== this.runId) { this.parar(); this.reset(); return; }

    this.t += dt;
    this.faseT += dt;
    this.k = clamp(this.t / 5.2, 0, 1);
    audio.setLoopGain('fogo', 0.03 + this.k * 0.30, 0.4);

    // estalos irregulares por cima do loop
    this.crackT -= dt;
    if (this.crackT <= 0 && this.k > 0.15) {
      this.crackT = 0.32 + Math.random() * 0.9;
      audio.fireCrack(0.5 + this.k * 0.5);
    }

    const p = game.player;
    const lv = game.level;
    const alvo = lv && lv.props && typeof lv.props.portaX === 'number' ? lv.props.portaX : null;

    // ---- ONDE ELE PARA PARA CHUTAR ----
    //
    // A marca no chao e escolhida UMA vez, no primeiro quadro da cena, e
    // olhando onde ele esta: o lado da porta mais perto dele. Ele pode ter
    // atendido o telefone em qualquer ponto da rua — o telefone e dele e
    // esta no bolso dele —, entao a cena nao pode supor de onde ele vem.
    if (alvo !== null && this.parada === null) {
      this.lado = p.x < alvo ? -1 : 1;      // de que lado da porta ele esta
      this.parada = alvo + this.lado * 20;  // onde os pes param
      this.dir = -this.lado;                // para onde ele olha, chuta e entra
    }
    const emPosicao = this.parada !== null && Math.abs(p.x - this.parada) <= 1.5;

    // 🐛 A primeira versao fazia `idx = min(idx+1, ultima)` e zerava o
    // cronometro. Na ultima fase isso reentrava nela para sempre: o
    // cronometro voltava a zero antes de a condicao de fim ser lida, a cena
    // nunca terminava e o jogador ficava preso no passado, com a casa
    // queimando em loop. O fim precisa ser um ramo proprio.
    //
    // ⚠ E A CENA NAO PASSA POR CIMA DO CHUTE. Se ele ainda esta indo, a
    // fase do chute ESPERA — ela nao tem duracao fixa, tem uma condicao.
    // Sem isso, uma caminhada mais longa acabava com o relogio chegando na
    // fase da queda antes do pe: a porta continuava inteira e o David caia
    // sozinho no meio da rua.
    const esperandoChute = this.fase === 'chute' && !this.chutou && alvo !== null;
    if (this.faseT >= FASES[this.idx][1] && !esperandoChute) {
      if (this.idx >= FASES.length - 1) {
        // ⚠ AQUI NAO SE DEVOLVE O `alpha`. Devolver acendia o David de volta
        // em pe na soleira, com a animacao de andar ainda em laco — e como
        // `ativo` fica falso no mesmo instante, o fogo PARA DE SER
        // DESENHADO: a casa voltava a ser uma casa normal e o David
        // reaparecia do nada andando no lugar, até o flashback acabar.
        // Quem devolve o `alpha` é o `enterLevel` do setor seguinte.
        this.ativo = false;
        const cb = this.onEnd;
        this.onEnd = null;
        if (cb) cb();
        return;
      }
      this.idx++;
      this.fase = FASES[this.idx][0];
      this.faseT = 0;
      this._entrarFase(game, p);
    }

    // Ele CORRE para a porta. Correr e a animacao que este homem nao usa em
    // mais nenhum lugar do capitulo — e e por isso que ela diz alguma coisa.
    //
    // ⚠ E ELE SO CHUTA QUANDO CHEGA. Isto ja deu errado duas vezes:
    //
    //   1. a fase trocava por relogio — se a corrida nao tivesse acabado, o
    //      pe saia no meio do quintal e ele atravessava uma porta fechada;
    //   2. a corrida so sabia ir PARA A ESQUERDA. Quem saia de casa parava
    //      em x=660, cinco pixels a esquerda da porta, e a condicao "ele
    //      esta a direita dela" nunca era verdadeira: ele ficava plantado
    //      na calcada, chutava o ar (ou nem isso) e a cena passava por cima.
    //
    // Agora ele anda ate a marca venha de onde vier, VIRA de frente para a
    // porta, e o pe so sai depois disso.
    if (alvo !== null && !this.chutou && (this.fase === 'porta' || this.fase === 'chute')) {
      if (!emPosicao) {
        const rumo = this.parada > p.x ? 1 : -1;
        const passo = 132 * dt;
        p.x = rumo > 0 ? Math.min(this.parada, p.x + passo) : Math.max(this.parada, p.x - passo);
        p.det.setFacing(rumo);
        p.facing = rumo;
        // Um acerto de cinco pixels nao e corrida — correr para andar meio
        // passo vira sapateado no lugar. Os ultimos 34px sao caminhada, e
        // de quebra isso da uma desaceleracao de graca.
        const anim = Math.abs(this.parada - p.x) > 34 ? 'run' : 'walk';
        if (p.det.anim !== anim) p.det.play(anim, { blend: 0.12 });
        // ⚠ SEGURANCA. A fase do chute agora espera por uma CONDICAO, e uma
        // condicao que nunca chega prenderia o jogador no passado com a
        // casa queimando em loop — que e exatamente o buraco do bug antigo,
        // entrando por outra porta. Depois de cinco segundos tentando, os
        // pes vao para a marca de uma vez e a cena segue.
        if (this.fase === 'chute' && this.faseT > 5) p.x = this.parada;
      } else if (this.fase === 'porta') {
        // Chegou antes da hora: fica DE FRENTE para ela e espera o chute.
        p.det.setFacing(this.dir);
        p.facing = this.dir;
        if (p.det.anim !== 'idle') p.det.play('idle', { blend: 0.14 });
      }
    }
    // Chegou e a fase e a do chute: VIRA PARA A PORTA e chuta.
    if (this.fase === 'chute' && !this.chutou && emPosicao) {
      this.chutou = true;
      p.det.setFacing(this.dir);
      p.facing = this.dir;
      p.det.play('kick', { restart: true, blend: 0.06 });
      audio.doorSlam ? audio.doorSlam(0.7) : audio.thud(0.9);
      gfx.shake(3.0);
      // a porta cede no quadro do impacto, nao no fim da animacao
      this._chuteT = 0.30;
      // E o relogio da fase comeca AGORA. Se a caminhada levou dois
      // segundos, o chute nao pode ficar com meio segundo de tela.
      this.faseT = 0;
    }
    if (this._chuteT > 0) {
      this._chuteT -= dt;
      if (this._chuteT <= 0) {
        this.portaAberta = true;
        audio.doorSlam ? audio.doorSlam(1.0) : audio.thud(1);
        audio.fireBurst(0.8);
        gfx.shake(4.6);
      }
    }
    // O corpo vai junto com a perna: e o que separa chutar de encostar o pe.
    // Tudo daqui para baixo anda no sentido da porta (`dir`), nao para a
    // esquerda: de que lado dela ele estava e coisa que a cena so descobre
    // quando ela comeca.
    if (this.fase === 'chute' && this.chutou && this._chuteT > 0.06) {
      p.x += this.dir * 22 * dt;
    }
    // A porta cede e ele cai PARA DENTRO, nao para tras.
    if (this.fase === 'queda' && this.faseT < 0.5) {
      p.x += this.dir * 34 * dt;
    }
    // E ele atravessa a soleira — e some dentro do clarao. A tela nao apaga
    // com ele parado na varanda: apaga com ele ja do outro lado.
    //
    // ⚠ E ELE PARA NO VAO. Sem o limite ele andava os 62px inteiros da fase
    // e SAIA pelo outro lado da porta — atravessava a casa e reaparecia na
    // calcada, meio transparente, que e o oposto exato do que a cena diz.
    // A porta e o fim do caminho: e por isso que ele chutou.
    if (this.fase === 'entra' && this.faseT > 0.85 && alvo !== null) {
      const passo = this.dir * 46 * dt;
      p.x = this.dir > 0 ? Math.min(alvo, p.x + passo) : Math.max(alvo, p.x + passo);
      if (p.det.anim !== 'walk') p.det.play('walk', { blend: 0.16 });
      p.det.alpha = clamp(1 - (this.faseT - 0.85) * 0.9, 0, 1);
    }
    p.det.update(dt);
  }

  _entrarFase(game, p) {
    const f = this.fase;
    if (f === 'estouro') {
      // O VIDRO. A primeira coisa que o jogador VE do fogo — antes disso
      // era so um clarao subindo atras das cortinas.
      audio.glassBreak(1.0);
      audio.fireBurst(0.8);
      gfx.shake(2.6);
      gfx.flashColor = '#ffb060'; gfx.flash = 0.22;
      // De frente para a casa, seja de que lado da porta ele estiver.
      p.det.setFacing(this.dir);
      p.facing = this.dir;
      p.say('b3_fogo_1', 2.0, true);
    } else if (f === 'porta') {
      p.say('b3_fogo_2', 2.2, true);
    } else if (f === 'chute') {
      // O CHUTE em si acontece por POSICAO, no `update`, quando ele chega.
      // Aqui so entra a fala.
      p.say('b3_fogo_3', 2.0, true);
    } else if (f === 'queda') {
      // ele cai para dentro, junto com a porta
      gfx.flashColor = '#ffd0a0'; gfx.flash = 0.38;
      p.det.play('collapse', { restart: true, blend: 0.05 });
      p.say('b3_fogo_4', 2.0, true);
    } else if (f === 'entra') {
      p.det.play('standUp', { restart: true, blend: 0.14 });
      p.say('b3_fogo_5', 2.4, true);
    } else if (f === 'fim') {
      // Ele ja esta do outro lado, e invisivel. O que sobra na tela e uma
      // casa queimando com um vao aberto no meio — e e nisso que a tela
      // apaga. Ele nao volta a aparecer.
      p.det.setFacing(this.dir);
      p.det.alpha = 0;
      p.say('b3_fogo_6', 2.4, true);
      const cb = this.onEntrou;
      this.onEntrou = null;
      if (cb) cb();
    }
  }

  // ---- desenho ----
  //
  // A chama e feita de retangulos: colunas de largura 1 a 3 com altura
  // sorteada por quadro, em tres tons. E o mesmo principio do resto do
  // cenario do jogo (milhares de retangulos de 1px), so que animado. Fogo
  // com gradiente suave destoaria de tudo o que esta em volta.
  draw(ctx, cam, game, lv) {
    if (!this.ativo || !lv || !lv.props || !lv.props.fogo) return;
    const F = lv.props.fogo;
    const k = this.k;
    const t = this.t;

    // clarao por dentro da casa, visto pelas janelas
    ctx.save();
    for (const j of F.janelas) {
      const sx = Math.round(j.x - cam.ix), sy = Math.round(j.y - cam.iy);
      const bril = 0.35 + Math.sin(t * 9 + j.x) * 0.12 + Math.random() * 0.16;
      ctx.globalAlpha = clamp(k * bril + 0.12, 0, 1);
      ctx.fillStyle = k > 0.5 ? '#ffb257' : '#c96a2a';
      ctx.fillRect(sx + 3, sy + 3, j.w - 6, j.h - 6);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // A PORTA ARROMBADA. O cenario e pintado uma vez e nao da para apagar
    // pixel dele — entao o vao e desenhado POR CIMA: um retangulo de escuro
    // com fogo lambendo a moldura. E o que faz o chute ter acontecido.
    if (this.portaAberta) {
      const P2 = F.porta;
      const sx = Math.round(P2.x - cam.ix), sy = Math.round(P2.y - cam.iy);
      ctx.save();
      ctx.fillStyle = '#0a0604';
      ctx.fillRect(sx, sy, P2.w, P2.h);
      // batente lascado: a madeira nao sai inteira
      ctx.fillStyle = '#2a1c10';
      for (let i = 0; i < 7; i++) {
        const yy = sy + 6 + i * 10;
        ctx.fillRect(sx, yy, 2 + (i % 3), 4);
        ctx.fillRect(sx + P2.w - 3 - (i % 2), yy + 4, 3, 3);
      }
      // e o clarao de dentro, que agora tem por onde sair
      const b2 = 0.4 + Math.sin(t * 8) * 0.12 + Math.random() * 0.14;
      ctx.globalAlpha = clamp(b2, 0, 1);
      ctx.fillStyle = '#c9591f';
      ctx.fillRect(sx + 3, sy + 4, P2.w - 6, P2.h - 6);
      ctx.restore();
    }

    if (this.idx < 1) return;   // antes do vidro estourar nao ha chama fora

    const bocas = [];
    for (const j of F.janelas) bocas.push({ x: j.x + 3, y: j.y + 4, w: j.w - 6, h: 26 + k * 30 });
    if (this.idx >= 2) bocas.push({ x: F.porta.x + 2, y: F.porta.y + 6, w: F.porta.w - 4, h: 20 + k * 34 });
    // O telhado so pega no fim, e com passo maior: a mesma largura de
    // coluna das janelas ao longo de 356px virava um pente de dentes
    // iguais atravessando a tela inteira.
    if (k > 0.7) bocas.push({ x: F.telhado.x + 40, y: F.telhado.y, w: F.telhado.w - 80, h: 8 + k * 16, passo: 3 });

    ctx.save();
    for (const b of bocas) {
      const sx = Math.round(b.x - cam.ix), sy = Math.round(b.y - cam.iy);
      if (sx > VW + 40 || sx + b.w < -40) continue;
      const passo = b.passo || 2;
      for (let x = 0; x < b.w; x += passo) {
        const fase = (x * 0.7 + t * 11 + b.x * 0.3);
        const alt = b.h * (0.45 + Math.abs(Math.sin(fase)) * 0.55) * (0.7 + Math.random() * 0.3) * k;
        const h = Math.max(2, Math.round(alt));
        // do mais escuro para o mais claro, de fora para dentro da chama
        ctx.fillStyle = '#8a2a12';
        ctx.fillRect(sx + x, sy - h, passo, h);
        ctx.fillStyle = '#d8641f';
        ctx.fillRect(sx + x, sy - Math.round(h * 0.72), passo, Math.round(h * 0.72));
        ctx.fillStyle = '#ffb046';
        ctx.fillRect(sx + x, sy - Math.round(h * 0.38), passo, Math.round(h * 0.38));
        if (Math.random() < 0.14) {
          ctx.fillStyle = '#ffe9b0';
          ctx.fillRect(sx + x, sy - Math.round(h * 0.16), passo, Math.max(1, Math.round(h * 0.16)));
        }
      }
    }
    ctx.restore();

    // fumaca: bloco escuro subindo do telhado, cada vez mais alto
    if (k > 0.25) {
      ctx.save();
      ctx.globalAlpha = clamp((k - 0.25) * 0.5, 0, 0.42);
      ctx.fillStyle = '#1a1512';
      const sx = Math.round(F.telhado.x - cam.ix);
      for (let x = 0; x < F.telhado.w; x += 4) {
        const h = 26 + Math.sin(x * 0.09 + t * 1.4) * 14 + Math.random() * 10;
        ctx.fillRect(sx + x, Math.round(F.telhado.y - cam.iy) - h, 4, h);
      }
      ctx.restore();
    }

    // brasas subindo. Vao para o sistema de particulas do jogo, entao
    // passam na frente do personagem e recebem o mesmo grao do resto.
    if (game.fx && Math.random() < 0.75) {
      const j = F.janelas[Math.random() < 0.5 ? 0 : 1];
      game.fx.spawn({
        x: j.x + Math.random() * j.w, y: j.y + 10 + Math.random() * 16,
        vx: -12 + Math.random() * 24, vy: -26 - Math.random() * 44 * k,
        ay: -6, life: 1.4 + Math.random() * 1.6, size: Math.random() < 0.25 ? 2 : 1,
        color: Math.random() < 0.4 ? '#ffd08a' : '#e8752a', glow: true, wobble: 14, drag: 0.5,
      });
    }
  }

  addLights(gfx2, cam, lv) {
    if (!this.ativo || !lv || !lv.props || !lv.props.fogo) return;
    const F = lv.props.fogo;
    const k = this.k;
    const tre = 0.82 + Math.sin(this.t * 13) * 0.09 + Math.random() * 0.12;
    // ⚠ Estes numeros ja foram uma vez o dobro disto, e o resultado foi
    // uma tela branca: as janelas estouravam, o bloom comia a parede de
    // tijolo e David sumia contra o proprio incendio. Fogo grande nao e
    // fogo claro — e fogo com sombra do lado. Se for mexer, meça na tela.
    for (const j of F.janelas) {
      gfx2.addLight(j.x + j.w / 2 - cam.ix, j.y + j.h / 2 - cam.iy,
        150 + k * 150, '#ff9a3c', (0.30 + k * 0.55) * tre, 0.92);
    }
    if (this.idx >= 2) {
      gfx2.addLight(F.porta.x + F.porta.w / 2 - cam.ix, F.porta.y + 30 - cam.iy,
        120 + k * 120, '#ffb055', (0.25 + k * 0.45) * tre, 1.0);
    }
    // a casa inteira acesa por dentro, jogando luz na rua
    gfx2.addLight(F.casa.x + F.casa.w / 2 - cam.ix, F.casa.y + F.casa.h / 2 - cam.iy,
      300 + k * 220, '#e8712a', (0.14 + k * 0.30) * tre, 1.35);
  }

  save() { return this.ativo ? { t: this.t, i: this.idx } : null; }
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
