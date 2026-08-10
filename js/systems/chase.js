// chase.js — O CREDOR, e os dez minutos finais do capitulo.
//
// Na narracao de abertura ele diz: "Se existe uma conta esperando por
// mim... ja passou da hora de pagar." O Credor e essa conta com pernas.
//
// O QUE ELE E: alto demais. Sobretudo IGUAL AO DELE, mas grande demais,
// arrastando no chao. Sem rosto sob a gola levantada. E arrasta um cano de
// metal — o MESMO cano com que o detetive se soltou no fim do Capitulo 1.
//
// O QUE ELE NAO PODE SER:
//   · rapido demais — terror de perseguicao funciona quando voce QUASE
//     consegue;
//   · burro — se der para enganar em circulo, morre a tensao;
//   · barulhento o tempo todo — o silencio dele e pior.
//
// REGRA DE OURO: o jogador precisa OUVIR o cano arrastando antes de ver.
//
// E o que faz a coisa funcionar nao e ele: e o mapa. O jogador ja conhece
// os sete setores, e agora eles viraram armadilha.

import { clamp, gfx, VW } from '../core/gfx.js';
import { audio } from '../core/audio.js';
import { Enemy } from './enemies.js';

// Ordem em que as luzes vao apagando, do mezanino ate a doca. Ele vem
// vindo, e o jogador ve por onde.
const ORDEM_APAGAR = [
  'ch2_mezz', 'ch2_machines', 'ch2_locker', 'ch2_cold', 'ch2_shelves', 'ch2_corridor',
];

export class Chase {
  constructor() {
    this.ativo = false;
    this.credor = null;
    this.levelKey = null;      // onde ele esta agora
    this.chegada = 0;          // quanto falta para ele entrar na sua fase
    this.lastX = 0;
    this.estado = 'cacar';     // cacar | procurar | sair
    this.procuraT = 0;
    this.apagou = 0;
    this.t = 0;
    this.buscaT = 0;
    this.onFala = null;
    this.onDano = null;
    this.entradaLado = -1;
    this.tiros = 0;
    this.lentidao = 0;
    this.ocultoAntes = false;
    this.passagemX = null;
    this.passagemDir = 0;
    this.ultimaDist = 999;
    this.grabCooldown = 4.2;
    this.agarrões = 0;
    this.contatos = 0;
    this.esconderN = 0;
    this.buscaModo = 0;
    this.fakeT = 0;
    this.onGrab = null;
    this.difficulty = null;
    this.routePressure = 1;
    this.currentSpeed = 0;
    this._orig = new Map();
  }

  // -------------------------------------------------------------------

  comecar(levels, deLevel, deX, opt = {}) {
    this.ativo = true;
    this.t = 0;
    this.apagou = 0;
    this.estado = 'cacar';
    this.tiros = 0;
    this.lentidao = 0;
    this.ocultoAntes = false;
    this.passagemX = null;
    this.passagemDir = 0;
    this.ultimaDist = 999;
    this.grabCooldown = 4.2;
    this.agarrões = 0;
    this.contatos = 0;
    this.esconderN = 0;
    this.buscaModo = 0;
    this.fakeT = 0;
    this.routePressure = 1;
    this.currentSpeed = 0;
    this.levelKey = deLevel;
    this.jogadorLevel = deLevel;
    this.lastX = deX;
    this.chegada = opt.immediate ? 0 : 8; // na introdução ele já está em cena
    this.dano = 0;
    this.credor = opt.credor || new Enemy('credor', deX, 214);
    this.credor.x = deX;
    this.levels = levels;
    audio.startDread();
    // A motosserra comeca a roncar AGORA, no outro lado do galpao, e nao
    // para mais ate o fim do capitulo.
    audio.startLoop('serra', { gain: 0.04, fade: 3 });
    audio.startLoop('static', { gain: 0.018, fade: 2.2 });
  }

  // Chamado a cada porta atravessada. O sinal diz por qual lado David
  // entrou; quando o Credor finalmente chegar, ele surge atrás do percurso,
  // nunca teleportado na frente do jogador.
  avisoEntrada(levelKey, facing) {
    this.entradaLado = facing >= 0 ? -1 : 1;
  }

  parar() {
    this.ativo = false;
    this.credor = null;
    audio.stopDread(1.2);
    audio.stopLoop('serra', 1.6);
    audio.stopLoop('static', 0.8);
    this._restaurar();
  }

  // Estado salvavel. Sem isto, carregar um save feito no meio da fuga
  // devolvia o jogador a um galpao apagado, com a musica de tensao tocando
  // e SEM o Credor — e com o portao da doca fechado, ou seja, sem saida.
  save() {
    if (!this.ativo) return null;
    return {
      lvl: this.levelKey, x: Math.round(this.credor ? this.credor.x : 0),
      lastX: Math.round(this.lastX), apagou: this.apagou,
      t: Math.round(this.t), estado: this.estado,
      chegada: this.chegada, entrada: this.entradaLado,
      tiros: this.tiros, lentidao: this.lentidao,
      stun: this.credor ? this.credor.stun : 0,
      saidaX: this.saidaX,
      passagemX: this.passagemX, passagemDir: this.passagemDir,
      ocultoAntes: this.ocultoAntes,
      ultimaDist: this.ultimaDist,
      grabCooldown: this.grabCooldown, agarrões: this.agarrões,
      contatos: this.contatos, esconderN: this.esconderN,
      buscaModo: this.buscaModo, fakeT: this.fakeT,
      routePressure: this.routePressure,
    };
  }

  load(d, levels, levelKeyDoJogador) {
    if (!d) { this.ativo = false; this.credor = null; return; }
    this.comecar(levels, d.lvl, d.x || 0);
    this.t = d.t || 0;
    this.lastX = d.lastX || 0;
    this.estado = d.estado || 'cacar';
    this.chegada = typeof d.chegada === 'number' ? d.chegada : this.chegada;
    this.entradaLado = d.entrada || -1;
    this.tiros = d.tiros || 0;
    this.lentidao = d.lentidao || 0;
    this.saidaX = d.saidaX;
    this.passagemX = typeof d.passagemX === 'number' ? d.passagemX : null;
    this.passagemDir = d.passagemDir || 0;
    this.ocultoAntes = !!d.ocultoAntes;
    this.ultimaDist = typeof d.ultimaDist === 'number' ? d.ultimaDist : 999;
    this.grabCooldown = typeof d.grabCooldown === 'number' ? d.grabCooldown : 4.2;
    this.agarrões = d.agarrões || 0;
    this.contatos = d.contatos || 0;
    this.esconderN = d.esconderN || 0;
    this.buscaModo = d.buscaModo || 0;
    this.fakeT = d.fakeT || 0;
    this.routePressure = d.routePressure || 1;
    this.jogadorLevel = levelKeyDoJogador;
    if (this.credor) this.credor.x = d.x || 0;
    if (this.credor) this.credor.stun = d.stun || 0;
    // reaplica o apagao dos setores que ja estavam no escuro
    this.apagou = 0;
    for (let i = 0; i < (d.apagou || 0) && i < ORDEM_APAGAR.length; i++) {
      this._apagarSetor(ORDEM_APAGAR[i]);
      this.apagou++;
    }
    // Se ele estava noutro setor, mantem a distancia — carregar um save
    // nunca pode devolver o jogador com o Credor colado nele.
    if (this.levelKey !== levelKeyDoJogador && typeof d.chegada !== 'number') this.chegada = 9;
  }

  // As luzes de emergencia do galpao inteiro comecam a apagar SETOR POR
  // SETOR, vindo na direcao dele. Guarda a intensidade original para o
  // capitulo poder terminar sem deixar o mundo no escuro para sempre.
  _apagarSetor(key) {
    const lv = this.levels && this.levels[key];
    if (!lv || this._orig.has(key)) return;
    const antes = lv.lightDefs.map(f => f.i);
    this._orig.set(key, antes);
    for (const f of lv.lightDefs) f.i *= 0.16;
  }

  _restaurar() {
    for (const [key, antes] of this._orig) {
      const lv = this.levels && this.levels[key];
      if (!lv) continue;
      for (let i = 0; i < lv.lightDefs.length; i++) lv.lightDefs[i].i = antes[i];
    }
    this._orig.clear();
  }

  // -------------------------------------------------------------------

  update(dt, ctx) {
    if (!this.ativo) return;
    const { player, level, levelKey, escondido } = ctx;
    this.t += dt;
    if (this.grabCooldown > 0) this.grabCooldown -= dt;

    // ---- as luzes apagando, uma fase de cada vez ----
    if (this.apagou < ORDEM_APAGAR.length && this.t > 4 + this.apagou * 9) {
      this._apagarSetor(ORDEM_APAGAR[this.apagou]);
      this.apagou++;
      audio.distantThump(0.9);
      gfx.shake(1.4, 0.3);
    }

    // ---- trocou de setor: ele NAO vem junto ----
    //
    // Este era o pior defeito da perseguicao. `chegada` era acertado uma
    // vez, no comeco, e nunca mais: depois da primeira chegada ele ficava
    // em zero, e trocar de sala punha o Credor em cima do jogador no mesmo
    // quadro. Fugir nao servia para nada.
    //
    // Agora cada porta atravessada compra tempo — pouco, mas compra. E e
    // esse tempo que transforma o mapa numa ferramenta em vez de numa
    // sentenca.
    if (levelKey !== this.jogadorLevel) {
      this.jogadorLevel = levelKey;
      if (this.levelKey !== levelKey) {
        // A distancia na sala anterior determina quanto ele demora para
        // cruzar a mesma porta. Se estava colado, entra quase junto; se foi
        // despistado, o jogador ainda compra alguns segundos.
        const dAntes = this.ultimaDist;
        if (levelKey === 'ch2_dock') this.chegada = dAntes < 90 ? 0.55 : 1.25;
        else if (dAntes < 72) this.chegada = 0.45 + Math.random() * 0.35;
        else if (dAntes < 160) this.chegada = 1.0 + Math.random() * 0.7;
        else this.chegada = 2.4 + Math.random() * 1.8;
        this.estado = 'cacar';
      }
    }

    // ---- ele nao esta na sua fase: esta vindo ----
    if (this.levelKey !== levelKey) {
      this.chegada -= dt;
      // O som chega antes dele. Sempre. A motosserra fica mais alta
      // conforme ele se aproxima da porta.
      audio.setLoopGain('serra', clamp(0.10 - this.chegada * 0.008, 0.02, 0.1), 0.6);
      this.buscaT -= dt;
      if (this.buscaT <= 0) {
        this.buscaT = 1.4 + Math.random() * 1.6;
        audio.dragMetal(clamp(0.4 - this.chegada * 0.02, 0.1, 0.4));
      }
      audio.setDread(clamp(0.22 - this.chegada * 0.015, 0.08, 0.42));
      const pulso = Math.sin(this.t * 12.5) > -0.08 ? 1 : 0.12;
      audio.setLoopGain('static', clamp(0.085 - this.chegada * 0.008, 0.008, 0.085) * pulso, 0.05);
      if (this.chegada <= 0) {
        this.levelKey = levelKey;
        // Entra pela porta por onde VOCE entrou, do lado de fora da tela.
        // Antes o lado era inferido pela posição atual do jogador e podia
        // colocá-lo adiante da fuga. Agora vem da transição de sala.
        const lado = this.entradaLado || (player.facing >= 0 ? -1 : 1);
        this.credor.x = lado < 0 ? level.minX - 28 : level.maxX + 28;
        this.credor.facing = -lado;
        this.credor.det.setFacing(-lado);
        this.credor.y = level.groundY;
        this.lastX = player.x;
        audio.doorSlam(0.7);
        gfx.shake(2.4, 0.4);
        if (this.onFala) this.onFala('b2_chase_3');
      }
      return;
    }

    // ---- ele esta aqui ----
    const c = this.credor;
    const dist = Math.abs(player.x - c.x);
    this.ultimaDist = dist;

    // Dez tiros compram alguns segundos. Cada impacto antes disso pesa no
    // passo, mas nunca transforma o chefe em alvo fácil ou matável.
    if (c.stun > 0) {
      c.stun -= dt;
      c.det.update(dt);
      audio.setDread(clamp(1 - dist / 340, 0.08, 1) * 0.55);
      audio.setLoopGain('serra', 0.04 + clamp(1 - dist / 340, 0, 1) * 0.08, 0.25);
      if (c.stun <= 0) c.det.play('run', { blend: 0.12 });
      return;
    }

    // Entrar no esconderijo ja quebra a linha visual. Prender a respiracao
    // controla o panico de David, mas nao governa mais a inteligencia do
    // Credor nem decide se ele vai sair da sala.
    const invisivel = !!escondido;
    if (invisivel && !this.ocultoAntes) {
      // O antigo alvo era exatamente o X de David. Isso fazia o Credor
      // parar sobre o esconderijo e inverter a direcao a cada quadro. Agora
      // ele conserva o sentido da aproximacao e atravessa o ponto ocupado.
      this.passagemDir = Math.sign(player.x - c.x) || c.facing || 1;
      this.lastX = player.x;
      this.passagemX = clamp(player.x + this.passagemDir * 92,
        level.minX - 18, level.maxX + 18);
      this.estado = 'cacar';
      // O padrao muda a cada esconderijo: passar reto, conferir um lugar
      // errado, ou fingir que foi embora. Nenhum deles depende de Shift e
      // todos terminam com o Credor abandonando a sala.
      this.buscaModo = this.esconderN % 3;
      this.esconderN++;
    } else if (!invisivel) {
      this.lastX = player.x;
      this.passagemX = null;
      this.passagemDir = 0;
      if (this.estado === 'sair') this.estado = 'cacar';
    }
    this.ocultoAntes = invisivel;

    if (this.estado === 'cacar') {
      const alvo = invisivel && this.passagemX !== null ? this.passagemX : player.x;
      const dir = invisivel && this.passagemDir
        ? this.passagemDir : (Math.sign(alvo - c.x) || c.facing);
      // Zona morta de 14px. Sem ela, com o Credor em cima do jogador o
      // sinal de `dir` trocava a cada quadro, `setFacing` disparava a
      // virada toda vez, e ele ficava GIRANDO no lugar para sempre — foi
      // exatamente o que travou a camara fria.
      if (Math.abs(alvo - c.x) > 14) {
        c.facing = dir;
        c.det.setFacing(dir);
        const lento = 1 - Math.min(0.32, this.lentidao);
        // David corre a 104 px/s. Perto o Credor ainda deixa uma margem de
        // reacao; longe ele acelera acima disso e recupera o terreno.
        const alcance = clamp((dist - 70) / 430, 0, 1);
        const diffV = this.difficulty ? (this.difficulty.chaseSpeed || 1) : 1;
        // A aceleracao serve para recuperar terreno, nao para transformar o
        // ultimo corredor numa sentenca. Perto de David o Credor fica no
        // limite da corrida do jogador; longe, acelera o bastante para nunca
        // desaparecer da perseguicao. A pressao da rota tem teto proprio e
        // nao se multiplica sem controle pela dificuldade.
        const pressaoRota = clamp(this.routePressure || 1, 0.96, 1.08);
        const v = (86 + alcance * 58) * lento * diffV * pressaoRota;
        this.currentSpeed = v;
        c.x = clamp(c.x + dir * v * dt, level.minX - 20, level.maxX + 20);
        c.det.speed = clamp(v / 108, 0.82, 1.7);
        if (c.det.anim !== 'run' && c.stun <= 0) c.det.play('run', { blend: 0.12 });
      } else if (invisivel) {
        // Ja passou alem do corpo escondido. Continua na mesma direcao ate
        // deixar a sala, sem retornar para cima do jogador. Em visitas
        // posteriores ele pode primeiro conferir um esconderijo errado.
        if (this.buscaModo === 1) {
          this.estado = 'procurar';
          this.procuraT = 1.8 + Math.min(1.2, this.esconderN * 0.14);
          this.buscaT = 0.18;
          this.lastX = clamp(player.x + this.passagemDir * 54, level.minX, level.maxX);
        } else {
          this.estado = 'sair';
          this.saidaX = this.passagemDir < 0 ? level.minX - 38 : level.maxX + 38;
        }
      }
      c.det.update(dt);
    } else if (this.estado === 'procurar') {
      this.procuraT -= dt;
      this.buscaT -= dt;
      if (this.buscaT <= 0) {
        this.buscaT = 1.1 + Math.random() * 1.4;
        audio.lockerBang(0.85);
        gfx.shake(1.1, 0.2);
        // vasculha para os lados, fechando o cerco em volta do ultimo ponto
        this.lastX += (Math.random() - 0.5) * 90;
        this.lastX = clamp(this.lastX, level.minX, level.maxX);
      }
      const dir = Math.sign(this.lastX - c.x) || 1;
      c.facing = dir; c.det.setFacing(dir);
      c.x = clamp(c.x + dir * c.cfg.vel * 0.55 * dt, level.minX - 20, level.maxX + 20);
      c.det.update(dt);
      if (!invisivel && dist < 200) { this.estado = 'cacar'; this.procuraT = 0; }
      if (this.procuraT <= 0 && invisivel) {
        // Perdeu o rastro de verdade: escolhe a saída mais próxima, abandona
        // a sala e só volta depois. A música acompanha a distância.
        this.estado = 'sair';
        const meio = (level.minX + level.maxX) / 2;
        this.saidaX = c.x < meio ? level.minX - 34 : level.maxX + 34;
      } else if (this.procuraT <= 0) this.estado = 'cacar';
    } else if (this.estado === 'sair') {
      if (!invisivel) {
        this.estado = 'cacar';
      } else {
        const dir = Math.sign(this.saidaX - c.x) || 1;
        c.facing = dir; c.det.setFacing(dir);
        c.x += dir * 112 * dt;
        c.det.speed = 1.05;
        if (c.det.anim !== 'dragWalk') c.det.play('dragWalk', { blend: 0.16 });
        c.det.update(dt);
        audio.setDread(clamp(1 - Math.abs(c.x - player.x) / 360, 0.03, 0.45));
        audio.setLoopGain('serra', 0.025 + clamp(1 - Math.abs(c.x - player.x) / 360, 0, 1) * 0.07, 0.35);
        if (Math.abs(c.x - this.saidaX) < 3) {
          if (this.buscaModo === 2 && this.fakeT <= 0) {
            // A serra some por um instante. Ele continua logo depois do
            // limite da camera, volta apenas o suficiente para golpear um
            // armario errado e entao vai embora de verdade.
            this.estado = 'fingir';
            this.fakeT = 1.35;
            audio.setDread(0.015);
            audio.setLoopGain('serra', 0.006, 0.25);
          } else {
            this._sumirDaSala();
          }
        }
      }
    } else if (this.estado === 'fingir') {
      if (!invisivel) {
        this.estado = 'cacar';
        this.fakeT = 0;
      } else {
        this.fakeT -= dt;
        c.det.update(dt);
        audio.setDread(0.01);
        audio.setLoopGain('serra', 0.004, 0.2);
        if (this.fakeT <= 0) {
          audio.lockerBang(1.05);
          audio.dragMetal(0.72);
          gfx.shake(1.7, 0.22);
          this.buscaModo = 0;
          this._sumirDaSala();
        }
      }
    }

    // ---- tensao pela DISTANCIA, nunca pelo relogio ----
    const k = escondido ? clamp(1 - dist / 300, 0, 1) * 0.8 : clamp(1 - dist / 340, 0, 1);
    audio.setDread(k * 0.85);
    // A motosserra sobe com a proximidade — e ela nunca desliga.
    audio.setLoopGain('serra', 0.05 + k * 0.16, 0.35);
    // O radio funciona como detector direcional. Perto de uma porta ele
    // pulsa cortado; imediatamente antes de um agarrão, cala de uma vez.
    const antesDoGrab = !escondido && dist < 48 && this.grabCooldown <= 0.35;
    const radio = antesDoGrab ? 0.001 : (0.012 + k * 0.105) * (this.levelKey === levelKey ? 1 : 0.55);
    audio.setLoopGain('static', radio, antesDoGrab ? 0.04 : 0.16);
    // Tremor SO quando ele esta em cima de voce, e fraco. Antes era a cada
    // quadro acima de 0.6 e a tela inteira balancava a fuga inteira.
    if (k > 0.86 && !escondido) gfx.shake(1.1, 0.18);

    // ---- a motosserra ----
    //
    // Ele PRECISA machucar. O gancho de dano nunca chegou a ser ligado no
    // jogo, entao o Credor chegava perto, encostava, e nao acontecia nada
    // — ele era um susto ambulante sem consequencia nenhuma.
    if (this.dano > 0) this.dano -= dt;
    if (!escondido && dist < c.cfg.alcance && this.dano <= 0) {
      this.contatos++;
      const podeAgarrar = this.onGrab && this.grabCooldown <= 0 && this.t > 4
        && this.agarrões < 3 && (this.agarrões === 0 || this.contatos % 2 === 0);
      if (podeAgarrar && this.onGrab(c.x)) {
        this.agarrões++;
        this.grabCooldown = Math.max(8, 13 - this.agarrões * 1.2);
        this.dano = 2.2;
      } else if (this.onDano) {
        this.dano = 1.6;
        audio.punchHit(1.2);
        this.onDano(c.cfg.dano, c.x);
        // Depois de acertar ele para um instante — e e essa janela que da
        // para correr. Sem ela a coisa vira uma sentenca, nao uma fuga.
        c.stun = 1.5;
        c.det.play('hurt', { restart: true, blend: 0.06 });
      }
    }
  }

  _sumirDaSala() {
    this.levelKey = '__corredor_escuro__';
    this.chegada = 5.2 + Math.random() * 3.4;
    this.estado = 'cacar';
    this.passagemX = null;
    this.passagemDir = 0;
    this.fakeT = 0;
    audio.setDread(0.05);
    audio.setLoopGain('serra', 0.02, 1.1);
  }

  // Obstaculos do mapa nao vencem o Credor; compram entre um e tres
  // segundos. Se ele ainda esta noutra sala, o mesmo tempo e somado à
  // chegada. Assim todo recurso funciona sem produzir teleporte.
  atrasar(segundos, impacto = 'metal') {
    if (!this.ativo || !this.credor) return false;
    if (this.levelKey === this.jogadorLevel) {
      this.credor.stun = Math.max(this.credor.stun || 0, segundos);
      this.credor.det.play('hurt', { restart: true, blend: 0.04 });
    } else this.chegada += segundos;
    if (impacto === 'steam') audio.pipeBurst(1);
    else if (impacto === 'alarm') audio.phoneRing(1);
    else audio.metalCreak(1);
    return true;
  }

  desviar(segundos) {
    if (!this.ativo) return false;
    this.levelKey = '__alarme__';
    this.chegada = Math.max(this.chegada, segundos);
    this.estado = 'cacar';
    audio.setDread(0.12);
    audio.setLoopGain('serra', 0.025, 0.5);
    return true;
  }

  levarTiro() {
    if (!this.ativo || !this.credor) return false;
    this.tiros++;
    this.lentidao = Math.min(0.32, this.lentidao + 0.032);
    this.credor.det.play('hurt', { restart: true, blend: 0.04 });
    this.credor.stun = 0.22;
    if (this.tiros % 10 === 0) {
      this.credor.stun = 3.8;
      this.credor.det.play('hurt', { restart: true, blend: 0.03 });
      audio.setLoopGain('serra', 0.018, 0.18);
      gfx.shake(4.2, 0.42);
      return 'stun';
    }
    return 'slow';
  }

  // Ele so e desenhado se estiver na fase em que o jogador esta.
  draw(ctx, cam, levelKey) {
    if (!this.ativo || !this.credor || this.levelKey !== levelKey) return;
    this.credor.draw(ctx, cam);
  }

  // Quanto ele esta perto, de 0 a 1 — usado pela sanidade e pelo HUD.
  pressao(levelKey, px) {
    if (!this.ativo || !this.credor) return 0;
    if (this.levelKey !== levelKey) return 0.15;
    return clamp(1 - Math.abs(px - this.credor.x) / 320, 0, 1);
  }
}
