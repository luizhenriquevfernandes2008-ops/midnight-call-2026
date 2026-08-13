// chapter4.js — o que so existe no Capitulo 4, "A CASA".
//
// O capitulo inteiro se apoia numa mecanica so, e ela e do Luiz:
//
//   O CIGARRO TROCA A CASA.
//
// O padrao e a casa EM PE — quente, com luz, com o radio tocando. Acender um
// cigarro mostra a RUINA, que e o que a casa e ha sete anos. Quem joga entra
// num lugar acolhedor e tem que se envenenar de proposito para ver a
// verdade. Ao contrario, seria so uma lanterna.
//
// O maco tem SETE. O jogo nunca diz quantos vao ser precisos, nao tem
// contador na tela, e nao avisa que acabou: ele aperta F, e so amassa o maco
// vazio.
//
// ⚠ E O FIM DO CAPITULO SAI DESSA CONTA, sem tela de escolha nenhuma. Quem
// chegar no telefone com cigarro na mao atende na casa iluminada e vai
// embora sem saber. Quem gastou os sete atende na ruina, e ouve.
//
// O que mora aqui:
//   1. CIGARRO ......... o relogio, o maco, e a troca dos dois estados
//   2. APARICAO ........ a figura que anda quando ele nao esta olhando, e o
//                        homem de sobretudo da varanda
//   3. MARCAS .......... tiro dado na ruina estraga a casa intacta
//   4. TELEFONE ........ o fim, nas duas versoes

import { VW, VH, clamp, gfx } from '../core/gfx.js';
import { PAL } from '../art/palette.js';
import { audio } from '../core/audio.js';
import { Detective } from '../art/detective.js';
import { aplicarEstadoCh4 } from '../world/levels-ch4.js';

// Quanto tempo um cigarro dura, em segundos.
//
// ⚠ D-15: ESTE NUMERO NAO FOI DECIDIDO OLHANDO A TELA. 40s e o que estava no
// papel. Curto demais vira corrida contra o relogio; longo demais tira a
// tensao. E o primeiro numero a mexer depois do teste humano.
export const DUR_CIGARRO = 40;

// Quantos vem no maco. Sete anos, sete cigarros.
export const NO_MACO = 7;

// Nos ultimos segundos a brasa aparece no canto da tela e a ruina comeca a
// "respirar" de volta. Sem numero e sem barra.
const AVISO_FIM = 8;

// ---------------------------------------------------------------------------
// 1 — O CIGARRO
// ---------------------------------------------------------------------------

export class Cigarro {
  constructor() { this.reset(); }

  reset() {
    this.maco = NO_MACO;
    this.estado = 'casa';
    this.t = 0;             // quanto resta do cigarro aceso
    this.trans = 0;         // 0..1, o veu da troca
    this.transLonga = false;
    this.primeira = true;   // a primeira vez a casa desaba em tempo real
    this.brasa = 0;
    this.runId = -1;
    this.bloqueado = false; // durante a cena do desabamento
  }

  get acesso() { return this.estado === 'ruina'; }
  get vazio() { return this.maco <= 0; }

  // ---- acender ----
  //
  // Devolve false quando nao ha o que acender. O jogo NAO avisa que o maco
  // acabou antes de ele tentar: descobrir de mao vazia e o ponto.
  acender(game) {
    if (this.acesso || this.bloqueado) return false;
    if (this.maco <= 0) {
      game.player.say('b4_maco_vazio', 2.4, true);
      audio.pageTurn(0.5);
      return false;
    }
    this.maco--;
    audio.lighterFlick(1);
    if (audio.flameWhoosh) audio.flameWhoosh(0.5);
    this._trocar(game, 'ruina');
    // A PRIMEIRA VEZ A CASA DESABA EM TEMPO REAL, e ele nao fala nada. A
    // primeira tragada e MUDA — ver o roteiro, cena 1.
    if (this.primeira) {
      this.primeira = false;
      this.transLonga = true;
      this.trans = 1;
      this.bloqueado = true;
      const p = game.player;
      p.controllable = false;
      p.vx = 0;
      const agora = game.runId;
      setTimeout(() => {
        if (game.runId !== agora) return;
        this.bloqueado = false;
        game.player.controllable = true;
      }, 4000);
    } else {
      this.trans = 1;
    }
    return true;
  }

  // ---- jogar fora ----
  //
  // ⚠ E EXATAMENTE A ANIMACAO DE OCIO DO CAPITULO 1, a do "hoje nao...", que
  // o jogador ja viu mil vezes. O gesto que define o personagem desde a
  // primeira tela do jogo virou um verbo — e o cigarro e gasto do mesmo
  // jeito, porque jogar fora custa igual a fumar ate o fim.
  jogarFora(game) {
    if (!this.acesso || this.bloqueado) return false;
    this.t = 0;
    audio.whoosh(0.28);
    this._trocar(game, 'casa');
    return true;
  }

  // Alterna. E o que a tecla F faz.
  alternar(game) {
    return this.acesso ? this.jogarFora(game) : this.acender(game);
  }

  _trocar(game, estado) {
    this.estado = estado;
    this.t = estado === 'ruina' ? DUR_CIGARRO : 0;
    this.trans = Math.max(this.trans, 0.85);
    const lv = game.level;
    if (lv && lv.ch4) {
      aplicarEstadoCh4(lv, estado);
      // O som do lugar muda junto: a casa tem tom de sala, a ruina tem
      // vento. Trocar sem trocar o ouvido deixa a ilusao pela metade.
      audio.stopAllLoops(0.35);
      for (const a of (lv.ambience || [])) audio.startLoop(a.n, { gain: a.g, fade: 0.5 });
      // ⚠ Se ele estava dentro de um vao que a casa intacta nao tem, ou em
      // cima de um buraco que virou chao, o jogo empurra ele para o espaco
      // livre mais proximo. Nunca mata por isso.
      this._desencalhar(game, lv);
    }
    // A musica da casa so existe do lado bom. Ela morre na fumaca.
    if (estado === 'casa') {
      if (!audio.tocarMusicaArquivo(0.16)) audio.startMusic('casa');
    } else {
      audio.pararMusicaArquivo(0.5);
      audio.stopMusic(0.6);
    }
    if (game.figura) game.figura.aoTrocar(game, estado);
  }

  _desencalhar(game, lv) {
    const p = game.player;
    p.x = clamp(p.x, lv.minX, lv.maxX);
    for (const par of (lv.paredes || [])) {
      if (p.x > par.x0 && p.x < par.x1) {
        const dEsq = p.x - par.x0, dDir = par.x1 - p.x;
        p.x = dEsq < dDir ? par.x0 - 2 : par.x1 + 2;
        p.vx = 0;
      }
    }
  }

  update(dt, game) {
    if (this.trans > 0) this.trans = Math.max(0, this.trans - dt * (this.transLonga ? 0.25 : 3.2));
    if (this.trans <= 0) this.transLonga = false;

    // ⚠ DEPOIS QUE ELE ATENDE, O RELOGIO PARA.
    //
    // Sem isto a cena final se desfazia sozinha: o fim da versao B derruba
    // a casa para a ruina de proposito, e o relogio — que estava zerado —
    // achava que o cigarro tinha acabado e devolvia a casa em pe no quadro
    // seguinte. O jogador ouvia a respiracao de crianca com o abajur aceso.
    // De quebra, a sanidade parava de ser cobrada durante a cena, que e o
    // certo: ele nao esta mais jogando.
    if (game.flags && game.flags.ch4_fim) { this.brasa = 0; return; }

    if (!this.acesso) { this.brasa = Math.max(0, this.brasa - dt * 2); return; }

    this.t -= dt;
    // A brasa no canto: so nos ultimos segundos, e sem numero.
    this.brasa = this.t < AVISO_FIM ? clamp(1 - this.t / AVISO_FIM, 0, 1) : 0;

    // A ruina custa. A casa nao devolve — ela so nao cobra.
    if (game.sanity) game.sanity.drain(dt * 0.85);

    if (this.t <= 0) {
      this.t = 0;
      this._trocar(game, 'casa');
    }
  }

  // O veu da troca. Nao e corte de tela: e cinza caindo, e ela cai muito
  // mais tempo na primeira vez.
  draw(ctx, game) {
    if (this.trans <= 0) return;
    const a = this.trans;
    ctx.save();
    ctx.globalAlpha = a * (this.transLonga ? 0.62 : 0.42);
    ctx.fillStyle = this.acesso ? '#05070a' : '#241a12';
    ctx.fillRect(0, 0, VW, VH);
    ctx.restore();
    // a cinza
    const n = this.transLonga ? 90 : 34;
    const t = game.level ? game.level.t : 0;
    ctx.save();
    ctx.globalAlpha = a * 0.6;
    for (let i = 0; i < n; i++) {
      const px = (i * 97 + Math.floor(t * 13)) % VW;
      const py = (i * 53 + Math.floor(t * 70 + i * 11)) % VH;
      ctx.fillStyle = i % 3 ? '#6a6055' : '#3a352e';
      ctx.fillRect(px, py, 1, 1);
    }
    ctx.restore();
  }

  // A brasa. E o unico elemento de interface que este capitulo acrescenta —
  // e ela nao diz quantos sobraram, so que ESTE esta acabando.
  drawBrasa(ctx) {
    if (this.brasa <= 0) return;
    const a = this.brasa;
    const x = VW - 22, y = VH - 30;
    const pulso = 0.6 + 0.4 * Math.sin(a * 22);
    ctx.save();
    ctx.globalAlpha = a * 0.9;
    ctx.fillStyle = '#2a1c14';
    ctx.fillRect(x, y, 10, 3);
    ctx.fillStyle = '#c8c0b0';
    ctx.fillRect(x, y, 10 - Math.round(a * 7), 3);
    ctx.fillStyle = a > 0.7 ? '#ff8a3c' : '#d86a28';
    ctx.globalAlpha = a * pulso;
    ctx.fillRect(x + 10 - Math.round(a * 7) - 1, y, 2, 3);
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// 2 — AS APARICOES
// ---------------------------------------------------------------------------
// Duas, e as duas sao o rig do detetive pintado de uma cor so. Sem rosto,
// sem informacao, e sem luz de contorno — contorno em cima delas devolveria
// justamente o volume que elas nao podem ter.

export class Aparicao {
  constructor(cor, anim, escala) {
    const d = this.det = new Detective();
    d.parts = null;
    d.silhouette = cor;
    d.rimAlpha = 0;
    d.reflect = 0;
    d.flipT = 1;
    if (escala) { d.scaleX = escala; d.scaleY = escala; }
    d.play(anim, { blend: 0 });
    this.anim = anim;
    this.level = null;
    this.x = 0;
    this.facing = -1;
    this.visivel = false;
  }

  por(level, x, facing) {
    this.level = level;
    this.x = x;
    this.facing = facing === undefined ? -1 : facing;
    this.det.setFacing(this.facing);
    this.det.flipT = 1;
    this.visivel = true;
  }

  sumir() { this.visivel = false; this.level = null; }

  update(dt) { if (this.visivel) this.det.update(dt); }

  draw(ctx, cam, groundY, lvKey) {
    if (!this.visivel || this.level !== lvKey) return;
    this.det.draw(ctx, this.x - cam.ix, groundY - cam.iy);
  }
}

// ---- A FIGURA NEGRA ----
//
// A mesma do deposito do Capitulo 1 e a mesma da sala de espera do
// Capitulo 3. A partir do TERCEIRO cigarro ela esta na casa.
//
// ⚠ A REGRA E UNICA, E E TODA A MECANICA: ELA SO SE MEXE ENQUANTO ELE NAO
// ESTA FUMANDO. Na ruina ela esta parada onde voce a viu. Na casa intacta
// ela some da tela — e quando voce acender de novo, ela esta mais perto.
//
// Isto nao precisa de IA nenhuma: e uma posicao que anda quando o estado
// troca. E faz o cigarro ser as duas coisas ao mesmo tempo, o mapa e a unica
// protecao. Os dois acabam juntos.
export class Figura extends Aparicao {
  constructor() {
    super('#050507', 'idle', 1.1);
    this.reset();
  }

  reset() {
    this.sumir();
    this.acesas = 0;      // quantas vezes ele acendeu
    this.passos = 0;      // quantos passos ela ja deu na direcao dele
    this.sentada = false;
    this.vistaUmaVez = false;
  }

  aoTrocar(game, estado) {
    if (estado !== 'ruina') {
      // Na casa intacta ela NAO EXISTE na tela. E enquanto ela nao esta na
      // tela e que ela anda.
      this.sumir();
      if (this.acesas >= 3) this.passos++;
      return;
    }
    this.acesas++;
    if (this.acesas < 3) return;

    const lv = game.level;
    if (!lv) return;
    // Ela nasce longe, no ponto que o setor indicar, e vai encurtando a
    // distancia a cada troca. 62px por passo: quatro trocas para chegar.
    const alvo = game.player.x;
    const longe = lv.props && lv.props.figuraX !== undefined
      ? lv.props.figuraX
      : (alvo + (alvo < lv.width / 2 ? 200 : -200));
    const dist = Math.max(18, Math.abs(longe - alvo) - this.passos * 62);
    const lado = longe >= alvo ? 1 : -1;
    const x = clamp(alvo + lado * dist, lv.minX, lv.maxX);
    this.por(lv.key, x, alvo >= x ? 1 : -1);

    // ENCOSTOU: ela nao mata. Ela SENTA. Do lado dele. E fica.
    if (dist <= 20 && !this.sentada) {
      this.sentada = true;
      this.det.play('sitChair', { blend: 0.3 });
      audio.heartbeat(0.9);
      if (game.sanity) game.sanity.drain(26, true);
      game.player.say('b4_figura_senta', 3.2, true);
    }

    if (!this.vistaUmaVez) {
      this.vistaUmaVez = true;
      // As tres falas da primeira vez sao as MESMAS tres da sala de espera
      // do Capitulo 3, palavra por palavra. Repetir e o ponto.
      game.player.sayAll(['b4_figura_1', 'b4_figura_2', 'b4_figura_3'], true);
    }
    // ⚠ E O DAVID NAO COMENTA QUE ELA ANDOU. Nunca, no capitulo inteiro.
    // Quem conta a distancia e o jogador.
  }
}

// ---- A JULIE ----
//
// Ela atravessa o fundo da tela indo para a cozinha, de costas, com um copo
// na mao. UMA vez, na casa intacta.
//
// ⚠ ELA NAO INTERAGE. Nao olha, nao fala com ele, nao responde. Esta fazendo
// uma noite comum, e e pior assim. E o David chama UMA vez e volta ao
// servico — ele ja sabe o que isso e; ele so nao vai dizer em voz alta.
export class Julie extends Aparicao {
  constructor() {
    super('#141018', 'walk', 0.94);
    this.reset();
  }

  reset() {
    this.sumir();
    this.andando = false;
    this.x0 = 0; this.x1 = 0;
    this.jaPassou = false;
  }

  atravessar(lv) {
    if (this.jaPassou || !lv.props || !lv.props.julie) return false;
    this.jaPassou = true;
    const j = lv.props.julie;
    this.x0 = j.x0; this.x1 = j.x1;
    this.por(lv.key, j.x0, 1);
    this.andando = true;
    this.det.play('walk', { blend: 0 });
    return true;
  }

  update(dt) {
    super.update(dt);
    if (!this.andando) return;
    this.x += 26 * dt;
    if (this.x >= this.x1) { this.andando = false; this.sumir(); }
  }
}

// ---- O HOMEM DE SOBRETUDO ----
//
// Recuperado da PARTE IV do roteiro (opcao 2), arquivada em 06/08 com o
// motivo "entrega o Credor cedo demais". No Capitulo 4 ja nao e cedo.
//
// Sentado no degrau da varanda, de costas, com sobretudo IGUAL AO DELE,
// fumando. So aparece se ele chegar la com o ULTIMO cigarro aceso.
export class HomemDoSobretudo extends Aparicao {
  constructor() {
    super('#0e0a08', 'sitChair', 1.0);
    this.reset();
  }

  reset() {
    this.sumir();
    this.ofereceu = false;
    this.aceitou = false;
  }
}

// ---------------------------------------------------------------------------
// 3 — AS MARCAS DE TIRO
// ---------------------------------------------------------------------------
// ⚠ TIRO DADO DENTRO DA RUINA ESTRAGA A CASA INTACTA. Cada disparo deixa uma
// marca que fica: o vidro trincado, o radio que emudece e nao volta, uma
// mancha no papel de parede.
//
// Ele atira no escuro, e quando a casa volta a ficar boa, ela esta um pouco
// menos boa. E o David nao comenta nenhuma dessas marcas. Nenhuma vez.
//
// (nota de design: e a licao do Capitulo 5 sendo ensinada com a mao do
//  jogador, um capitulo antes de ela ser cobrada. Violencia contra a coisa
//  que te assombra estraga a lembranca, nao a assombracao.)
//
// D-17: elas NAO atravessam para o Capitulo 5. Zeram no fim do 4.
export class Marcas {
  constructor() { this.reset(); }

  reset() { this.lista = []; this.radioMudo = false; }

  registrar(game, x) {
    const lv = game.level;
    if (!lv || !lv.ch4) return;
    this.lista.push({ lv: lv.key, x: Math.round(x), y: 60 + (this.lista.length * 37) % 90 });
    // O radio e a primeira coisa que morre. Depois dele, so parede.
    if (!this.radioMudo) {
      this.radioMudo = true;
      game.flags.ch4_radio_mudo = true;
    }
  }

  // Desenhadas so na casa intacta, e por cima do cenario: elas sao o que a
  // ruina deixou na lembranca.
  draw(ctx, cam, lvKey, estado) {
    if (estado !== 'casa') return;
    for (const m of this.lista) {
      if (m.lv !== lvKey) continue;
      const sx = Math.round(m.x - cam.ix), sy = m.y;
      ctx.save();
      ctx.globalAlpha = 0.82;
      ctx.fillStyle = '#0b0806';
      ctx.fillRect(sx - 2, sy - 2, 5, 5);
      ctx.fillStyle = '#1c1410';
      ctx.fillRect(sx - 4, sy - 1, 9, 3);
      ctx.fillRect(sx - 1, sy - 4, 3, 9);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#2e2018';
      ctx.fillRect(sx - 7, sy, 15, 1);
      ctx.restore();
    }
  }
}

// ---------------------------------------------------------------------------
// 4 — O TELEFONE
// ---------------------------------------------------------------------------
// O fim do capitulo, em duas versoes, e o jogador nao escolhe numa tela de
// escolha: ele ja escolheu, fumando ou nao fumando, durante 45 minutos.
//
// ⚠ O QUE A LIGACAO DIZ, NAS DUAS: nenhuma palavra, nenhum nome, nenhuma voz
// de mulher. A regra de 10/08 continua de pe — se sair palavra dali, o
// Capitulo 6 fica sem ter o que dizer. RESPIRACAO NAO E PALAVRA, e e por
// isso que ela pode.

export class Telefone {
  constructor() { this.reset(); }

  reset() {
    this.tocando = false;
    this.atendido = false;
    this.ringT = 0;
    this.runId = -1;
  }

  comecarATocar(game) {
    if (this.tocando || this.atendido) return false;
    this.tocando = true;
    this.ringT = 0;
    this.runId = game.runId;
    return true;
  }

  update(dt, game) {
    if (!this.tocando || this.atendido) return;
    if (game.runId !== this.runId) { this.reset(); return; }
    this.ringT -= dt;
    if (this.ringT <= 0) {
      this.ringT = 4.2;
      // Casa sem luz, fio derretido ha sete anos. E ele toca.
      audio.phoneRing(game.level && game.level.key === 'ch4_sala' ? 0.75 : 0.3);
    }
  }
}

// ---------------------------------------------------------------------------
// entrada e saida do capitulo
// ---------------------------------------------------------------------------

// Ele chega na casa com TUDO que o escaninho 214 devolveu na saida da
// delegacia. E a primeira vez no jogo inteiro em que o casaco esta cheio, e
// isso paga uma promessa que o Capitulo 3 fez por escrito: "quando a arma
// voltar, no Capitulo 4, ela vai pesar."
export function equiparParaCapitulo4(game) {
  const p = game.player;
  p.idleMode = null;
  p.det.parts = null;
  p.hasGun = true;
  p.ammo = 6;
  p.reserve = 12;
  p.det.props.gun = 'holstered';
  p.segurarPorrete(false);
  p.club = false;
  p.hp = 100;
  p.det.coatTorn = true;
  p.det.blood = 0.3;
  p.det.injury = 0;
  game.inv.add('cigs');
  game.inv.add('lighter');
  game.inv.add('gun');
  game.inv.add('shotgun');   // a calibre doze da mesa dele, do Capitulo 3
  game.inv.add('map');
  game.flags.caderno = true;
}
