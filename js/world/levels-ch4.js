// levels-ch4.js — os setores do Capitulo 4, "A CASA".
//
// O Capitulo 3 termina com ele decidindo achar o Andrade. Ele precisa de um
// endereco, e o unico papel dele de sete anos atras esta na casa. Ele vai la
// POR MOTIVO DE DETETIVE — nao vai visitar a dor, vai buscar uma conta de
// telefone. Chega, e A CASA ESTA EM PE.
//
// ⚠ ISTO NAO E FLASHBACK. Sem cartela, sem sepia, sem troca de roupa, sem
// tirar o controle da mao. O jogo NUNCA explica o que esta acontecendo, e o
// David nao especula. Ver ROTEIRO.txt, PARTE XI.
//
// ----------------------------------------------------------------------
// A ESTRUTURA DESTE ARQUIVO — e ela e diferente de todos os outros
// ----------------------------------------------------------------------
// Cada setor daqui e UM setor com DOIS ESTADOS desenhados por cima da mesma
// geometria:
//
//   casa .... a casa como ela era. Luz, movel, papel de parede. E o PADRAO.
//   ruina ... sete anos depois do fogo. E o que aparece enquanto ele fuma.
//
// Os dois estados moram em `lvl.ch4.casa` e `lvl.ch4.ruina`, e quem troca e
// `aplicarEstadoCh4()`, no fim deste arquivo. Trocar de estado nao recria
// nada: os canvas dos dois ja estao prontos desde o boot.
//
// A REGRA QUE FAZ O PUZZLE: cada estado tem uma topologia propria.
//   · parede caida na ruina = PASSAGEM que a casa intacta nao tem
//   · assoalho do corredor na ruina = BURACO que so a casa intacta cobre
// Entao o jogador e obrigado a acender de proposito E a apagar de proposito.
//
// A REGRA NUMERICA DE LUZ (erro M-04) vale aqui como em todo lugar, e vale
// NOS DOIS ESTADOS: `preencher()` e chamada duas vezes por setor.
// ----------------------------------------------------------------------

import { VW, VH, makeBuffer, mulberry32 } from '../core/gfx.js';
import { rect, grainRect, ditherV } from '../art/pixel.js';
import * as M from './materials.js';
import { Level } from './levels.js';

const GY = 214;

// ---------------------------------------------------------------------------
// pinceis da ruina — so existem aqui
// ---------------------------------------------------------------------------

// Preenchimento fraco na altura do chao, a cada ~200px. Mesma funcao que o
// Capitulo 3 usa; ela vive nos dois arquivos de proposito, porque a do 3 nao
// e exportada e importar por importar acopla dois capitulos sem motivo.
function preencher(lights, W, cor = '#8a7a60', i = 0.2, passo = 200, y = GY - 30) {
  for (let x = passo / 2; x < W; x += passo) {
    lights.push({ x, y, r: passo * 0.9, color: cor, i, falloff: 1.25 });
  }
}

// ---- A LUZ DA RUINA ----
//
// ⚠ ERRO M-04, COMETIDO PELA TERCEIRA VEZ NESTE PROJETO E PEGO OLHANDO A
// TELA, nao pelo teste: a primeira versao da ruina estava com ambiente
// #141c26 e preenchimento 0.16, e o resultado era uma tela PRETA com um
// boneco no meio. O teste passava — ele conta lampadas, nao enxerga.
//
// A ruina precisa ser MAIS ESCURA E MAIS FRIA que a casa, nao invisivel:
// tudo o que o capitulo tem para contar de verdade esta do lado destruido,
// e o jogador precisa LER marca de unha, sapato e cartaz ali dentro.
//
// A fonte de luz da ruina e uma so, e ela justifica o resto: o telhado nao
// existe mais, entao o ceu entra. Por isso a luz vem DE CIMA e e azul.
function luzDoCeu(lights, W, forca = 1) {
  for (let x = 120; x < W + 120; x += 240) {
    lights.push({ x, y: 24, r: 250, color: '#54708f', i: 0.42 * forca, falloff: 1.05 });
  }
  preencher(lights, W, '#4a6280', 0.34 * forca, 190, GY - 26);
  // uma segunda camada rasteira, so no chao: sem ela o pe do cenario — que
  // e onde estao o sapato, os cartazes e a porta do armario — some.
  preencher(lights, W, '#3e5068', 0.26 * forca, 150, GY - 6);
}

// Madeira queimada: tabua com a face carbonizada e o veio ainda visivel por
// baixo. E o material da casa inteira depois do fogo.
function madeiraQueimada(g, x, y, w, h, seed) {
  const rnd = mulberry32(seed);
  rect(g, x, y, w, h, '#1a1512');
  for (let i = 0; i < w * h * 0.05; i++) {
    const px = x + rnd() * w, py = y + rnd() * h;
    const c = rnd() < 0.7 ? '#0e0b09' : (rnd() < 0.6 ? '#2a2019' : '#3a2c20');
    rect(g, px, py, 1 + (rnd() < 0.2 ? 1 : 0), 1, c);
  }
  // as rachaduras do carvao: sempre verticais, sempre curtas
  for (let i = 0; i < w * 0.06; i++) {
    const px = x + rnd() * w, py = y + rnd() * h * 0.8;
    rect(g, px, py, 1, 3 + rnd() * 5, '#070505');
  }
}

// Papel de parede descascado: o que sobra de uma parede que teve papel. A
// mancha de fuligem sobe, porque fumaca sobe.
function paredeDescascada(g, x, y, w, h, seed) {
  const rnd = mulberry32(seed);
  rect(g, x, y, w, h, '#332a22');
  grainRect(g, x, y, w, h, ['#41352b', '#241c17', '#4e3c2c'], 0.05, seed + 1);
  // pedacos de papel que aguentaram, sempre na parte de baixo
  for (let i = 0; i < w * 0.03; i++) {
    const px = x + rnd() * w;
    const py = y + h * 0.4 + rnd() * h * 0.5;
    const pw = 5 + rnd() * 16, ph = 6 + rnd() * 18;
    rect(g, px, py, pw, ph, '#5a4632');
    rect(g, px, py, pw, 1, '#70573e');
  }
  // Fuligem subindo — fumaca sobe. Ela para no terco de cima e NAO chega a
  // preto: parede preta multiplicada pela luz da fase vira buraco, e o
  // jogador precisa ler marca de unha e cartaz em cima dela.
  ditherV(g, x, y, w, Math.round(h * 0.34), '#171210', '#332a22', 6);
}

// Mato crescendo dentro de casa. Sete anos sem telhado fazem isso, e e a
// coisa que mais rapido diz ao olho "faz muito tempo".
function mato(g, x, gy, w, seed, alt = 16) {
  const rnd = mulberry32(seed);
  for (let i = 0; i < w * 0.28; i++) {
    const px = x + rnd() * w;
    const h = 4 + rnd() * alt;
    const c = rnd() < 0.5 ? '#2a3320' : (rnd() < 0.6 ? '#37421f' : '#1e2618');
    rect(g, px, gy - h, 1, h, c);
    if (rnd() < 0.3) rect(g, px + (rnd() < 0.5 ? -1 : 1), gy - h + 2, 1, 2, c);
  }
}

// Ceu aberto onde havia telhado. Nao e uma cor: e o buraco, com as pontas do
// caibro que sobraram mordendo a borda.
function telhadoAberto(g, x, y, w, seed) {
  const rnd = mulberry32(seed);
  rect(g, x, 0, w, y, '#0d1622');
  ditherV(g, x, Math.max(0, y - 44), w, 44, '#1b2a3e', '#0d1622', 5);
  // O fio de luz na linha do telhado. Sem ele o dentro e o ceu viram o
  // mesmo borrao escuro e a casa nao parece aberta, parece apagada.
  rect(g, x, y - 1, w, 1, '#40587a');
  for (let i = 0; i < 60; i++) {
    if (rnd() < 0.5) rect(g, x + rnd() * w, rnd() * Math.max(1, y - 12), 1, 1, '#8fa5c8');
  }
  // caibros partidos pendurados na borda de cima
  let cx = x + 6;
  while (cx < x + w - 6) {
    const ch = 5 + rnd() * 13;
    rect(g, cx, y - ch, 3, ch, '#160f0b');
    rect(g, cx, y - ch, 1, ch, '#241a12');
    cx += 12 + rnd() * 26;
  }
}

// Vidro estourado PARA DENTRO. A direcao importa: para dentro e fogo e
// bombeiro; para fora seria explosao. Nesta casa foi fogo.
function janelaQuebrada(g, x, y, w, h, seed) {
  const rnd = mulberry32(seed);
  rect(g, x, y, w, h, '#0c1116');
  rect(g, x, y, w, 1, '#241a14');
  rect(g, x, y + h - 1, w, 1, '#241a14');
  for (let i = 0; i < 14; i++) {
    const sx = x + 1 + rnd() * (w - 2);
    const sh = 2 + rnd() * 6;
    rect(g, sx, y + 1, 1, sh, '#3e4a52');
  }
  M.glassShards(g, x + 2, y + h + 10, w - 4, seed + 7);
}

// ---------------------------------------------------------------------------
// 1 — A RUA E O PORTAO   (cenas 1, 6 do roteiro)
// ---------------------------------------------------------------------------
// Onde ele chega, onde esta a varanda, e onde estao os fundos.
//
// ⚠ NA CASA (intacta) a porta da frente esta TRANCADA e a chave acabou com a
// casa. Nao ha outra entrada. O jogo nao sugere nada — o unico item do
// casaco que faz alguma coisa aqui e o maco. Isso e o tutorial inteiro.

export function buildRuaDaCasa() {
  const W = 1150;

  // ---- fundo comum aos dois estados: o resto da rua, sem uma janela acesa
  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.4) + 8, VH);
  {
    const b = back.x;
    rect(b, 0, 0, b.canvas.width, VH, '#080d14');
    ditherV(b, 0, 20, b.canvas.width, 140, '#101c2c', '#080d14', 6);
    for (let i = 0; i < 7; i++) {
      M.buildingSilhouette(b, i * 132 - 30, 158, 100, 82 + i * 9, '#0c141f', 12001 + i, false);
    }
  }

  const CASA = 500, PORTA = CASA + 148, VAR = CASA + 210, FUNDOS = 940;

  // =========================== A CASA (intacta) ===========================
  const mCasa = makeBuffer(W, VH);
  const iCasa = [];
  const lCasa = [];
  {
    const g = mCasa.x;
    rect(g, 0, 0, W, VH, '#12202e');
    M.brickWall(g, 0, 26, W, GY - 26, 12011, { hi: '#6a5442', mid: '#4e3d30', dk: '#33281f' });
    rect(g, 0, 0, W, 26, '#0b1420');
    M.asphalt(g, 0, GY, W, VH - GY, 12021, { hi: '#454a44', mid: '#343833', dk: '#232622' });
    rect(g, 0, GY, W, 1, '#0d100e');

    // a fachada, igual a do flashback do Capitulo 3 — e de proposito
    M.brickWall(g, CASA, GY - 150, 340, 150, 12041, { hi: '#7a5f46', mid: '#5a4534', dk: '#3a2c21' });
    rect(g, CASA - 8, GY - 156, 356, 8, '#4a3a2c');
    rect(g, CASA - 8, GY - 158, 356, 3, '#63503c');
    for (const wx of [CASA + 26, CASA + 250]) {
      const wy = GY - 128;
      rect(g, wx, wy, 44, 38, '#22303c');
      rect(g, wx + 3, wy + 3, 38, 32, '#ffd9a0');
      rect(g, wx + 20, wy + 3, 2, 32, '#c9a870');
      rect(g, wx + 3, wy + 18, 38, 2, '#c9a870');
      lCasa.push({ x: wx + 22, y: wy + 18, r: 132, color: '#ffcf90', i: 0.7, falloff: 1.0 });
    }

    // A PORTA DA FRENTE, trancada. Ele mexe na macaneta e ela nao vai.
    rect(g, PORTA - 4, GY - 80, 42, 80, '#33261a');
    rect(g, PORTA, GY - 76, 34, 76, '#43331f');
    rect(g, PORTA + 26, GY - 44, 3, 3, '#c8b070');
    lCasa.push({ x: PORTA + 17, y: GY - 40, r: 108, color: '#ffcf90', i: 0.5, falloff: 1.1 });
    iCasa.push({
      x: PORTA - 4, y: GY - 80, w: 42, h: 80, prompt: 'prompt_open',
      action: 'ch4_porta_trancada', range: 32, id: 'porta_frente', prio: 1, so: 'casa',
    });
    // ⚠ E DEPOIS QUE ELE JA ENTROU UMA VEZ, ELA ABRE.
    //
    // Isto nao e conveniencia, e o conserto de um SOFTLOCK que o teste de
    // regressao pegou: sem esta porta, o setor da rua nao tinha saida
    // nenhuma no estado "casa". Quem gastasse o ultimo cigarro na calcada
    // ficava do lado de fora para sempre, com o capitulo por terminar.
    //
    // A ficcao ja dava a resposta: a porta da frente abre POR DENTRO sem
    // chave — e o roteiro conta com isso no fim do capitulo. Se ele abriu
    // por dentro uma vez, ela esta aberta. Quem liga e `updateCh4`.
    iCasa.push({
      x: PORTA - 4, y: GY - 80, w: 42, h: 80, prompt: 'prompt_open',
      action: 'goto', to: 'ch4_sala', tox: 70, tofacing: 1, range: 32,
      isDoor: true, prio: 2, id: 'porta_aberta', so: 'casa', disabled: true,
    });

    // a varanda: o banco e o cinzeiro. E o lugar dele.
    rect(g, VAR, GY - 8, 110, 8, '#4a3a2c');
    rect(g, VAR, GY - 10, 110, 2, '#63503c');
    rect(g, VAR + 6, GY - 42, 3, 34, '#3a2c21');
    rect(g, VAR + 96, GY - 42, 3, 34, '#3a2c21');
    rect(g, VAR + 6, GY - 44, 96, 3, '#4a3a2c');
    rect(g, VAR + 30, GY - 24, 40, 5, '#54402a');
    rect(g, VAR + 33, GY - 19, 4, 19, '#3a2c1d');
    rect(g, VAR + 63, GY - 19, 4, 19, '#3a2c1d');
    iCasa.push({
      x: VAR + 26, y: GY - 30, w: 50, h: 30, prompt: 'prompt_look',
      lines: 'c4_varanda_casa', range: 26, so: 'casa',
    });

    // a garagem dos fundos, fechada e inteira
    rect(g, FUNDOS, GY - 96, 150, 96, '#4e3d2e');
    M.woodPanel(g, FUNDOS + 8, GY - 84, 134, 84, 12051, { hi: '#6a5236', mid: '#4a3826', dk: '#2e2318' });
    rect(g, FUNDOS + 8, GY - 86, 134, 3, '#7a6042');
    iCasa.push({
      x: FUNDOS, y: GY - 96, w: 150, h: 96, prompt: 'prompt_look',
      lines: 'c4_fundos_casa', range: 30, so: 'casa',
    });

    for (let x = 200; x < W; x += 380) {
      M.streetLampPost(g, x, GY, 92);
      lCasa.push({ x, y: GY - 92, r: 186, color: '#e0c088', i: 0.6, falloff: 1.0 });
      lCasa.push({ x, y: GY - 92, r: 24, color: '#fff0c8', i: 0.58 });
    }
    preencher(lCasa, W, '#9a8a68', 0.2);
  }

  // ============================== A RUINA ==============================
  const mRuina = makeBuffer(W, VH);
  const iRuina = [];
  const lRuina = [];
  {
    const g = mRuina.x;
    rect(g, 0, 0, W, VH, '#070b10');
    M.brickWall(g, 0, 26, W, GY - 26, 12011, { hi: '#3a2f26', mid: '#2a231c', dk: '#171310' });
    rect(g, 0, 0, W, 26, '#04070b');
    M.asphalt(g, 0, GY, W, VH - GY, 12021, { hi: '#2a2d2a', mid: '#1e211e', dk: '#141614' });
    rect(g, 0, GY, W, 1, '#070907');
    mato(g, 0, GY, CASA - 20, 12061, 9);

    // A FACHADA CAIDA. A parede da frente nao existe mais: o vao e a entrada,
    // e e a unica que existe no capitulo inteiro.
    paredeDescascada(g, CASA, GY - 150, 340, 150, 12071);
    telhadoAberto(g, CASA - 8, GY - 150, 356, 12081);
    janelaQuebrada(g, CASA + 26, GY - 128, 44, 38, 12091);
    janelaQuebrada(g, CASA + 250, GY - 128, 44, 38, 12095);
    // o vao: onde estava a parede, agora ha escombro e passagem
    const VAO = PORTA - 30;
    rect(g, VAO, GY - 96, 96, 96, '#05070a');
    M.wallHole(g, VAO, GY - 96, 96, 96, 12101);
    M.debris(g, VAO + 4, GY, 88, 12111);
    mato(g, VAO + 10, GY, 76, 12121, 12);
    iRuina.push({
      x: VAO, y: GY - 96, w: 96, h: 96, prompt: 'prompt_enter',
      action: 'goto', to: 'ch4_sala', tox: 70, tofacing: 1, range: 34,
      isDoor: true, prio: 1, id: 'vao_frente', so: 'ruina',
    });

    // a varanda: o assoalho cedeu no meio, o banco virou carvao. E a SOLEIRA
    // continua ali — e e nela que esta o sapato.
    madeiraQueimada(g, VAR, GY - 8, 110, 8, 12131);
    rect(g, VAR + 40, GY - 8, 26, 8, '#05070a');
    madeiraQueimada(g, VAR + 30, GY - 22, 40, 4, 12141);
    rect(g, VAR + 6, GY - 40, 3, 32, '#160f0b');
    iRuina.push({
      x: VAR + 26, y: GY - 30, w: 50, h: 30, prompt: 'prompt_look',
      lines: 'c4_varanda_ruina', range: 26, so: 'ruina',
    });
    // O HOMEM DE SOBRETUDO senta no degrau da varanda. Ele so existe se ele
    // chegar aqui com o ULTIMO cigarro aceso — quem liga e desliga isto e
    // `updateCh4`, entao aqui o gancho ja nasce desligado.
    iRuina.push({
      x: VAR + 10, y: GY - 60, w: 40, h: 60, prompt: 'prompt_talk',
      action: 'ch4_homem', range: 30, id: 'homem', prio: 3, disabled: true,
    });

    // ★ O SAPATO. Na soleira, fora do alcance que o fogo teve.
    const SAP = PORTA + 46;
    rect(g, SAP, GY - 7, 11, 7, '#3a2a20');
    rect(g, SAP + 1, GY - 8, 8, 2, '#4e392b');
    rect(g, SAP + 7, GY - 5, 4, 5, '#2a1e17');
    iRuina.push({
      x: SAP - 6, y: GY - 22, w: 24, h: 22, prompt: 'prompt_look',
      action: 'ch4_sapato', range: 24, id: 'sapato', prio: 2, so: 'ruina',
    });

    // ---- OS FUNDOS: o que sobrou da garagem, e o que mora nela ----
    paredeDescascada(g, FUNDOS, GY - 96, 150, 96, 12151);
    telhadoAberto(g, FUNDOS, GY - 96, 150, 12161);
    M.debris(g, FUNDOS + 6, GY, 60, 12171);
    // o colchao no chao, com cobertor
    rect(g, FUNDOS + 74, GY - 9, 56, 9, '#3a3038');
    rect(g, FUNDOS + 74, GY - 10, 56, 2, '#4a3f48');
    rect(g, FUNDOS + 88, GY - 13, 34, 5, '#2e3a34');
    // a lata com cinzas
    rect(g, FUNDOS + 44, GY - 16, 18, 16, '#26221e');
    rect(g, FUNDOS + 45, GY - 17, 16, 2, '#39332c');
    rect(g, FUNDOS + 47, GY - 14, 12, 4, '#5a5048');
    // os macos vazios, amassados
    for (const mx of [FUNDOS + 66, FUNDOS + 70, FUNDOS + 78, FUNDOS + 136]) {
      rect(g, mx, GY - 5, 5, 5, '#6a2620');
      rect(g, mx, GY - 5, 5, 1, '#8d3128');
    }
    // ★ o bolo de cartazes, amarrado com barbante
    rect(g, FUNDOS + 106, GY - 20, 26, 20, '#b8b0a0');
    rect(g, FUNDOS + 106, GY - 20, 26, 1, '#d0c8b6');
    rect(g, FUNDOS + 106, GY - 13, 26, 1, '#5a5248');
    rect(g, FUNDOS + 117, GY - 20, 2, 20, '#4a4238');
    lRuina.push({ x: FUNDOS + 100, y: GY - 40, r: 74, color: '#5a6a80', i: 0.2, falloff: 1.3 });
    iRuina.push({
      x: FUNDOS + 40, y: GY - 30, w: 100, h: 30, prompt: 'prompt_look',
      action: 'ch4_fundos', range: 34, id: 'fundos', prio: 2, so: 'ruina',
    });

    // os postes: um so ainda acende, e pisca
    // Um unico poste ainda acende nesta rua, e ele pisca.
    for (let x = 200; x < W; x += 380) {
      M.streetLampPost(g, x, GY, 92);
      if (x === 580) {
        lRuina.push({ x, y: GY - 92, r: 172, color: '#c8b088', i: 0.5, falloff: 1.05, flick: 'bulb' });
      }
    }
    luzDoCeu(lRuina, W, 1.0);
  }

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.15) + 8, VH);
  {
    const f = fore.x;
    rect(f, 0, 0, f.canvas.width, 10, '#050708');
    rect(f, 0, VH - 8, f.canvas.width, 8, '#050708');
    for (const cx of [90, 800]) { rect(f, cx, 0, 12, VH, '#0a0e0c'); rect(f, cx, 0, 2, VH, '#161d18'); }
  }

  const lvl = new Level({
    key: 'ch4_rua',
    nameKey: 'loc_ch4_rua',
    width: W, groundY: GY,
    ambient: '#3a4658',
    layers: [{ c: back.c, par: 0.4 }, { c: mCasa.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.15 }],
    lightDefs: lCasa,
    interactables: iCasa.concat(iRuina),
    weather: 'none',
    reflect: 0.08,
    minX: 26, maxX: W - 44,
    spawn: { x: 60, facing: 1 },
    bloom: 0.5,
    indoor: false,
    material: 'concrete',
    ambience: [{ n: 'wind', g: 0.03 }, { n: 'roomtone', g: 0.04 }],
    randomSfx: [],
    maxInimigos: 0,
    enterBarks: ['b4_rua_1', 'b4_rua_2', 'b4_rua_3', 'b4_rua_4'],
  });
  lvl.ch4 = {
    casa: {
      layers: [{ c: back.c, par: 0.4 }, { c: mCasa.c, par: 1 }],
      lightDefs: lCasa, ambient: '#3a4658', bloom: 0.5, material: 'concrete',
      ambience: [{ n: 'wind', g: 0.03 }, { n: 'roomtone', g: 0.04 }],
      minX: 26, maxX: W - 44, paredes: [],
    },
    ruina: {
      layers: [{ c: back.c, par: 0.4 }, { c: mRuina.c, par: 1 }],
      lightDefs: lRuina, ambient: '#2c3a4c', bloom: 0.4, material: 'concrete',
      ambience: [{ n: 'wind', g: 0.05 }, { n: 'roomtone', g: 0.03 }],
      minX: 26, maxX: W - 44, paredes: [],
    },
  };
  lvl.props.varandaX = VAR + 55;
  lvl.props.portaX = PORTA + 17;
  return lvl;
}

// ---------------------------------------------------------------------------
// 2 — A SALA   (cena 2 do roteiro)
// ---------------------------------------------------------------------------
// A sala do flashback do Capitulo 3, sete anos depois. E o setor onde o
// jogador aprende que os dois estados servem para coisas diferentes: a
// Julie atravessa o fundo na casa intacta, e nao ha NADA para pegar ali.
//
// ⚠ O TELEFONE DA MESINHA e onde o capitulo termina. Ele fica mudo o
// capitulo inteiro ate la.

export function buildSalaCh4() {
  const W = 820;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.5) + 8, VH);
  {
    const b = back.x;
    rect(b, 0, 0, b.canvas.width, VH, '#241a12');
    ditherV(b, 0, 30, b.canvas.width, 130, '#3a2a1c', '#241a12', 6);
  }
  const backR = makeBuffer(Math.ceil(VW + (W - VW) * 0.5) + 8, VH);
  {
    const b = backR.x;
    rect(b, 0, 0, b.canvas.width, VH, '#0a0f14');
    ditherV(b, 0, 30, b.canvas.width, 130, '#141c26', '#0a0f14', 6);
  }

  const TV = 210, SOFA = 290, ABJ = 460, MESA = 620, TEL = 168, COZ = 762;

  // =========================== A CASA (intacta) ===========================
  const mCasa = makeBuffer(W, VH);
  const iCasa = [];
  const lCasa = [];
  {
    const g = mCasa.x;
    rect(g, 0, 0, W, VH, '#4a3524');
    ditherV(g, 0, 20, W, GY - 60, '#7a5c3c', '#54402a', 6);
    grainRect(g, 0, 20, W, GY - 60, ['#8a6a44', '#4a3524', '#63492e'], 0.05, 12201);
    for (let x = 0; x < W; x += 12) rect(g, x, 20, 2, GY - 78, '#63492e');
    M.woodPanel(g, 0, GY - 44, W, 44, 12211, { hi: '#6f5436', mid: '#54402a', dk: '#33261a' });
    rect(g, 0, GY - 46, W, 3, '#7d6142');
    rect(g, 0, 0, W, 20, '#2a1e14');
    M.woodPanel(g, 0, GY, W, VH - GY, 12221, { hi: '#7a5c3c', mid: '#5a422a', dk: '#3a2a1c' });
    rect(g, 0, GY, W, 1, '#221812');

    // ---- a porta da frente, por dentro. Abre sem chave, e o jogo deixa. ----
    const ex0 = M.doorFrame(g, 34, GY, 12231);
    iCasa.push({
      x: ex0.x, y: ex0.y, w: ex0.w, h: ex0.h, prompt: 'prompt_open',
      action: 'goto', to: 'ch4_rua', tox: 680, tofacing: 1, range: 30,
      isDoor: true, prio: 1, so: 'casa',
    });

    // ---- O TELEFONE DA MESINHA ----
    rect(g, TEL, GY - 26, 30, 5, '#6f5436');
    rect(g, TEL + 3, GY - 21, 4, 21, '#4a3524');
    rect(g, TEL + 23, GY - 21, 4, 21, '#4a3524');
    M.wallPhone(g, TEL + 6, GY - 42, 12241);
    iCasa.push({
      x: TEL, y: GY - 44, w: 30, h: 44, prompt: 'prompt_look',
      lines: 'c4_tel_casa', range: 26, id: 'telefone_casa', so: 'casa',
    });

    // ---- o radio na estante. Ele TOCA — ate a quarta tragada. ----
    rect(g, TV, GY - 46, 46, 40, '#3a3128');
    rect(g, TV + 4, GY - 42, 38, 16, '#2a231c');
    rect(g, TV + 7, GY - 39, 14, 10, '#6a5a3c');
    for (let i = 0; i < 5; i++) rect(g, TV + 24, GY - 38 + i * 3, 14, 1, '#4a4034');
    rect(g, TV + 8, GY - 6, 6, 6, '#2a231c');
    rect(g, TV + 32, GY - 6, 6, 6, '#2a231c');
    lCasa.push({ x: TV + 23, y: GY - 34, r: 76, color: '#e8b46a', i: 0.26, falloff: 1.2 });
    iCasa.push({
      x: TV, y: GY - 46, w: 46, h: 46, prompt: 'prompt_look',
      action: 'ch4_radio', range: 26, id: 'radio', so: 'casa',
    });

    // ---- o sofa ----
    rect(g, SOFA, GY - 30, 96, 24, '#5c4a58');
    rect(g, SOFA, GY - 30, 96, 2, '#756070');
    rect(g, SOFA - 6, GY - 40, 10, 34, '#4e3e4a');
    rect(g, SOFA + 92, GY - 40, 10, 34, '#4e3e4a');
    rect(g, SOFA + 4, GY - 40, 84, 12, '#6b5666');
    iCasa.push({
      x: SOFA, y: GY - 42, w: 96, h: 42, prompt: 'prompt_look',
      lines: 'c4_sofa_casa', range: 28, so: 'casa',
    });

    // ---- o abajur: a luz mais quente do jogo ----
    rect(g, ABJ, GY - 40, 4, 40, '#4a3524');
    rect(g, ABJ - 10, GY - 54, 24, 14, '#c9a06a');
    rect(g, ABJ - 8, GY - 52, 20, 10, '#ffdca8');
    lCasa.push({ x: ABJ + 2, y: GY - 48, r: 168, color: '#ffcf90', i: 0.82, falloff: 0.9 });
    lCasa.push({ x: ABJ + 2, y: GY - 48, r: 26, color: '#fff2d8', i: 0.68 });

    // ---- O RETRATO. Nos tres. E ele esta rindo nessa foto. ----
    rect(g, 380, GY - 118, 34, 28, '#3a2a1c');
    rect(g, 383, GY - 115, 28, 22, '#8a7d6b');
    rect(g, 387, GY - 111, 6, 8, '#a89a86');
    rect(g, 395, GY - 111, 6, 8, '#a89a86');
    // ⚠ REGRA DO NOME: o rosto da menina nao e legivel. Nem aqui, nem na
    // ruina, nem no cartaz. Ela e tres pixels e uma mancha, de proposito.
    rect(g, 403, GY - 109, 5, 6, '#a89a86');
    iCasa.push({
      x: 380, y: GY - 118, w: 34, h: 28, prompt: 'prompt_look',
      lines: 'c4_retrato_casa', range: 26, id: 'retrato', so: 'casa',
    });

    // ---- a mesa posta ----
    rect(g, MESA, GY - 34, 110, 6, '#6f5436');
    rect(g, MESA, GY - 34, 110, 1, '#8a6844');
    rect(g, MESA + 6, GY - 28, 6, 28, '#4a3524');
    rect(g, MESA + 98, GY - 28, 6, 28, '#4a3524');
    for (const px of [MESA + 16, MESA + 48, MESA + 80]) {
      rect(g, px, GY - 38, 18, 4, '#c9c1a8');
      rect(g, px + 2, GY - 37, 14, 2, '#a89f88');
    }

    // ---- A PORTA DA COZINHA: inchou de umidade. Ele empurra e nao vai. ----
    rect(g, COZ - 4, GY - 82, 42, 82, '#3a2a1c');
    rect(g, COZ, GY - 78, 34, 78, '#4e3a24');
    rect(g, COZ + 26, GY - 44, 3, 3, '#c8b070');
    iCasa.push({
      x: COZ - 4, y: GY - 82, w: 42, h: 82, prompt: 'prompt_open',
      action: 'ch4_porta_cozinha', range: 30, id: 'porta_cozinha', prio: 1, so: 'casa',
    });

    for (let x = 160; x < W; x += 300) {
      lCasa.push({ x, y: 40, r: 176, color: '#e8bc80', i: 0.46, falloff: 1.05 });
    }
    preencher(lCasa, W, '#b08a5c', 0.24);
  }

  // ============================== A RUINA ==============================
  const mRuina = makeBuffer(W, VH);
  const iRuina = [];
  const lRuina = [];
  {
    const g = mRuina.x;
    rect(g, 0, 0, W, VH, '#0c0a08');
    paredeDescascada(g, 0, 92, W, GY - 92, 12251);
    telhadoAberto(g, 0, 96, W, 12261);
    madeiraQueimada(g, 0, GY, W, VH - GY, 12271);
    rect(g, 0, GY, W, 1, '#050403');
    mato(g, 0, GY, W, 12281, 13);

    // o vao da frente, do lado de dentro
    rect(g, 30, GY - 96, 70, 96, '#05070a');
    M.wallHole(g, 26, GY - 96, 76, 96, 12291);
    M.debris(g, 30, GY, 66, 12295);
    iRuina.push({
      x: 26, y: GY - 96, w: 76, h: 96, prompt: 'prompt_exit',
      action: 'goto', to: 'ch4_rua', tox: 660, tofacing: 1, range: 32,
      isDoor: true, prio: 1, so: 'ruina',
    });

    // A MESINHA E O TELEFONE, derretidos. O fio nao existe mais.
    madeiraQueimada(g, TEL, GY - 24, 30, 5, 12301);
    rect(g, TEL + 8, GY - 34, 14, 10, '#1e1a18');
    rect(g, TEL + 9, GY - 33, 11, 3, '#2c2724');
    iRuina.push({
      x: TEL, y: GY - 40, w: 30, h: 40, prompt: 'prompt_look',
      lines: 'c4_tel_ruina', range: 26, id: 'telefone_ruina', so: 'ruina',
    });

    // o radio derretido em cima da estante caida
    M.debris(g, TV - 6, GY, 58, 12311);
    rect(g, TV + 10, GY - 9, 22, 9, '#1a1614');
    rect(g, TV + 12, GY - 10, 14, 2, '#282320');
    iRuina.push({
      x: TV, y: GY - 20, w: 46, h: 20, prompt: 'prompt_look',
      action: 'ch4_radio', range: 26, so: 'ruina',
    });

    // o sofa: carcaca de molas
    rect(g, SOFA, GY - 20, 96, 14, '#171310');
    for (let i = 0; i < 9; i++) {
      const sx = SOFA + 6 + i * 10;
      rect(g, sx, GY - 30, 1, 12, '#3a332c');
      rect(g, sx - 1, GY - 31, 3, 1, '#4a4238');
    }
    mato(g, SOFA + 10, GY, 76, 12321, 18);
    iRuina.push({
      x: SOFA, y: GY - 34, w: 96, h: 34, prompt: 'prompt_look',
      lines: 'c4_sofa_ruina', range: 28, so: 'ruina',
    });

    // O RETRATO: o vidro estourou PARA DENTRO. Da para ver as tres formas.
    rect(g, 380, GY - 118, 34, 28, '#181210');
    rect(g, 383, GY - 115, 28, 22, '#241c18');
    for (let i = 0; i < 9; i++) rect(g, 384 + i * 3, GY - 114, 1, 2 + (i % 3) * 4, '#3e4a52');
    rect(g, 388, GY - 106, 5, 5, '#2e2822');
    rect(g, 396, GY - 106, 5, 5, '#2e2822');
    rect(g, 403, GY - 104, 4, 4, '#2e2822');
    iRuina.push({
      x: 380, y: GY - 118, w: 34, h: 28, prompt: 'prompt_look',
      lines: 'c4_retrato_ruina', range: 26, so: 'ruina',
    });

    // a mesa: tombada, e um prato inteiro no meio do carvao
    madeiraQueimada(g, MESA, GY - 26, 110, 5, 12331);
    rect(g, MESA + 40, GY - 5, 16, 4, '#8a8474');
    M.debris(g, MESA - 10, GY, 60, 12341);

    // ---- ONDE ERA A PORTA DA COZINHA: o batente caiu. Passagem. ----
    rect(g, COZ - 10, GY - 100, 60, 100, '#05070a');
    M.wallHole(g, COZ - 12, GY - 100, 64, 100, 12351);
    M.debris(g, COZ - 8, GY, 54, 12355);
    iRuina.push({
      x: COZ - 12, y: GY - 100, w: 64, h: 100, prompt: 'prompt_enter',
      action: 'goto', to: 'ch4_cozinha', tox: 60, tofacing: 1, range: 32,
      isDoor: true, prio: 1, id: 'vao_cozinha', so: 'ruina',
    });

    // uma unica claridade: a lua pelo telhado aberto
    luzDoCeu(lRuina, W, 1.0);
  }

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.2) + 8, VH);
  {
    const f = fore.x;
    rect(f, 0, 0, f.canvas.width, 10, '#0a0705');
    rect(f, 0, VH - 8, f.canvas.width, 8, '#0a0705');
    rect(f, 300, 0, 14, VH, '#120c08');
    rect(f, 300, 0, 2, VH, '#1e150e');
  }

  const lvl = new Level({
    key: 'ch4_sala',
    nameKey: 'loc_ch4_sala',
    width: W, groundY: GY,
    ambient: '#6a5a48',
    layers: [{ c: back.c, par: 0.5 }, { c: mCasa.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.2 }],
    lightDefs: lCasa,
    interactables: iCasa.concat(iRuina),
    weather: 'none',
    reflect: 0.06,
    minX: 26, maxX: W - 44,
    spawn: { x: 70, facing: 1 },
    bloom: 0.6,
    indoor: true,
    material: 'wood',
    ambience: [{ n: 'roomtone', g: 0.08 }],
    randomSfx: [],
    maxInimigos: 0,
    enterBarks: ['b4_sala_1', 'b4_sala_2'],
  });
  lvl.ch4 = {
    casa: {
      layers: [{ c: back.c, par: 0.5 }, { c: mCasa.c, par: 1 }],
      lightDefs: lCasa, ambient: '#6a5a48', bloom: 0.6, material: 'wood',
      ambience: [{ n: 'roomtone', g: 0.08 }],
      minX: 26, maxX: W - 44, paredes: [],
    },
    ruina: {
      layers: [{ c: backR.c, par: 0.5 }, { c: mRuina.c, par: 1 }],
      lightDefs: lRuina, ambient: '#2a3646', bloom: 0.38, material: 'concrete',
      ambience: [{ n: 'wind', g: 0.03 }, { n: 'roomtone', g: 0.04 }],
      minX: 26, maxX: W - 44, paredes: [],
    },
  };
  // Onde a Julie atravessa o fundo da tela, na casa intacta. Ela nao
  // interage, nao olha e nao responde: esta fazendo uma noite comum.
  lvl.props.julie = { x0: 500, x1: 770, y: GY - 4 };
  lvl.props.telefoneX = TEL + 14;
  return lvl;
}

// ---------------------------------------------------------------------------
// 3 — A COZINHA   (cena 3 do roteiro)
// ---------------------------------------------------------------------------
// O que ele veio buscar esta aqui, e ele acha CEDO — no primeiro terco do
// capitulo, de proposito. Nao faca o jogador esperar 40 minutos pelo obvio.
//
// Na casa intacta a gaveta abre e esta cheia, e a mao atravessa tudo.
// Na ruina a gaveta e um buraco no armario caido, e dentro esta A CAIXA.

export function buildCozinhaCh4() {
  const W = 620;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.5) + 8, VH);
  { const b = back.x; rect(b, 0, 0, b.canvas.width, VH, '#2a2118'); }
  const backR = makeBuffer(Math.ceil(VW + (W - VW) * 0.5) + 8, VH);
  { const b = backR.x; rect(b, 0, 0, b.canvas.width, VH, '#090d11'); }

  const PIA = 180, ARM = 330, GAV = 366, CORR = 560;

  // =========================== A CASA (intacta) ===========================
  const mCasa = makeBuffer(W, VH);
  const iCasa = [];
  const lCasa = [];
  {
    const g = mCasa.x;
    rect(g, 0, 0, W, VH, '#3e4a42');
    grainRect(g, 0, 20, W, GY - 40, ['#4e5c52', '#38443c', '#5a6a5e'], 0.05, 12401);
    // azulejo ate a meia altura
    for (let y = GY - 96; y < GY - 40; y += 12) {
      for (let x = 0; x < W; x += 12) {
        rect(g, x, y, 11, 11, (x / 12 + y / 12) % 2 ? '#6a7a6e' : '#5e6e62');
      }
    }
    rect(g, 0, 0, W, 20, '#1e2620');
    M.woodPanel(g, 0, GY, W, VH - GY, 12411, { hi: '#6a5c44', mid: '#4e4432', dk: '#302a20' });
    rect(g, 0, GY, W, 1, '#1e1a14');

    const ex0 = M.doorFrame(g, 30, GY, 12421);
    iCasa.push({
      x: ex0.x, y: ex0.y, w: ex0.w, h: ex0.h, prompt: 'prompt_open',
      action: 'goto', to: 'ch4_sala', tox: 740, tofacing: -1, range: 30,
      isDoor: true, prio: 1, so: 'casa',
    });

    // a pia, com louca lavada e escorrendo
    rect(g, PIA, GY - 40, 90, 40, '#54604e');
    rect(g, PIA, GY - 42, 90, 3, '#6e7a68');
    rect(g, PIA + 12, GY - 38, 40, 8, '#3a443a');
    rect(g, PIA + 62, GY - 52, 4, 12, '#8a9086');
    for (let i = 0; i < 4; i++) rect(g, PIA + 58 + i * 6, GY - 46, 5, 5, '#c9c1a8');
    iCasa.push({
      x: PIA, y: GY - 52, w: 90, h: 52, prompt: 'prompt_look',
      lines: 'c4_pia_casa', range: 28, so: 'casa',
    });

    // O ARMARIO E A GAVETA. Ela abre. E a mao atravessa tudo.
    M.woodPanel(g, ARM, GY - 92, 130, 52, 12431, { hi: '#7a6242', mid: '#5a4832', dk: '#3a2e20' });
    rect(g, ARM, GY - 94, 130, 3, '#8a7048');
    rect(g, GAV, GY - 36, 66, 14, '#5a4832');
    rect(g, GAV, GY - 36, 66, 2, '#7a6242');
    rect(g, GAV + 28, GY - 31, 10, 3, '#c8b070');
    iCasa.push({
      x: GAV - 4, y: GY - 40, w: 74, h: 40, prompt: 'prompt_open',
      action: 'ch4_gaveta_casa', range: 28, id: 'gaveta_casa', prio: 2, so: 'casa',
    });

    // a porta do corredor
    rect(g, CORR - 4, GY - 82, 42, 82, '#3a2a1c');
    rect(g, CORR, GY - 78, 34, 78, '#4e3a24');
    rect(g, CORR + 26, GY - 44, 3, 3, '#c8b070');
    iCasa.push({
      x: CORR - 4, y: GY - 82, w: 42, h: 82, prompt: 'prompt_open',
      action: 'goto', to: 'ch4_corredor', tox: 50, tofacing: 1, range: 30,
      isDoor: true, prio: 1, so: 'casa',
    });

    lCasa.push({ x: 160, y: 44, r: 178, color: '#e8dcb0', i: 0.62, falloff: 1.0 });
    lCasa.push({ x: 440, y: 44, r: 178, color: '#e8dcb0', i: 0.56, falloff: 1.0 });
    preencher(lCasa, W, '#a8a078', 0.24);
  }

  // ============================== A RUINA ==============================
  const mRuina = makeBuffer(W, VH);
  const iRuina = [];
  const lRuina = [];
  {
    const g = mRuina.x;
    rect(g, 0, 0, W, VH, '#0b0c0a');
    paredeDescascada(g, 0, 92, W, GY - 92, 12451);
    telhadoAberto(g, 0, 96, W, 12461);
    // o azulejo aguentou. E a unica coisa desta casa que aguentou.
    for (let y = GY - 96; y < GY - 40; y += 12) {
      for (let x = 0; x < W; x += 12) {
        if ((x * 7 + y * 13) % 11 < 7) {
          rect(g, x, y, 11, 11, (x / 12 + y / 12) % 2 ? '#3a423a' : '#333b34');
        }
      }
    }
    madeiraQueimada(g, 0, GY, W, VH - GY, 12471);
    mato(g, 0, GY, W, 12481, 11);

    rect(g, 26, GY - 96, 60, 96, '#05070a');
    M.wallHole(g, 22, GY - 96, 68, 96, 12491);
    iRuina.push({
      x: 22, y: GY - 96, w: 68, h: 96, prompt: 'prompt_exit',
      action: 'goto', to: 'ch4_sala', tox: 730, tofacing: -1, range: 32,
      isDoor: true, prio: 1, so: 'ruina',
    });

    // a pia arrancada da parede
    rect(g, PIA + 10, GY - 16, 70, 16, '#2a302a');
    rect(g, PIA + 10, GY - 17, 70, 2, '#3a423a');
    M.debris(g, PIA, GY, 50, 12501);
    iRuina.push({
      x: PIA, y: GY - 24, w: 90, h: 24, prompt: 'prompt_look',
      lines: 'c4_pia_ruina', range: 28, so: 'ruina',
    });

    // ★ O ARMARIO CAIDO, E A GAVETA QUE VIROU BURACO. A caixa esta dentro.
    madeiraQueimada(g, ARM - 10, GY - 30, 150, 30, 12511);
    rect(g, GAV, GY - 26, 52, 22, '#05060a');
    rect(g, GAV + 4, GY - 20, 40, 14, '#4a4236');
    rect(g, GAV + 4, GY - 20, 40, 2, '#5e5646');
    rect(g, GAV + 8, GY - 16, 30, 1, '#6a6250');
    lRuina.push({ x: GAV + 26, y: GY - 30, r: 58, color: '#6a7a90', i: 0.2, falloff: 1.3 });
    iRuina.push({
      x: GAV - 6, y: GY - 34, w: 66, h: 34, prompt: 'prompt_take',
      action: 'ch4_caixa', range: 28, id: 'caixa', prio: 2, so: 'ruina',
    });

    // a porta do corredor virou vao
    rect(g, CORR - 6, GY - 96, 54, 96, '#05070a');
    M.wallHole(g, CORR - 8, GY - 96, 58, 96, 12521);
    iRuina.push({
      x: CORR - 8, y: GY - 96, w: 58, h: 96, prompt: 'prompt_enter',
      action: 'goto', to: 'ch4_corredor', tox: 50, tofacing: 1, range: 30,
      isDoor: true, prio: 1, so: 'ruina',
    });

    luzDoCeu(lRuina, W, 1.0);
  }

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.2) + 8, VH);
  {
    const f = fore.x;
    rect(f, 0, 0, f.canvas.width, 10, '#0a0705');
    rect(f, 0, VH - 8, f.canvas.width, 8, '#0a0705');
  }

  const lvl = new Level({
    key: 'ch4_cozinha',
    nameKey: 'loc_ch4_cozinha',
    width: W, groundY: GY,
    ambient: '#5e6a58',
    layers: [{ c: back.c, par: 0.5 }, { c: mCasa.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.2 }],
    lightDefs: lCasa,
    interactables: iCasa.concat(iRuina),
    weather: 'none',
    reflect: 0.05,
    minX: 26, maxX: W - 40,
    spawn: { x: 60, facing: 1 },
    bloom: 0.5,
    indoor: true,
    material: 'wood',
    ambience: [{ n: 'roomtone', g: 0.07 }],
    randomSfx: [],
    maxInimigos: 0,
    enterBarks: ['b4_coz_1'],
  });
  lvl.ch4 = {
    casa: {
      layers: [{ c: back.c, par: 0.5 }, { c: mCasa.c, par: 1 }],
      lightDefs: lCasa, ambient: '#5e6a58', bloom: 0.5, material: 'wood',
      ambience: [{ n: 'roomtone', g: 0.07 }],
      minX: 26, maxX: W - 40, paredes: [],
    },
    ruina: {
      layers: [{ c: backR.c, par: 0.5 }, { c: mRuina.c, par: 1 }],
      lightDefs: lRuina, ambient: '#293444', bloom: 0.36, material: 'concrete',
      ambience: [{ n: 'wind', g: 0.025 }, { n: 'roomtone', g: 0.04 }],
      minX: 26, maxX: W - 40, paredes: [],
    },
  };
  return lvl;
}

// ---------------------------------------------------------------------------
// 4 — O CORREDOR   (cena 4 do roteiro)
// ---------------------------------------------------------------------------
// ⚠ ESTE SETOR E O INVERSO DE TODOS OS OUTROS, e e a razao de ele existir.
//
// Na ruina o assoalho cedeu: um vao de dois metros com terra e ferro no
// fundo. Nao da para pular e nao da para descer. Na casa intacta o corredor
// e um corredor. Com tapete.
//
// Entao ele tem que JOGAR O CIGARRO FORA DE PROPOSITO, no escuro, sabendo
// que a unica coisa que ele controla naquela casa vai acabar. E e aqui que a
// figura aparece pela primeira vez.

export function buildCorredorCh4() {
  const W = 520;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.5) + 8, VH);
  { const b = back.x; rect(b, 0, 0, b.canvas.width, VH, '#221a12'); }
  const backR = makeBuffer(Math.ceil(VW + (W - VW) * 0.5) + 8, VH);
  { const b = backR.x; rect(b, 0, 0, b.canvas.width, VH, '#080b0f'); }

  // O BURACO. As duas bordas sao as paredes da ruina.
  const BUR0 = 210, BUR1 = 330;

  const mCasa = makeBuffer(W, VH);
  const iCasa = [];
  const lCasa = [];
  {
    const g = mCasa.x;
    rect(g, 0, 0, W, VH, '#4a3524');
    ditherV(g, 0, 20, W, GY - 60, '#6e5236', '#4a3524', 6);
    for (let x = 0; x < W; x += 12) rect(g, x, 20, 2, GY - 78, '#5a422a');
    M.woodPanel(g, 0, GY - 44, W, 44, 12611, { hi: '#6f5436', mid: '#54402a', dk: '#33261a' });
    rect(g, 0, GY - 46, W, 3, '#7d6142');
    rect(g, 0, 0, W, 20, '#241a12');
    M.woodPanel(g, 0, GY, W, VH - GY, 12621, { hi: '#7a5c3c', mid: '#5a422a', dk: '#3a2a1c' });
    // ---- O TAPETE. E ele que existe aqui e nao existe na ruina. ----
    rect(g, BUR0 - 30, GY, BUR1 - BUR0 + 60, 14, '#6a3a34');
    rect(g, BUR0 - 30, GY, BUR1 - BUR0 + 60, 2, '#8a4e44');
    for (let x = BUR0 - 26; x < BUR1 + 26; x += 10) rect(g, x, GY + 4, 5, 5, '#4e2a26');
    rect(g, 0, GY, W, 1, '#221812');

    const ex0 = M.doorFrame(g, 26, GY, 12631);
    iCasa.push({
      x: ex0.x, y: ex0.y, w: ex0.w, h: ex0.h, prompt: 'prompt_open',
      action: 'goto', to: 'ch4_cozinha', tox: 540, tofacing: -1, range: 30,
      isDoor: true, prio: 1, so: 'casa',
    });

    // ---- a porta do quarto dela, no fim do corredor ----
    const QRT = 450;
    rect(g, QRT - 4, GY - 82, 42, 82, '#3a2a1c');
    rect(g, QRT, GY - 78, 34, 78, '#4e3a24');
    rect(g, QRT + 26, GY - 44, 3, 3, '#c8b070');
    rect(g, QRT, GY - 3, 34, 3, '#ffd9a0');
    lCasa.push({ x: QRT + 17, y: GY - 2, r: 54, color: '#ffcf90', i: 0.4, falloff: 1.2 });
    iCasa.push({
      x: QRT - 4, y: GY - 82, w: 42, h: 82, prompt: 'prompt_open',
      action: 'goto', to: 'ch4_quarto', tox: 60, tofacing: 1, range: 30,
      isDoor: true, prio: 1, so: 'casa',
    });

    lCasa.push({ x: 120, y: 42, r: 150, color: '#e8bc80', i: 0.44, falloff: 1.1 });
    lCasa.push({ x: 360, y: 42, r: 150, color: '#e8bc80', i: 0.4, falloff: 1.1 });
    preencher(lCasa, W, '#a8875c', 0.22);
  }

  const mRuina = makeBuffer(W, VH);
  const iRuina = [];
  const lRuina = [];
  {
    const g = mRuina.x;
    rect(g, 0, 0, W, VH, '#0a0a0c');
    paredeDescascada(g, 0, 104, W, GY - 104, 12651);
    telhadoAberto(g, 0, 108, W, 12661);
    madeiraQueimada(g, 0, GY, W, VH - GY, 12671);

    // ---- O BURACO: terra e ferro no fundo, e as duas bordas mordidas ----
    rect(g, BUR0, GY, BUR1 - BUR0, VH - GY, '#050506');
    ditherV(g, BUR0, GY, BUR1 - BUR0, 26, '#0e0d0c', '#050506', 5);
    for (let i = 0; i < 9; i++) {
      const bx = BUR0 + 8 + i * 13;
      rect(g, bx, GY + 12 + (i % 3) * 5, 2, 12 + (i % 4) * 6, '#221d18');
    }
    // as tabuas partidas nas duas beiradas
    for (let i = 0; i < 6; i++) {
      rect(g, BUR0 - 6 + i * 2, GY, 2, 3 + i * 2, '#160f0b');
      rect(g, BUR1 + 4 - i * 2, GY, 2, 3 + i * 2, '#160f0b');
    }
    mato(g, 0, GY, BUR0 - 10, 12681, 8);
    mato(g, BUR1 + 10, GY, W - BUR1 - 10, 12685, 8);

    rect(g, 22, GY - 96, 60, 96, '#05070a');
    M.wallHole(g, 18, GY - 96, 68, 96, 12691);
    iRuina.push({
      x: 18, y: GY - 96, w: 68, h: 96, prompt: 'prompt_exit',
      action: 'goto', to: 'ch4_cozinha', tox: 540, tofacing: -1, range: 30,
      isDoor: true, prio: 1, so: 'ruina',
    });

    // a porta do quarto: caida, e o vao continua ali
    const QRT = 450;
    rect(g, QRT - 6, GY - 92, 50, 92, '#05070a');
    M.wallHole(g, QRT - 8, GY - 92, 54, 92, 12695);
    iRuina.push({
      x: QRT - 8, y: GY - 92, w: 54, h: 92, prompt: 'prompt_enter',
      action: 'goto', to: 'ch4_quarto', tox: 60, tofacing: 1, range: 30,
      isDoor: true, prio: 1, so: 'ruina',
    });
    iRuina.push({
      x: BUR0, y: GY - 30, w: BUR1 - BUR0, h: 40, prompt: 'prompt_look',
      lines: 'c4_buraco', range: 40, so: 'ruina',
    });

    // O corredor e o mais escuro dos cinco, e de proposito: e o setor da
    // figura. Escuro, nao invisivel — o buraco tem que se ver.
    luzDoCeu(lRuina, W, 0.82);
  }

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.2) + 8, VH);
  {
    const f = fore.x;
    rect(f, 0, 0, f.canvas.width, 10, '#0a0705');
    rect(f, 0, VH - 8, f.canvas.width, 8, '#0a0705');
  }

  const lvl = new Level({
    key: 'ch4_corredor',
    nameKey: 'loc_ch4_corredor',
    width: W, groundY: GY,
    ambient: '#6a5a48',
    layers: [{ c: back.c, par: 0.5 }, { c: mCasa.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.2 }],
    lightDefs: lCasa,
    interactables: iCasa.concat(iRuina),
    weather: 'none',
    reflect: 0.05,
    minX: 26, maxX: W - 40,
    spawn: { x: 50, facing: 1 },
    bloom: 0.5,
    indoor: true,
    material: 'wood',
    ambience: [{ n: 'roomtone', g: 0.07 }],
    randomSfx: [],
    maxInimigos: 0,
    enterBarks: ['b4_corr_1'],
  });
  lvl.ch4 = {
    casa: {
      layers: [{ c: back.c, par: 0.5 }, { c: mCasa.c, par: 1 }],
      lightDefs: lCasa, ambient: '#6a5a48', bloom: 0.5, material: 'wood',
      ambience: [{ n: 'roomtone', g: 0.07 }],
      minX: 26, maxX: W - 40, paredes: [],
    },
    ruina: {
      // ⚠ AQUI ESTA O PUZZLE INTEIRO DO SETOR, e sao dois numeros.
      layers: [{ c: backR.c, par: 0.5 }, { c: mRuina.c, par: 1 }],
      lightDefs: lRuina, ambient: '#26313f', bloom: 0.34, material: 'concrete',
      ambience: [{ n: 'wind', g: 0.03 }, { n: 'roomtone', g: 0.03 }],
      minX: 26, maxX: W - 40, paredes: [{ x0: BUR0 - 4, x1: BUR1 + 4 }],
    },
  };
  lvl.props.buraco = { x0: BUR0, x1: BUR1 };
  // Onde a figura para, na primeira vez: no fim do corredor arruinado.
  lvl.props.figuraX = 470;
  return lvl;
}

// ---------------------------------------------------------------------------
// 5 — O QUARTO DELA   (cena 5 do roteiro)
// ---------------------------------------------------------------------------
// ⚠ A DIFERENCA MAIS CRUEL DO JOGO, E ELA E DE GRACA: no Capitulo 3 a menina
// estava sentada no chao desenhando. Aqui o quarto e IDENTICO e vazio. Mesmo
// na versao boa da casa, ela nao volta.
//
// ★ E na ruina, a porta do armario esta caida no chao com a face de dentro
// para cima. MARCAS DE UNHA. POR DENTRO.

export function buildQuartoCh4() {
  const W = 560;

  const back = makeBuffer(Math.ceil(VW + (W - VW) * 0.5) + 8, VH);
  { const b = back.x; rect(b, 0, 0, b.canvas.width, VH, '#2a2036'); }
  const backR = makeBuffer(Math.ceil(VW + (W - VW) * 0.5) + 8, VH);
  { const b = backR.x; rect(b, 0, 0, b.canvas.width, VH, '#0a0a10'); }

  const CAMA = 150, ARM = 380, DES = 280;

  const mCasa = makeBuffer(W, VH);
  const iCasa = [];
  const lCasa = [];
  {
    const g = mCasa.x;
    rect(g, 0, 0, W, VH, '#5a4a62');
    ditherV(g, 0, 20, W, GY - 60, '#7a6482', '#5a4a62', 6);
    for (let x = 0; x < W; x += 16) rect(g, x, 20, 3, GY - 78, '#6a5672');
    M.woodPanel(g, 0, GY - 40, W, 40, 12711, { hi: '#6f5436', mid: '#54402a', dk: '#33261a' });
    rect(g, 0, 0, W, 20, '#2a2036');
    M.woodPanel(g, 0, GY, W, VH - GY, 12721, { hi: '#7a5c3c', mid: '#5a422a', dk: '#3a2a1c' });
    rect(g, 0, GY, W, 1, '#221812');

    const ex0 = M.doorFrame(g, 26, GY, 12731);
    iCasa.push({
      x: ex0.x, y: ex0.y, w: ex0.w, h: ex0.h, prompt: 'prompt_open',
      action: 'goto', to: 'ch4_corredor', tox: 470, tofacing: -1, range: 30,
      isDoor: true, prio: 1, so: 'casa',
    });

    // ---- A CAMA. Feita. Ela arrumava sozinha. ----
    rect(g, CAMA, GY - 26, 92, 20, '#4e3a2a');
    rect(g, CAMA, GY - 32, 92, 8, '#8a94a8');
    rect(g, CAMA, GY - 33, 92, 2, '#a2acc0');
    rect(g, CAMA + 4, GY - 38, 26, 7, '#c4ccdc');
    rect(g, CAMA - 4, GY - 44, 8, 38, '#3e2e20');
    rect(g, CAMA + 88, GY - 40, 8, 34, '#3e2e20');
    iCasa.push({
      x: CAMA, y: GY - 44, w: 92, h: 44, prompt: 'prompt_look',
      lines: 'c4_cama_casa', range: 28, so: 'casa',
    });

    // ---- OS DESENHOS NO CHAO. Uma casa, um sol, tres bonecos. ----
    rect(g, DES, GY - 4, 30, 4, '#d8d0bc');
    rect(g, DES + 6, GY - 3, 8, 2, '#8a6a3c');
    rect(g, DES + 20, GY - 3, 4, 2, '#c8a030');
    rect(g, DES + 34, GY - 4, 26, 4, '#d8d0bc');
    for (let i = 0; i < 3; i++) rect(g, DES + 38 + i * 6, GY - 3, 2, 2, '#5a6a8a');
    // o giz de cera, espalhado
    for (const c of [['#8d3128', 0], ['#3a6a4a', 7], ['#c8a030', 13]]) {
      rect(g, DES + 66 + c[1], GY - 2, 4, 2, c[0]);
    }
    iCasa.push({
      x: DES - 6, y: GY - 16, w: 100, h: 16, prompt: 'prompt_look',
      action: 'ch4_desenhos', range: 30, id: 'desenhos', prio: 2, so: 'casa',
    });

    // ---- o armario, fechado, com roupa dentro. Nada. ----
    M.woodPanel(g, ARM, GY - 96, 74, 96, 12741, { hi: '#7a6242', mid: '#5a4832', dk: '#3a2e20' });
    rect(g, ARM, GY - 98, 74, 3, '#8a7048');
    rect(g, ARM + 36, GY - 96, 2, 96, '#3a2e20');
    rect(g, ARM + 30, GY - 52, 4, 3, '#c8b070');
    rect(g, ARM + 40, GY - 52, 4, 3, '#c8b070');
    iCasa.push({
      x: ARM, y: GY - 96, w: 74, h: 96, prompt: 'prompt_open',
      action: 'ch4_armario_casa', range: 28, id: 'armario_casa', prio: 2, so: 'casa',
    });

    // o abajur dela
    rect(g, 500, GY - 34, 4, 34, '#4a3524');
    rect(g, 492, GY - 46, 20, 12, '#c9a06a');
    lCasa.push({ x: 502, y: GY - 42, r: 148, color: '#ffcf90', i: 0.74, falloff: 0.95 });
    lCasa.push({ x: 240, y: 40, r: 168, color: '#e8bc80', i: 0.44, falloff: 1.05 });
    preencher(lCasa, W, '#a888a0', 0.24);
  }

  const mRuina = makeBuffer(W, VH);
  const iRuina = [];
  const lRuina = [];
  {
    const g = mRuina.x;
    rect(g, 0, 0, W, VH, '#0a0a0c');
    paredeDescascada(g, 0, 92, W, GY - 92, 12751);
    telhadoAberto(g, 0, 96, W, 12761);
    madeiraQueimada(g, 0, GY, W, VH - GY, 12771);
    mato(g, 0, GY, W, 12781, 12);

    rect(g, 22, GY - 92, 56, 92, '#05070a');
    M.wallHole(g, 18, GY - 92, 62, 92, 12791);
    iRuina.push({
      x: 18, y: GY - 92, w: 62, h: 92, prompt: 'prompt_exit',
      action: 'goto', to: 'ch4_corredor', tox: 470, tofacing: -1, range: 30,
      isDoor: true, prio: 1, so: 'ruina',
    });

    // a cama: o estrado, e o colchao que virou pó
    rect(g, CAMA, GY - 18, 92, 12, '#171310');
    for (let i = 0; i < 8; i++) rect(g, CAMA + 4 + i * 11, GY - 22, 8, 4, '#221c16');
    rect(g, CAMA - 4, GY - 36, 8, 30, '#160f0b');
    iRuina.push({
      x: CAMA, y: GY - 36, w: 92, h: 36, prompt: 'prompt_look',
      lines: 'c4_cama_ruina', range: 28, so: 'ruina',
    });

    // ★★★ O ARMARIO. A porta caida, face de dentro para cima.
    madeiraQueimada(g, ARM - 20, GY - 34, 96, 34, 12801);
    // a porta no chao — mais clara que o resto, porque a face de dentro nao
    // pegou fogo: ela estava fechada.
    rect(g, ARM - 6, GY - 12, 84, 12, '#4a3a2a');
    rect(g, ARM - 6, GY - 13, 84, 2, '#5e4a34');
    // AS MARCAS. Quatro grupos de quatro riscos, e eles vao de dentro
    // para fora — quem estava ali dentro puxava a porta.
    for (let gI = 0; gI < 4; gI++) {
      for (let i = 0; i < 4; i++) {
        const mx = ARM + 6 + gI * 18 + i * 3;
        rect(g, mx, GY - 11, 1, 5 + (i % 2) * 3, '#2a1e16');
        rect(g, mx, GY - 11, 1, 2, '#1a1210');
      }
    }
    lRuina.push({ x: ARM + 30, y: GY - 26, r: 70, color: '#6a7a90', i: 0.24, falloff: 1.25 });
    iRuina.push({
      x: ARM - 8, y: GY - 22, w: 88, h: 22, prompt: 'prompt_look',
      action: 'ch4_armario', range: 30, id: 'armario', prio: 2, so: 'ruina',
    });

    // onde estavam os desenhos: chao queimado, e nada
    iRuina.push({
      x: DES - 6, y: GY - 16, w: 100, h: 16, prompt: 'prompt_look',
      lines: 'c4_desenhos_ruina', range: 30, so: 'ruina',
    });

    luzDoCeu(lRuina, W, 1.05);
  }

  const fore = makeBuffer(Math.ceil(VW + (W - VW) * 1.2) + 8, VH);
  {
    const f = fore.x;
    rect(f, 0, 0, f.canvas.width, 10, '#0a0705');
    rect(f, 0, VH - 8, f.canvas.width, 8, '#0a0705');
  }

  const lvl = new Level({
    key: 'ch4_quarto',
    nameKey: 'loc_ch4_quarto',
    width: W, groundY: GY,
    ambient: '#6a5a70',
    layers: [{ c: back.c, par: 0.5 }, { c: mCasa.c, par: 1 }],
    fores: [{ c: fore.c, par: 1.2 }],
    lightDefs: lCasa,
    interactables: iCasa.concat(iRuina),
    weather: 'none',
    reflect: 0.05,
    minX: 26, maxX: W - 40,
    spawn: { x: 60, facing: 1 },
    bloom: 0.55,
    indoor: true,
    material: 'wood',
    ambience: [{ n: 'roomtone', g: 0.06 }],
    randomSfx: [],
    maxInimigos: 0,
    enterBarks: ['b4_qrt_1', 'b4_qrt_2'],
  });
  lvl.ch4 = {
    casa: {
      layers: [{ c: back.c, par: 0.5 }, { c: mCasa.c, par: 1 }],
      lightDefs: lCasa, ambient: '#6a5a70', bloom: 0.55, material: 'wood',
      ambience: [{ n: 'roomtone', g: 0.06 }],
      minX: 26, maxX: W - 40, paredes: [],
    },
    ruina: {
      layers: [{ c: backR.c, par: 0.5 }, { c: mRuina.c, par: 1 }],
      lightDefs: lRuina, ambient: '#26313f', bloom: 0.34, material: 'concrete',
      ambience: [{ n: 'wind', g: 0.028 }, { n: 'roomtone', g: 0.03 }],
      minX: 26, maxX: W - 40, paredes: [],
    },
  };
  return lvl;
}

// ---------------------------------------------------------------------------
// A TROCA
// ---------------------------------------------------------------------------

// Aplica um dos dois estados a um setor do Capitulo 4. Nao recria nada: os
// canvas dos dois estados existem desde o boot, e isto so aponta o setor
// para um deles.
//
// ⚠ AS LUZES PRECISAM SER REARMADAS. `Level` prepara `cur`, `tt` e `k` de
// cada lampada no construtor; um conjunto de luzes que nunca passou por la
// entra com `cur` indefinido, e `addLights` desenha `undefined` — ou seja,
// nada. O setor inteiro fica preto e parece bug de camera.
export function aplicarEstadoCh4(lv, estado) {
  if (!lv || !lv.ch4) return false;
  const e = lv.ch4[estado] || lv.ch4.casa;
  lv.layers = e.layers;
  lv.lightDefs = e.lightDefs;
  lv.ambient = e.ambient;
  lv.bloom = e.bloom;
  lv.material = e.material;
  lv.ambience = e.ambience;
  lv.minX = e.minX;
  lv.maxX = e.maxX;
  lv.paredes = e.paredes || [];
  for (const f of lv.lightDefs) {
    if (f.cur === undefined) { f.cur = f.i; f.tt = 0; f.k = 1; }
  }
  // Interagivel marcado com `so` existe apenas no seu estado. Quem nao tem
  // marca existe nos dois — e nao ha nenhum hoje, mas a regra fica.
  for (const it of lv.interactables) {
    if (it.so) it.disabled = it.so !== estado;
  }
  lv.estadoCh4 = estado;
  return true;
}

// ---------------------------------------------------------------------------

export function buildChapter4() {
  return {
    ch4_rua: buildRuaDaCasa(),
    ch4_sala: buildSalaCh4(),
    ch4_cozinha: buildCozinhaCh4(),
    ch4_corredor: buildCorredorCh4(),
    ch4_quarto: buildQuartoCh4(),
  };
}
