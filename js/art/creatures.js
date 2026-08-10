// creatures.js — as coisas que vazaram da cabeça dele, e as duas pessoas.
//
// REGRA: nenhum deles pode ser um monstro genérico. Cada um tem que ser
// reconhecível como UMA IDEIA, e a ideia tem que ser um trauma que a
// profissão dele produz. Não é um bestiário de terror — é a ficha médica
// de um detetive de vinte e tantos anos de serviço.
//
//   OS SEM-ROSTO ..... as pessoas que ele não conseguiu salvar. Ele não
//                      lembra mais a cara de nenhuma. Roupa de gente comum,
//                      mancha escura no peito onde ele não estancou nada.
//
//   OS EMPILHADOS .... os corpos. Dobrados sobre si mesmos como quem foi
//                      guardado com pressa, lençol de necrotério ainda
//                      preso, etiqueta amarela no pé. Andam de quatro.
//
//   O ECOADOR ........ a ligação que chegou tarde. No lugar do rosto tem
//                      um fone de telefone preto, e ele arrasta o fio.
//                      Não ataca: TOCA.
//
//   O CREDOR ......... a conta. Avental de açougueiro por cima do
//                      sobretudo, cabeça de porco costurada em pano de
//                      saco, e uma motosserra que nunca desliga.
//
// Tudo continua sendo o mesmo esqueleto articulado do detetive — o que
// muda são as PEÇAS. Cada criatura troca cabeça, tronco, braços e pernas
// pelas suas, e herda todas as animações de graça.

import { PAL } from './palette.js';
import { sprite, darken } from './pixel.js';

// Paleta de caracteres própria. Deliberadamente mais clara do que a
// lógica pediria: a cena inteira é multiplicada pela luz, e cor
// "realista" vira preto.
const C = {
  // pele morta, esverdeada
  S: '#a89a86', s: '#8a7d6b', q: '#6b6053', t: '#c2b5a0',
  // lençol de necrotério
  L: '#c9c6bd', l: '#a8a49a', k: '#807d75',
  // roupa de gente comum, encardida
  R: '#6e6a79', r: '#565364', z: '#3d3b48',
  // casaco/paletó escuro
  P: '#4a4650', p: '#38353e', d: '#26242b',
  // sangue seco
  B: '#8d2a22', b: '#5c1a15',
  // baquelite do telefone
  T: '#2a2a30', y: '#43434c', Y: '#5e5e69',
  // metal
  M: '#8f959e', m: '#5c626b', N: '#c8ced6',
  // etiqueta de necrotério
  A: '#c9a83a', a: '#8f7620',
  // avental e pano de saco
  V: '#b9a888', v: '#8f8064', u: '#635840',
  // porco
  G: '#c98d8d', g: '#a86a6a', h: '#7d4a4a',
  // cabelo
  H: '#1c1614', E: '#ddd4c6', e: '#141013',
  // uniforme de zelador / vestido de telefonista
  U: '#4a6a5c', n: '#35503f',
  W: '#8a5a68', w: '#6b4250',
  // cabo e franja do esfregão
  F: '#c9bfa0', f: '#9a9078',

  // ---- Capitulo 3: a delegacia e a casa ----
  // ⚠ As chaves do mapa sao de UM caractere: cada letra da grade e um pixel.
  // farda azul de policia (clara de proposito: a cena e multiplicada pela luz)
  J: '#4a5a78', j: '#36435c', i: '#252f41',
  // camisa social branca encardida, de quem virou a noite
  X: '#b9b8ae', x: '#95948b', c: '#6e6d66',
  // gravata frouxa, vinho
  O: '#7d3830', o: '#5a2722',
  // malha de trico do Betinho, marrom-mostarda
  Q: '#8a6f42', I: '#65502f',
  // macacao de custodia: ocre institucional. Nao e laranja de desenho
  // animado — mas tambem NAO PODE ser o ocre "realista", porque a cena
  // inteira e multiplicada pelo buffer de luz e cor realista vira preto.
  // A primeira versao usava #9a7b46 e chegava na tela como (41,36,28):
  // um marrom sem nome. Aqui ele e pintado claro de proposito. (Regra da
  // paleta, secao 6 do documento mestre.)
  D: '#d9a95c', K: '#a87c3c', '1': '#725228',
  // camiseta por baixo, e a pulseira de papel do plantao
  '8': '#cfc9bc', '9': '#e8e0cc',
  // cabelo raspado rente: nao e careca, e barba de cabeca
  '0': '#3a3128',
  // vestido de casa da Julie, verde-oliva quente
  Z: '#6f7a4a', '2': '#525b36',
  // pijama da Jenna, azul claro
  '3': '#7d93a8', '4': '#5b6c7d',
  // cabelo castanho claro
  '5': '#4a3620', '6': '#31240f',
  // cafe e caneca
  C: '#c9c1a8', '7': '#3a2a1c',
  // ---- a roupa de trabalho do David, sete anos atras ----
  // Todas as 26 letras (nos dois caixas) e todos os digitos ja estavam em
  // uso quando esta roupa foi desenhada, entao daqui para baixo o mapa usa
  // simbolos. Funciona igual: cada caractere da grade e um pixel.
  //
  // Colete de tweed sobre camisa e gravata. NAO pode puxar para o marrom do
  // sobretudo — o ponto da roupa e que ela e outra roupa. Puxa para o
  // oliva-acinzentado, que separa dele e do branco encardido do Michael.
  // ⚠ Estes quatro sao a EXCECAO da regra da paleta, e a excecao tem
  // motivo: a regra manda pintar mais claro do que a logica pede porque a
  // cena e multiplicada pela luz. Aqui o colete precisa CONTRASTAR com a
  // camisa (#b9b8ae) que esta logo do lado dele, no mesmo corpo, sob a
  // mesma luz. Pintado claro, o tronco inteiro virava uma mancha bege e a
  // roupa deixava de ser "colete sobre camisa" para virar "camisa larga".
  // E seguro escurecer porque esta roupa so existe no flashback, que sao
  // os dois setores mais claros do jogo.
  '+': '#4e5462', '=': '#31363f', '*': '#6d7484', '-': '#262a31',
};

const P = {};
let pronto = false;

// ---------------------------------------------------------------------------

function build() {
  // =======================================================================
  // OS SEM-ROSTO
  // =======================================================================
  // A cabeça é a parte inteira do truque: mesmo formato de crânio, mesmo
  // cabelo, e nenhum traço dentro. A silhueta continua sendo de gente — e
  // é por isso que assusta. Um rosto derretido seria monstro; isto aqui é
  // alguém de quem você esqueceu a cara.
  P.faceHead = sprite({
    pivot: [6, 14], map: C, rows: [
      '...HHHHHHH....',
      '..HHHHHHHHH...',
      '.HHHHHqqqqH...',
      '.HHHHqSSSSSt..',
      '.HHHqSSSSSSSt.',
      '.HHHqSSSSSSSt.',
      '.HHHqSSSSSSSt.',
      '.HHHqSSSSSSSt.',
      '.HHHqSSSSSSSt.',
      '.HHHqSSSSSSst.',
      '..HqSSSSSSSst.',
      '..qsSSSSSSSs..',
      '...sSSSSSSs...',
      '....sSSSs.....',
      '....sSSSs.....',
    ]
  });

  // Tronco: roupa de trabalho comum, e a mancha. Ela é a única informação
  // do corpo inteiro, e conta a história toda sem uma linha de diálogo.
  P.faceTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '...zRRRRRRRz......',
      '..zRRRRRRRRRz.....',
      '.zRRRRRRRRREEz....',
      '.zRRRRRRRRRERz....',
      '.zRRRrRRRRRzRz....',
      '.zRRRrRRRRRzRz....',
      '.zRRrbBBbrRzRz....',
      '.zRRbBBBBbRzRz....',
      '.zRRbBBBBBbzRz....',
      '.zRRrbBBBbRzRz....',
      '.zRRRrbBbrRzRz....',
      '.zRRRRrbrRRzRz....',
      '.zRRRRRRRRRzRz....',
      '.zRRRRRRRRRzRz....',
      '.zRRRRRRRRRzRz....',
      '.zRRRRRRRRRzRz....',
      '.zRRRRRRRRRzRz....',
      '.zRRRRRRRRRzRz....',
      '..zRRRRRRRRzRz....',
      '..zRRRRRRRRRz.....',
      '...zRRRRRRRz......',
    ]
  });

  P.faceUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      'zRRRr', 'zRRRr', 'zRRRr', 'zRRRr', 'zRRRr', 'zRRRr',
      'zRRRr', 'zRRRr', 'zRRRr', '.zRRr', '.zrrr',
    ]
  });
  P.faceFore = sprite({
    pivot: [2, 1], map: C, rows: [
      'zRRRr', 'zRRRr', 'zRRRr', 'zRRRr', '.zRRr', '.zRRr',
      '.zSSq', '.zSSq', 'zSSSq', '.zqqq',
    ]
  });
  P.faceHand = sprite({
    pivot: [2, 0], map: C, rows: ['.sSs.', 'sSSSs', 'sSSSs', '.sSs.', '..q..'],
  });
  P.faceThigh = sprite({
    pivot: [4, 1], map: C, rows: [
      'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd',
      'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd',
      '.dpPPPpd', '.dpPPPpd', '.dpPPPpd', '.dpPPPpd',
      '.dpPPPpd', '..dpPpd.',
    ]
  });
  P.faceShin = sprite({
    pivot: [3, 1], map: C, rows: [
      '.dpPPpd', '.dpPPpd', '.dpPPpd', '.dpPPpd', '.dpPPpd',
      'dppppppd', 'dpppppd', 'dpppppd', 'dpppppd', 'dpppppd',
      'dpppppd', 'ddpppdd',
    ]
  });
  P.faceFoot = sprite({
    pivot: [3, 0], map: C, rows: ['.dppppd..', 'dpppppppd', 'dddddddd.', '.dddddd..'],
  });

  // =======================================================================
  // OS EMPILHADOS
  // =======================================================================
  // A cabeça pende para baixo, virada ao contrário. O lençol ainda está
  // amarrado por cima — quem guardou não terminou o serviço.
  P.stackHead = sprite({
    pivot: [6, 12], map: C, rows: [
      '....LLLLL.....',
      '..LLLLLLLLL...',
      '.LLLlllllLLL..',
      '.Llq.....qlL..',
      '.lqSSSSSSSql..',
      '.qSSsssssSSq..',
      '.qSseeeeesSq..',
      '.qSsee.eesSq..',
      '..qSssssssq...',
      '..qSSqqqSSq...',
      '...qSSSSSq....',
      '....qqqqq.....',
    ]
  });

  // Tronco dobrado, com as costelas marcando por baixo do lençol.
  P.stackTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '...kLLLLLLLk......',
      '..kLLLLLLLLLk.....',
      '.kLLLLLLLLLLLk....',
      '.kLlLLLLLLLlLk....',
      '.kLlkLLLLLklLk....',
      '.kLLlkLLLklLLk....',
      '.kLLLlkLklLLLk....',
      '.kLLLLlklLLLLk....',
      '.kLLLLLkLLLLLk....',
      '.kLLLLklkLLLLk....',
      '.kLLLklLlkLLLk....',
      '.kLLklLLLlkLLk....',
      '.kLklLLLLLlkLk....',
      '.kklLLLLLLLlkk....',
      '.klLLLLLLLLLlk....',
      '.kLLLLLLLLLLLk....',
      '.kLLLLqqqLLLLk....',
      '.kLLLqSSSqLLLk....',
      '..kLLqSSSqLLk.....',
      '..kLLLqqqLLLk.....',
      '...kLLLLLLLk......',
    ]
  });

  // Membros esqueléticos: pele colada no osso, sem roupa.
  P.stackUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      'qSSsq', 'qSSsq', 'qSsSq', 'qSSsq', 'qSsSq', 'qSSsq',
      'qSsSq', 'qSSsq', 'qSsSq', '.qSsq', '.qqsq',
    ]
  });
  P.stackFore = sprite({
    pivot: [2, 1], map: C, rows: [
      'qSSsq', 'qSsSq', 'qSSsq', 'qSsSq', '.qSSq', '.qSsq',
      '.qSSq', '.qSsq', 'qSSSq', '.qqqq',
    ]
  });
  P.stackHand = sprite({
    pivot: [2, 0], map: C, rows: ['.sqs.', 'sSqSs', 'qSSSq', '.sqs.', '..q..'],
  });
  P.stackThigh = sprite({
    pivot: [4, 1], map: C, rows: [
      'qsSSSSsq', 'qsSSSSsq', 'qsSsSSsq', 'qsSSSSsq',
      'qsSsSSsq', 'qsSSSSsq', 'qsSsSSsq', 'qsSSSSsq',
      '.qsSSSsq', '.qsSsSsq', '.qsSSSsq', '.qsSsSsq',
      '.qsSSSsq', '..qsSsq.',
    ]
  });
  P.stackShin = sprite({
    pivot: [3, 1], map: C, rows: [
      '.qsSSsq', '.qsSsSq', '.qsSSsq', '.qsSsSq', '.qsSSsq',
      '.qsSsSq', '.qsSSsq', '.qsSsSq', '.qsSSsq', '.qsSSsq',
      '.qsSSsq', '.qqssqq',
    ]
  });
  // O pé com a etiqueta de necrotério amarrada. É o detalhe que diz o que
  // isso é, e ele nunca comenta.
  P.stackFoot = sprite({
    pivot: [3, 0], map: C, rows: [
      '.qsSSSsq..', 'qsSSSSSSq.', 'qqsssssqq.', '.qqAAAqq..', '...aAa....',
    ]
  });

  // =======================================================================
  // O ECOADOR
  // =======================================================================
  // No lugar da cara, um fone de telefone preto — daqueles pesados, de
  // baquelite. Ele não tem boca, e mesmo assim é o único que faz barulho.
  P.echoHead = sprite({
    pivot: [6, 13], map: C, rows: [
      '...HHHHHHH....',
      '..HHHHHHHHH...',
      '.HHHqqqqqqH...',
      '.HHqSSSSSSq...',
      '..TTTTTTTTTT..',
      '.TYYYYYYYYYYT.',
      'TYYYTTTTTTYYYT',
      'TYYT......TYYT',
      '.TT........TT.',
      '..qSSSSSSSq...',
      '..qSSSSSSSq...',
      '...qSSSSSq....',
      '....qSSSq.....',
    ]
  });

  P.echoTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '....dPPPPPd.......',
      '...dPPPPPPPd......',
      '..dPPPPPPPPPd.....',
      '..dPPPpPPPpPd.....',
      '..dPPpPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPpPPPPPPpd.....',
      '..dPPpPPPPpPd.....',
      '...dPPPPPPPd......',
      '...dPPPPPPPd......',
      '....dPPPPPd.......',
    ]
  });

  P.echoUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      'dPPp', 'dPPp', 'dPPp', 'dPPp', 'dPPp', 'dPPp',
      'dPPp', 'dPPp', 'dPPp', '.dPp', '.dpp',
    ]
  });
  P.echoFore = sprite({
    pivot: [2, 1], map: C, rows: [
      'dPPp', 'dPPp', 'dPPp', 'dPPp', '.dPp', '.dPp',
      '.dSq', '.dSq', 'dSSq', '.dqq',
    ]
  });
  P.echoHand = sprite({
    pivot: [2, 0], map: C, rows: ['.sSs.', 'sSSSs', 'sSSSs', '.sSs.', '..q..'],
  });
  P.echoThigh = sprite({
    pivot: [4, 1], map: C, rows: [
      'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd',
      'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd', '.dpPPPpd',
      '.dpPPPpd', '.dpPPPpd', '.dpPPPpd', '.dpPPPpd',
      '..dpPpd.', '..dpPpd.',
    ]
  });
  P.echoShin = sprite({
    pivot: [3, 1], map: C, rows: [
      '.dpPPpd', '.dpPPpd', '.dpPPpd', '.dpPPpd', '.dpPPpd',
      '.dppppd', '.dppppd', '.dppppd', '.dppppd', '.dppppd',
      '.dppppd', '.ddppdd',
    ]
  });
  P.echoFoot = sprite({
    pivot: [3, 0], map: C, rows: ['.dpppd...', 'dppppppd.', 'dddddddd.', '.dddddd..'],
  });

  // O fio, que ele arrasta e que não está ligado em lugar nenhum.
  P.echoCord = sprite({
    pivot: [1, 0], map: C, rows: [
      '.T.', 'TT.', '.TT', '.T.', 'TT.', '.TT', '.T.', 'TT.',
      '.TT', '.T.', 'TT.', '.TT', '.T.', 'TTT',
    ]
  });

  // =======================================================================
  // O CREDOR
  // =======================================================================
  // Cabeça de porco costurada em pano de saco. Não é uma máscara bonita:
  // é pano grosso, com dois furos e um focinho mal costurado. Os olhos
  // não são olhos — são buracos onde a luz não entra.
  P.pigHead = sprite({
    pivot: [7, 15], map: C, rows: [
      '..vvvvvvvvv...',
      '.vVVVVVVVVVv..',
      'vVVVVVVVVVVVv.',
      'vVVuVVVVVuVVv.',
      'vVVVVVVVVVVVv.',
      'vVVeeVVVVeeVv.',
      'vVVeeVVVVeeVvG',
      'vVVVVVVVVVGGGG',
      'vVVVVVVVVGGggG',
      'vVVVVVVVVGeGeG',
      'vVVuVVVVVGGGGG',
      '.vVVVVVVVVGGg.',
      '.vVVVVVVVVVv..',
      '..vuvuvuvuv...',
      '...vvvvvvv....',
    ]
  });

  // Avental de açougueiro por cima do sobretudo. O avental é claro, e é a
  // única coisa clara nele — por isso é o que se vê primeiro no escuro.
  P.pigTorso = sprite({
    pivot: [10, 22], map: C, rows: [
      '...ddPPPPPPPdd.....',
      '..dPPPPPPPPPPPd....',
      '.dPPPPPPPPPPPPPd...',
      '.dPPvVVVVVVVvPPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPvVVVbBBbVVvPd...',
      '.dPvVVbBBBBbVvPd...',
      '.dPvVVVbBBbVVvPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPvVVbVVVbVVvPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPvVVVVVVVVVvPd...',
      '.dPPvVVVVVVVvPPd...',
      '..dPPvvvvvvvPPd....',
      '..dPPPPPPPPPPPd....',
      '...ddPPPPPPPdd.....',
    ]
  });

  P.pigUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      'dPPPp', 'dPPPp', 'dPPPp', 'dPPPp', 'dPPPp', 'dPPPp',
      'dPPPp', 'dPPPp', 'dPPPp', '.dPPp', '.dppp',
    ]
  });
  P.pigFore = sprite({
    pivot: [2, 1], map: C, rows: [
      'dPPPp', 'dPPPp', 'dPPPp', 'dPPPp', '.dPPp', '.dPPp',
      '.dGGh', '.dGGh', 'dGGGh', '.dhhh',
    ]
  });
  P.pigHand = sprite({
    pivot: [2, 0], map: C, rows: ['.gGg.', 'gGGGg', 'gGGGg', '.gGg.', '..h..'],
  });
  P.pigThigh = sprite({
    pivot: [4, 1], map: C, rows: [
      'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd',
      'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd', 'dpPPPPpd',
      'dpPPPPpd', '.dpPPPpd', '.dpPPPpd', '.dpPPPpd',
      '.dpPPPpd', '..dpPpd.',
    ]
  });
  P.pigShin = sprite({
    pivot: [3, 1], map: C, rows: [
      '.dpPPpd', '.dpPPpd', '.dpPPpd', '.dpPPpd', '.dpPPpd',
      'ddddddd', 'dddddddd', 'ddddddd', 'ddddddd', 'ddddddd',
      'ddddddd', 'ddddddd',
    ]
  });
  P.pigFoot = sprite({
    pivot: [3, 0], map: C, rows: ['.dddddd..', 'dddddddddd', 'dddddddddd', '.dddddddd.'],
  });

  // A MOTOSSERRA. Ela nunca desliga — e é o som dela que chega antes dele.
  // Corrente desenhada com dentes alternados para o olho pegar movimento
  // mesmo com a coisa parada.
  P.chainsaw = sprite({
    pivot: [2, 0], map: C, rows: [
      'mMMMMm', 'MNNNNM', 'mMMMMm', 'mmMMmm', '.mMMm.',
      '.mMMm.', '.MmmM.', '.mMMm.', '.MmmM.', '.mMMm.',
      '.MmmM.', '.mMMm.', '.MmmM.', '.mMMm.', '.MmmM.',
      '.mMMm.', '..MM..', '..mm..',
    ]
  });

  // =======================================================================
  // AS DUAS PESSOAS
  // =======================================================================

  // A TELEFONISTA — cabelo preso, vestido de trabalho vinho, gola branca.
  // Ela está no turno dela, e o turno dela acabou há dez anos.
  P.opHead = sprite({
    pivot: [6, 14], map: C, rows: [
      '...HHHHHHH....',
      '..HHHHHHHHHH..',
      '.HHHHHHHHHHHH.',
      '.HHHHHHHSSStH.',
      '.HHHHHSSSSSStH',
      '.HHHHqSSeeSStH',
      '.HHHHqSSEeSstH',
      '.HHHHqSSqSStSH',
      '.HHHHqSSSSSqSH',
      '.HHHHSSSSSSstH',
      '..HHqSSBBBSstH',
      '..sHSSSSSSSsHH',
      '...sSSSSSSs.H.',
      '....sSSSs.....',
      '....sSSSs.....',
    ]
  });
  P.opTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '...wWWWWWWWw......',
      '..wWWWWWWWWWw.....',
      '.wWWWWWWWWWEEw....',
      '.wWWWWWWWWWEWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wwwwwwwwwwwww....',
      '.wWWWWWWWWWWWw....',
      '.wWWWWWWWWWWWw....',
      '.wWWWWWWWWWWWw....',
      '.wWWWWWWWWWWWw....',
      '.wWWWWWWWWWWWw....',
      '..wWWWWWWWWWw.....',
      '..wWWWWWWWWWw.....',
      '...wWWWWWWWw......',
    ]
  });
  P.opUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      'wWWWw', 'wWWWw', 'wWWWw', 'wWWWw', 'wWWWw', 'wWWWw',
      'wWWWw', 'wWWWw', '.wWWw', '.wSSq', '.qSSq',
    ]
  });
  P.opFore = sprite({
    pivot: [2, 1], map: C, rows: [
      'qSSSq', 'qSSSq', 'qSSSq', 'qSSSq', '.qSSq', '.qSSq',
      '.qSSq', '.qSSq', 'qSSSq', '.qqqq',
    ]
  });

  // O ZELADOR — macacão verde desbotado, e o esfregão. Ele nunca larga o
  // esfregão, nem quando está sentado, nem quando está falando com você.
  P.jaHead = sprite({
    pivot: [6, 14], map: C, rows: [
      '...LLLLLLL....',
      '..LLLLLLLLLL..',
      '.LLLLLLLLLLLL.',
      '.HHHHHHHSSSt..',
      '.HHHHHSSSSSSt.',
      '.HHHHqSSeeSSt.',
      '.HHHHqSSEeSst.',
      '.HHHHqSSqSStS.',
      '.HHHHqSSSSSqS.',
      '.HHHHSSSSSSst.',
      '..HHqSSSSSSst.',
      '..sHSSSSSSSs..',
      '...sSSSSSSs...',
      '....sSSSs.....',
      '....sSSSs.....',
    ]
  });
  P.jaTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '...nUUUUUUUn......',
      '..nUUUUUUUUUn.....',
      '.nUUUUUUUUUEEn....',
      '.nUUUUUUUUUEUn....',
      '.nUUUnUUUUUnUn....',
      '.nUUUnUUUUUnUn....',
      '.nUUUnUUUUUnUn....',
      '.nUUUnUUUUUnUn....',
      '.nUAAnUUUUUnUn....',
      '.nUAAnUUUUUnUn....',
      '.nUUUnUUUUUnUn....',
      '.nUUUnUUUUUnUn....',
      '.nUUUnUUUUUnUn....',
      '.nUUUnUUUUUnUn....',
      '.nUUUUUUUUUUUn....',
      '.nUUUUUUUUUUUn....',
      '.nUUUnUUUUUnUn....',
      '.nUUUnUUUUUnUn....',
      '..nUUnUUUUUnUn....',
      '..nUUUUUUUUUn.....',
      '...nUUUUUUUn......',
    ]
  });
  P.jaUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      'nUUUn', 'nUUUn', 'nUUUn', 'nUUUn', 'nUUUn', 'nUUUn',
      'nUUUn', 'nUUUn', 'nUUUn', '.nUUn', '.nnnn',
    ]
  });
  P.jaFore = sprite({
    pivot: [2, 1], map: C, rows: [
      'nUUUn', 'nUUUn', 'nUUUn', 'nUUUn', '.nUUn', '.nUUn',
      '.qSSq', '.qSSq', 'qSSSq', '.qqqq',
    ]
  });

  // O esfregão. Cabo comprido e um bolo de fios cinzentos na ponta.
  P.mop = sprite({
    pivot: [1, 0], map: C, rows: [
      'fFf', 'fFf', 'fFf', 'fFf', 'fFf', 'fFf', 'fFf', 'fFf',
      'fFf', 'fFf', 'fFf', 'fFf', 'fFf', 'fFf',
      'kLk', 'LLL', 'LLL', 'lLl', 'lll', 'klk',
    ]
  });

  // =======================================================================
  // CAPITULO 3 — AS PESSOAS
  //
  // Estas nao sao criaturas: sao gente. A diferenca esta na CABECA — todas
  // tem rosto de verdade, com o olho de quatro pixels (sobrancelha, esclera,
  // pupila e a sombra debaixo), que e o que separa um olho de um furo.
  //
  // Regra de leitura a 62px: o que distingue uma pessoa da outra e a
  // SILHUETA e a COR DA ROUPA, nao o rosto. Por isso cada uma tem um
  // formato de cabelo diferente e uma roupa de cor propria.
  // =======================================================================

  // ---- O PLANTONISTA: farda azul, quepe, atras do vidro ----
  P.deskHead = sprite({
    pivot: [6, 14], map: C, rows: [
      '..iiiiiiiii...',
      '.iJJJJJJJJJi..',
      '.iiiiiiiiiii..',
      '..HHHHHSSSt...',
      '.HHHHHSSSSSt..',
      '.HHHHqSSeeSSt.',
      '.HHHHqSSEeSst.',
      '.HHHHqSSqSStS.',
      '.HHHHqSSSSSqS.',
      '.HHHHSSSSSSst.',
      '..HHqSSSSSSst.',
      '..sHSSSSSSSs..',
      '...sSSSSSSs...',
      '....sSSSs.....',
      '....sSSSs.....',
    ]
  });
  P.deskTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '...jJJJJJJJj......',
      '..jJJJJJJJJJj.....',
      '.jJJJJJJJJJXXj....',
      '.jJJJJJJJJJXJj....',
      '.jJJJjJJJJJjJj....',
      '.jJNJjJJJJJjJj....',
      '.jJNJjJJJJJjJj....',
      '.jJJJjJJJJJjJj....',
      '.jJJJjJJJJJjJj....',
      '.jJJJjJJJJJjJj....',
      '.jJJJjJJJJJjJj....',
      '.jJJJjJJJJJjJj....',
      '.jJJJjJJJJJjJj....',
      '.jiiijiiiiijJj....',
      '.jJJJJJJJJJJJj....',
      '.jJJJJJJJJJJJj....',
      '.jJJJjJJJJJjJj....',
      '.jJJJjJJJJJjJj....',
      '..jJJjJJJJJjJj....',
      '..jJJJJJJJJJj.....',
      '...jJJJJJJJj......',
    ]
  });
  P.deskUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      'jJJJj', 'jJJJj', 'jJJJj', 'jJJJj', 'jJJJj', 'jJJJj',
      'jJJJj', 'jJJJj', 'jJJJj', '.jJJj', '.jjjj',
    ]
  });
  P.deskFore = sprite({
    pivot: [2, 1], map: C, rows: [
      'jJJJj', 'jJJJj', 'jJJJj', 'jNNNj', '.jJJj', '.jJJj',
      '.qSSq', '.qSSq', 'qSSSq', '.qqqq',
    ]
  });

  // ---- MICHAEL: camisa arregacada, gravata frouxa, cabelo grisalho ----
  // E a unica conversa quente do jogo. Ele tem que parecer alguem que voce
  // conhece ha vinte anos, nao um figurante de reparticao.
  P.miHead = sprite({
    pivot: [6, 14], map: C, rows: [
      '...MMMMMM.....',
      '..MMMMMMMMM...',
      '.MMMMMMqqqq...',
      '.MMMMMqSSSSt..',
      '.MMMMqSSSSSSt.',
      '.MMMqSSeeSSSt.',
      '.MMMqSSEeSSst.',
      '.MMMqSSqSSStS.',
      '.MMMqSSSSSSqS.',
      '.MMqSSSSSSSst.',
      '..MqSSSSSSSst.',
      '..qsSSSSSSSs..',
      '...sSSSSSSs...',
      '....sSSSs.....',
      '....sSSSs.....',
    ]
  });
  P.miTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '...cXXXXXXXc......',
      '..cXXXXXXXXXc.....',
      '.cXXXXXOOXXXXc....',
      '.cXXXXXOOXXXXc....',
      '.cXXXcXOOXXcXc....',
      '.cXXXcXoOXXcXc....',
      '.cXXXcXOOXXcXc....',
      '.cXXXcXoOXXcXc....',
      '.cXXXcXOOXXcXc....',
      '.cXXXcXoOXXcXc....',
      '.cXXXcXXXXXcXc....',
      '.cXXXcXXXXXcXc....',
      '.cXXXcXXXXXcXc....',
      '.cxxxcxxxxxcXc....',
      '.cXXXXXXXXXXXc....',
      '.cXXXXXXXXXXXc....',
      '.cXXXcXXXXXcXc....',
      '.cXXXcXXXXXcXc....',
      '..cXXcXXXXXcXc....',
      '..cXXXXXXXXXc.....',
      '...cXXXXXXXc......',
    ]
  });
  // camisa ARREGACADA: o antebraco e pele, nao pano. Detalhe pequeno que
  // diz "esse aqui esta no meio do turno" sem uma linha de dialogo.
  P.miUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      'cXXXc', 'cXXXc', 'cXXXc', 'cXXXc', 'cXXXc', 'cXXXc',
      'cXXXc', 'cxxxc', '.cXXc', '.cXXc', '.cccc',
    ]
  });
  P.miFore = sprite({
    pivot: [2, 1], map: C, rows: [
      'qSSSq', 'qSSSq', 'qSSSq', 'qSSSq', '.qSSq', '.qSSq',
      '.qSSq', '.qSSq', 'qSSSq', '.qqqq',
    ]
  });

  // ---- RUIZ: farda, em pe, o mais parecido com um policial de manual ----
  P.ruHead = sprite({
    pivot: [6, 14], map: C, rows: [
      '...HHHHHHH....',
      '..HHHHHHHHH...',
      '.HHHHHHqqqq...',
      '.HHHHHqSSSSt..',
      '.HHHHqSSSSSSt.',
      '.HHHqSSeeSSSt.',
      '.HHHqSSEeSSst.',
      '.HHHqSSqSSStS.',
      '.HHHqSSSSSSqS.',
      '.HHqSSSSSSSst.',
      '..HqSSSSSSSst.',
      '..qsSSSSSSSs..',
      '...sSSSSSSs...',
      '....sSSSs.....',
      '....sSSSs.....',
    ]
  });
  P.ruTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '...jJJJJJJJj......',
      '..jJJJJJJJJJj.....',
      '.jJJJJJJJJJJJj....',
      '.jJJJJJJJJJJJj....',
      '.jJNJjJJJJJjJj....',
      '.jJJJjJJJJJjJj....',
      '.jJJJjJJJJJjJj....',
      '.jJJJjJJJJJjJj....',
      '.jJJJjJJJJJjJj....',
      '.jJJJjJJJJJjJj....',
      '.jJJJjJJJJJjJj....',
      '.jJJJjJJJJJjJj....',
      '.jiiiiiiiiiiij....',
      '.jJJJjJJJJJjJj....',
      '.jJJJjJJJJJjJj....',
      '.jJJJjJJJJJjJj....',
      '.jJJJjJJJJJjJj....',
      '.jJJJjJJJJJjJj....',
      '..jJJjJJJJJjJj....',
      '..jJJJJJJJJJj.....',
      '...jJJJJJJJj......',
    ]
  });

  // ---- ELAINE: blusa vinho, cabelo preso, datilografando ----
  P.elHead = sprite({
    pivot: [6, 14], map: C, rows: [
      '...HHHHHH.....',
      '..HHHHHHHHH...',
      '.HHHHHHqqqqH..',
      '.HHHHHqSSSStH.',
      '.HHHHqSSSSSStH',
      '.HHHqSSeeSSStH',
      '.HHHqSSEeSSstH',
      '.HHHqSSqSSStSH',
      '.HHHqSSSSSSqSH',
      '.HHqSSSSSSSstH',
      '..HqSSSSSSSst.',
      '..qsSSSSSSSs..',
      '...sSSSSSSs...',
      '....sSSSs.....',
      '....sSSSs.....',
    ]
  });
  P.elTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '...wWWWWWWWw......',
      '..wWWWWWWWWWw.....',
      '.wWWWWWLLWWWWw....',
      '.wWWWWWLLWWWWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWWWWWWWWWw....',
      '.wWWWWWWWWWWWw....',
      '.wWWWwWWWWWwWw....',
      '.wWWWwWWWWWwWw....',
      '..wWWwWWWWWwWw....',
      '..wWWWWWWWWWw.....',
      '...wWWWWWWWw......',
    ]
  });

  // ---- BETINHO: mais velho, trico marrom, caneca na mao ----
  P.beHead = sprite({
    pivot: [6, 14], map: C, rows: [
      '....MMMMM.....',
      '..MMMMMMMMM...',
      '.MMMqqqqqqq...',
      '..MqSSSSSSSt..',
      '.MqSSSSSSSSSt.',
      '.MqSSeeSSSSSt.',
      '.MqSSEeSSSSst.',
      '.MqSSqSSSSStS.',
      '.MqSSSSSSSSqS.',
      '.qSSSSSSSSSst.',
      '..qSSSSSSSSst.',
      '..qsSSSSSSSs..',
      '...ssSSSSss...',
      '....sSSSs.....',
      '....sSSSs.....',
    ]
  });
  P.beTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '...IQQQQQQQI......',
      '..IQQQQQQQQQI.....',
      '.IQQQQQXXQQQQI....',
      '.IQQQQQXXQQQQI....',
      '.IQQQIQQQQQIQI....',
      '.IQQQIQQQQQIQI....',
      '.IQQQIQQQQQIQI....',
      '.IQQQIQQQQQIQI....',
      '.IQQQIQQQQQIQI....',
      '.IQQQIQQQQQIQI....',
      '.IQQQIQQQQQIQI....',
      '.IQQQIQQQQQIQI....',
      '.IQQQIQQQQQIQI....',
      '.IQQQIQQQQQIQI....',
      '.IQQQQQQQQQQQI....',
      '.IQQQQQQQQQQQI....',
      '.IQQQIQQQQQIQI....',
      '.IQQQIQQQQQIQI....',
      '..IQQIQQQQQIQI....',
      '..IQQQQQQQQQI.....',
      '...IQQQQQQQI......',
    ]
  });
  P.beUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      'IQQQI', 'IQQQI', 'IQQQI', 'IQQQI', 'IQQQI', 'IQQQI',
      'IQQQI', 'IQQQI', 'IQQQI', '.IQQI', '.IIII',
    ]
  });
  P.beFore = sprite({
    pivot: [2, 1], map: C, rows: [
      'IQQQI', 'IQQQI', 'IQQQI', 'IQQQI', '.IQQI', '.IQQI',
      '.qSSq', '.qSSq', 'qSSSq', '.qqqq',
    ]
  });
  // a caneca de cafe. Betinho nunca aparece sem ela.
  P.mug = sprite({
    pivot: [1, 0], map: C, rows: [
      'CCCC.', 'C77C.', 'CCCCC', 'CCC.C', 'CCCCC', '.CCC.',
    ]
  });

  // ---- CARLOS: MACACAO DE CUSTODIA ----
  //
  // Ele nao pode parecer vilao. Tem que parecer PRESO, que e outra coisa —
  // e o que diz isso nao e cara de mau, sao tres detalhes de rotina:
  //
  //   · cabelo raspado rente, sem forma nenhuma
  //   · macacao fechado ate em cima, com o NUMERO estampado no peito
  //   · pulseira de papel no punho, e pe descalco
  //
  // Nada disso e ameaca. E burocracia — e por isso funciona.
  P.caHead = sprite({
    pivot: [6, 14], map: C, rows: [
      '....000000....',
      '...00000000...',
      '..0000000000..',
      '..000qSSSSSt..',
      '..00qSSSSSSSt.',
      '..0qSSeeSSSSt.',
      '..0qSSEeSSSst.',
      '..qqSSqSSSStS.',
      '..qqSSSSSSSqS.',
      '..qsSSSSSSSst.',
      '..qsSSSSSSSst.',
      '..qsSSSSSSSs..',
      '...sSSSSSSs...',
      '....sSSSs.....',
      '....sSSSs.....',
    ]
  });
  // Macacao fechado ate o pescoco, com a numeracao no peito. A camiseta
  // aparece so no colarinho — e o unico pedaco de roupa dele mesmo.
  P.caTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '...1DDDDDDD1......',
      '..1DDD888DDD1.....',
      '.1DDDD888DDDD1....',
      '.1DDDDDDDDDDD1....',
      '.1DDD1DDDDD1D1....',
      '.1D991DDDDD1D1....',
      '.1D991D999D1D1....',
      '.1DDD1D9D9D1D1....',
      '.1DDD1D999D1D1....',
      '.1DDD1D9D9D1D1....',
      '.1DDD1D999D1D1....',
      '.1DDD1DDDDD1D1....',
      '.1KKKKKKKKKKK1....',
      '.1KKK1KKKKK1K1....',
      '.1DDDDDDDDDDD1....',
      '.1DDDDDDDDDDD1....',
      '.1DDD1DDDDD1D1....',
      '.1DDD1DDDDD1D1....',
      '..1DD1DDDDD1D1....',
      '..1DDDDDDDDD1.....',
      '...1DDDDDDD1......',
    ]
  });
  // Manga inteira do macacao — nao e camiseta. So a mao fica de fora, e no
  // punho vai a pulseira de papel do plantao.
  P.caUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      '1DDD1', '1DDD1', '1DDD1', '1DDD1', '1DDD1', '1DDD1',
      '1DDD1', '1DDD1', '1KKK1', '.1DD1', '.1111',
    ]
  });
  P.caFore = sprite({
    pivot: [2, 1], map: C, rows: [
      '1DDD1', '1DDD1', '1DDD1', '1KKK1', '.999.', '.qSSq',
      '.qSSq', '.qSSq', 'qSSSq', '.qqqq',
    ]
  });
  // Pe descalco: sem cadarco, sem cinto, sem nada que amarre. E o detalhe
  // que diz custodia sem dizer uma palavra.
  P.caFoot = sprite({
    pivot: [3, 1], map: C, rows: [
      'qSSSSq', 'SSSSSS', 'sSSSSs', 'qssssq',
    ]
  });
  P.caShin = sprite({
    pivot: [2, 1], map: C, rows: [
      '1DDD1', '1DDD1', '1DDD1', '1DDD1', '1DDD1', '1KKK1',
      '.qSSq', '.qSSq', '.qSSq', '.qqqq', '.qqqq',
    ]
  });

  // ---- JULIE: vestido de casa. A unica pessoa quente do jogo inteiro. ----
  // ⚠ CABELO COMPRIDO. As linhas abaixo da 14 caem ALEM do pivo, ou seja,
  // sao desenhadas por cima do tronco: e assim que o cabelo passa do
  // pescoco e chega no ombro. A cabeca so gira em passos de 7 graus, entao
  // a ponta do cabelo balanca no maximo um pixel e meio — nao derrete.
  P.juHead = sprite({
    pivot: [6, 14], map: C, rows: [
      '...555555.....',
      '..5555555555..',
      '.55555qqqq55..',
      '.5555qSSSSt55.',
      '.555qSSSSSSt5.',
      '.55qSSeeSSSt5.',
      '.55qSSEeSSst5.',
      '.55qSSqSSStS5.',
      '.55qSSSSSSqS5.',
      '.55qSSSSSSst5.',
      '.55qSSSSSSst5.',
      '.55qsSSSSSSs5.',
      '.555sSSSSSs55.',
      '.5555sSSSs555.',
      '.5555sSSSs555.',
      '.66555...55566',
      '.66555...55566',
      '.6655.....5566',
      '.665.......566',
      '..65.......56.',
      '..6.........6.',
    ]
  });
  P.juTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '...2ZZZZZZZ2......',
      '..2ZZZZZZZZZ2.....',
      '.2ZZZZZZZZZZZ2....',
      '.2ZZZZZZZZZZZ2....',
      '.2ZZZ2ZZZZZ2Z2....',
      '.2ZZZ2ZZZZZ2Z2....',
      '.2ZZZ2ZZZZZ2Z2....',
      '.2ZZZ2ZZZZZ2Z2....',
      '.2ZZZ2ZZZZZ2Z2....',
      '.2ZZZ2ZZZZZ2Z2....',
      '.2ZZZ2ZZZZZ2Z2....',
      '.2ZZZ2ZZZZZ2Z2....',
      '.2ZZZ2ZZZZZ2Z2....',
      '.2ZZZ2ZZZZZ2Z2....',
      '.2ZZZZZZZZZZZ2....',
      '.2ZZZZZZZZZZZ2....',
      '.2ZZZZZZZZZZZ2....',
      '.2ZZZZZZZZZZZ2....',
      '..2ZZZZZZZZZ2.....',
      '..2ZZZZZZZZZ2.....',
      '...2ZZZZZZZ2......',
    ]
  });
  P.juUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      '2ZZZ2', '2ZZZ2', '2ZZZ2', '.qSSq', 'qSSSq', 'qSSSq',
      'qSSSq', 'qSSSq', 'qSSSq', '.qSSq', '.qqqq',
    ]
  });
  P.juFore = sprite({
    pivot: [2, 1], map: C, rows: [
      'qSSSq', 'qSSSq', 'qSSSq', 'qSSSq', '.qSSq', '.qSSq',
      '.qSSq', '.qSSq', 'qSSSq', '.qqqq',
    ]
  });

  // ---- JENNA: pijama azul. Desenhada MENOR de proposito. ----
  // O rig e o mesmo; quem encolhe e o `escala` do NPC. Mas a cabeca dela e
  // proporcionalmente maior, que e o que faz uma crianca parecer crianca em
  // vez de um adulto reduzido.
  // O cabelo dela e mais comprido que o da mae e nao esta preso — ela devia
  // estar dormindo ha duas horas. Detalhe pequeno, mas e o tipo de coisa
  // que faz uma crianca parecer uma crianca em vez de um adulto reduzido.
  P.jeHead = sprite({
    pivot: [6, 14], map: C, rows: [
      '...555555.....',
      '..5555555555..',
      '.555555qqq55..',
      '.5555qSSSSt55.',
      '.555qSSSSSSt5.',
      '.55qSSeeSSSt5.',
      '.55qSSEeSSst5.',
      '.55qSSSSSSSt5.',
      '.55qSSSqSSSq5.',
      '.55qSSSSSSSs5.',
      '.55qSSSSSSSs5.',
      '.55qsSSSSSSs5.',
      '.555sSSSSSs55.',
      '.5555sSSSs555.',
      '.5555sSSSs555.',
      '.65555...55556',
      '.65555...55556',
      '.6655.....5566',
      '.6655.....5566',
      '.665.......566',
      '..65.......56.',
      '..6.........6.',
      '..6.........6.',
    ]
  });
  P.jeTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '...4333333334.....',
      '..433333333334....',
      '.4333333333334....',
      '.4333433333434....',
      '.4333433333434....',
      '.4333433333434....',
      '.4333433333434....',
      '.4333433333434....',
      '.4333433333434....',
      '.4333433333434....',
      '.4333433333434....',
      '.4333433333434....',
      '.4333433333434....',
      '.4333433333434....',
      '.4333333333334....',
      '.4333333333334....',
      '.4333433333434....',
      '.4333433333434....',
      '..433433333434....',
      '..43333333334.....',
      '...433333334......',
    ]
  });
  P.jeUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      '43334', '43334', '43334', '43334', '43334', '43334',
      '43334', '43334', '43334', '.4334', '.4444',
    ]
  });
  P.jeFore = sprite({
    pivot: [2, 1], map: C, rows: [
      '43334', '43334', '43334', '43334', '.4334', '.4334',
      '.qSSq', '.qSSq', 'qSSSq', '.qqqq',
    ]
  });

  // =======================================================================
  // O DAVID DE SETE ANOS ATRAS
  // =======================================================================
  // Ele nao pode estar com a mesma roupa. O sobretudo marrom e o que ele
  // veste HA SETE ANOS, todo dia, e a piada silenciosa do jogo inteiro e
  // essa: um homem que nao troca de roupa desde a noite em que parou.
  // Entao no flashback ele veste o que um detetive de turno veste: camisa,
  // gravata e colete. Sem aba de sobretudo, sem gola levantada, sem coldre
  // no quadril.
  //
  // O ganho e de silhueta, e e enorme: a aba do casaco e metade da area do
  // boneco. Sem ela o corpo fica estreito, os bracos aparecem inteiros e
  // ele anda mais leve — sem uma linha de dialogo dizendo isso.
  //
  // ⚠ A cabeca continua sendo a DELE. E o mesmo homem, e o jogador tem que
  // reconhecer na hora; quem muda e a roupa, nao a pessoa.
  // ⚠ REFEITO na sessao 22. A primeira versao era um colete que cobria o
  // tronco quase inteiro, e a 62px o resultado era uma mancha so: "ta tudo
  // enfiado dentro de tudo". O que le como ROUPA SOCIAL num boneco deste
  // tamanho nao e o tecido, sao TRES FAIXAS VERTICAIS em contraste:
  //
  //     paleto escuro  |  lapela clara  |  camisa branca  |  gravata
  //
  // O paleto fica ABERTO, a camisa aparece inteira do colarinho ao cinto e
  // a gravata desce por dentro dela. Sao quatro colunas de cor diferente
  // lado a lado — e e isso, e so isso, que diz "esse homem trabalhava de
  // terno" sem uma linha de dialogo.
  P.pastTorso = sprite({
    pivot: [9, 20], map: C, rows: [
      '...==++++++++=....',
      '..=+++++++++*X=...',
      '.=++++++++++*XX=..',
      '.=+++++++++*XOXX=.',
      '.=++=++++++*XOX9=.',
      '.=++=++++++*XOX=..',
      '.=++=++++++*XOX=..',
      '.=++=++++++*XoX=..',
      '.=++=++++++*XOX=..',
      '.=++=++++++*XOX=..',
      '.=++=++++++*XoX=..',
      '.=++=++++++*XOX=..',
      '.=++=++++++*XOX=..',
      '.=++++++++++XXX=..',
      '.=------------=...',
      '.=++++++++++++=...',
      '.=++=++++++*XX=...',
      '.=++=++++++*XX=...',
      '..=+=++++++*X=....',
      '..=++++++++++=....',
      '...==++++++++=....',
    ]
  });
  // Manga de PALETO, com o punho da camisa saindo na ponta. O punho claro
  // e o detalhe que separa "de terno" de "de casaco": um homem de terno
  // mostra dois centimetros de camisa no pulso, e a 62px esses dois
  // centimetros sao dois pixels — mas sao os dois pixels certos.
  P.pastUpper = sprite({
    pivot: [2, 1], map: C, rows: [
      '=++++=', '=++++=', '=++++=', '=++++=', '=++++=', '=++++=',
      '=++++=', '=++++=', '=++++=', '.=+++=', '.=+++=',
    ]
  });
  P.pastFore = sprite({
    pivot: [2, 1], map: C, rows: [
      '=++++=', '=++++=', '=++++=', '=++++=', '.=+++=', '.=+++=',
      '.=+++=', '.=+++=', 'cXXXXc', '.cccc.',
    ]
  });
  // Colarinho de camisa, no lugar da gola levantada do sobretudo. Sem
  // alguma coisa aqui a cabeca pousa num pescoco de 2px e parece colada —
  // foi o bug B-08 e ele nao vai voltar por causa de uma troca de roupa.
  P.pastCollar = sprite({
    pivot: [8, 9], map: C, rows: [
      '................',
      '................',
      '................',
      '................',
      '................',
      '....=......=....',
      '....=cXXXXc=....',
      '...=cXXXXXXc=...',
      '...=cxxxxxxc=...',
    ]
  });

  // versões escurecidas dos membros de trás
  const K = 0.68, T2 = '#22304a';
  for (const nome of ['faceUpper', 'faceFore', 'faceHand', 'faceThigh', 'faceShin', 'faceFoot',
    'stackUpper', 'stackFore', 'stackHand', 'stackThigh', 'stackShin', 'stackFoot',
    'echoUpper', 'echoFore', 'echoHand', 'echoThigh', 'echoShin', 'echoFoot',
    'pigUpper', 'pigFore', 'pigHand', 'pigThigh', 'pigShin', 'pigFoot',
    'opUpper', 'opFore', 'jaUpper', 'jaFore',
    // Capitulo 3. Quem nao tem braco proprio herda o do detetive, entao so
    // entram aqui os que realmente desenharam um.
    'deskUpper', 'deskFore', 'miUpper', 'miFore', 'beUpper', 'beFore',
    'caUpper', 'caFore', 'caShin', 'caFoot', 'juUpper', 'juFore',
    'jeUpper', 'jeFore', 'pastUpper', 'pastFore']) {
    P['d_' + nome] = darken(P[nome], K, T2);
  }

  pronto = true;
}

// Conjuntos de peças por criatura. O rig procura primeiro aqui e cai no
// detetive para o que não estiver definido — assim uma criatura nova só
// precisa das peças que realmente mudam.
export function partesDe(id) {
  if (!pronto) build();
  switch (id) {
    case 'semrosto': return {
      head: P.faceHead, headBlank: P.faceHead, torso: P.faceTorso,
      upperArm: P.faceUpper, forearm: P.faceFore, hand: P.faceHand,
      thigh: P.faceThigh, shin: P.faceShin, foot: P.faceFoot,
      dUpperArm: P.d_faceUpper, dForearm: P.d_faceFore, dHand: P.d_faceHand,
      dThigh: P.d_faceThigh, dShin: P.d_faceShin, dFoot: P.d_faceFoot,
      collar: null, coatSkirt: null, holster: null,
    };
    case 'empilhado': return {
      head: P.stackHead, headBlank: P.stackHead, torso: P.stackTorso,
      upperArm: P.stackUpper, forearm: P.stackFore, hand: P.stackHand,
      thigh: P.stackThigh, shin: P.stackShin, foot: P.stackFoot,
      dUpperArm: P.d_stackUpper, dForearm: P.d_stackFore, dHand: P.d_stackHand,
      dThigh: P.d_stackThigh, dShin: P.d_stackShin, dFoot: P.d_stackFoot,
      collar: null, coatSkirt: null, holster: null,
    };
    case 'ecoador': return {
      head: P.echoHead, headBlank: P.echoHead, torso: P.echoTorso,
      upperArm: P.echoUpper, forearm: P.echoFore, hand: P.echoHand,
      thigh: P.echoThigh, shin: P.echoShin, foot: P.echoFoot,
      dUpperArm: P.d_echoUpper, dForearm: P.d_echoFore, dHand: P.d_echoHand,
      dThigh: P.d_echoThigh, dShin: P.d_echoShin, dFoot: P.d_echoFoot,
      collar: null, coatSkirt: null, holster: null,
      naMao: P.echoCord,
    };
    case 'credor': return {
      head: P.pigHead, headBlank: P.pigHead, torso: P.pigTorso,
      upperArm: P.pigUpper, forearm: P.pigFore, hand: P.pigHand,
      thigh: P.pigThigh, shin: P.pigShin, foot: P.pigFoot,
      dUpperArm: P.d_pigUpper, dForearm: P.d_pigFore, dHand: P.d_pigHand,
      dThigh: P.d_pigThigh, dShin: P.d_pigShin, dFoot: P.d_pigFoot,
      collar: null, coatSkirt: null, holster: null,
      naMao: P.chainsaw,
    };
    case 'operadora': return {
      head: P.opHead, headBlank: P.opHead, torso: P.opTorso,
      upperArm: P.opUpper, forearm: P.opFore,
      dUpperArm: P.d_opUpper, dForearm: P.d_opFore,
      collar: null, coatSkirt: null, holster: null,
    };
    case 'zelador': return {
      head: P.jaHead, headBlank: P.jaHead, torso: P.jaTorso,
      upperArm: P.jaUpper, forearm: P.jaFore,
      dUpperArm: P.d_jaUpper, dForearm: P.d_jaFore,
      collar: null, coatSkirt: null, holster: null,
      naMao: P.mop,
    };

    // ---------------- CAPITULO 3 ----------------
    // Gente, nao criatura: todas tem rosto, e o que separa uma da outra e a
    // silhueta e a cor da roupa. `collar`, `coatSkirt` e `holster` ficam
    // nulos porque o sobretudo e do David — ninguem mais usa um.
    case 'plantonista': return {
      head: P.deskHead, headBlank: P.deskHead, torso: P.deskTorso,
      upperArm: P.deskUpper, forearm: P.deskFore,
      dUpperArm: P.d_deskUpper, dForearm: P.d_deskFore,
      collar: null, coatSkirt: null, holster: null,
    };
    case 'michael': return {
      head: P.miHead, headBlank: P.miHead, torso: P.miTorso,
      upperArm: P.miUpper, forearm: P.miFore,
      dUpperArm: P.d_miUpper, dForearm: P.d_miFore,
      collar: null, coatSkirt: null, holster: null,
    };
    case 'ruiz': return {
      head: P.ruHead, headBlank: P.ruHead, torso: P.ruTorso,
      upperArm: P.deskUpper, forearm: P.deskFore,
      dUpperArm: P.d_deskUpper, dForearm: P.d_deskFore,
      collar: null, coatSkirt: null, holster: null,
    };
    case 'elaine': return {
      head: P.elHead, headBlank: P.elHead, torso: P.elTorso,
      upperArm: P.opUpper, forearm: P.opFore,
      dUpperArm: P.d_opUpper, dForearm: P.d_opFore,
      collar: null, coatSkirt: null, holster: null,
    };
    case 'betinho': return {
      head: P.beHead, headBlank: P.beHead, torso: P.beTorso,
      upperArm: P.beUpper, forearm: P.beFore,
      dUpperArm: P.d_beUpper, dForearm: P.d_beFore,
      collar: null, coatSkirt: null, holster: null,
      naMao: P.mug,
    };
    case 'carlos': return {
      head: P.caHead, headBlank: P.caHead, torso: P.caTorso,
      upperArm: P.caUpper, forearm: P.caFore,
      shin: P.caShin, foot: P.caFoot,
      dUpperArm: P.d_caUpper, dForearm: P.d_caFore,
      dShin: P.d_caShin, dFoot: P.d_caFoot,
      collar: null, coatSkirt: null, holster: null,
    };
    case 'julie': return {
      head: P.juHead, headBlank: P.juHead, torso: P.juTorso,
      upperArm: P.juUpper, forearm: P.juFore,
      dUpperArm: P.d_juUpper, dForearm: P.d_juFore,
      collar: null, coatSkirt: null, holster: null,
    };
    case 'jenna': return {
      head: P.jeHead, headBlank: P.jeHead, torso: P.jeTorso,
      upperArm: P.jeUpper, forearm: P.jeFore,
      dUpperArm: P.d_jeUpper, dForearm: P.d_jeFore,
      collar: null, coatSkirt: null, holster: null,
    };

    // O PROPRIO DAVID, sete anos atras. Cabeca, mao, perna e bota continuam
    // sendo as dele — cai no detetive para tudo que nao esta declarado
    // aqui. `coatSkirt: null` e o que muda a silhueta inteira.
    case 'david_passado': return {
      torso: P.pastTorso,
      upperArm: P.pastUpper, forearm: P.pastFore,
      dUpperArm: P.d_pastUpper, dForearm: P.d_pastFore,
      collar: P.pastCollar, coatSkirt: null, holster: null,
    };
  }
  return null;
}

export { P as CREATURE_PARTS };
